"""Takes the four screenshots in shots.json with headless Chromium.

Serves app/ on a throwaway localhost port, opens each ?shot= scene at
the viewport shots.json asks for, waits until the page raises
window.__shotReady, and writes the JPEG into screenshots/. Run from the
repository root:  python3 tools/take_shots.py
"""
import json
import sys
import threading
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SHOTS = json.loads((ROOT / "shots.json").read_text())
OUT = ROOT / "screenshots"
OUT.mkdir(exist_ok=True)


def serve_forever(port_holder):
    handler = partial(SimpleHTTPRequestHandler, directory=str(ROOT / "app"))
    httpd = ThreadingHTTPServer(("127.0.0.1", 0), handler)
    port_holder.append(httpd.server_address[1])
    httpd.serve_forever()


def main():
    from playwright.sync_api import sync_playwright

    port_holder = []
    thread = threading.Thread(target=serve_forever, args=(port_holder,), daemon=True)
    thread.start()
    while not port_holder:
        pass
    port = port_holder[0]
    with sync_playwright() as pw:
        browser = pw.chromium.launch()
        for shot in SHOTS:
            page = browser.new_page(viewport={"width": shot["w"], "height": shot["h"]})
            errors = []
            page.on("console", lambda m: errors.append(m.text) if m.type == "error" else None)
            page.on("pageerror", lambda e: errors.append(str(e)))
            page.goto(f"http://127.0.0.1:{port}/index.html{shot['query']}", wait_until="load")
            page.wait_for_function("window.__shotReady === true", timeout=15000)
            target = OUT / shot["name"]
            page.screenshot(path=str(target), type="jpeg", quality=88)
            page.close()
            size = target.stat().st_size
            print(f"{shot['name']}: {shot['w']}x{shot['h']} {size} bytes"
                  + (f"  CONSOLE ERRORS: {errors}" if errors else ""))
            if size > 262144:
                print(f"  WARNING: {shot['name']} is over the 256 KiB cap", file=sys.stderr)
        browser.close()
    print("done")


if __name__ == "__main__":
    main()
