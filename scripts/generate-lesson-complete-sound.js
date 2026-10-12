// Gera assets/sounds/lesson-complete.wav: um acorde ascendente curto, tocado
// na tela de parabéns da aula. Rode na raiz do projeto:
//   node scripts/generate-lesson-complete-sound.js
const fs = require('node:fs');
const path = require('node:path');

const SAMPLE_RATE = 44100;
const DURATION = 1.6;
const VOLUME = 0.32;

// Dó maior subindo (C5, E5, G5, C6); cada nota entra um pouco depois
const NOTES = [
  { frequency: 523.25, start: 0 },
  { frequency: 659.25, start: 0.11 },
  { frequency: 783.99, start: 0.22 },
  { frequency: 1046.5, start: 0.33 },
];

const total = Math.floor(SAMPLE_RATE * DURATION);
const samples = new Float64Array(total);

for (const note of NOTES) {
  const first = Math.floor(note.start * SAMPLE_RATE);

  for (let i = first; i < total; i += 1) {
    const time = (i - first) / SAMPLE_RATE;
    // Entrada rápida para não estalar, depois decaimento
    const attack = Math.min(1, time / 0.008);
    const envelope = attack * Math.exp(-time * 3.2);
    const wave =
      Math.sin(2 * Math.PI * note.frequency * time) +
      0.3 * Math.sin(2 * Math.PI * note.frequency * 2 * time) +
      0.1 * Math.sin(2 * Math.PI * note.frequency * 3 * time);

    samples[i] += wave * envelope;
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

const file = path.join(
  __dirname,
  '..',
  'assets',
  'sounds',
  'lesson-complete.wav'
);
fs.writeFileSync(file, Buffer.concat([header, data]));
console.log(`${file} (${header.length + data.length} bytes)`);
