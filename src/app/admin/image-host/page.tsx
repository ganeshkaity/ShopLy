"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { initializeApp, getApp, getApps } from "firebase/app";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getFirestore,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
} from "firebase/firestore";

type ImgBBLinkGroup = {
  filename?: string;
  name?: string;
  mime?: string;
  extension?: string;
  url?: string;
};

type UploadItem = {
  id: string;
  title: string;
  url_viewer: string;
  url: string;
  display_url: string;
  width: number;
  height: number;
  size: number;
  sizeText: string;
  dimText: string;
  delete_url: string;
  image?: ImgBBLinkGroup | null;
  thumb?: ImgBBLinkGroup | null;
  medium?: ImgBBLinkGroup | null;
  createdAt?: unknown;
};

const MAX_FILE_SIZE = 20 * 1024 * 1024;

// Hardcoded config (as requested)
const firebaseConfig = {
  apiKey: "AIzaSyBtAX-XAzKlhXoghd11iUc8pp4mPk5LnHE",
  authDomain: "bookzygovehicle.firebaseapp.com",
  databaseURL: "https://bookzygovehicle-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "bookzygovehicle",
  storageBucket: "bookzygovehicle.firebasestorage.app",
  messagingSenderId: "974715115648",
  appId: "1:974715115648:web:5239ff7afbd4f4dcac2e65",
  measurementId: "G-R59GLRL194",
};

const IMG_BB_KEY = "f836d90a7d863714c3ebfd67412a5cbf";

function formatBytes(bytes: number) {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  let value = bytes;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit += 1;
  }
  return `${value.toFixed(value >= 10 || unit === 0 ? 0 : 1)} ${units[unit]}`;
}

function escapeHtml(str: string) {
  return str
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export default function Page() {
  const app = useMemo(() => (getApps().length ? getApp() : initializeApp(firebaseConfig)), []);
  const db = useMemo(() => getFirestore(app), [app]);

  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [notice, setNotice] = useState<{ type: "ok" | "err" | "info"; text: string } | null>(null);
  const [search, setSearch] = useState("");
  const [items, setItems] = useState<UploadItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<UploadItem | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const dropRef = useRef<HTMLDivElement | null>(null);

  const showNotice = (type: "ok" | "err" | "info", text: string) => setNotice({ type, text });

  useEffect(() => {
    const q = query(collection(db, "images"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(
      q,
      (snap) => {
        const next = snap.docs.map((d) => {
          const data = d.data() as Omit<UploadItem, "id">;
          return {
            id: d.id,
            ...data,
            sizeText: data.sizeText || formatBytes(data.size || 0),
            dimText: data.dimText || `${data.width || 0} × ${data.height || 0}`,
          };
        });
        setItems(next);
      },
      () => showNotice("err", "Firestore sync failed. Check your rules.")
    );

    return () => unsubscribe();
  }, [db]);

  useEffect(() => {
    if (!file) {
      setPreviewUrl("");
      return;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  useEffect(() => {
    if (!dropRef.current) return;
    const el = dropRef.current;

    const onDragOver = (e: DragEvent) => {
      e.preventDefault();
      el.classList.add("dragover");
    };
    const onDragLeave = (e: DragEvent) => {
      e.preventDefault();
      el.classList.remove("dragover");
    };
    const onDrop = (e: DragEvent) => {
      e.preventDefault();
      el.classList.remove("dragover");
      const dropped = e.dataTransfer?.files?.[0];
      if (dropped) setFile(dropped);
    };

    el.addEventListener("dragover", onDragOver);
    el.addEventListener("dragleave", onDragLeave);
    el.addEventListener("drop", onDrop);

    return () => {
      el.removeEventListener("dragover", onDragOver);
      el.removeEventListener("dragleave", onDragLeave);
      el.removeEventListener("drop", onDrop);
    };
  }, []);

  const filtered = items.filter((item) => item.title.toLowerCase().includes(search.toLowerCase()));

  async function uploadToImgBB(selectedFile: File) {
    const formData = new FormData();
    formData.append("image", selectedFile);

    const res = await fetch(`https://api.imgbb.com/1/upload?key=${IMG_BB_KEY}`, {
      method: "POST",
      body: formData,
    });

    const json = await res.json();
    if (!res.ok || !json?.success) {
      throw new Error(json?.error?.message || "ImgBB upload failed");
    }

    return json.data as {
      url_viewer?: string;
      url?: string;
      display_url?: string;
      width?: number;
      height?: number;
      size?: number;
      delete_url?: string;
      image?: ImgBBLinkGroup;
      thumb?: ImgBBLinkGroup;
      medium?: ImgBBLinkGroup;
    };
  }

  async function onUpload() {
    setNotice(null);

    if (!IMG_BB_KEY) {
      showNotice("err", "ImageBB key missing.");
      return;
    }
    if (!file) {
      showNotice("err", "Pick an image first.");
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      showNotice("err", "File is bigger than 20 MB.");
      return;
    }

    try {
      setLoading(true);
      showNotice("info", "Uploading to ImgBB and saving metadata to Firestore...");

      const data = await uploadToImgBB(file);

      const payload = {
        title: title.trim() || file.name,
        url_viewer: data.url_viewer || "",
        url: data.image?.url || data.url || "",
        display_url: data.medium?.url || data.thumb?.url || data.display_url || "",
        width: data.width || 0,
        height: data.height || 0,
        size: data.size || file.size,
        sizeText: formatBytes(data.size || file.size),
        dimText: `${data.width || 0} × ${data.height || 0}`,
        delete_url: data.delete_url || "",
        image: data.image || null,
        thumb: data.thumb || null,
        medium: data.medium || null,
        createdAt: serverTimestamp(),
      };

      await addDoc(collection(db, "images"), payload);
      setTitle("");
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      showNotice("ok", "Upload complete.");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Upload failed.";
      showNotice("err", message);
    } finally {
      setLoading(false);
    }
  }

  async function copyText(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      showNotice("ok", "Copied to clipboard.");
    } catch {
      showNotice("err", "Copy failed.");
    }
  }

  async function deleteCurrent(item: UploadItem) {
    const ok = confirm(`Delete ${item.title}?`);
    if (!ok) return;

    try {
      await fetch(item.delete_url, { method: "GET", mode: "no-cors" }).catch(() => {});
      await deleteDoc(doc(db, "images", item.id));
      setSelected(null);
      showNotice("ok", "Deleted.");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Delete failed.";
      showNotice("err", message);
    }
  }

  const modalViewer = selected?.url_viewer || "-";
  const modalImage = selected?.image?.url || selected?.url || "";
  const modalThumb = selected?.thumb?.url || selected?.display_url || "-";
  const modalMedium = selected?.medium?.url || selected?.display_url || "-";
  const modalDelete = selected?.delete_url || "-";

  return (
    <main style={styles.page}>
      <section style={styles.hero}>
        <div style={styles.panel}>
          <div style={styles.badge}>⚡ Personal image hosting hub</div>
          <h1 style={styles.h1}>My Image Host</h1>
          <p style={styles.sub}>
            Upload images to ImgBB, store the metadata in Firestore, and browse everything from one gallery.
          </p>
          <div style={styles.stats}>
            <Stat label="Total uploads" value={items.length} />
            <Stat label="Latest size" value={items[0]?.sizeText || "0 B"} />
            <Stat label="Status" value="Live" />
          </div>
        </div>

        <div style={styles.panel}>
          <h2 style={styles.h2}>Upload image</h2>

          <div style={styles.field}>
            <label style={styles.label}>Title</label>
            <input
              style={styles.input}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter image title"
            />
          </div>

          <div
            ref={dropRef}
            style={styles.dropzone}
            onClick={() => fileInputRef.current?.click()}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") fileInputRef.current?.click();
            }}
          >
            <div>
              <strong>Drop image here or choose a file</strong>
              <small>PNG, JPG, WEBP, GIF • Max 20 MB</small>
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            hidden
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />

          {file && (
            <div style={styles.preview}>
              {previewUrl ? <img src={previewUrl} alt="Preview" style={styles.previewImg} /> : null}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={styles.previewName}>{file.name}</div>
                <div style={styles.previewInfo}>
                  {file.type || "unknown type"} • {formatBytes(file.size)}
                </div>
              </div>
              <button style={styles.ghostButton} onClick={() => setFile(null)} type="button">
                Clear
              </button>
            </div>
          )}

          <div style={styles.actions}>
            <button style={styles.primaryButton} onClick={onUpload} disabled={loading} type="button">
              {loading ? "Uploading..." : "Upload to ImgBB"}
            </button>
          </div>

          {notice ? <div style={{ ...styles.notice, ...noticeStyles[notice.type] }}>{notice.text}</div> : null}
        </div>
      </section>

      <section style={styles.toolbar}>
        <h2 style={styles.h2}>Your uploads</h2>
        <input
          style={{ ...styles.input, maxWidth: 420 }}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by title..."
        />
      </section>

      {filtered.length === 0 ? (
        <div style={styles.empty}>No images yet. Upload your first one and it will show up here.</div>
      ) : (
        <section style={styles.grid}>
          {filtered.map((item) => {
            const thumb = item.thumb?.url || item.medium?.url || item.display_url || item.url || "";
            return (
              <article key={item.id} style={styles.card} onClick={() => setSelected(item)}>
                {thumb ? (
                  <img src={thumb} alt={item.title} style={styles.thumb} loading="lazy" />
                ) : (
                  <div style={styles.thumbPlaceholder}>No Image</div>
                )}
                <div style={styles.cardBody}>
                  <div style={styles.cardTitle}>{item.title}</div>
                  <div style={styles.cardMeta}>
                    <span>{item.sizeText}</span>
                    <span>{item.dimText}</span>
                  </div>
                </div>
              </article>
            );
          })}
        </section>
      )}

      {selected ? (
        <div style={styles.modalOverlay} onClick={() => setSelected(null)}>
          <div style={styles.modalCard} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHead}>
              <div>
                <h2 style={{ ...styles.h2, marginBottom: 6 }}>{selected.title}</h2>
                <div style={styles.modalSub}>
                  {selected.sizeText} • {selected.dimText}
                </div>
              </div>
              <button style={styles.closeBtn} onClick={() => setSelected(null)} type="button">
                ✕
              </button>
            </div>

            <div style={styles.modalContent}>
              {modalImage ? (
                <img src={modalImage} alt={selected.title} style={styles.modalImg} />
              ) : (
                <div style={styles.modalPlaceholder}>No preview available</div>
              )}

              <div style={styles.details}>
                <div style={styles.detailCard}>
                  <h3 style={styles.detailTitle}>Info</h3>
                  <div style={styles.detailText}>
                    <div><b>File:</b> {selected.image?.filename || selected.thumb?.filename || selected.medium?.filename || selected.title}</div>
                    <div><b>Name:</b> {selected.image?.name || selected.thumb?.name || selected.medium?.name || "-"}</div>
                    <div><b>Mime:</b> {selected.image?.mime || selected.thumb?.mime || selected.medium?.mime || "-"}</div>
                    <div><b>Extension:</b> {selected.image?.extension || selected.thumb?.extension || selected.medium?.extension || "-"}</div>
                    <div><b>Width:</b> {selected.width || "-"}</div>
                    <div><b>Height:</b> {selected.height || "-"}</div>
                    <div><b>Size:</b> {selected.sizeText || "-"}</div>
                    <div><b>Firestore ID:</b> {selected.id}</div>
                  </div>
                </div>

                <div style={styles.detailCard}>
                  <h3 style={styles.detailTitle}>Links</h3>
                  <LinkRow label="Image Viewer" value={modalViewer} onCopy={() => copyText(modalViewer)} />
                  <LinkRow label="Image" value={modalImage || "-"} onCopy={() => copyText(modalImage)} />
                  <LinkRow label="Thumb" value={modalThumb} onCopy={() => copyText(modalThumb)} />
                  <LinkRow label="Medium" value={modalMedium} onCopy={() => copyText(modalMedium)} />
                  <LinkRow label="Delete URL" value={modalDelete} onCopy={() => copyText(modalDelete)} />
                </div>

                <div style={styles.actions}>
                  <button
                    style={styles.ghostButton}
                    onClick={() => modalViewer !== "-" && window.open(modalViewer, "_blank", "noopener,noreferrer")}
                    type="button"
                  >
                    Open viewer
                  </button>
                  <button style={styles.dangerButton} onClick={() => deleteCurrent(selected)} type="button">
                    Delete image
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div style={styles.stat}>
      <b>{value}</b>
      <span>{label}</span>
    </div>
  );
}

function LinkRow({ label, value, onCopy }: { label: string; value: string; onCopy: () => void }) {
  return (
    <div style={styles.linkItem}>
      <div style={styles.linkLabel}>{label}</div>
      <div style={styles.row}>
        <div style={styles.code}>{escapeHtml(value)}</div>
        <button style={styles.ghostButton} onClick={onCopy} type="button">
          Copy
        </button>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    padding: 18,
    background:
      "radial-gradient(1200px 700px at 10% 10%, rgba(124,92,255,.20), transparent 50%), radial-gradient(1000px 600px at 90% 0%, rgba(37,208,171,.16), transparent 50%), linear-gradient(180deg, #0b1020, #11182f)",
    color: "#eef2ff",
    fontFamily:
      'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },
  hero: {
    display: "grid",
    gridTemplateColumns: "1.3fr .9fr",
    gap: 18,
    marginBottom: 18,
  },
  panel: {
    background: "rgba(255,255,255,.08)",
    border: "1px solid rgba(255,255,255,.12)",
    borderRadius: 22,
    padding: 24,
    backdropFilter: "blur(18px)",
    boxShadow: "0 18px 55px rgba(0,0,0,.35)",
  },
  badge: {
    display: "inline-flex",
    alignItems: "center",
    gap: 10,
    padding: "8px 12px",
    borderRadius: 999,
    background: "rgba(255,255,255,.08)",
    color: "#b7c0e0",
    fontSize: 13,
    marginBottom: 14,
  },
  h1: { fontSize: "clamp(34px, 5vw, 56px)", lineHeight: 1, letterSpacing: "-0.05em", margin: "0 0 10px" },
  h2: { margin: 0, fontSize: 20, letterSpacing: "-0.03em" },
  sub: { margin: 0, color: "#b7c0e0", lineHeight: 1.6, fontSize: 15 },
  stats: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginTop: 18 },
  stat: {
    padding: "14px 16px",
    borderRadius: 18,
    background: "rgba(255,255,255,.06)",
    border: "1px solid rgba(255,255,255,.08)",
  },
  field: { display: "grid", gap: 8, marginTop: 18 },
  label: { color: "#b7c0e0", fontSize: 13 },
  input: {
    width: "100%",
    padding: "14px 15px",
    borderRadius: 16,
    border: "1px solid rgba(255,255,255,.12)",
    background: "rgba(8,12,24,.65)",
    color: "#eef2ff",
    outline: "none",
  },
  dropzone: {
    border: "1.5px dashed rgba(255,255,255,.20)",
    borderRadius: 20,
    padding: 18,
    minHeight: 140,
    display: "grid",
    placeItems: "center",
    textAlign: "center",
    background: "rgba(255,255,255,.04)",
    transition: ".2s ease",
    cursor: "pointer",
    marginTop: 14,
  },
  preview: {
    display: "flex",
    gap: 12,
    alignItems: "center",
    padding: 10,
    borderRadius: 18,
    background: "rgba(255,255,255,.05)",
    border: "1px solid rgba(255,255,255,.08)",
    marginTop: 14,
  },
  previewImg: { width: 72, height: 72, objectFit: "cover", borderRadius: 14, border: "1px solid rgba(255,255,255,.1)" },
  previewName: { whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", fontWeight: 700 },
  previewInfo: { color: "#b7c0e0", fontSize: 13, marginTop: 4 },
  actions: { display: "flex", gap: 10, flexWrap: "wrap", marginTop: 14 },
  primaryButton: {
    border: 0,
    cursor: "pointer",
    borderRadius: 16,
    padding: "12px 16px",
    fontWeight: 700,
    color: "#fff",
    background: "linear-gradient(135deg, #7c5cff, #5b8cff)",
    boxShadow: "0 12px 30px rgba(124,92,255,.22)",
  },
  ghostButton: {
    border: "1px solid rgba(255,255,255,.12)",
    cursor: "pointer",
    borderRadius: 16,
    padding: "12px 16px",
    fontWeight: 700,
    color: "#eef2ff",
    background: "rgba(255,255,255,.08)",
  },
  dangerButton: {
    border: 0,
    cursor: "pointer",
    borderRadius: 16,
    padding: "12px 16px",
    fontWeight: 700,
    color: "#fff",
    background: "linear-gradient(135deg, #ff5c7a, #ff9066)",
  },
  notice: {
    marginTop: 14,
    padding: "12px 14px",
    borderRadius: 16,
    border: "1px solid rgba(255,255,255,.1)",
    lineHeight: 1.5,
    fontSize: 14,
  },
  toolbar: {
    display: "flex",
    gap: 12,
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "space-between",
    margin: "18px 0 14px",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(210px, 1fr))",
    gap: 14,
  },
  card: {
    overflow: "hidden",
    borderRadius: 20,
    background: "rgba(255,255,255,.07)",
    border: "1px solid rgba(255,255,255,.10)",
    cursor: "pointer",
    transition: "transform .18s ease, border-color .18s ease",
  },
  thumb: { aspectRatio: "1 / 1", width: "100%", background: "rgba(255,255,255,.05)", objectFit: "cover", display: "block" },
  thumbPlaceholder: {
    aspectRatio: "1 / 1",
    width: "100%",
    display: "grid",
    placeItems: "center",
    background: "rgba(255,255,255,.05)",
    color: "#b7c0e0",
  },
  cardBody: { padding: 12 },
  cardTitle: { fontWeight: 700, marginBottom: 6, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  cardMeta: { color: "#b7c0e0", fontSize: 12, display: "flex", justifyContent: "space-between", gap: 10 },
  empty: {
    padding: 34,
    textAlign: "center",
    color: "#b7c0e0",
    border: "1px dashed rgba(255,255,255,.14)",
    borderRadius: 22,
    background: "rgba(255,255,255,.04)",
  },
  modalOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,.6)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    zIndex: 50,
  },
  modalCard: {
    width: "min(1000px, 100%)",
    maxHeight: "92vh",
    overflow: "auto",
    background: "#0d1428",
    border: "1px solid rgba(255,255,255,.12)",
    borderRadius: 28,
    boxShadow: "0 18px 55px rgba(0,0,0,.35)",
  },
  modalHead: {
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    alignItems: "center",
    padding: "18px 18px 0",
  },
  closeBtn: {
    width: 42,
    height: 42,
    display: "grid",
    placeItems: "center",
    borderRadius: 14,
    background: "rgba(255,255,255,.08)",
    color: "#eef2ff",
    border: 0,
    cursor: "pointer",
    fontSize: 18,
  },
  modalSub: { color: "#b7c0e0", fontSize: 13 },
  modalContent: {
    display: "grid",
    gridTemplateColumns: "1.1fr .9fr",
    gap: 16,
    padding: 18,
  },
  modalImg: {
    width: "100%",
    maxHeight: "68vh",
    objectFit: "contain",
    background: "rgba(255,255,255,.04)",
    borderRadius: 22,
    border: "1px solid rgba(255,255,255,.10)",
  },
  modalPlaceholder: {
    width: "100%",
    minHeight: 400,
    display: "grid",
    placeItems: "center",
    background: "rgba(255,255,255,.04)",
    borderRadius: 22,
    border: "1px solid rgba(255,255,255,.10)",
    color: "#b7c0e0",
  },
  details: { display: "grid", gap: 12, alignContent: "start" },
  detailCard: {
    padding: 14,
    borderRadius: 18,
    border: "1px solid rgba(255,255,255,.10)",
    background: "rgba(255,255,255,.05)",
  },
  detailTitle: { margin: "0 0 8px", fontSize: 15 },
  detailText: { color: "#b7c0e0", fontSize: 13, lineHeight: 1.7 },
  linkItem: { display: "grid", gap: 6, marginTop: 12 },
  linkLabel: { fontSize: 12, fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase", color: "#8fa0d6" },
  row: { display: "grid", gridTemplateColumns: "1fr auto", gap: 10, alignItems: "center" },
  code: {
    fontSize: 12,
    lineHeight: 1.5,
    wordBreak: "break-all",
    padding: "10px 12px",
    borderRadius: 14,
    background: "rgba(5,8,16,.75)",
    border: "1px solid rgba(255,255,255,.08)",
    color: "#dfe6ff",
  },
};

const noticeStyles: Record<"ok" | "err" | "info", React.CSSProperties> = {
  ok: { display: "block", background: "rgba(37,208,171,.12)" },
  err: { display: "block", background: "rgba(255,92,122,.12)" },
  info: { display: "block", background: "rgba(124,92,255,.12)" },
};