const { useEffect, useMemo, useState } = React;

/**
 * Responsive Moodboard Tileboard
 * - Full-bleed grid, square-ish tiles (fills entire viewport)
 * - Toggle between small 2×4 and large 5×3 layouts via floating action button
 * - Image tiles span two columns while word tiles span one; header tile is 1×1
 * - Remaining tiles are shuffled from the two selected categories
 * - Images fade in on load; subtle pop-in animation on refresh
 * - Includes defensive code for SSR and simple runtime sanity checks
 */

// -------------------- Utilities --------------------
function useGrid(isLarge) {
  const cols = isLarge ? 5 : 2;
  const rows = isLarge ? 3 : 4;
  return { cols, rows };
}

function useConfig() {
  const [config, setConfig] = useState(null);
  useEffect(() => {
    fetch('config.json')
      .then((res) => res.json())
      .then(setConfig)
      .catch((err) => console.error('Failed to load config', err));
  }, []);
  return config;
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

function randomColor() {
  return '#' + Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, '0');
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
    gridColumn: `span ${data.span || 1}`,
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
    <div
      className="w-full h-full flex flex-col items-center justify-center gap-3 bg-white tile-wrap"
      style={{ gridColumn: "span 1", animation: "tile-pop 420ms cubic-bezier(0.22, 1, 0.36, 1) both" }}
    >
      <div className="text-center">
        <div className="text-xs uppercase tracking-widest text-zinc-500">Moodboard</div>
        <div className="text-lg font-semibold text-zinc-900 mt-1">
          {a?.name} {'×'} {p?.name}
        </div>
        {(a?.meta?.subtitle || p?.meta?.subtitle) && (
          <div className="mt-1 text-xs text-zinc-500">
            {a?.meta?.subtitle} {'·'} {p?.meta?.subtitle}
          </div>
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
function App() {
  const [isLarge, setIsLarge] = useState(false);
  const { cols, rows } = useGrid(isLarge);
  const CONFIG = useConfig();
  const totalCells = cols * rows;
  const headerSpan = 1;

  // Shuffle nonce triggers reselection & re-render animations
  const [nonce, setNonce] = useState(0);

  // Choose one aesthetic and one place each time
  const selection = useMemo(() => {
    if (!CONFIG) return { aesthetic: null, place: null };
    const aesthetic = sample(CONFIG.aesthetics) || CONFIG.aesthetics[0];
    const place = sample(CONFIG.places) || CONFIG.places[0];
    return { aesthetic, place };
  }, [nonce, CONFIG]);

  // Build the mixed tile list for visible grid (minus header)
  const data = useMemo(() => {
    if (!selection.aesthetic || !selection.place) return [];

    const aTiles = (selection.aesthetic.tiles || []).map(t => ({ ...t, _cat: selection.aesthetic.name }));
    const pTiles = (selection.place.tiles || []).map(t => ({ ...t, _cat: selection.place.name }));

    const palette = [...aTiles, ...pTiles]
      .filter(t => t.type === "word" && t.color)
      .map(t => t.color);

    const aWords = aTiles.filter(t => t.type === "word");
    const aImages = aTiles.filter(t => t.type === "image");
    const pWords = pTiles.filter(t => t.type === "word");
    const pImages = pTiles.filter(t => t.type === "image");

    const randPop = arr => {
      if (!arr.length) return null;
      const idx = Math.floor(Math.random() * arr.length);
      return arr.splice(idx, 1)[0];
    };

    const needCells = Math.max(0, totalCells - headerSpan); // account for header span
    const mandatory = [];
    let used = 0;

    const takeMandatory = (arr, span) => {
      const t = randPop(arr);
      if (t && used + span <= needCells) {
        const color = t.type === "word" ? t.color || sample(palette) || randomColor() : undefined;
        mandatory.push({ ...t, span, color });
        used += span;
      }
    };

    if (needCells < 6) {
      // Prefer two images and one word when space is extremely tight
      const takeImage = arr => takeMandatory(arr, 2);
      // Grab images first to guarantee two
      takeImage(aImages);
      takeImage(pImages);
      if (mandatory.filter(t => t.type === "image").length < 2) takeImage(aImages);
      if (mandatory.filter(t => t.type === "image").length < 2) takeImage(pImages);

      // Then take a single word from either category
      const [w1, w2] = shuffle([aWords, pWords]);
      if (!takeMandatory(w1, 1)) takeMandatory(w2, 1);
    } else {
      // Ensure at least one word and one image from each category
      takeMandatory(aWords, 1);
      takeMandatory(aImages, 2);
      takeMandatory(pWords, 1);
      takeMandatory(pImages, 2);
    }

    const pool = shuffle([...aWords, ...aImages, ...pWords, ...pImages]);
    const chosen = [];
    let i = 0;
    while (used < needCells && pool.length > 0) {
      const t = pool[i % pool.length];
      const span = t.type === "image" ? 2 : 1;
      if (used + span <= needCells) {
        const color = t.type === "word" ? t.color || sample(palette) || randomColor() : undefined;
        chosen.push({ ...t, span, color });
        used += span;
      }
      i++;
    }

    if (used < needCells) {
      const filler = pool.find(t => t.type === "word") || mandatory.find(t => t.type === "word");
      while (used < needCells && filler) {
        const color = filler.color || sample(palette) || randomColor();
        chosen.push({ ...filler, span: 1, color });
        used += 1;
      }
    }

    return shuffle([...mandatory, ...chosen]);
  }, [totalCells, selection]);

  // Randomized stagger delays for a subtle cascade
  const delays = useMemo(() => {
    const n = data.length;
    const arr = Array.from({ length: n }, (_, i) => 25 * i);
    return shuffle(arr);
  }, [data.length, nonce]);

  const handleRefresh = () => setNonce(n => n + 1);

  // ---- Runtime sanity checks (lightweight "tests") ----
  useEffect(() => {
    if (!CONFIG) return;
    try {
      console.assert(Array.isArray(CONFIG.aesthetics) && CONFIG.aesthetics.length >= 1, "CONFIG.aesthetics should be a non-empty array");
      console.assert(Array.isArray(CONFIG.places) && CONFIG.places.length >= 1, "CONFIG.places should be a non-empty array");
        console.assert(Number.isInteger(totalCells) && totalCells > 0, "totalCells should be a positive integer");

      // Test helpers
      const arr = [1, 2, 3, 4, 5];
      const s1 = shuffle(arr);
      console.assert(s1.length === arr.length, "shuffle should not change array length");
      const smp = sample(arr);
      console.assert(arr.includes(smp), "sample should return an element from the array");
    } catch (e) {
      console.warn("Sanity checks failed:", e);
    }
    }, [totalCells, CONFIG]);

  if (!CONFIG) return <div className="min-h-screen w-full" />;

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
            gridAutoFlow: "dense",
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
      <button
        onClick={() => setIsLarge(l => !l)}
        className="fixed bottom-4 right-4 w-10 h-10 rounded-full bg-white/60 backdrop-blur-sm shadow-md border border-zinc-300 flex items-center justify-center text-zinc-700 hover:bg-white/80 transition"
        aria-label="Toggle grid layout"
      >
        {isLarge ? '−' : '+'}
      </button>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
