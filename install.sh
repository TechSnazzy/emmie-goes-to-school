#!/usr/bin/env bash
# Emmie Goes to School — serve the game locally and open it in a browser.
set -euo pipefail

PORT="${PORT:-8000}"
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
URL="http://localhost:${PORT}/"

cd "$DIR"

echo "Serving Emmie Goes to School at $URL"
echo "Press Ctrl+C to stop."

# open the browser once the server is up (best effort)
( sleep 1
  if command -v xdg-open >/dev/null 2>&1; then xdg-open "$URL"
  elif command -v open   >/dev/null 2>&1; then open "$URL"
  fi ) &

exec python3 -m http.server "$PORT"
