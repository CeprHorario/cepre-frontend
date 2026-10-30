import { deflateSync } from "node:zlib";
import { writeFileSync } from "node:fs";

// Fixture sintético, no captura de una clase real. PNG RGB 8 bits, estático y sin entrelazar.
function crc32(bytes) {
  let crc = 0xffffffff;
  for (const byte of bytes) {
    crc ^= byte;
    for (let i = 0; i < 8; i++) crc = (crc >>> 1) ^ ((crc & 1) ? 0xedb88320 : 0);
  }
  return (crc ^ 0xffffffff) >>> 0;
}
function chunk(type, bytes) {
  const name = Buffer.from(type), length = Buffer.alloc(4), crc = Buffer.alloc(4);
  length.writeUInt32BE(bytes.length); crc.writeUInt32BE(crc32(Buffer.concat([name, bytes])));
  return Buffer.concat([length, name, bytes, crc]);
}
const width = 1280, height = 720;
const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(width); ihdr.writeUInt32BE(height, 4); ihdr[8] = 8; ihdr[9] = 2;
const raw = Buffer.alloc((width * 3 + 1) * height);
for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
  const offset = y * (width * 3 + 1) + 1 + x * 3;
  const light = y < 80 || y > height - 60 || (y > 160 && y < 240 && x > 80 && x < width - 80);
  raw[offset] = light ? 244 : 28; raw[offset + 1] = light ? 244 : 33; raw[offset + 2] = light ? 246 : 64;
}
writeFileSync("/tmp/opencode/cepr-captura-prueba.png", Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]), chunk("IHDR", ihdr), chunk("IDAT", deflateSync(raw)), chunk("IEND", Buffer.alloc(0))]));
