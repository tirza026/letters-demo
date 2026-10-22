# Letters to Leo — portfolio demo

A fully interactive demo of the letters app with a fictional child (Leo) and seven sample
letters from birth to age six. It needs no account or server: everything runs in the
visitor's browser. Anything a visitor writes stays in their own browser only, and the
**reset** button (bottom-left, or settings → reset demo) brings back the sample letters.

```
index.html        the app
demo-runtime.js   sample letters + in-browser storage
media/            illustrated sample photos
vendor/           fonts and libraries (no outside services needed)
```

## Option A — GitHub Pages (free)

1. Sign in at github.com and click **New repository**. Name it `letters-demo`, set it to
   **Public**, and click **Create repository**.
2. Click **uploading an existing file**. Drag in everything from this folder
   (`index.html`, `demo-runtime.js`, `README.md`, and the `media` and `vendor` folders),
   then click **Commit changes**.
3. Go to **Settings → Pages**. Under *Build and deployment* choose **Deploy from a branch**,
   branch **main**, folder **/ (root)**, then **Save**.
4. After a minute or two it's live at `https://<your-github-username>.github.io/letters-demo/`.

## Option B — your Synology (it's already running a web server)

1. In File Station, open `docker/letterbox/public` and create a folder called `demo`.
2. Upload everything from this folder into `docker/letterbox/public/demo`.
3. It's live straight away at `https://letterstoj.synology.me/demo/`, with no login needed.
   Your real letters stay behind the password; the demo only contains the sample letters.

   Note: when you update the real app by replacing the `public` folder, copy the `demo`
   folder back in (or keep a copy of this zip).

## Put it in Framer

1. In your case study page, add an **Embed** component (Insert → Embed), choose **URL**,
   and paste the demo link.
2. Size it like a phone: **390 × 844**. Rounded corners (~40) and a drop shadow make it
   read as a phone screen; or place it inside a phone mockup frame.
3. Under it, add a text link "Open the demo full screen ↗" pointing to the same URL.
   Embedded prototypes feel cramped on small screens, and recruiters on phones will prefer it.
4. Sound and pinch-zoom work best when opened full screen.

## Things worth showing in the walkthrough

- Tap the box → envelopes rise out; pick one → the stamp peels off and the letter slides out
- Swipe the letter sideways → pages shuffle like paper
- Tap the photo collage → gallery with swipe and pinch-zoom
- Write a letter: envelope papers, stamp categories, photo framing, signature choice
- Settings → my handwriting → write on screen to turn your handwriting into a font
