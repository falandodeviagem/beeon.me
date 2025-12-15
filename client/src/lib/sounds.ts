// Sound feedback utility using Web Audio API
// Generates synthetic tones for toast notifications

const SOUND_ENABLED_KEY = "toast-sounds-enabled";

// Check if sounds are enabled (default: true)
export function areSoundsEnabled(): boolean {
  const stored = localStorage.getItem(SOUND_ENABLED_KEY);
  return stored === null ? true : stored === "true";
}

// Toggle sound preference
export function toggleSounds(): boolean {
  const newValue = !areSoundsEnabled();
  localStorage.setItem(SOUND_ENABLED_KEY, String(newValue));
  return newValue;
}

// Play sound only if tab is active and sounds are enabled
function shouldPlaySound(): boolean {
  return (
    areSoundsEnabled() &&
    document.visibilityState === "visible"
  );
}

// Create audio context (lazy initialization)
let audioContext: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioContext;
}

// Play success sound (pleasant ascending tone)
export function playSuccessSound() {
  if (!shouldPlaySound()) return;

  try {
    const ctx = getAudioContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    // Pleasant C major chord arpeggio
    oscillator.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
    oscillator.frequency.setValueAtTime(659.25, ctx.currentTime + 0.05); // E5
    oscillator.frequency.setValueAtTime(783.99, ctx.currentTime + 0.1); // G5

    oscillator.type = "sine";
    gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.2);
  } catch (error) {
    console.warn("Failed to play success sound:", error);
  }
}

// Play error sound (dissonant descending tone)
export function playErrorSound() {
  if (!shouldPlaySound()) return;

  try {
    const ctx = getAudioContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    // Dissonant descending tone
    oscillator.frequency.setValueAtTime(400, ctx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.15);

    oscillator.type = "square";
    gainNode.gain.setValueAtTime(0.08, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.15);
  } catch (error) {
    console.warn("Failed to play error sound:", error);
  }
}

// Play warning sound (neutral middle tone)
export function playWarningSound() {
  if (!shouldPlaySound()) return;

  try {
    const ctx = getAudioContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    // Two quick beeps
    oscillator.frequency.setValueAtTime(600, ctx.currentTime);
    oscillator.frequency.setValueAtTime(600, ctx.currentTime + 0.1);

    oscillator.type = "triangle";
    gainNode.gain.setValueAtTime(0.08, ctx.currentTime);
    gainNode.gain.setValueAtTime(0, ctx.currentTime + 0.05);
    gainNode.gain.setValueAtTime(0.08, ctx.currentTime + 0.1);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.2);
  } catch (error) {
    console.warn("Failed to play warning sound:", error);
  }
}
