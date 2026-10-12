// Gera assets/sounds/achievement.wav: uma fanfarra curta e brilhante, tocada
// quando o aluno desbloqueia uma conquista. Rode na raiz do projeto:
//   node scripts/generate-achievement-sound.js
const fs = require('node:fs');
const path = require('node:path');

const SAMPLE_RATE = 44100;
const DURATION = 1.3;
const VOLUME = 0.34;

// Três notas rápidas subindo (G5, C6, E6) e um acorde agudo que fica soando
// (C6, E6, G6, C7). `decay` maior faz a nota sumir mais rápido.
const NOTES = [
  { frequency: 783.99, start: 0, decay: 9 },
  { frequency: 1046.5, start: 0.08, decay: 9 },
  { frequency: 1318.51, start: 0.16, decay: 9 },
  { frequency: 1046.5, start: 0.26, decay: 3 },
  { frequency: 1318.51, start: 0.26, decay: 3 },
  { frequency: 1567.98, start: 0.26, decay: 3 },
  { frequency: 2093.0, start: 0.26, decay: 3.6 },
];

const total = Math.floor(SAMPLE_RATE * DURATION);
const samples = new Float64Array(total);

for (const note of NOTES) {
  const first = Math.floor(note.start * SAMPLE_RATE);

  for (let i = first; i < total; i += 1) {
    const time = (i - first) / SAMPLE_RATE;
    // Entrada rápida para não estalar, depois decaimento
    const attack = Math.min(1, time / 0.006);
    const envelope = attack * Math.exp(-time * note.decay);
    // Um leve tremor dá o brilho de sino
    const shimmer = 1 + 0.12 * Math.sin(2 * Math.PI * 11 * time);
    const wave =
      Math.sin(2 * Math.PI * note.frequency * time) +
      0.35 * Math.sin(2 * Math.PI * note.frequency * 2 * time) +
      0.12 * Math.sin(2 * Math.PI * note.frequency * 3 * time);

    samples[i] += wave * envelope * shimmer;
  }
}

const peak = samples.reduce((max, value) => Math.max(max, Math.abs(value)), 0);
const data = Buffer.alloc(total * 2);

for (let i = 0; i < total; i += 1) {
  // Some suavemente nos últimos 100 ms
  const fadeOut = Math.min(1, (total - i) / (SAMPLE_RATE * 0.1));
  const value = (samples[i] / peak) * VOLUME * fadeOut;
  data.writeInt16LE(Math.round(value * 32767), i * 2);
}

// Cabeçalho WAV: PCM, mono, 16 bits
const header = Buffer.alloc(44);
header.write('RIFF', 0);
header.writeUInt32LE(36 + data.length, 4);
header.write('WAVE', 8);
header.write('fmt ', 12);
header.writeUInt32LE(16, 16);
header.writeUInt16LE(1, 20);
header.writeUInt16LE(1, 22);
header.writeUInt32LE(SAMPLE_RATE, 24);
header.writeUInt32LE(SAMPLE_RATE * 2, 28);
header.writeUInt16LE(2, 32);
header.writeUInt16LE(16, 34);
header.write('data', 36);
header.writeUInt32LE(data.length, 40);

const file = path.join(__dirname, '..', 'assets', 'sounds', 'achievement.wav');
fs.writeFileSync(file, Buffer.concat([header, data]));
console.log(`${file} (${header.length + data.length} bytes)`);
