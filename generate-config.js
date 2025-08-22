const fs = require('fs');
const path = require('path');

const images = require('./images.json');

const moods = {
  miaminoir: {
    category: 'aesthetics',
    name: 'Miami Vice Neon Noir',
    meta: { subtitle: 'electric / neon / retro-futurism', palette: ['#00E7F9', '#FF4FA5', '#4F2B7E'] },
    words: [
      { text: 'electric', color: '#00E7F9' },
      { text: 'neon', color: '#FF4FA5' },
      { text: 'chrome', color: '#EDEDED' },
      { text: 'synthwave', color: '#4F2B7E' },
      { text: 'palms', color: '#00A6E0' }
    ]
  },
  sodiumvapor: {
    category: 'aesthetics',
    name: "Fincher's Sodium Vapor Sickness",
    meta: { subtitle: 'sickly yellow-green / desaturated amber / drained blue', palette: ['#B5B35D', '#C5A469', '#5E6A74'] },
    words: [
      { text: 'sodium', color: '#B5B35D' },
      { text: 'paranoia', color: '#5E6A74' },
      { text: 'industrial', color: '#5C5C5C' },
      { text: 'obsession', color: '#C5A469' },
      { text: 'decay', color: '#444444' }
    ]
  },
  tokyocyberpunk: {
    category: 'aesthetics',
    name: 'Tokyo Cyberpunk',
    words: ['neon', 'rain', 'future', 'crowds', 'wires']
  },
  dogme95: {
    category: 'aesthetics',
    name: 'Dogme 95',
    words: ['raw', 'handheld', 'authentic', 'minimal', 'vow']
  },
  giallo: {
    category: 'aesthetics',
    name: 'Giallo',
    words: ['knife', 'mystery', 'gloves', 'blood', 'gaze']
  },
  y2k: {
    category: 'aesthetics',
    name: 'Y2K',
    words: ['chrome', 'bubble', 'techno', 'aqua', 'glitch']
  },
  midnightlaundry: {
    category: 'places',
    name: 'Midnight Laundry',
    meta: { subtitle: 'nocturnal / fluorescent / ritual', palette: ['#0E1E37', '#446688', '#CFE0ED'] },
    words: ['insomnia', 'fluorescent', 'ritual', 'solitude', 'repetition']
  },
  aftertheparty: {
    category: 'places',
    name: 'After the Party',
    meta: { subtitle: 'remnants / dawn / stillness', palette: ['#F7CAC9', '#FFE1A8', '#CDEDF6'] },
    words: ['scattered', 'aftermath', 'dawn', 'remnants', 'quiet']
  },
  beach: {
    category: 'places',
    name: 'The Shore',
    meta: { subtitle: 'coastal / boundless / serene', palette: ['#E0E7FF', '#A7D0CB', '#F5D6BA'] },
    words: ['horizon', 'tidal', 'driftwood', 'vast', 'footprints']
  },
  beauty: {
    category: 'places',
    name: 'Mirror, Mirror',
    meta: { subtitle: 'reflection / transformation / community', palette: ['#ECD8F0', '#FDF5E6', '#C0BECF'] },
    words: ['reflection', 'transformation', 'salon', 'glamour', 'community']
  },
  greatoutdoors: {
    category: 'places',
    name: 'The Great Outdoors',
    words: ['trail', 'campfire', 'summit', 'wilderness', 'fresh']
  },
  mallrats: {
    category: 'places',
    name: 'Mallrats',
    words: ['retail', 'escalators', 'food court', 'arcade', 'security']
  }
};

function basenameWithoutExt(p) {
  return path.basename(p).replace(/\.[^.]+$/, '');
}

function prettyName(folder) {
  return folder.replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

const folderSet = new Set(images.map(p => p.split('/')[1]));

const result = { aesthetics: [], places: [] };

for (const [folder, def] of Object.entries(moods)) {
  folderSet.delete(folder);
  const imagesForFolder = images.filter(p => p.startsWith(`img/${folder}/`));
  const imageTiles = imagesForFolder.map(p => ({ type: 'image', src: p, alt: basenameWithoutExt(p) }));
  const wordTiles = (def.words || []).map(w => typeof w === 'string' ? { type: 'word', text: w } : { type: 'word', text: w.text, color: w.color });
  const tiles = [...wordTiles, ...imageTiles];
  const name = def.name || prettyName(folder);
  const obj = { name, tiles };
  if (def.meta) obj.meta = def.meta;
  const category = def.category || 'aesthetics';
  if (!result[category]) result[category] = [];
  result[category].push(obj);
}

for (const folder of Array.from(folderSet).sort()) {
  const imagesForFolder = images.filter(p => p.startsWith(`img/${folder}/`));
  const imageTiles = imagesForFolder.map(p => ({ type: 'image', src: p, alt: basenameWithoutExt(p) }));
  const obj = { name: prettyName(folder), tiles: imageTiles };
  result.aesthetics.push(obj);
}

fs.writeFileSync('config.json', JSON.stringify(result, null, 2) + '\n');
console.log('Wrote config.json with', result.aesthetics.length, 'aesthetics and', result.places.length, 'places');
