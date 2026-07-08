#!/usr/bin/env bash
# RobbeVersum auf den Hostinger-VPS deployen.
# Voraussetzung: SSH-Key ~/.ssh/robbe_vps ist auf dem Server hinterlegt.
# Nutzung: ./deploy/deploy.sh  (aus dem Projekt-Root)
set -euo pipefail

SERVER="root@srv1047901.hstgr.cloud"
SSH_KEY="$HOME/.ssh/robbe_vps"
TARGET="/var/www/robbeversum"

echo "→ Build"
npm run build

echo "→ Upload nach $SERVER:$TARGET"
ssh -i "$SSH_KEY" "$SERVER" "mkdir -p $TARGET"
rsync -az --delete -e "ssh -i $SSH_KEY" dist/ "$SERVER:$TARGET/"

echo "✓ Deployt. Fully Kiosk laedt die neue Version beim naechsten Reload."
