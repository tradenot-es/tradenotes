# Self-hosting TradeNot.es

TradeNot.es is a trading journal (NinjaTrader add-on, Interactive Brokers Flex, TradingView and CSV import,
calendar, reports, journal). You can run your own copy with Docker: **one container, one folder** for all data.

- Image: `ghcr.io/tradenot-es/tradenotes` (linux/amd64 and linux/arm64)
- Data: everything lives in `/data` inside the container (database, screenshots, daily backups)
- Database: a PostgreSQL 18 runs inside the container. If you prefer your own Postgres, set `DATABASE_URL`.
- No account at tradenot.es, no telemetry, no analytics. The app only talks to the internet for what you use:
  the calendar fetches public Fed and White House schedules (turn off with `MARKET_EVENTS=off`), and the
  Interactive Brokers sync talks to IBKR.

## Quick start

### docker run

```sh
docker run -d --name tradenotes --restart unless-stopped \
  -p 3000:3000 \
  -v /path/to/tradenotes:/data \
  -e BASE_URL=http://192.168.1.10:3000 \
  ghcr.io/tradenot-es/tradenotes:latest
```

### Docker Compose

Use [`compose.yaml`](../compose.yaml) from this repository:

```sh
mkdir tradenotes && cd tradenotes
curl -O https://raw.githubusercontent.com/tradenot-es/tradenotes/main/compose.yaml
# set BASE_URL in compose.yaml, then
docker compose up -d
```

### Unraid

Install **TradeNot.es** from Community Applications. Until it is listed there, save
[`deploy/unraid/tradenotes.xml`](../deploy/unraid/tradenotes.xml) as
`/boot/config/plugins/dockerMan/templates-user/my-tradenotes.xml` and pick it under Docker → Add Container.
Data goes to `/mnt/user/appdata/tradenotes`, the container runs as `99:100` like other Unraid apps.

### Proxmox, Synology, TrueNAS, Portainer and others

Anything that runs Docker containers works the same way: map port 3000, map a folder to `/data`, set `BASE_URL`.
On Proxmox, run it in a VM or an LXC container with Docker installed.

### First start

Open `BASE_URL` in the browser. The first account you create becomes the **administrator** and is signed in
right away, no mail needed. After that, sign-up is closed. To let family or friends create their own
accounts, set `ALLOW_SIGNUP=true`.

## Settings

All settings are environment variables. Only `BASE_URL` is needed.

| Variable | Default | Meaning |
|---|---|---|
| `BASE_URL` | – (required) | The address you open TradeNot.es under, e.g. `https://journal.example.com` or `http://192.168.1.10:3000`. Used for links (shared trades, mails) and the login cookie. |
| `TRUSTED_ORIGINS` | – | More addresses you open it under, comma-separated (e.g. the IP next to the domain). Logins from other addresses are refused. |
| `PUID` / `PGID` | `1000` / `1000` | Owner of the files in `/data` (Unraid: `99` / `100`). |
| `ALLOW_SIGNUP` | `false` | `true`: more people can create accounts after the first one. |
| `TRUST_PROXY` | `false` | Set `true` when a reverse proxy (Caddy, Traefik, Nginx Proxy Manager…) is in front. Then the visitor's address comes from `X-Forwarded-For`, which the login rate limit needs. Without a proxy leave it off, or anybody could fake that header. |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` | – | Optional mail server for password-reset and confirmation mails. Port 465 uses TLS, others STARTTLS. |
| `MAIL_FROM` | `TradeNot.es <SMTP_USER>` | Sender of the mails. |
| `DATABASE_URL` | – | An existing PostgreSQL instead of the built-in one, e.g. `postgres://user:password@host:5432/tradenotes`. Needs the `pgcrypto` extension (part of standard Postgres). |
| `BETTER_AUTH_SECRET` | generated | Key that signs logins. Created once and kept in `/data/secret.key`. |
| `BACKUP_KEEP_DAYS` | `7` | Daily database dumps in `/data/backups` are kept this many days; `0` turns them off. Only for the built-in database. |
| `MARKET_EVENTS` | on | `off`: do not fetch Fed speeches and the White House schedule for the calendar. |
| `ADMIN_EMAILS` | – | More admin accounts by e-mail address (comma-separated). They also need two-factor login turned on. The first account is always admin. |

### Without a mail server

Everything works without mail. Accounts are confirmed automatically. If someone forgets their password,
they use "Forgot password?" as usual. The reset link is then written to the container log instead of being mailed:

```sh
docker logs tradenotes 2>&1 | grep "\[mail\]"
```

### Behind a reverse proxy

Point the proxy at port 3000, set `BASE_URL` to the public address and `TRUST_PROXY=true`. Example for Caddy:

```
journal.example.com {
	reverse_proxy tradenotes:3000
}
```

Opening TradeNot.es to the internet is fine. It has a rate limit on logins, account lock-out after
repeated wrong passwords, a captcha on sign-up and optional two-factor login (Account → Security).
Turn on two-factor login for the admin account.

## Backups

With the built-in database, the container writes a dump to `/data/backups` every day: the first one five
minutes after start, then every 24 hours. Back up the whole `/data` folder with your usual tool, such as the
Unraid appdata backup plugin, restic or Borg. The dumps are consistent even if the copy runs while the app is running.

A dump right now:

```sh
docker exec -u node tradenotes sh -c 'pg_dump -h /tmp -U tradenotes -d tradenotes -Fc -f /data/backups/manual.dump'
```

Restore into a fresh installation. Start the new container with an empty `/data` and do **not** create an
account. Copy the dump into its `/data/backups`, then run:

```sh
docker exec -u node tradenotes sh -c 'pg_restore -h /tmp -U tradenotes -d tradenotes --clean --if-exists /data/backups/<file>.dump'
docker restart tradenotes
```

Also copy `/data/uploads` (screenshots) over from the old installation.

## Updates

```sh
docker compose pull && docker compose up -d      # or: Unraid "Check for updates"
```

Database changes are applied automatically on start. Your data stays in `/data`.

## Reporting problems

Please open an issue: https://github.com/tradenot-es/tradenotes/issues. Include the version from the bottom
of the page and the output of `docker logs tradenotes`.
