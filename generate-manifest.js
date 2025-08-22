const fs = require('fs');
const path = require('path');

function walk(dir) {
  return fs.readdirSync(dir).flatMap((name) => {
    const filepath = path.join(dir, name);
    const stat = fs.statSync(filepath);
    if (stat.isDirectory()) {
      return walk(filepath);
    }
    if (/\.(png|jpe?g|webp|gif)$/i.test(name)) {
      return [filepath.replace(/\\/g, '/')];
    }
    return [];
  });
}

const images = walk('img').sort();
fs.writeFileSync('images.json', JSON.stringify(images, null, 2));
console.log(`Wrote ${images.length} images to images.json`);
