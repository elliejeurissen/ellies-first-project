let clicks = 0;

document.getElementById("hello").addEventListener("click", (event) => {
  clicks += 1;
  document.getElementById("message").textContent =
    `Hello! You've clicked ${clicks} time${clicks === 1 ? "" : "s"} 🎉`;
  popEmoji(event.currentTarget);
});

// Each click pops up a different emoji that floats up and fades away.
const EMOJIS = ["🎉", "🦄", "🌈", "🚀", "🍕", "🐶", "🌟", "🎸", "🍦", "🦋", "🐙", "🌻", "🎧", "🍩", "🐸", "💖"];
let emojiBag = [];
let lastEmoji = null;

// Shuffle all the emojis and hand them out one by one, so every emoji
// appears once before any repeats.
function nextEmoji() {
  if (emojiBag.length === 0) {
    emojiBag = [...EMOJIS];
    for (let i = emojiBag.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [emojiBag[i], emojiBag[j]] = [emojiBag[j], emojiBag[i]];
    }
    // Don't start the new round with the emoji that ended the last one.
    if (emojiBag[emojiBag.length - 1] === lastEmoji) emojiBag.reverse();
  }
  lastEmoji = emojiBag.pop();
  return lastEmoji;
}

function popEmoji(button) {
  const emoji = nextEmoji();

  const pop = document.createElement("span");
  pop.className = "emoji-pop";
  pop.textContent = emoji;
  const box = button.getBoundingClientRect();
  pop.style.left = `${box.left + box.width / 2}px`;
  pop.style.top = `${box.top}px`;
  // Drift a little left or right so each one takes its own path.
  pop.style.setProperty("--drift", `${Math.round(Math.random() * 160 - 80)}px`);
  document.body.appendChild(pop);
  pop.addEventListener("animationend", () => pop.remove());
}

// Background song: a little looping tune made with the Web Audio API,
// so there's no music file to download.
const BEAT = 0.25; // seconds per note
const MELODY = [
  "C5", "E5", "G5", "E5", "A5", "G5", "E5", "C5",
  "D5", "F5", "A5", "F5", "G5", "E5", "D5", "C5",
  "E5", "G5", "C6", "G5", "A5", "F5", "D5", "B4",
  "C5", "E5", "G5", "E5", "D5", "B4", "C5", null,
];
const BASS = ["C3", "A2", "F2", "G2"]; // one note per 8 melody notes

const musicButton = document.getElementById("music");
let audio = null;
let playing = false;
let nextNoteTime = 0;
let step = 0;
let timer = null;

function frequency(note) {
  const names = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
  const semitone = names[note[0]] + (Number(note.slice(1)) + 1) * 12;
  return 440 * Math.pow(2, (semitone - 69) / 12);
}

function playNote(note, time, length, type, volume) {
  const osc = audio.createOscillator();
  const gain = audio.createGain();
  osc.type = type;
  osc.frequency.value = frequency(note);
  gain.gain.setValueAtTime(volume, time);
  gain.gain.exponentialRampToValueAtTime(0.001, time + length);
  osc.connect(gain).connect(audio.destination);
  osc.start(time);
  osc.stop(time + length);
}

function scheduleNotes() {
  while (nextNoteTime < audio.currentTime + 0.2) {
    const note = MELODY[step % MELODY.length];
    if (note) playNote(note, nextNoteTime, BEAT * 0.9, "triangle", 0.15);
    if (step % 8 === 0) {
      playNote(BASS[(step / 8) % BASS.length], nextNoteTime, BEAT * 8, "sine", 0.2);
    }
    nextNoteTime += BEAT;
    step += 1;
  }
}

function startMusic() {
  audio = audio || new AudioContext();
  if (playing) return;
  playing = true;
  audio.resume();
  nextNoteTime = audio.currentTime + 0.05;
  timer = setInterval(scheduleNotes, 50);
  musicButton.textContent = "🔇 Stop music";
  musicButton.setAttribute("aria-pressed", "true");
}

function stopMusic() {
  playing = false;
  clearInterval(timer);
  musicButton.textContent = "🎵 Play music";
  musicButton.setAttribute("aria-pressed", "false");
}

musicButton.addEventListener("click", () => {
  if (playing) stopMusic();
  else startMusic();
});

// The song starts when the "Click me" button is clicked.
document.getElementById("hello").addEventListener("click", startMusic);
