// Gera assets/sounds/warning.wav: um sinal curto de atenção, duas notas
// descendo, tocado quando a simulação avisa que o aluno saiu das tarefas.
// Rode na raiz do projeto:
//   node scripts/generate-warning-sound.js
const fs = require('node:fs');
const path = require('node:path');

const SAMPLE_RATE = 44100;
const DURATION = 0.55;
const VOLUME = 0.32;

// Duas notas descendo (A4, F4), a segunda um pouco mais longa: soa como
// "opa", sem ser alarme. `decay` maior faz a nota sumir mais rápido.
const NOTES = [
  { frequency: 440, start: 0, length: 0.16, decay: 7 },
  { frequency: 349.23, start: 0.15, length: 0.4, decay: 5 },
];

const total = Math.floor(SAMPLE_RATE * DURATION);
const samples = new Float64Array(total);

for (const note of NOTES) {
  const first = Math.floor(note.start * SAMPLE_RATE);
  const last = Math.min(total, first + Math.floor(note.length * SAMPLE_RATE));

  for (let i = first; i < last; i += 1) {
    const time = (i - first) / SAMPLE_RATE;
    // Entrada rápida para não estalar, decaimento e saída suave no fim da nota
    const attack = Math.min(1, time / 0.005);
    const release = Math.min(1, (last - i) / (SAMPLE_RATE * 0.02));
    const envelope = attack * release * Math.exp(-time * note.decay);
    // Harmônicos ímpares dão um timbre de buzina suave, mais "atenção" que o
    // sino dos sons de acerto
    const wave =
      Math.sin(2 * Math.PI * note.frequency * time) +
      0.3 * Math.sin(2 * Math.PI * note.frequency * 3 * time) +
      0.1 * Math.sin(2 * Math.PI * note.frequency * 5 * time);

    samples[i] += wave * envelope;
  }
}

const peak = samples.reduce((max, value) => Math.max(max, Math.abs(value)), 0);
const data = Buffer.alloc(total * 2);

for (let i = 0; i < total; i += 1) {
  const value = (samples[i] / peak) * VOLUME;
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

const file = path.join(__dirname, '..', 'assets', 'sounds', 'warning.wav');
fs.writeFileSync(file, Buffer.concat([header, data]));
console.log(`${file} (${header.length + data.length} bytes)`);
