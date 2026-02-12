// Space Math Mission - Sound Effects
// Using Web Audio API for synthesized sounds (no external files needed)

class SoundManager {
    constructor() {
        this.audioContext = null;
        this.enabled = true;
    }

    init() {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }

    ensureContext() {
        if (!this.audioContext) {
            this.init();
        }
        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
    }

    // Play a simple tone
    playTone(frequency, duration, type = 'sine', volume = 0.3) {
        if (!this.enabled) return;
        this.ensureContext();

        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        oscillator.type = type;
        oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);

        gainNode.gain.setValueAtTime(volume, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);

        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + duration);
    }

    // Tile drop sound
    drop() {
        this.playTone(400, 0.1, 'sine', 0.2);
    }

    // Correct answer - happy ascending notes
    correct() {
        if (!this.enabled) return;
        this.ensureContext();

        const notes = [523, 659, 784, 1047]; // C5, E5, G5, C6
        notes.forEach((freq, i) => {
            setTimeout(() => {
                this.playTone(freq, 0.15, 'sine', 0.3);
            }, i * 100);
        });
    }

    // Wrong answer - descending buzz
    wrong() {
        this.playTone(200, 0.3, 'sawtooth', 0.2);
        setTimeout(() => {
            this.playTone(150, 0.3, 'sawtooth', 0.15);
        }, 150);
    }

    // Rocket launch/advance
    rocket() {
        if (!this.enabled) return;
        this.ensureContext();

        // Whoosh sound
        const noise = this.audioContext.createOscillator();
        const noiseGain = this.audioContext.createGain();
        
        noise.type = 'sawtooth';
        noise.frequency.setValueAtTime(100, this.audioContext.currentTime);
        noise.frequency.exponentialRampToValueAtTime(400, this.audioContext.currentTime + 0.5);
        
        noiseGain.gain.setValueAtTime(0.2, this.audioContext.currentTime);
        noiseGain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.5);
        
        noise.connect(noiseGain);
        noiseGain.connect(this.audioContext.destination);
        
        noise.start();
        noise.stop(this.audioContext.currentTime + 0.5);
    }

    // Victory fanfare
    victory() {
        if (!this.enabled) return;
        this.ensureContext();

        const melody = [
            { freq: 523, time: 0 },     // C5
            { freq: 659, time: 150 },   // E5
            { freq: 784, time: 300 },   // G5
            { freq: 1047, time: 450 },  // C6
            { freq: 784, time: 600 },   // G5
            { freq: 1047, time: 750 },  // C6
        ];

        melody.forEach(note => {
            setTimeout(() => {
                this.playTone(note.freq, 0.2, 'sine', 0.3);
            }, note.time);
        });
    }

    // Button click
    click() {
        this.playTone(600, 0.05, 'sine', 0.1);
    }

    // Backspace/remove
    remove() {
        this.playTone(300, 0.1, 'triangle', 0.15);
    }

    // Level up / planet reached
    levelUp() {
        if (!this.enabled) return;
        
        const notes = [440, 554, 659, 880]; // A4, C#5, E5, A5
        notes.forEach((freq, i) => {
            setTimeout(() => {
                this.playTone(freq, 0.2, 'sine', 0.25);
            }, i * 120);
        });
    }
}

// Global sound manager
const sounds = new SoundManager();
