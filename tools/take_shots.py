"""Takes the entry's screenshots with headless Chromium (Playwright).

Reads shots.json (name, query, viewport w/h), opens the locally served app,
waits for window.__shotReady, and saves a JPEG screenshot per entry.
Usage: python3 tools/take_shots.py [port]  (server must already be running)
"""
import json
import sys
from pathlib import Path

from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parent.parent
PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8091


def main():
    shots = json.loads((ROOT / "shots.json").read_text())
    out_dir = ROOT / "screenshots"
    out_dir.mkdir(exist_ok=True)
    with sync_playwright() as pw:
        browser = pw.chromium.launch()
        for shot in shots:
            page = browser.new_page(viewport={"width": shot["w"], "height": shot["h"]})
            page.goto(f"http://127.0.0.1:{PORT}/{shot['query']}")
            page.wait_for_function("window.__shotReady === true", timeout=30000)
            page.wait_for_timeout(400)
            path = out_dir / shot["name"]
            page.screenshot(path=str(path), type="jpeg", quality=82)
            page.close()
            print(f"{shot['name']}: {path.stat().st_size} bytes")
        browser.close()


if __name__ == "__main__":
    main()
