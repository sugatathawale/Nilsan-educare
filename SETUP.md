# Neon + Bunny Stream setup (Nilsan Educare)

Your app uses **two services**:

| Service | Stores | Used for |
|---|---|---|
| **Neon (PostgreSQL)** | Users, courses, lessons metadata, payments, enrollments | App database |
| **Bunny Stream** | Actual video files + streaming | Lecture playback |

Neon never stores video files. Lessons only save `videoId` + embed URL.

---

## Part 1 — Neon (database)

### 1. Create a Neon project
1. Go to [https://console.neon.tech](https://console.neon.tech) and sign up / log in.
2. Click **Create project**.
3. Name it e.g. `nilsan-educare`.
4. Pick a region close to India (or your users).
5. Create the project.

### 2. Copy the connection string
1. Open the project → **Dashboard** / **Connection details**.
2. Copy the **connection string** (URI).
3. It looks like:

```text
postgresql://neondb_owner:xxxx@ep-cool-name-xxxxx.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
```

### 3. Put it in backend env
Open `backend/.env` and set:

```env
DATABASE_URL="paste-your-neon-uri-here"
```

Keep the quotes. Make sure `sslmode=require` is present.

### 4. Push schema + seed
From the repo root:

```bash
cd backend
npm install
npm run db:generate
npm run db:push
npm run db:seed
```

- `db:push` creates tables on Neon  
- `db:seed` adds the default English course + lessons  

Optional: open data browser:

```bash
npm run db:studio
```

---

## Part 2 — Bunny Stream (videos)

### 1. Create a Bunny account + Stream library
1. Go to [https://bunny.net](https://bunny.net) and create an account.
2. Open **Stream**.
3. Click **Add Video Library** (e.g. `nilsan-lectures`).
4. Open that library.

### 2. Copy these 3 values into `backend/.env`

| Env variable | Where to find it |
|---|---|
| `BUNNY_STREAM_LIBRARY_ID` | Library page — numeric **Library ID** |
| `BUNNY_STREAM_API_KEY` | Stream → **API** → Video Library **API Key** (AccessKey) |
| `BUNNY_STREAM_CDN_HOSTNAME` | Library details — CDN hostname like `vz-xxxx.b-cdn.net` |

Example:

```env
BUNNY_STREAM_LIBRARY_ID="123456"
BUNNY_STREAM_API_KEY="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
BUNNY_STREAM_CDN_HOSTNAME="vz-abc123def.b-cdn.net"
```

### 3. Restart the backend
After saving `.env`:

```bash
cd backend
npm run dev
```

On **Admin → Lessons** you should see a green banner: **Bunny Stream Connected**.

---

## Part 3 — Run the app

Terminal 1 — API:

```bash
npm run dev:backend
```

Terminal 2 — Frontend:

```bash
npm run dev
```

Then open:

- Site: http://localhost:3000  
- Admin: http://localhost:3000/admin/login  

**Demo admin**

- Email: `admin@nilsaneducare.com`  
- Password: `admin123`  

---

## How video upload works

1. Admin opens **Lessons** → **Add Lesson**.
2. Fills title / order / duration.
3. Chooses a video file (MP4/MOV, up to 500 MB).
4. Backend:
   - Creates a video entry in Bunny
   - Uploads the file to Bunny (API key never leaves the server)
   - Saves `videoId` + embed URL in **Neon** on the `Lesson` row
5. Students later play via Bunny embed URL  
   `https://iframe.mediadelivery.net/embed/{libraryId}/{videoId}`

Deleting a lesson also deletes the Bunny video (when configured).

---

## Checklist

- [ ] Neon project created  
- [ ] `DATABASE_URL` pasted into `backend/.env`  
- [ ] Ran `db:generate`, `db:push`, `db:seed`  
- [ ] Bunny Stream library created  
- [ ] `BUNNY_STREAM_LIBRARY_ID` set  
- [ ] `BUNNY_STREAM_API_KEY` set  
- [ ] `BUNNY_STREAM_CDN_HOSTNAME` set  
- [ ] Backend restarted  
- [ ] Admin Lessons page shows Bunny **Connected**  
- [ ] Test upload one short MP4  

---

## Troubleshooting

| Problem | Fix |
|---|---|
| `Invalid environment variables` / DB errors | Check `DATABASE_URL` is the full Neon URI with `sslmode=require` |
| Admin login fails | Restart backend after changing `ADMIN_PASSWORD`; confirm API runs on port 4000 |
| Bunny banner is orange | Fill all Bunny env vars and restart backend |
| Upload fails | File must be a video; max 500 MB; API key must be the **Stream library** AccessKey |
| Video plays blank | Wait 1–5 minutes for Bunny encoding after upload |

Need help wiring your real Neon/Bunny keys? Paste the values into `backend/.env` (never commit that file) and restart the servers.
