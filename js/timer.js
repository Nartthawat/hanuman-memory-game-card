let timerInterval = null;
let timerAudioContext = null;
let timerTickTimeout = null;

function loadTimerTick() {
    try {
        if (!timerAudioContext) {
            timerAudioContext = new (
                window.AudioContext || window.webkitAudioContext
            )();
        }

        if (timerAudioContext.state === "suspended") {
            timerAudioContext.resume();
        }
    } catch (error) {
        console.warn("Timer audio unavailable:", error);
    }
}

function playTimerTick() {
    try {
        if (!timerAudioContext) {
            loadTimerTick();
        }

        if (!timerAudioContext) return;

        const oscillator = timerAudioContext.createOscillator();
        const gain = timerAudioContext.createGain();

        oscillator.type = "sine";
        oscillator.frequency.value = 850;

        gain.gain.setValueAtTime(0.08, timerAudioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(
            0.001,
            timerAudioContext.currentTime + 0.06
        );

        oscillator.connect(gain);
        gain.connect(timerAudioContext.destination);

        oscillator.start();
        oscillator.stop(timerAudioContext.currentTime + 0.06);
    } catch (error) {
        console.warn("Timer tick unavailable:", error);
    }
}

function stopTimerSounds() {
    if (timerTickTimeout) {
        clearTimeout(timerTickTimeout);
        timerTickTimeout = null;
    }

    if (timerAudioContext && timerAudioContext.state === "running") {
        timerAudioContext.suspend().catch(() => {});
    }
}

function scheduleTimerTick() {
    if (!gameStarted || remainingTime <= 0) return;

    playTimerTick();

    let speed = 1000;

    if (remainingTime <= 5) {
        speed = 250;
    } else if (remainingTime <= 10) {
        speed = 500;
    }

    timerTickTimeout = setTimeout(() => {
        scheduleTimerTick();
    }, speed);
}

function startTimer() {
    clearInterval(timerInterval);
    stopTimerSounds();

    remainingTime = GAME_SECONDS;
    updateStats();

    loadTimerTick();

    if (timerAudioContext && timerAudioContext.state === "suspended") {
        timerAudioContext.resume().catch(() => {});
    }

    scheduleTimerTick();

    timerInterval = setInterval(() => {
        if (!gameStarted) return;

        remainingTime--;
        updateStats();

        if (remainingTime <= 0) {
            clearInterval(timerInterval);
            timerInterval = null;
            stopTimerSounds();
            endGame(false);
        }
    }, 1000);
}

function stopTimer() {
    clearInterval(timerInterval);
    timerInterval = null;
    stopTimerSounds();
}
