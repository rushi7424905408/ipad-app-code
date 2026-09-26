#!/usr/bin/env python3
"""
WortSchatz • High-Performance Self-Hosted German PDF Reader Server
Optimized for iPad Air M3, Local LAN Access, and Obsidian Vault Sync
"""

import http.server
import socketserver
import socket
import os
import sys
import json
import mimetypes
import traceback
from datetime import datetime

PORT = 8000
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

# Configure MIME types for Apple Safari & PWA
mimetypes.init()
mimetypes.add_type('application/manifest+json', '.json')
mimetypes.add_type('image/svg+xml', '.svg')
mimetypes.add_type('application/javascript', '.js')
mimetypes.add_type('application/pdf', '.pdf')
mimetypes.add_type('text/tab-separated-values', '.tsv')
mimetypes.add_type('text/markdown', '.md')


def get_local_ip():
    """Detect local network IP for connecting from iPad Air M3 on the same Wi-Fi."""
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.settimeout(0.2)
        # Use Google DNS to detect default routing interface without sending packets
        s.connect(('8.8.8.8', 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except Exception:
        try:
            return socket.gethostbyname(socket.gethostname())
        except Exception:
            return '127.0.0.1'


class ThreadedTCPServer(socketserver.ThreadingMixIn, socketserver.TCPServer):
    daemon_threads = True
    allow_reuse_address = True


class AppHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

    def do_POST(self):
        if self.path == '/api/save-obsidian':
            content_length = int(self.headers.get('Content-Length', 0))
            post_data = self.rfile.read(content_length)

            try:
                data = json.loads(post_data.decode('utf-8'))
                podcast_title = data.get('podcastTitle') or data.get('podcast_title') or 'German Reading'
                podcast_title = podcast_title.strip()
                custom_vault_dir = (data.get('vaultPath') or '').strip()

                # Normalise vocabulary items (batch or single word)
                vocab_items = data.get('vocabulary', [])
                if not vocab_items and data.get('word'):
                    vocab_items = [{
                        'german': data.get('word', ''),
                        'english': data.get('translation', ''),
                        'pos': data.get('pos', 'word'),
                        'gender': data.get('gender', ''),
                        'pageNum': data.get('page', 1)
                    }]

                today_str = datetime.now().strftime('%Y-%m-%d %H:%M')

                # Format Markdown Section for Obsidian
                lines = []
                lines.append(f"\n## 🎙️ {podcast_title}\n")
                lines.append("> [!info] Reading & Podcast Metadata\n")
                lines.append(f"> **Date**: {today_str} | **Words Count**: {len(vocab_items)} | **Tags**: #german #wortschatz #vocabulary\n\n")

                lines.append("| German | English Translation | Gender / Class | Page | Spaced Repetition (Anki) |\n")
                lines.append("| :--- | :--- | :--- | :---: | :--- |\n")

                for item in vocab_items:
                    de = item.get('german', '').strip()
                    en = item.get('english', '').strip()
                    pos = item.get('pos', 'word')
                    gender = item.get('gender', '')
                    page = item.get('pageNum') or item.get('page') or 1

                    gender_pos = f"{gender} ({pos})" if gender else pos
                    card_syntax = f"`{de} :: {en}`"
                    lines.append(f"| **{de}** | {en} | {gender_pos} | {page} | {card_syntax} |\n")

                lines.append("\n---\n")
                markdown_section = "".join(lines)

                # Resolve Obsidian Vault path
                desktop_dir = os.path.expanduser('~/Desktop')
                target_vault_dir = None

                if custom_vault_dir:
                    expanded = os.path.expanduser(custom_vault_dir)
                    try:
                        os.makedirs(expanded, exist_ok=True)
                        target_vault_dir = expanded
                    except Exception:
                        pass

                if not target_vault_dir:
                    # Scan common Obsidian Vault locations on host machine
                    candidates = [
                        os.path.join(desktop_dir, 'Obsidian Vault'),
                        os.path.join(desktop_dir, 'Obsidian'),
                        os.path.join(desktop_dir, 'vault'),
                        os.path.expanduser('~/Documents/Obsidian Vault'),
                        os.path.expanduser('~/Obsidian Vault'),
                        os.path.expanduser('~/Library/Mobile Documents/iCloud~md~obsidian/Documents') # macOS iCloud Obsidian
                    ]
                    for candidate_path in candidates:
                        if os.path.exists(candidate_path) and os.path.isdir(candidate_path):
                            target_vault_dir = candidate_path
                            break

                if not target_vault_dir:
                    try:
                        target_vault_dir = os.path.join(desktop_dir, 'Obsidian Vault')
                        os.makedirs(target_vault_dir, exist_ok=True)
                    except Exception:
                        target_vault_dir = os.path.join(DIRECTORY, 'Obsidian_Vault')
                        os.makedirs(target_vault_dir, exist_ok=True)

                vocab_file_path = os.path.join(target_vault_dir, 'vocabulary.md')

                # Read or create master vocabulary.md
                existing_content = ""
                if os.path.exists(vocab_file_path):
                    with open(vocab_file_path, 'r', encoding='utf-8') as vf:
                        existing_content = vf.read()
                else:
                    existing_content = "# 🇩🇪 German Vocabulary Vault\n\n*Master vocabulary index from WortSchatz PDF Reader*\n\n---\n"

                section_header = f"## 🎙️ {podcast_title}"
                if section_header in existing_content:
                    parts = existing_content.split(section_header)
                    after_header = parts[1]
                    next_sec_idx = after_header.find("\n## 🎙️ ")
                    remainder = after_header[next_sec_idx:] if next_sec_idx != -1 else ""
                    updated_content = parts[0] + markdown_section + remainder
                else:
                    updated_content = existing_content.strip() + "\n" + markdown_section

                with open(vocab_file_path, 'w', encoding='utf-8') as vf:
                    vf.write(updated_content)

                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                response = {
                    'status': 'success',
                    'filePath': vocab_file_path,
                    'vaultDir': target_vault_dir,
                    'podcastTitle': podcast_title,
                    'count': len(vocab_items),
                    'file': os.path.basename(vocab_file_path)
                }
                self.wfile.write(json.dumps(response).encode('utf-8'))
                print(f"✓ Saved {len(vocab_items)} vocabulary entries to: {vocab_file_path}")

            except Exception as e:
                err_msg = f"{e}\n{traceback.format_exc()}"
                print(f"Error saving to Obsidian: {err_msg}", file=sys.stderr)
                self.send_response(500)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({'status': 'error', 'message': str(e)}).encode('utf-8'))
        else:
            self.send_response(404)
            self.end_headers()


def main():
    os.chdir(DIRECTORY)
    port = PORT
    httpd = None

    for p in range(PORT, PORT + 20):
        try:
            httpd = ThreadedTCPServer(("0.0.0.0", p), AppHandler)
            port = p
            break
        except OSError:
            continue

    if not httpd:
        print("Error: Could not bind to any port.", file=sys.stderr)
        sys.exit(1)

    local_ip = get_local_ip()
    local_url = f"http://localhost:{port}/index.html"
    ipad_url = f"http://{local_ip}:{port}/index.html"

    print("\n" + "=" * 68)
    print("  🇩🇪 WortSchatz — German PDF Reader & Obsidian Vault Sync")
    print("  🚀 Multi-Threaded Self-Hosted Engine (iPad Air M3 Ready)")
    print("=" * 68)
    print(f"  📱 Open on iPad Air M3 (Same Wi-Fi):  {ipad_url}")
    print(f"  💻 Open locally on this machine:      {local_url}")
    print("=" * 68)
    print("  💡 Tip for iPad Air M3:")
    print("     In Safari, tap 'Share' -> 'Add to Home Screen' to run")
    print("     WortSchatz as a full-screen, offline-capable native iPad app!")
    print("=" * 68 + "\n")

    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nShutting down WortSchatz server.")
        httpd.server_close()


if __name__ == "__main__":
    main()
