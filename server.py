import http.server
import socketserver
import os

class ThreadedHTTPServer(socketserver.ThreadingMixIn, http.server.HTTPServer):
    daemon_threads = True

class CustomHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=os.path.abspath('.'), **kwargs)

    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        super().end_headers()

if __name__ == '__main__':
    port = 8080
    with ThreadedHTTPServer(('0.0.0.0', port), CustomHandler) as httpd:
        print(f"Robust Multi-Threaded Server serving {os.path.abspath('.')} on port {port}...")
        httpd.serve_forever()
