# OM Programming Lab

Web app for **Mohamed and Omar** — track **projects you've done**, **things you need to make**, the **project you're working on** with a progress bar, **done projects on GitHub**, and **tasks for each other**.

**No database:** all changes are saved in your browser (localStorage). You can host it on GitHub Pages and use it from any PC; each device keeps its own data.

---

## Project structure

```
om-programming-lab/
  om programming lab/     ← web app (all files here)
    index.html
    styles.css
    app.js
    manifest.webmanifest
    sw.js
    assets/
      icon-192.png
      icon-512.png
  README.md
  package.json
```

Edit the app in the **om programming lab** folder: **index.html**, **styles.css**, **app.js**.

---

## Put it on GitHub Pages (for you and Omar)

1. Push this repo to GitHub (e.g. repo name: `om-programming-lab`).
2. On GitHub: **Settings → Pages**.
3. Under **Source** choose **Deploy from a branch**.
4. Branch: **main** (or **master**), folder: **/ (root)**. Save.
5. After a minute, the app is at:  
   **`https://<your-username>.github.io/om-programming-lab/om%20programming%20lab/`**  
   (or copy the exact URL from the Pages settings)

Share that link with Omar. You and Omar each open it in your browser; your data is saved on your own PC (no account, no server).

---

## Install on your PC (like an app)

1. Open the app in **Chrome** or **Edge** (from GitHub Pages or from `index.html` with a local server).
2. In the address bar, click the **install** icon (⊕ or “Install app” / “App available”).
3. Click **Install**. The app opens in its own window and you can pin it to the taskbar or Start menu.

After that you can open “OM Programming Lab” from the Start menu like any installed app. Everything still saves in the browser on that PC (no database).

---

## Run locally (optional)

- **Quick:** Open the **om programming lab** folder and double‑click **index.html** (or drag it into your browser). For PWA install you need HTTPS.
- **With a server:** From the project root run `npm start`, then open **http://localhost:3000**. The server serves the **om programming lab** folder.

---

## Data (no database)

All lists, progress, GitHub projects, and tasks are stored in **localStorage** in the browser. Nothing is sent to a server. Each device (your PC, Omar’s PC) has its own data.
