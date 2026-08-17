/**
 * Generates LifeQuest PWA icons as PNGs with zero dependencies.
 * Deterministic, brand-exact (colors come straight from the design system),
 * 4x supersampled for smooth edges. Run: node scripts/make-icons.mjs
 */
import { deflateSync } from "node:zlib";
import { mkdirSync, writeFileSync } from "node:fs";

const MOSS = [0x3f, 0x6d, 0x4e];
const INK = [0xf3, 0xf6, 0xee];
const SS = 4; // supersampling factor

// ---------- PNG encoding ----------
const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const body = Buffer.concat([Buffer.from(type, "ascii"), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body), 0);
  return Buffer.concat([len, body, crc]);
}

function encodePNG(width, height, rgba) {
  const sig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // RGBA
  const raw = Buffer.alloc(height * (width * 4 + 1));
  for (let y = 0; y < height; y++) {
    const rowStart = y * (width * 4 + 1);
    raw[rowStart] = 0; // filter: none
    rgba.copy(raw, rowStart + 1, y * width * 4, (y + 1) * width * 4);
  }
  return Buffer.concat([
    sig,
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(raw, { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

// ---------- geometry ----------
function insideRoundedRect(x, y, size, radius) {
  const r = radius;
  const cx = Math.min(Math.max(x, r), size - r);
  const cy = Math.min(Math.max(y, r), size - r);
  const dx = x - cx;
  const dy = y - cy;
  return dx * dx + dy * dy <= r * r;
}

function distToSegment(px, py, ax, ay, bx, by) {
  const vx = bx - ax;
  const vy = by - ay;
  const wx = px - ax;
  const wy = py - ay;
  const len2 = vx * vx + vy * vy;
  let t = len2 === 0 ? 0 : (wx * vx + wy * vy) / len2;
  t = Math.max(0, Math.min(1, t));
  const dx = px - (ax + t * vx);
  const dy = py - (ay + t * vy);
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * @param {number} size       output size in px
 * @param {boolean} fullBleed square background (apple / maskable) vs rounded
 * @param {number} scale      checkmark scale (smaller for maskable safe zone)
 */
function renderIcon(size, fullBleed, scale = 1) {
  const S = size * SS;
  const radius = fullBleed ? 0 : S * 0.22;
  // Checkmark control points in normalized icon space.
  const pts = [
    [0.27, 0.52],
    [0.43, 0.68],
    [0.75, 0.32],
  ].map(([nx, ny]) => [
    (0.5 + (nx - 0.5) * scale) * S,
    (0.5 + (ny - 0.5) * scale) * S,
  ]);
  const stroke = S * 0.105 * scale;
  const half = stroke / 2;

  const out = Buffer.alloc(size * size * 4);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let rs = 0, gs = 0, bs = 0, as = 0;
      for (let sy = 0; sy < SS; sy++) {
        for (let sx = 0; sx < SS; sx++) {
          const px = x * SS + sx + 0.5;
          const py = y * SS + sy + 0.5;
          const inBg = fullBleed || insideRoundedRect(px, py, S, radius);
          if (!inBg) continue;
          const d = Math.min(
            distToSegment(px, py, pts[0][0], pts[0][1], pts[1][0], pts[1][1]),
            distToSegment(px, py, pts[1][0], pts[1][1], pts[2][0], pts[2][1])
          );
          const color = d <= half ? INK : MOSS;
          rs += color[0];
          gs += color[1];
          bs += color[2];
          as += 255;
        }
      }
      const n = SS * SS;
      const i = (y * size + x) * 4;
      // Premultiply-safe: average color over covered samples only.
      const cov = as / 255;
      out[i] = cov ? Math.round(rs / cov) : 0;
      out[i + 1] = cov ? Math.round(gs / cov) : 0;
      out[i + 2] = cov ? Math.round(bs / cov) : 0;
      out[i + 3] = Math.round(as / n);
    }
  }
  return encodePNG(size, size, out);
}

mkdirSync("public/icons", { recursive: true });

const targets = [
  ["public/icons/icon-192.png", 192, false, 1],
  ["public/icons/icon-512.png", 512, false, 1],
  ["public/icons/icon-maskable-512.png", 512, true, 0.72],
  ["public/icons/apple-touch-icon.png", 180, true, 0.92],
  ["public/icons/favicon-32.png", 32, false, 1],
];

for (const [path, size, fullBleed, scale] of targets) {
  writeFileSync(path, renderIcon(size, fullBleed, scale));
  console.log(`wrote ${path} (${size}x${size})`);
}
