const cardShuffleSound = new Audio("assets/sounds/card-shuffle.mp3");
const correctSound = new Audio("assets/sounds/correct.mp3");
const wrongSound = new Audio("assets/sounds/wrong.mp3");
const gameStartSound = new Audio("assets/sounds/game-start.mp3");

cardShuffleSound.volume = 0.5;
correctSound.volume = 0.6;
wrongSound.volume = 0.6;
gameStartSound.volume = 0.6;

function playSound(sound) {
    if (!sound) return;

    sound.currentTime = 0;
    sound.play().catch(() => {});
}

function stopSound(sound) {
    if (!sound) return;

    sound.pause();
    sound.currentTime = 0;
}

function playShuffleSound() {
    playSound(cardShuffleSound);
}

function stopShuffleSound() {
    stopSound(cardShuffleSound);
}

function playCorrectSound() {
    playSound(correctSound);
}

function playWrongSound() {
    playSound(wrongSound);
}

function playGameStartSound() {
    playSound(gameStartSound);
}

/* CARD FLIP SOUND */

let flipAudioContext = null;

function playFlipSound() {
    try {
        if (!flipAudioContext) {
            flipAudioContext = new (
                window.AudioContext || window.webkitAudioContext
            )();
        }

        if (flipAudioContext.state === "suspended") {
            flipAudioContext.resume();
        }

        const duration = 0.12;
        const sampleRate = flipAudioContext.sampleRate;
        const buffer = flipAudioContext.createBuffer(
            1,
            sampleRate * duration,
            sampleRate
        );

        const data = buffer.getChannelData(0);

        for (let i = 0; i < data.length; i++) {
            const fade = 1 - i / data.length;
            data[i] = (Math.random() * 2 - 1) * fade;
        }

        const noise = flipAudioContext.createBufferSource();
        const filter = flipAudioContext.createBiquadFilter();
        const gain = flipAudioContext.createGain();

        noise.buffer = buffer;

        filter.type = "bandpass";
        filter.frequency.value = 1200;
        filter.Q.value = 0.7;

        gain.gain.setValueAtTime(
            0.12,
            flipAudioContext.currentTime
        );

        gain.gain.exponentialRampToValueAtTime(
            0.001,
            flipAudioContext.currentTime + duration
        );

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(flipAudioContext.destination);

        noise.start();
        noise.stop(flipAudioContext.currentTime + duration);
    } catch (error) {
        console.warn("Card flip sound unavailable:", error);
    }
}
