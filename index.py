#!/usr/bin/env python3
"""
File Encryption & Decryption Tool v3.0 Ultra - Master Python Entry Point
========================================================================
Main application launcher for File Encryption & Decryption Tool.
Runs a local server and launches the Web UI in your default browser.

Usage:
    python index.py [port]
"""

import http.server
import socketserver
import os
import sys
import socket
import webbrowser
import time

DEFAULT_PORT = 8000

def get_free_port(start_port=8000):
    """Find an available TCP port starting from start_port."""
    port = start_port
    while port < 9999:
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            if s.connect_ex(('127.0.0.1', port)) != 0:
                return port
        port += 1
    return start_port

class CustomHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    """HTTP Request Handler serving files with correct MIME types."""
    def end_headers(self):
        self.send_header("Cache-Control", "no-cache, no-store, must-revalidate")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")
        super().end_headers()

def main():
    # Ensure current directory is script root
    script_dir = os.path.dirname(os.path.abspath(__file__))
    os.chdir(script_dir)

    # Determine port
    if len(sys.argv) > 1 and sys.argv[1].isdigit():
        port = int(sys.argv[1])
    else:
        port = get_free_port(DEFAULT_PORT)

    url = f"http://localhost:{port}"

    print("=================================================================")
    print(" FILE ENCRYPTION & DECRYPTION TOOL v3.0 ULTRA - PYTHON SERVER")
    print("=================================================================")
    print(f" [+] Main Entry Point : {os.path.abspath(__file__)}")
    print(f" [+] Serving Directory: {script_dir}")
    print(f" [+] Server URL        : {url}")
    print("=================================================================")
    print(" Launching Web UI in default browser...")

    handler = CustomHTTPRequestHandler

    try:
        with socketserver.TCPServer(("127.0.0.1", port), handler) as httpd:
            # Auto open browser after 500ms
            def open_browser():
                time.sleep(0.5)
                webbrowser.open(url)

            import threading
            threading.Thread(target=open_browser, daemon=True).start()

            print(f" Server active at {url} (Press Ctrl+C to stop)")
            httpd.serve_forever()

    except KeyboardInterrupt:
        print("\n [!] Server stopped by user.")
        sys.exit(0)
    except Exception as e:
        print(f"\n [X] Server error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
