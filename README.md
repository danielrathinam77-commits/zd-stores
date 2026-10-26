# ZD STORZ: deployment guide

## What you need
- A small Linux server (Ubuntu 22.04 or 24.04, 1 GB RAM is enough) with a public IP
- A domain name with an A record pointing to the server's IP

## First deploy
1. Install Docker: `curl -fsSL https://get.docker.com | sh`
2. Allow only the needed ports: `ufw allow 22 && ufw allow 80 && ufw allow 443 && ufw enable`
3. Upload this folder to the server (for example `scp -r zd-storz root@SERVER_IP:/opt/`).
4. In the folder: `cp .env.example .env`, then edit `.env`. Fill in every line.
5. Start: `docker compose up -d --build`
6. Open `https://your-domain` (the HTTPS certificate is issued automatically). Admin panel: `/admin`.

If the app container keeps restarting, run `docker compose logs app`. A missing `.env` value is named there.

## Daily backup
`crontab -e`, then add:
`0 2 * * * /opt/zd-storz/scripts/backup.sh`
Backups are saved in the data volume. Also copy them off the server regularly (for example with rsync or your provider's snapshots).

## Updating the site
Upload the new files, then run `docker compose up -d --build`. Orders and settings are kept.

## Changing customer codes
Edit `VIP_CODE` / `WHOLESALE_CODE` in `.env`, then `docker compose up -d`.

## Forgot the admin password
`docker compose exec app node -e "const b=require('bcryptjs'),d=require('better-sqlite3')('/data/store.db');d.prepare('update admins set hash=?').run(b.hashSync(process.argv[1],12))" 'NewStrongPassword!'`

## Before taking real orders
Payments are a demo. Connect a real gateway (for example Razorpay) first, and add your privacy and returns policies.
