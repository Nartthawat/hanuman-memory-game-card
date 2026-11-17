/* GAME STATE */

let cards = [];
let selectedCards = [];

let score = 0;
let mistakes = 0;
let matchedPairs = 0;
let remainingTime = GAME_SECONDS;

let gameStarted = false;
let inputLocked = true;
let gameSession = 0;

/* HTML ELEMENTS */

const timerElement = document.getElementById("timer");
const matchedElement = document.getElementById("matched");
const scoreElement = document.getElementById("score");
const mistakesElement = document.getElementById("mistakes");

const progressBar = document.getElementById("progress-bar");
const progressText = document.getElementById("progress-text");

const statusElement = document.getElementById("status");
const messageElement = document.getElementById("message");

const introModal = document.getElementById("intro-modal");
const resultsModal = document.getElementById("results-modal");

/* UPDATE DISPLAY */

function updateStats() {
    if (timerElement) {
        timerElement.textContent = remainingTime;
    }

    if (matchedElement) {
        matchedElement.textContent = `${matchedPairs}/${TOTAL_ITEMS}`;
    }

    if (scoreElement) {
        scoreElement.textContent = score;
    }

    if (mistakesElement) {
        mistakesElement.textContent = mistakes;
    }

    const timerBox = document.querySelector(".timer-box");

    if (timerBox) {
        timerBox.classList.toggle(
            "warning",
            remainingTime <= 10 && remainingTime > 0
        );
    }
}

function updateProgress() {
    const percentage = (matchedPairs / TOTAL_ITEMS) * 100;

    if (progressBar) {
        progressBar.style.width = `${percentage}%`;
    }

    if (progressText) {
        progressText.textContent = `${matchedPairs}/${TOTAL_ITEMS} คู่`;
    }
}

function setStatus(text) {
    if (statusElement) {
        statusElement.textContent = text;
    }

    if (messageElement) {
        messageElement.textContent = text;
    }
}

/* START GAME */

async function startAttempt() {
    gameSession++;

    const currentSession = gameSession;

    stopTimer();
    stopShuffleSound();

    gameStarted = true;
    inputLocked = true;

    score = 0;
    mistakes = 0;
    matchedPairs = 0;
    remainingTime = GAME_SECONDS;

    selectedCards = [];

    if (introModal) {
        introModal.classList.add("hidden");
    }

    if (resultsModal) {
        resultsModal.classList.add("hidden");
    }

    updateStats();
    updateProgress();

    setStatus("เตรียมตัวให้พร้อม!");

    playGameStartSound();

    createCards();

    await shuffleCards(currentSession);

    if (currentSession !== gameSession) return;

    await showPreview(currentSession);
}

/* END GAME */

function endGame(won) {
    if (!gameStarted) return;

    gameStarted = false;
    inputLocked = true;

    stopTimer();
    stopShuffleSound();

    const resultEyebrow = document.getElementById("result-eyebrow");
    const resultTitle = document.getElementById("result-title");
    const resultMessage = document.getElementById("result-message");

    const finalScore = document.getElementById("final-score");
    const finalMatched = document.getElementById("final-matched");
    const finalMistakes = document.getElementById("final-mistakes");
    const finalTime = document.getElementById("final-time");

    if (won) {
        if (resultEyebrow) {
            resultEyebrow.textContent = "ภารกิจสำเร็จ";
        }

        if (resultTitle) {
            resultTitle.textContent = "ยอดเยี่ยม!";
        }

        if (resultMessage) {
            resultMessage.textContent =
                "คุณจับคู่เครื่องแต่งกายได้ครบทั้งหมดแล้ว!";
        }
    } else {
        if (resultEyebrow) {
            resultEyebrow.textContent = "หมดเวลา";
        }

        if (resultTitle) {
            resultTitle.textContent = "จบเกม!";
        }

        if (resultMessage) {
            resultMessage.textContent =
                `คุณจับคู่ได้ ${matchedPairs} จาก ${TOTAL_ITEMS} คู่ ลองอีกครั้งนะ!`;
        }
    }

    if (finalScore) {
        finalScore.textContent = score;
    }

    if (finalMatched) {
        finalMatched.textContent = `${matchedPairs}/${TOTAL_ITEMS}`;
    }

    if (finalMistakes) {
        finalMistakes.textContent = mistakes;
    }

    if (finalTime) {
        finalTime.textContent = remainingTime;
    }

    if (resultsModal) {
        resultsModal.classList.remove("hidden");
    }
}

startAttempt();
