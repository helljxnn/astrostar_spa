import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const root = process.cwd();

const jobs = [
  {
    dir: path.join(root, "public", "assets", "images", "Areas_Projects"),
    maxWidth: 1600,
    quality: 72,
    include: /\.(jpe?g|png)$/i,
  },
  {
    dir: path.join(root, "src", "features", "landing", "pages", "Services", "images", "cards"),
    maxWidth: 1200,
    quality: 72,
    include: /\.(jpe?g|png)$/i,
  },
];

const formatBytes = (bytes) => `${(bytes / (1024 * 1024)).toFixed(2)} MB`;

async function optimizeImage(dir, file, maxWidth, quality) {
  const inputPath = path.join(dir, file);
  const parsed = path.parse(file);
  const outputPath = path.join(dir, `${parsed.name}.webp`);

  const source = sharp(inputPath, { failOn: "none" });
  const metadata = await source.metadata();

  let pipeline = sharp(inputPath, { failOn: "none" }).rotate();

  if (metadata.width && metadata.width > maxWidth) {
    pipeline = pipeline.resize({ width: maxWidth, withoutEnlargement: true });
  }

  await pipeline
    .webp({ quality, effort: 6 })
    .toFile(outputPath);

  const [before, after] = await Promise.all([
    fs.stat(inputPath),
    fs.stat(outputPath),
  ]);

  return {
    inputPath,
    outputPath,
    before: before.size,
    after: after.size,
  };
}

async function run() {
  const results = [];

  for (const job of jobs) {
    const files = await fs.readdir(job.dir);
    const targetFiles = files.filter((f) => job.include.test(f));

    for (const file of targetFiles) {
      const result = await optimizeImage(job.dir, file, job.maxWidth, job.quality);
      results.push(result);
    }
  }

  const totalBefore = results.reduce((acc, item) => acc + item.before, 0);
  const totalAfter = results.reduce((acc, item) => acc + item.after, 0);

  for (const item of results) {
    const saved = item.before - item.after;
    const pct = item.before > 0 ? ((saved / item.before) * 100).toFixed(1) : "0.0";
    console.log(`${path.basename(item.inputPath)} -> ${path.basename(item.outputPath)} | ${formatBytes(item.before)} => ${formatBytes(item.after)} | -${pct}%`);
  }

  const totalSaved = totalBefore - totalAfter;
  const totalPct = totalBefore > 0 ? ((totalSaved / totalBefore) * 100).toFixed(1) : "0.0";

  console.log("\nResumen:");
  console.log(`Total antes: ${formatBytes(totalBefore)}`);
  console.log(`Total despues: ${formatBytes(totalAfter)}`);
  console.log(`Ahorro: ${formatBytes(totalSaved)} (-${totalPct}%)`);
}

run().catch((error) => {
  console.error("Error optimizando imagenes:", error);
  process.exitCode = 1;
});
