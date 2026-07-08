# Cowork-Auftrag: RobbeVersum live bringen (Auto-Deploy + Subdomain)

**Ziel:** Jede Änderung im Repo ist nach dem Push automatisch online, erreichbar
unter **https://messe.robbe-consulting.de**. Alle Aufgaben bis „live".

**Dieses Dokument ist selbst-enthalten** — alle Fakten stehen hier. Bei
Abweichungen (Fehlermeldungen, andere Panel-Oberflächen) sinnvoll improvisieren
und am Ende dokumentieren, was anders war.

---

## Fakten

| Was | Wert |
|---|---|
| Lokales Repo | `/Users/florianrobbe/Claude/Projects/robbe-messe-app` (git, Stand committet) |
| App | React+Vite-SPA, Build: `npm ci && npm run build` → `dist/` |
| Ziel-Server (VPS) | `srv1047901.hstgr.cloud` = **147.93.57.16** (Hostinger, dort läuft auch n8n) |
| Ziel-Verzeichnis | `/var/www/robbeversum` |
| Subdomain | `messe.robbe-consulting.de` → A-Record auf **147.93.57.16** |
| DNS-Verwaltung | **IONOS** (Nameserver ui-dns.de — robbe-consulting.de liegt bei IONOS) |
| GitHub-Account | `MrRobb86` (gh CLI ist auf diesem Mac angemeldet; dort liegt auch die Website MrRobb86.github.io mit funktionierendem FTPS-Deploy als Vorbild) |
| SSH-Key (Mac, bereits erzeugt) | `~/.ssh/robbe_vps` / `.pub`: `ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIC8NMqN5sKBAP/IpNMqjZXBb0U5b0ZEniOdTEyqnPaEz florian-mac-robbeversum` |
| nginx-Config (fertig) | `deploy/nginx-messe.conf` im Repo |
| Manuelles Deploy-Script | `deploy/deploy.sh` im Repo (für Notfälle) |

**Sicherheitsregeln:**
- NIEMALS `.env` / private Keys committen. Secrets nur in GitHub-Actions-Secrets.
- Auf dem VPS läuft produktiv n8n — nichts anfassen außer nginx-Site + `/var/www/robbeversum` + certbot.
- Vor destruktiven Schritten (bestehende nginx-Sites, Firewall) erst schauen, dann handeln.

---

## Aufgaben (in dieser Reihenfolge)

### 1. SSH-Zugang zum VPS herstellen
Der Public Key (oben) muss auf dem Server in `~/.ssh/authorized_keys` (User root
oder Deploy-User). Weg A: Hostinger-Panel (hpanel.hostinger.com, Florian ist
eingeloggt bzw. loggt sich ein) → VPS → SSH-Zugang/Keys → Key hinzufügen.
Weg B: Falls Panel-Zugang klemmt, Florian nach dem Root-Passwort fragen und den
Key per `ssh-copy-id -i ~/.ssh/robbe_vps.pub root@srv1047901.hstgr.cloud` hinterlegen.
**Test:** `ssh -i ~/.ssh/robbe_vps root@srv1047901.hstgr.cloud 'echo OK'`

### 2. DNS: Subdomain anlegen
IONOS-Kundencenter (login.ionos.de, mit Florian) → Domain robbe-consulting.de →
DNS → neuer **A-Record**: Host `messe`, Wert `147.93.57.16`, TTL kurz (300–3600).
**Test:** `dig +short messe.robbe-consulting.de` → muss 147.93.57.16 liefern
(Propagation kann Minuten dauern — währenddessen mit Schritt 3/4 weitermachen).

### 3. Server vorbereiten (per SSH)
```bash
ssh -i ~/.ssh/robbe_vps root@srv1047901.hstgr.cloud
mkdir -p /var/www/robbeversum
# nginx-Config aus dem Repo (deploy/nginx-messe.conf) nach
# /etc/nginx/sites-available/messe.robbe-consulting.de kopieren (scp),
# dann: ln -s ../sites-available/messe.robbe-consulting.de /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx
```
Achtung: Prüfen, ob auf dem Server überhaupt nginx läuft (dort kann auch Caddy/
Traefik für n8n laufen!). `systemctl status nginx caddy traefik docker` ansehen.
- Läuft **Caddy** statt nginx: stattdessen einen Site-Block in die Caddyfile
  (`messe.robbe-consulting.de { root * /var/www/robbeversum; file_server; try_files {path} /index.html }`)
  — Caddy macht HTTPS automatisch, Schritt 5 entfällt.
- Läuft n8n in **Docker mit Port 80/443 belegt** (z. B. Traefik): den vorhandenen
  Reverse-Proxy nutzen (Label/Config ergänzen), NICHT parallel nginx erzwingen.

### 4. Erstes Deploy (manuell, als Funktionsbeweis)
Auf dem Mac im Repo: `./deploy/deploy.sh` — baut und rsynct `dist/` auf den Server.
**Test:** `curl -sI http://messe.robbe-consulting.de` → 200 und HTML.

### 5. HTTPS (nur bei nginx nötig)
```bash
ssh -i ~/.ssh/robbe_vps root@srv1047901.hstgr.cloud 'certbot --nginx -d messe.robbe-consulting.de --non-interactive --agree-tos -m florian.robbe@robbe-consulting.de'
```
(certbot ggf. erst installieren: `apt install certbot python3-certbot-nginx`)
**Test:** `curl -sI https://messe.robbe-consulting.de` → 200, gültiges Zertifikat.

### 6. Auto-Deploy: GitHub-Repo + Action
1. Repo anlegen und pushen (gh ist als MrRobb86 angemeldet):
   ```bash
   cd /Users/florianrobbe/Claude/Projects/robbe-messe-app
   gh repo create MrRobb86/robbe-messe-app --private --source . --push
   ```
   (Private Repos: Actions funktionieren, Pages nicht — brauchen wir nicht.)
2. **Eigenen Deploy-Key für die Action** erzeugen (nicht den Mac-Key hochladen!):
   `ssh-keygen -t ed25519 -f /tmp/gh_deploy -N "" -C "github-actions-robbeversum"`
   Public Key zusätzlich auf dem Server in `authorized_keys` eintragen.
3. GitHub-Secrets setzen:
   ```bash
   gh secret set VPS_SSH_KEY < /tmp/gh_deploy      # danach /tmp/gh_deploy löschen!
   gh secret set VPS_HOST --body "srv1047901.hstgr.cloud"
   ```
   Falls vorhanden auch Build-Umgebung: `VITE_OWUI_KIOSK_KEY` etc. (siehe
   `.env.example`; noch nicht alle Werte existieren — dann weglassen, die App
   läuft mit Defaults aus der Config).
4. Workflow `.github/workflows/deploy.yml` anlegen:
   ```yaml
   name: Deploy zu VPS
   on:
     push:
       branches: [main]
   jobs:
     deploy:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v4
         - uses: actions/setup-node@v4
           with: { node-version: 20, cache: npm }
         - run: npm ci
         - run: npm run build
           env:
             VITE_OPENWEBUI_URL: https://ki.robbe-consulting.de
             VITE_OWUI_KIOSK_KEY: ${{ secrets.VITE_OWUI_KIOSK_KEY }}
         - name: SSH-Key einrichten
           run: |
             mkdir -p ~/.ssh
             echo "${{ secrets.VPS_SSH_KEY }}" > ~/.ssh/id_ed25519
             chmod 600 ~/.ssh/id_ed25519
             ssh-keyscan -H ${{ secrets.VPS_HOST }} >> ~/.ssh/known_hosts
         - name: rsync auf den Server
           run: rsync -az --delete dist/ root@${{ secrets.VPS_HOST }}:/var/www/robbeversum/
   ```
5. Committen, pushen, Action beobachten: `gh run watch`.
**Test:** Kleine sichtbare Änderung committen/pushen → nach ~2 Min. live unter
https://messe.robbe-consulting.de sichtbar. DAS ist das Abnahmekriterium
(„alles was im Repo geschrieben wird, ist sofort online").

### 7. Abschluss-Verifikation
- [ ] `https://messe.robbe-consulting.de` lädt das RobbeVersum (Attract-Mode startet)
- [ ] Website-Modul: robbe-consulting.de lädt im iframe (die Website erlaubt
      `frame-ancestors https://messe.robbe-consulting.de` bereits — nichts zu tun)
- [ ] Terminbuchung: Google-Kalender-Overlay öffnet
- [ ] Kamera-Hinweis: Visitenkarten-Scanner braucht HTTPS ✓ (jetzt gegeben) —
      Kameratest selbst geht nur am echten Gerät
- [ ] Push-Test aus Schritt 6.5 dokumentieren
- [ ] Florian mitteilen: Fully-Kiosk-Start-URL = `https://messe.robbe-consulting.de`

### Kontext, falls etwas Größeres unklar ist
Projekt-Doku im Repo: `KONZEPT.md` (Architektur & Entscheidungen), `CLAUDE.md`
(Konventionen), `README.md` (Checkliste). Der Betreiber ist Florian Robbe
(florian.robbe@robbe-consulting.de) — bei Zugangs-/Panel-Fragen direkt ihn fragen.
