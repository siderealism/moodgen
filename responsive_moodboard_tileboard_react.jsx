import React, { useEffect, useMemo, useState } from "react";

/**
 * Responsive Moodboard Tileboard
 * - Full-bleed grid, square-ish tiles (fills entire viewport)
 * - Desktop: 3×4, Mobile (<640px): 2×4
 * - First tile is a header showing selected Aesthetic × Place and a Refresh button
 * - Remaining tiles are shuffled from the two selected categories
 * - Images fade in on load; subtle pop-in animation on refresh
 * - Includes defensive code for SSR and simple runtime sanity checks
 */

// -------------------- Master CONFIG --------------------
const CONFIG = {
  aesthetics: [
   {
    "name": "Miami Vice Neon Noir",
    "meta": { "subtitle": "electric / neon / retro‑futurism", "palette": ["#00E7F9", "#FF4FA5", "#4F2B7E"] },
    "tiles": [
      { "type": "word", "text": "electric", "color": "#00E7F9" },
      { "type": "word", "text": "neon", "color": "#FF4FA5" },
      { "type": "word", "text": "chrome", "color": "#EDEDED" },
      { "type": "word", "text": "synthwave", "color": "#4F2B7E" },
      { "type": "word", "text": "palms", "color": "#00A6E0" },
      { "type": "image", "src": "https://images.unsplash.com/photo-1630354225636-9846415c1d21?auto=format&fit=crop&w=1200&q=80", "alt": "Neon ‘Starlite’ sign glowing pink against a palm tree, Miami Beach:contentReference[oaicite:2]{index=2}" },
      { "type": "image", "src": "https://images.unsplash.com/photo-1578742903196-42ce22984ec9?auto=format&fit=crop&w=1200&q=80", "alt": "Classic yellow and white car parked by the Avalon hotel under green neon lights:contentReference[oaicite:3]{index=3}" },
      { "type": "image", "src": "https://images.unsplash.com/photo-1562147624-cc4020943c73?auto=format&fit=crop&w=1200&q=80", "alt": "Palm tree silhouetted against a teal and green neon night sky:contentReference[oaicite:4]{index=4}" },
      { "type": "image", "src": "https://images.unsplash.com/photo-1631379054647-376f289b059f?auto=format&fit=crop&w=1200&q=80", "alt": "Vibrant cityscape at night bathed in blue, pink and purple neon lights:contentReference[oaicite:5]{index=5}" },
      { "type": "image", "src": "https://images.unsplash.com/photo-1716904994199-094ff29d609f?auto=format&fit=crop&w=1200&q=80", "alt": "Grey sports car parked in front of a wall with colorful neon stripes:contentReference[oaicite:6]{index=6}" }
    ]
  },
  {
    "name": "Fincher's Sodium Vapor Sickness",
    "meta": { "subtitle": "sickly yellow‑green / desaturated amber / drained blue", "palette": ["#B5B35D", "#C5A469", "#5E6A74"] },
    "tiles": [
      { "type": "word", "text": "sodium", "color": "#B5B35D" },
      { "type": "word", "text": "paranoia", "color": "#5E6A74" },
      { "type": "word", "text": "industrial", "color": "#5C5C5C" },
      { "type": "word", "text": "obsession", "color": "#C5A469" },
      { "type": "word", "text": "decay", "color": "#444444" },
      { "type": "image", "src": "https://images.unsplash.com/photo-1642083493404-98a4a97c20bb?auto=format&fit=crop&w=1200&q=80", "alt": "Street lamp casting a warm yellow glow through tree leaves on a dark night:contentReference[oaicite:7]{index=7}" },
      { "type": "image", "src": "https://images.unsplash.com/photo-1739730560092-50f197591350?auto=format&fit=crop&w=1200&q=80", "alt": "Foggy highway lined with street lights disappearing into the mist:contentReference[oaicite:8]{index=8}" },
      { "type": "image", "src": "https://images.unsplash.com/photo-1605815745425-47ddb7438bde?auto=format&fit=crop&w=1200&q=80", "alt": "Vintage black typewriter on a dark wooden desk with aged papers" },
      { "type": "image", "src": "https://images.unsplash.com/photo-1730822577974-eaabaeb62409?auto=format&fit=crop&w=1200&q=80", "alt": "Dark hallway with a light coming in from the end; minimal corridor with cables on the ceiling:contentReference[oaicite:9]{index=9}" },
      { "type": "image", "src": "https://images.unsplash.com/photo-1597076966189-3d1775dab451?auto=format&fit=crop&w=1200&q=80", "alt": "Grey and black rotary telephone mounted on a white brick wall:contentReference[oaicite:10]{index=10}" }
    ]
  },
    {
      name: "Mendl's Pastry Box Pink",
      meta: { subtitle: "cotton candy / regal / analog nostalgia", palette: ["#F7CDD9", "#7E5F92", "#F6E5D4"] },
      tiles: [
        { type: "word", text: "cotton candy", color: "#F7CDD9" },
        { type: "word", text: "regal", color: "#7E5F92" },
        { type: "word", text: "cream", color: "#F6E5D4" },
        { type: "word", text: "burgundy", color: "#5C2A41" },
        { type: "word", text: "nostalgia", color: "#A67D5D" },
        { type: "image", src: "https://images.unsplash.com/photo-1566932520883-c3cef6df83a5?auto=format&fit=crop&w=1200&q=80", alt: "Pastel macarons, pink/blue" },
        { type: "image", src: "https://images.unsplash.com/photo-1694031764302-c32eedf4216c?auto=format&fit=crop&w=1200&q=80", alt: "Symmetrical pink building, green roof" },
        { type: "image", src: "https://images.unsplash.com/photo-1741555165521-4c9e762fb2e8?auto=format&fit=crop&w=1200&q=80", alt: "Vintage Kodak camera" },
        { type: "image", src: "https://images.unsplash.com/photo-1742236467776-8fcdd2e6a381?auto=format&fit=crop&w=1200&q=80", alt: "Opulent palace interior" },
        { type: "image", src: "https://images.unsplash.com/photo-1589535189132-7221b70db02a?auto=format&fit=crop&w=1200&q=80", alt: "Burgundy theater chairs" },
      ],
    },
  ],
  places: [
   {
  name: "Midnight Laundry",
  meta: { subtitle: "nocturnal / fluorescent / ritual", palette: ["#0E1E37", "#446688", "#CFE0ED"] },
  tiles: [
    { type: "word", text: "insomnia" },
    { type: "word", text: "fluorescent" },
    { type: "word", text: "ritual" },
    { type: "word", text: "solitude" },
    { type: "word", text: "repetition" },
    { type: "image", src: "https://images.unsplash.com/photo-1604335398549-1b80aadd00a8?auto=format&fit=crop&w=1200&q=80", alt: "empty laundromat interior with a long row of front‑loading washing machines under fluorescent lights", },
    { type: "image", src: "https://images.unsplash.com/photo-1743428471505-8391bc8c088a?auto=format&fit=crop&w=1200&q=80", alt: "nighttime view through a dark window into a small laundromat with glowing machines", },
    { type: "image", src: "https://images.unsplash.com/photo-1752805869096-9b149e6effa1?auto=format&fit=crop&w=1200&q=80", alt: "dim laundry room with an open front‑loading washing machine and scattered clothes", },
    { type: "image", src: "https://images.unsplash.com/photo-1675430409777-eaa846201440?auto=format&fit=crop&w=1200&q=80", alt: "fluorescent‑lit laundromat with shiny dryer doors and rolling carts", },
    { type: "image", src: "https://images.unsplash.com/photo-1749318475359-800b8318ee7f?auto=format&fit=crop&w=1200&q=80", alt: "black‑and‑white view of a narrow laundromat with stacked dryers and empty carts", }
  ]
},
    {
  name: "After the Party",
  meta: { subtitle: "remnants / dawn / stillness", palette: ["#F7CAC9", "#FFE1A8", "#CDEDF6"] },
  tiles: [
    { type: "word", text: "scattered" },
    { type: "word", text: "aftermath" },
    { type: "word", text: "dawn" },
    { type: "word", text: "remnants" },
    { type: "word", text: "quiet" },
    { type: "image", src: "https://images.unsplash.com/photo-1559456474-507a0d806eb7?auto=format&fit=crop&w=1200&q=80", alt: "assorted‑color confetti on floor", },
    { type: "image", src: "https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?auto=format&fit=crop&w=1200&q=80", alt: "a person using a vacuum to clean a carpet strewn with confetti", },
    { type: "image", src: "https://images.unsplash.com/photo-1503509563013-22b008324105?auto=format&fit=crop&w=1200&q=80", alt: "assorted‑color balloons on floor near a closed door", },
    { type: "image", src: "https://images.unsplash.com/photo-1659918151453-8cabafe3880e?auto=format&fit=crop&w=1200&q=80", alt: "empty bottles on a table at sunrise", },
    { type: "image", src: "https://images.unsplash.com/photo-1565986438088-b7d99e8c8184?auto=format&fit=crop&w=1200&q=80", alt: "rows of empty chairs after a ceremony", }
  ]
}
,
   {
  name: "The Shore",
  meta: { subtitle: "coastal / boundless / serene", palette: ["#E0E7FF", "#A7D0CB", "#F5D6BA"] },
  tiles: [
    { type: "word", text: "horizon" },
    { type: "word", text: "tidal" },
    { type: "word", text: "driftwood" },
    { type: "word", text: "vast" },
    { type: "word", text: "footprints" },
    { type: "image", src: "https://images.unsplash.com/photo-1755268359630-bba69be70fe5?auto=format&fit=crop&w=1200&q=80", alt: "sandy beach with distant people and grassy dunes", },
    { type: "image", src: "https://images.unsplash.com/photo-1755231907705-47c850dc5f22?auto=format&fit=crop&w=1200&q=80", alt: "calm ocean meeting a sandy beach with distant figures", },
    { type: "image", src: "https://images.unsplash.com/photo-1754778805689-1bd1da87eb96?auto=format&fit=crop&w=1200&q=80", alt: "rocky coastline with tide pools and waves", },
    { type: "image", src: "https://images.unsplash.com/photo-1734517455753-2bab9eaa9ee6?auto=format&fit=crop&w=1200&q=80", alt: "driftwood lying on a beach with the ocean beyond", },
    { type: "image", src: "https://images.unsplash.com/photo-1639825502320-9e59b9748f99?auto=format&fit=crop&w=1200&q=80", alt: "footprints in the sand near the shoreline", }
  ]
},{
  name: "Mirror, Mirror",
  meta: { subtitle: "reflection / transformation / community", palette: ["#ECD8F0", "#FDF5E6", "#C0BECF"] },
  tiles: [
    { type: "word", text: "reflection" },
    { type: "word", text: "transformation" },
    { type: "word", text: "salon" },
    { type: "word", text: "glamour" },
    { type: "word", text: "community" },
    { type: "image", src: "https://images.unsplash.com/photo-1706629503720-13cad35ce2e5?auto=format&fit=crop&w=1200&q=80", alt: "a hair salon with chairs and mirrors", },
    { type: "image", src: "https://images.unsplash.com/photo-1637777277337-f114350fb088?auto=format&fit=crop&w=1200&q=80", alt: "a hair salon with chairs and neon signs", },
    { type: "image", src: "https://images.unsplash.com/photo-1675034742143-151fc66c9d0b?auto=format&fit=crop&w=1200&q=80", alt: "a woman getting her hair styled in a mirror", },
    { type: "image", src: "https://images.unsplash.com/photo-1639574658063-859c220019e6?auto=format&fit=crop&w=1200&q=80", alt: "a close up of a hair dryer on a table", },
    { type: "image", src: "https://images.unsplash.com/photo-1587477444258-096b2d514c12?auto=format&fit=crop&w=1200&q=80", alt: "brown hair comb on a white wooden table", }
  ]
}

  ],
};

// -------------------- Utilities --------------------
function isClient() {
  return typeof window !== "undefined" && typeof document !== "undefined";
}

function useWindowSize() {
  const [size, setSize] = useState({
    w: isClient() ? window.innerWidth : 1024,
    h: isClient() ? window.innerHeight : 768,
  });

  useEffect(() => {
    if (!isClient()) return;
    const onResize = () => setSize({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return size;
}

function useGrid() {
  const { w } = useWindowSize();
  const isMobile = w < 640;
  const cols = isMobile ? 2 : 3;
  const rows = 4;
  return { isMobile, cols, rows };
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function sample(arr) {
  if (!Array.isArray(arr) || arr.length === 0) return undefined;
  return arr[Math.floor(Math.random() * arr.length)];
}

// -------------------- Tiles --------------------
function ImageTile({ src, alt }) {
  const [loaded, setLoaded] = useState(false);
  const [errored, setErrored] = useState(false);
  return (
    <div className="relative w-full h-full overflow-hidden bg-zinc-100">
      {!errored ? (
        <img
          src={src}
          alt={alt || "tile"}
          className="absolute inset-0 w-full h-full object-cover"
          draggable={false}
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
          onLoad={() => setLoaded(true)}
          onError={() => { setLoaded(true); setErrored(true); }}
          style={{
            opacity: loaded ? 1 : 0,
            filter: loaded ? "none" : "blur(6px)",
            transform: loaded ? "scale(1)" : "scale(1.02)",
            transition: "opacity 400ms ease-out, filter 600ms ease-out, transform 500ms ease-out",
            willChange: "opacity, transform, filter",
          }}
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-zinc-200">
          <span className="text-xs text-zinc-500">image unavailable</span>
        </div>
      )}
    </div>
  );
}

function WordTile({ text, color }) {
  return (
    <div className="flex items-center justify-center w-full h-full" style={{ backgroundColor: color || "#EEE" }}>
      <span className="text-zinc-900 text-2xl font-semibold tracking-wide select-none">{text}</span>
    </div>
  );
}

function Tile({ data, mountDelay = 0 }) {
  const style = {
    animation: `tile-pop 420ms cubic-bezier(0.22, 1, 0.36, 1) ${mountDelay}ms both`,
    willChange: "opacity, transform",
  };

  if (data.type === "word") {
    return (
      <div className="tile-wrap" style={style}>
        <WordTile text={data.text} color={data.color} />
      </div>
    );
  }
  if (data.type === "image") {
    return (
      <div className="tile-wrap" style={style}>
        <ImageTile src={data.src} alt={data.alt} />
      </div>
    );
  }
  return <div className="w-full h-full bg-zinc-200 tile-wrap" style={style} />;
}

function HeaderTile({ a, p, onRefresh }) {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-3 bg-white tile-wrap" style={{ animation: "tile-pop 420ms cubic-bezier(0.22, 1, 0.36, 1) both" }}>
      <div className="text-center">
        <div className="text-xs uppercase tracking-widest text-zinc-500">Moodboard</div>
        <div className="text-lg font-semibold text-zinc-900 mt-1">{a?.name} × {p?.name}</div>
        {(a?.meta?.subtitle || p?.meta?.subtitle) && (
          <div className="mt-1 text-xs text-zinc-500">{a?.meta?.subtitle} · {p?.meta?.subtitle}</div>
        )}
      </div>
      <button
        onClick={onRefresh}
        className="px-4 py-2 text-sm font-medium rounded-md border border-zinc-300 hover:bg-zinc-50 active:scale-[.98]"
        aria-label="Shuffle tiles"
      >
        Refresh
      </button>
    </div>
  );
}

// -------------------- App --------------------
export default function App() {
  const { cols, rows } = useGrid();
  const visibleCount = cols * rows; // includes header tile at index 0

  // Shuffle nonce triggers reselection & re-render animations
  const [nonce, setNonce] = useState(0);

  // Choose one aesthetic and one place each time
  const selection = useMemo(() => {
    const aesthetic = sample(CONFIG.aesthetics) || CONFIG.aesthetics[0];
    const place = sample(CONFIG.places) || CONFIG.places[0];
    return { aesthetic, place };
  }, [nonce]);

  // Build the mixed tile list for visible grid (minus header)
  const data = useMemo(() => {
    const a = (selection.aesthetic?.tiles || []).map(t => ({ ...t, _cat: selection.aesthetic.name }));
    const p = (selection.place?.tiles || []).map(t => ({ ...t, _cat: selection.place.name }));
    const mixed = shuffle([...a, ...p]);

    const need = Math.max(0, visibleCount - 1);
    const chosen = mixed.slice(0, need);

    // Cycle if not enough tiles
    let i = 0;
    while (chosen.length < need && mixed.length > 0) {
      chosen.push(mixed[i % mixed.length]);
      i++;
    }
    return chosen;
  }, [visibleCount, selection]);

  // Randomized stagger delays for a subtle cascade
  const delays = useMemo(() => {
    const n = Math.max(0, visibleCount - 1);
    const arr = Array.from({ length: n }, (_, i) => 25 * i);
    return shuffle(arr);
  }, [visibleCount, nonce]);

  const handleRefresh = () => setNonce(n => n + 1);

  // ---- Runtime sanity checks (lightweight "tests") ----
  useEffect(() => {
    try {
      console.assert(Array.isArray(CONFIG.aesthetics) && CONFIG.aesthetics.length >= 1, "CONFIG.aesthetics should be a non-empty array");
      console.assert(Array.isArray(CONFIG.places) && CONFIG.places.length >= 1, "CONFIG.places should be a non-empty array");
      console.assert(Number.isInteger(visibleCount) && visibleCount > 0, "visibleCount should be a positive integer");

      // Test helpers
      const arr = [1, 2, 3, 4, 5];
      const s1 = shuffle(arr);
      console.assert(s1.length === arr.length, "shuffle should not change array length");
      const smp = sample(arr);
      console.assert(arr.includes(smp), "sample should return an element from the array");
    } catch (e) {
      console.warn("Sanity checks failed:", e);
    }
  }, [visibleCount]);

  return (
    <div className="min-h-screen w-full">
      {/* Local keyframes + seam-busting tweaks */}
      <style>{`
        @keyframes tile-pop {
          0% { opacity: 0; transform: scale(1.01) translateY(4px); }
          60% { opacity: 1; transform: scale(1.005) translateY(0px); }
          100% { opacity: 1; transform: scale(1) translateY(0px); }
        }
        html, body, #root { margin: 0; padding: 0; }
        body { background: #fff; }
        .tile-wrap { position: relative; overflow: hidden; backface-visibility: hidden; transform: translateZ(0); outline: 1px solid transparent; }
      `}</style>

      <div
        className="grid h-[100dvh] w-[100dvw]"
        style={{
          gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
          gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))`,
          gap: 0,
        }}
      >
        {/* Header tile in first cell */}
        <HeaderTile a={selection.aesthetic} p={selection.place} onRefresh={handleRefresh} />

        {/* Remaining shuffled tiles */}
        {data.map((t, i) => (
          <Tile key={`${nonce}-${i}-${t._cat}-${t.text || t.src}`} data={t} mountDelay={delays[i] || 0} />
        ))}
      </div>
    </div>
  );
}
