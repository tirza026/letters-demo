// Portfolio demo runtime: the letters page runs entirely in the visitor's browser.
// Sample letters load on first visit; anything a visitor adds stays in their own browser.
// "Reset demo" puts the sample letters back.
(function () {
  const KEY = "letters-demo-db-v3", MEDIA = "letters-demo-media-";
  const SEED = {
    "meta/child": { name: "Leo", gender: "boy", birth: "2020-05-12", sign: "love, mama" },
    "letters/w1": { date: "2020-05-20", createdAt: 1, title: "welcome, little one", env: "cream", stamp: { design: 4 }, photos: ["newborn2.webp", "newborn.webp"],
      body: "Dear Leo,\n\nYou are eight days old and you already sneeze like your grandpa. You fall asleep with one hand on my collarbone, as if you're checking I'm still here.\n\nI am. I always will be." },
    "letters/w2": { date: "2020-12-24", createdAt: 2, title: "your first christmas", env: "xmas", stamp: { design: 3, frame: "#c8423b" }, photos: ["christmas.webp", "christmas2.webp"],
      body: "Dear Leo,\n\nYou were far more interested in the wrapping paper than anything inside it. You crumpled it for twenty minutes and laughed every single time.\n\nThe best present this year was you." },
    "letters/w3": { date: "2021-09-03", createdAt: 3, title: "the day you walked", env: "mint", stamp: { design: 15 }, photos: ["firstwalk.webp"],
      body: "Dear Leo,\n\nFour wobbly steps across the grass in the park, then you sat down hard and looked at me like you'd just discovered a secret.\n\nYou didn't stop walking for the rest of the afternoon." },
    "letters/w4": { date: "2023-05-12", createdAt: 4, title: "three candles", env: "bday", stamp: { design: 19, frame: "#e88aa8" }, photos: ["birthday.webp", "birthday2.webp"],
      stickers: [{ key: "s2", x: .86, y: .74, w: .13, r: 14 }],
      media: [{ id: "birthday-song.m4a", kind: "audio", type: "audio/mp4", dur: 18.6, label: "your birthday song" }],
      body: "Dear Leo,\n\nYou asked for a blue cake with \"lots of candles\". When we sang, you blew so hard you missed every one of them, then clapped for yourself anyway.\n\nHappy third birthday, my favourite person." },
    "letters/w5": { date: "2024-02-10", createdAt: 5, title: "your first ang bao", env: "cny", stamp: { design: 23, frame: "#c8423b" }, photos: ["chinesenewyear.webp"],
      body: "Dear Leo,\n\nYou said \"gong xi fa cai\" to every single auntie at the reunion dinner and collected nine red packets. You put them all under your pillow \"so they can sleep too\"." },
    "letters/w6": { date: "2025-01-06", createdAt: 6, title: "first day of school", env: "airmail", stamp: { design: 14, frame: "#2f55a8" }, photos: ["firstschool.webp"], sign: "love, mama & papa",
      body: "Dear Leo,\n\nYour new bag was nearly as big as you. You held my hand all the way to the gate, then let go without looking back.\n\nI cried in the car. Happy tears, mostly." },
    "letters/w7": { date: "2026-07-20", createdAt: 7, title: "you learned to swim", env: "blue", stamp: { design: 2, frame: "#2f8f8f" }, photos: ["swim.webp"],
      stickers: [{ key: "s8", x: .84, y: .47, w: .13, r: -10 }],
      doodles: [{ c: "#d8553f", w: .009, p: [[0.165,0.71],[0.145,0.685],[0.16,0.665],[0.185,0.67],[0.2,0.685],[0.215,0.67],[0.24,0.665],[0.255,0.685],[0.235,0.71],[0.2,0.74],[0.165,0.71]] }],
      body: "Dear Leo,\n\nYou kicked so hard the whole pool got splashed, came up laughing with water up your nose, and shouted \"again!\"\n\nThen we built a sandcastle and the waves took it. You said the sea must have wanted a house too.\n\nI hope you always jump in like that." }
  };

  /* ---------- storage ---------- */
  let cache;
  function load() { try { const s = localStorage.getItem(KEY); if (s) return JSON.parse(s); } catch (_) {} return JSON.parse(JSON.stringify(SEED)); }
  function persist() { try { localStorage.setItem(KEY, JSON.stringify(cache)); } catch (_) {} }
  cache = load();
  const docSubs = new Map(), colSubs = new Map();
  const clone = v => JSON.parse(JSON.stringify(v));
  const randomId = () => Math.random().toString(36).slice(2, 12) + Date.now().toString(36);
  const parentOf = p => p.split("/").slice(0, -1).join("/");
  const docSnap = p => ({ id: p.split("/").pop(), exists: cache[p] !== undefined, data: () => cache[p], metadata: { fromCache: false, hasPendingWrites: false } });
  function colSnap(c) {
    const depth = c.split("/").length + 1;
    const docs = Object.keys(cache).filter(k => k.startsWith(c + "/") && k.split("/").length === depth).sort().map(docSnap);
    return { docs, size: docs.length, empty: !docs.length, docChanges: () => [], metadata: { fromCache: false, hasPendingWrites: false } };
  }
  function emit(p) {
    (docSubs.get(p) || []).forEach(f => f(docSnap(p)));
    const c = parentOf(p); (colSubs.get(c) || []).forEach(f => f(colSnap(c)));
  }
  const merge = (a, b) => { const o = { ...a }; for (const [k, v] of Object.entries(b)) o[k] = v && typeof v === "object" && !Array.isArray(v) && o[k] && typeof o[k] === "object" && !Array.isArray(o[k]) ? merge(o[k], v) : v; return o; };
  function docRef(p) {
    return {
      id: p.split("/").pop(), path: p,
      async get() { return docSnap(p); },
      async set(d) { cache[p] = clone(d); persist(); emit(p); },
      async update(d) { if (cache[p] === undefined) throw Object.assign(new Error("missing"), { code: "invalid_argument" }); cache[p] = merge(cache[p], clone(d)); persist(); emit(p); },
      async delete() { delete cache[p]; persist(); emit(p); },
      onSnapshot(cb) { if (!docSubs.has(p)) docSubs.set(p, new Set()); docSubs.get(p).add(cb); setTimeout(() => cb(docSnap(p)), 0); return () => docSubs.get(p).delete(cb); },
      collection(sub) { return colRef(p + "/" + sub); }
    };
  }
  function colRef(c) {
    return {
      path: c,
      doc(id) { return docRef(c + "/" + (id || randomId())); },
      async add(d) { const r = docRef(c + "/" + randomId()); await r.set(d); return r; },
      async get() { return colSnap(c); },
      onSnapshot(cb) { if (!colSubs.has(c)) colSubs.set(c, new Set()); colSubs.get(c).add(cb); setTimeout(() => cb(colSnap(c)), 0); return () => colSubs.get(c).delete(cb); }
    };
  }
  const db = { doc: docRef, collection: colRef };

  /* ---------- photos, videos and sound a visitor adds ---------- */
  // kept in this browser's IndexedDB (localStorage is far too small for video)
  const mem = {};
  const IDB = "letters-demo-media";
  function idb() { return new Promise((res, rej) => { const r = indexedDB.open(IDB, 1); r.onupgradeneeded = () => r.result.createObjectStore("files"); r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); }); }
  async function idbDo(mode, fn) { const d = await idb(); return new Promise((res, rej) => { const t = d.transaction("files", mode), st = t.objectStore("files"), q = fn(st); t.oncomplete = () => { d.close(); res(q && q.result); }; t.onerror = t.onabort = () => { d.close(); rej(t.error); }; }); }
  // load what this visitor added before, so the pictures and players can find it straight away
  const ready = (async () => {
    try {
      const d = await idb();
      await new Promise(res => { const t = d.transaction("files", "readonly"), c = t.objectStore("files").openCursor();
        c.onsuccess = () => { const cur = c.result; if (cur) { mem[cur.key] = URL.createObjectURL(cur.value); cur.continue(); } };
        t.oncomplete = t.onerror = () => { d.close(); res(); }; });
    } catch (_) {}
    // older demo versions kept photos in localStorage
    try { Object.keys(localStorage).filter(k => k.startsWith(MEDIA)).forEach(k => { const id = k.slice(MEDIA.length); if (!mem[id]) mem[id] = localStorage.getItem(k); }); } catch (_) {}
  })();
  const ATTRS = { img: "src", image: "href", video: "src", audio: "src", source: "src" };
  const check = (el, attr) => { const v = el.getAttribute(attr); if (v && v.startsWith("media/u-")) { const u = mem[v.slice(6)]; if (u) el.setAttribute(attr, u); } };
  const fix = node => {
    if (node.nodeType !== 1) return;
    const own = ATTRS[node.tagName.toLowerCase()]; if (own) check(node, own);
    if (node.tagName === "VIDEO") check(node, "poster");
    if (node.tagName === "A") check(node, "href");
    node.querySelectorAll && node.querySelectorAll("[src^='media/u-'],[href^='media/u-'],video[poster^='media/u-']").forEach(n => { ["src", "href", "poster"].forEach(a => n.hasAttribute(a) && check(n, a)); });
  };
  new MutationObserver(list => list.forEach(m => { if (m.type === "attributes") fix(m.target); else m.addedNodes.forEach(fix); }))
    .observe(document.documentElement, { subtree: true, childList: true, attributes: true, attributeFilter: ["src", "href", "poster"] });
  // media elements given a src before they're on the page still need fixing up
  for (const [P, prop] of [[HTMLMediaElement.prototype, "src"], [HTMLImageElement.prototype, "src"], [HTMLVideoElement.prototype, "poster"]]) {
    const d = Object.getOwnPropertyDescriptor(P, prop);
    if (d && d.set) Object.defineProperty(P, prop, { ...d, set(v) { const s = String(v); const i = s.indexOf("media/u-"); d.set.call(this, i >= 0 && mem[s.slice(i + 6)] ? mem[s.slice(i + 6)] : v); } });
  }
  const assets = {
    async upload(blob, opt, onProgress) {
      const id = "u-" + randomId(), type = (opt && opt.type) || blob.type;
      const b = type && blob.type !== type ? new Blob([blob], { type }) : blob;
      try { await idbDo("readwrite", st => st.put(b, id)); }
      catch (e) { throw Object.assign(new Error("Storage is full"), { code: "quota_exceeded" }); }
      mem[id] = URL.createObjectURL(b); if (onProgress) onProgress(1);
      return { id, url: mem[id], sizeBytes: b.size, contentType: type };
    },
    async delete(ref) { const id = String(ref).replace(/^.*media\//, ""); if (mem[id] && mem[id].startsWith("blob:")) URL.revokeObjectURL(mem[id]); delete mem[id];
      try { await idbDo("readwrite", st => st.delete(id)); } catch (_) {} try { localStorage.removeItem(MEDIA + id); } catch (_) {} return { deleted: true }; },
    async list() { return { assets: [], usage: {} }; }
  };
  const downloads = { async save({ filename, data }) { const u = URL.createObjectURL(data instanceof Blob ? data : new Blob([data])); const a = document.createElement("a"); a.href = u; a.download = filename; a.click(); setTimeout(() => URL.revokeObjectURL(u), 60000); return { status: "saved" }; } };

  window.letterboxDemo = {
    reset() {
      try { Object.keys(localStorage).filter(k => k.startsWith(MEDIA) || k === KEY || k.startsWith("letters-")).forEach(k => localStorage.removeItem(k)); } catch (_) {}
      const go = () => location.reload();
      try { const r = indexedDB.deleteDatabase(IDB); r.onsuccess = r.onerror = r.onblocked = go; setTimeout(go, 1500); } catch (_) { go(); }
    }
  };
  window.claude = {
    async use(name) {
      await ready;
      if (name === "db") return db;
      if (name === "assets") return assets;
      if (name === "downloads") return downloads;
      return null;
    }
  };
})();
