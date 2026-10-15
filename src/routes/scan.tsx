import { createFileRoute, Link } from "@tanstack/react-router";
import { Camera, ImagePlus, RefreshCw, SwitchCamera, Upload, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { ScanResults } from "@/components/ScanResults";
import { captureVideoFrame, checkFrameQuality, fileToResizedDataUrl } from "@/lib/image-utils";
import { mergeShots, type ScanItem } from "@/lib/scan";
import { useAppStore } from "@/lib/app-store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/scan")({
  head: () => ({
    meta: [
      { title: "Scan Fridge — AI ingredient scanner | What2Cook" },
      { name: "description", content: "Upload fridge photos or use your live camera. AI identifies and counts your food, then matches recipes." },
      { property: "og:title", content: "Scan Fridge | What2Cook" },
      { property: "og:description", content: "Snap your fridge shelves and find out what you can cook." },
    ],
  }),
  component: ScanPage,
});

const MAX_UPLOAD = 4;
const MAX_SHOTS = 6;
type Tab = "upload" | "camera";

async function scanImages(images: string[]): Promise<ScanItem[]> {
  let res: Response;
  try {
    res = await fetch("/api/scan", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ images }) });
  } catch {
    throw new Error("We couldn't reach the scanner. Check your internet connection and try again.");
  }
  const data = await res.json().catch(() => ({}));
  if (res.status === 429) throw new Error("Too many scans right now. Please wait a minute and try again.");
  if (res.status === 402) throw new Error("AI usage limit reached for now. Please try again later.");
  if (res.status === 400 || res.status === 422) throw new Error("We couldn't read these photos. Try clearer, well-lit pictures.");
  if (!res.ok) throw new Error("Something went wrong while scanning. Please try again.");
  if (!data.items?.length) throw new Error("EMPTY");
  return data.items as ScanItem[];
}

function ScanPage() {
  const { setLastScan } = useAppStore();
  const [tab, setTab] = useState<Tab>("upload");
  const [photos, setPhotos] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [items, setItemsState] = useState<ScanItem[] | null>(null);
  const [multi, setMulti] = useState(false);

  const setItems = useCallback((fn: (p: ScanItem[]) => ScanItem[]) => setItemsState((p) => fn(p ?? [])), []);

  useEffect(() => {
    if (items) setLastScan({ at: new Date().toISOString(), items });
  }, [items, setLastScan]);

  async function run() {
    setBusy(true);
    setError(null);
    try {
      const found = await scanImages(photos);
      setMulti(photos.length > 1 || !!items);
      setItemsState((prev) => (prev && prev.length ? mergeShots([prev, found]) : found));
      setPhotos([]); // discard photos after the scan
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Scan failed.";
      setError(msg === "EMPTY" ? "We couldn't spot any food. Make sure the photo shows your fridge or food items clearly." : msg);
    } finally {
      setBusy(false);
    }
  }

  const reset = () => { setItemsState(null); setPhotos([]); setError(null); };
  const showResults = items && !busy && photos.length === 0;

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-8">
      <div>
        <h1 className="font-display text-4xl font-bold">Scan Fridge 📸</h1>
        <p className="text-muted-foreground">Your photos are used only to identify ingredients.</p>
      </div>

      {busy ? (
        <div className="rounded-3xl border bg-card p-10 text-center">
          <div className="mx-auto mb-4 size-14 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-lg font-bold">Looking inside your fridge…</p>
        </div>
      ) : showResults ? (
        <ScanResults items={items} setItems={setItems} multiShot={multi}
          onScanAgain={reset}
          onScanAnother={() => setTab("camera")} />
      ) : null}

      {!busy && (!showResults || tab === "camera" && photos.length > 0) && null}

      {!busy && !showResults && (
        <>
          <div className="grid grid-cols-2 gap-2 rounded-full bg-secondary p-1" role="tablist">
            {(["upload", "camera"] as const).map((t) => (
              <button key={t} role="tab" aria-selected={tab === t} onClick={() => { setTab(t); setPhotos([]); }}
                className={cn("rounded-full py-3 font-bold", tab === t ? "bg-card shadow-soft" : "text-muted-foreground")}>
                {t === "upload" ? "Upload Photo" : "Use Camera"}
              </button>
            ))}
          </div>

          {tab === "upload" ? (
            <UploadPanel photos={photos} setPhotos={setPhotos} />
          ) : (
            <CameraPanel photos={photos} setPhotos={setPhotos} onFallback={() => setTab("upload")} />
          )}

          {error && (
            <div className="rounded-3xl border border-destructive/40 bg-destructive/10 p-4">
              <p className="font-semibold">{error}</p>
              {photos.length > 0 && <Button variant="outline" size="sm" className="mt-2 rounded-full" onClick={run}><RefreshCw /> Retry</Button>}
            </div>
          )}

          <Button size="lg" className="h-14 w-full rounded-full text-lg" disabled={!photos.length} onClick={run}>
            Scan My Fridge
          </Button>
          {items && <Button variant="ghost" className="w-full" onClick={() => setPhotos([])}>Back to results</Button>}

          <div className="rounded-3xl bg-cream p-5 text-sm">
            <b>Tips:</b> Open the door fully, use good lighting, take one shelf per shot, and keep labels facing the camera.
          </div>
          <p className="text-center text-sm text-muted-foreground">
            Prefer to type? <Link to="/find" className="font-semibold text-primary">Pick ingredients by hand</Link>
          </p>
        </>
      )}

      {showResults && tab === "camera" && null}
    </div>
  );
}

function Thumbs({ photos, setPhotos, labelPrefix }: { photos: string[]; setPhotos: (fn: (p: string[]) => string[]) => void; labelPrefix: string }) {
  if (!photos.length) return null;
  return (
    <div className="flex gap-3 overflow-x-auto pb-1">
      {photos.map((p, i) => (
        <div key={i} className="relative shrink-0">
          <img src={p} alt={`${labelPrefix} ${i + 1}`} className="size-24 rounded-2xl object-cover" />
          <span className="absolute bottom-1 left-1 rounded-full bg-card/90 px-2 text-xs font-bold">{labelPrefix} {i + 1}</span>
          <button aria-label={`Remove ${labelPrefix} ${i + 1}`} onClick={() => setPhotos((ps) => ps.filter((_, j) => j !== i))}
            className="absolute -right-2 -top-2 rounded-full bg-destructive p-1 text-destructive-foreground"><X className="size-3" /></button>
        </div>
      ))}
    </div>
  );
}

function UploadPanel({ photos, setPhotos }: { photos: string[]; setPhotos: React.Dispatch<React.SetStateAction<string[]>> }) {
  const [drag, setDrag] = useState(false);
  async function add(files: FileList | null) {
    if (!files) return;
    const list = [...files].filter((f) => f.type.startsWith("image/")).slice(0, MAX_UPLOAD - photos.length);
    const urls = await Promise.all(list.map((f) => fileToResizedDataUrl(f).catch(() => null)));
    setPhotos((p) => [...p, ...(urls.filter(Boolean) as string[])].slice(0, MAX_UPLOAD));
  }
  return (
    <div className="space-y-4">
      <label
        onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => { e.preventDefault(); setDrag(false); add(e.dataTransfer.files); }}
        className={cn("flex cursor-pointer flex-col items-center gap-2 rounded-3xl border-2 border-dashed bg-card p-8 text-center", drag && "border-primary bg-secondary")}
      >
        <Upload className="size-8 text-primary" />
        <span className="font-bold">Drop photos here or tap to choose</span>
        <span className="text-sm text-muted-foreground">Up to {MAX_UPLOAD} photos — one per shelf works best</span>
        <input type="file" accept="image/*" multiple className="sr-only" onChange={(e) => { add(e.target.files); e.target.value = ""; }} disabled={photos.length >= MAX_UPLOAD} />
      </label>
      <label className="flex cursor-pointer items-center justify-center gap-2 rounded-full border bg-card py-3 font-semibold md:hidden">
        <ImagePlus className="size-5" /> Take a photo
        <input type="file" accept="image/*" capture="environment" className="sr-only" onChange={(e) => { add(e.target.files); e.target.value = ""; }} />
      </label>
      <Thumbs photos={photos} setPhotos={setPhotos} labelPrefix="Photo" />
    </div>
  );
}

type CamState = "intro" | "starting" | "live" | "denied" | "nocamera" | "busy" | "error";

function CameraPanel({ photos, setPhotos, onFallback }: { photos: string[]; setPhotos: React.Dispatch<React.SetStateAction<string[]>>; onFallback: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [state, setState] = useState<CamState>("intro");
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [deviceIdx, setDeviceIdx] = useState(-1);
  const [warn, setWarn] = useState<string | null>(null);
  const [auto, setAuto] = useState(false);
  const [countdown, setCountdown] = useState(3);

  const stop = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }, []);

  const start = useCallback(async (idx: number) => {
    if (!navigator.mediaDevices?.getUserMedia) { setState("nocamera"); return; }
    setState("starting");
    stop();
    try {
      const constraints: MediaStreamConstraints = {
        video: idx >= 0 && devices[idx] ? { deviceId: { exact: devices[idx]!.deviceId } } : { facingMode: "environment", width: { ideal: 1920 } },
        audio: false,
      };
      const s = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = s;
      if (videoRef.current) { videoRef.current.srcObject = s; await videoRef.current.play().catch(() => {}); }
      const all = (await navigator.mediaDevices.enumerateDevices()).filter((d) => d.kind === "videoinput");
      setDevices(all);
      setState("live");
    } catch (e) {
      const name = (e as DOMException)?.name;
      setState(name === "NotAllowedError" || name === "SecurityError" ? "denied" : name === "NotFoundError" || name === "OverconstrainedError" ? "nocamera" : name === "NotReadableError" ? "busy" : "error");
    }
  }, [devices, stop]);

  useEffect(() => stop, [stop]);

  const capture = useCallback(() => {
    const v = videoRef.current;
    if (!v || state !== "live" || !v.videoWidth) return;
    if (photos.length >= MAX_SHOTS) return;
    const q = checkFrameQuality(v);
    if (q === "dark") { setWarn("That shot looks too dark — add some light and try again."); return; }
    if (q === "blurry") { setWarn("That shot looks blurry — hold steady and try again."); return; }
    setWarn(null);
    setPhotos((p) => [...p, captureVideoFrame(v)].slice(0, MAX_SHOTS));
  }, [photos.length, setPhotos, state]);

  // keyboard: Space to capture
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (e.code === "Space" && !["INPUT", "TEXTAREA", "BUTTON"].includes(t.tagName)) { e.preventDefault(); capture(); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [capture]);

  // auto-capture every 3s
  useEffect(() => {
    if (!auto || state !== "live") return;
    if (photos.length >= MAX_SHOTS) { setAuto(false); return; }
    setCountdown(3);
    const tick = setInterval(() => setCountdown((c) => (c > 1 ? c - 1 : c)), 1000);
    const shot = setTimeout(capture, 3000);
    return () => { clearInterval(tick); clearTimeout(shot); };
  }, [auto, state, photos.length, capture]);

  if (state === "intro") {
    return (
      <div className="space-y-4 rounded-3xl border bg-card p-6 text-center">
        <Camera className="mx-auto size-10 text-primary" />
        <p className="font-semibold">Camera is used only to identify food items. Photos are not stored.</p>
        <p className="text-xs text-muted-foreground">The camera needs a secure (https) connection — this site already uses one.</p>
        <Button size="lg" className="rounded-full" onClick={() => start(-1)}>Allow camera</Button>
      </div>
    );
  }

  const problem: Partial<Record<CamState, React.ReactNode>> = {
    denied: (
      <>
        <p className="font-bold">Camera access was blocked.</p>
        <ol className="mt-2 list-decimal pl-5 text-left text-sm">
          <li>Tap the lock or camera icon next to the web address.</li>
          <li>Set Camera to "Allow".</li>
          <li>Reload this page and tap "Use Camera" again.</li>
        </ol>
      </>
    ),
    nocamera: <p className="font-bold">We couldn't find a camera, or this browser doesn't support it. You can upload photos instead.</p>,
    busy: <p className="font-bold">Your camera seems to be in use by another app. Close it and try again.</p>,
    error: <p className="font-bold">The camera couldn't start. Please try again.</p>,
  };
  if (problem[state]) {
    return (
      <div className="space-y-3 rounded-3xl border border-destructive/40 bg-destructive/10 p-5">
        {problem[state]}
        <div className="flex flex-wrap gap-2">
          {state !== "nocamera" && <Button variant="outline" className="rounded-full" onClick={() => start(deviceIdx)}><RefreshCw /> Try again</Button>}
          <Button className="rounded-full" onClick={onFallback}>Switch to Upload Photo</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative overflow-hidden rounded-3xl bg-foreground">
        <video ref={videoRef} playsInline muted className="aspect-[3/4] w-full object-cover sm:aspect-video" />
        {state === "live" && <div className="scan-line pointer-events-none absolute inset-x-0 h-1 bg-primary/80 shadow-[0_0_16px_var(--primary)]" />}
        <div className="absolute inset-x-0 top-3 text-center">
          <span className="rounded-full bg-card/90 px-3 py-1 text-xs font-bold">Point the camera at one fridge shelf at a time.</span>
        </div>
        {auto && <div className="absolute right-3 top-12 rounded-full bg-accent px-3 py-1 font-bold text-accent-foreground">{countdown}</div>}
      </div>

      {warn && <p className="rounded-2xl bg-accent/20 p-3 text-sm font-semibold">{warn}</p>}

      <div className="flex items-center justify-center gap-6">
        {devices.length > 1 ? (
          <Button size="icon" variant="outline" className="size-12 rounded-full" aria-label="Switch camera"
            onClick={() => { const n = (deviceIdx + 1) % devices.length; setDeviceIdx(n); start(n); }}>
            <SwitchCamera />
          </Button>
        ) : <span className="size-12" />}
        <button aria-label="Capture shelf photo" onClick={capture} disabled={state !== "live" || photos.length >= MAX_SHOTS}
          className="size-20 rounded-full border-4 border-primary bg-card shadow-soft transition active:scale-95 disabled:opacity-50">
          <span className="sr-only">Capture</span>
        </button>
        <span className="w-12 text-center text-sm font-bold">{photos.length}/{MAX_SHOTS}</span>
      </div>
      <p className="hidden text-center text-xs text-muted-foreground md:block">Press Space to capture</p>

      <div className="flex items-center justify-between rounded-2xl border bg-card p-3">
        <label className="flex items-center gap-2 text-sm font-semibold">
          <Switch checked={auto} onCheckedChange={setAuto} aria-label="Auto-capture every 3 seconds" /> Auto-capture every 3 s
        </label>
        {auto && <Button size="sm" variant="outline" className="rounded-full" onClick={() => setAuto(false)}>Stop</Button>}
      </div>

      <Thumbs photos={photos} setPhotos={setPhotos} labelPrefix="Shelf" />
      {photos.length > 1 && <p className="text-xs text-muted-foreground">Items seen in several shots are counted once.</p>}
    </div>
  );
}
