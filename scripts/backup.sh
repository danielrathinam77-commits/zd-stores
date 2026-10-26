#!/bin/sh
# Daily database backup. Keeps the newest 14 copies inside the data volume.
cd "$(dirname "$0")/.." || exit 1
docker compose exec -T app node -e "const fs=require('fs');fs.mkdirSync('/data/backups',{recursive:true});require('better-sqlite3')('/data/store.db').backup('/data/backups/store-'+new Date().toISOString().slice(0,10)+'.db').then(()=>process.exit(0))"
docker compose exec -T app sh -c "ls -1t /data/backups/*.db | tail -n +15 | xargs -r rm"
