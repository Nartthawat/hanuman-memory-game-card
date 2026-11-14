
// ==========================================
// HANUMAN COSTUME MEMORY CHALLENGE
// ==========================================

// GAME SETTINGS
const TOTAL_PAIRS = 5;
const PREVIEW_SECONDS = 5;
const GAME_SECONDS = 60;

// ==========================================
// COSTUME ITEMS
// ==========================================

const costumeItems = [
    {
        id: "crown",
        name: "มงกุฎ",
        image: "crown.png"
    },
    {
        id: "necklace",
        name: "สร้อยคอ",
        image: "necklace.png"
    },
    {
        id: "jewelry",
        name: "เครื่องประดับ",
        image: "jewelry.png"
    },
    {
        id: "belt",
        name: "เครื่องประดับเข็มขัด",
        image: "belt.png"
    },
    {
        id: "armor",
        name: "เกราะอก",
        image: "armor.png"
    }
];

// ==========================================
// ROUND CONFIGURATION
// แก้ไขคำถามและลำดับคำตอบได้ตรงนี้
// ==========================================

const roundProblems = [
    {
        title: "รอบที่ 1",
        question: "หนุมานควรสวมเครื่องประดับชิ้นใดก่อนและหลัง?",
        order: [
            "crown",
            "necklace",
            "jewelry",
            "belt",
            "armor"
        ]
    },

    {
        title: "รอบที่ 2",
        question: "จงเรียงลำดับเครื่องแต่งกายของหนุมานให้ถูกต้อง",
        order: [
            "crown",
            "necklace",
            "jewelry",
            "belt",
            "armor"
        ]
    },

    {
        title: "รอบที่ 3",
        question: "เครื่องแต่งกายชิ้นใดควรสวมก่อนเป็นลำดับแรก?",
        order: [
            "crown",
            "necklace",
            "jewelry",
            "belt",
            "armor"
        ]
    },

    {
        title: "รอบที่ 4",
        question: "จงจับคู่เครื่องแต่งกายตามลำดับที่ถูกต้อง",
        order: [
            "crown",
            "necklace",
            "jewelry",
            "belt",
            "armor"
        ]
    },

    {
        title: "รอบที่ 5",
        question: "ทดสอบความจำของคุณด้วยการเรียงลำดับเครื่องแต่งกาย",
        order: [
            "crown",
            "necklace",
            "jewelry",
            "belt",
            "armor"
        ]
    }
];

// ==========================================
// HTML ELEMENTS
// ==========================================

const grid = document.getElementById("game-grid");

const timerDisplay = document.getElementById("timer");
const matchedDisplay = document.getElementById("matched");
const scoreDisplay = document.getElementById("score");
const mistakesDisplay = document.getElementById("mistakes");

const progressBar = document.getElementById("progress-bar");
const progressText = document.getElementById("progress-text");

const statusDisplay = document.getElementById("status");
const messageDisplay = document.getElementById("message");
const hintDisplay = document.getElementById("game-hint");

const roundLabel = document.getElementById("round-label");
const roundTitle = document.getElementById("round-title");

const timerBox = document.querySelector(".timer-box");

const startButton = document.getElementById("start-button");
const restartButton = document.getElementById("restart-button");
const modalStartButton = document.getElementById("modal-start-button");

const introModal = document.getElementById("intro-modal");
const resultsModal = document.getElementById("results-modal");

const nextRoundButton = document.getElementById("next-round-button");
const playAgainButton = document.getElementById("play-again-button");

const resultEyebrow = document.getElementById("result-eyebrow");
const resultTitle = document.getElementById("result-title");
const resultMessage = document.getElementById("result-message");

const finalScore = document.getElementById("final-score");
const finalMistakes = document.getElementById("final-mistakes");
const finalTime = document.getElementById("final-time");

// ==========================================
// GAME VARIABLES
// ==========================================

let cards = [];

let firstCard = null;
let secondCard = null;

let matchedPairs = 0;
let score = 0;
let mistakes = 0;

let timeRemaining = GAME_SECONDS;
let previewRemaining = PREVIEW_SECONDS;

let currentRound = 0;

let gameStarted = false;
let locked = true;
let phase = "ready";

let timerInterval = null;
let previewInterval = null;
let flipTimeout = null;
let restartTimeout = null;

let gameSession = 0;

// ==========================================
// CURRENT ROUND
// ==========================================

function getCurrentRound() {
    return roundProblems[currentRound % roundProblems.length];
}

function getExpectedItem() {
    const expectedId = getCurrentRound().order[matchedPairs];

    return costumeItems.find(item => item.id === expectedId);
}

// ==========================================
// HELPER FUNCTIONS
// ==========================================

function sleep(milliseconds) {
    return new Promise(resolve => {
        setTimeout(resolve, milliseconds);
    });
}

function shuffleArray(array) {
    const result = [...array];

    for (let i = result.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));

        [result[i], result[j]] = [result[j], result[i]];
    }

    return result;
}

function clearGameTimers() {
    gameSession++;

    clearInterval(timerInterval);
    clearInterval(previewInterval);

    clearTimeout(flipTimeout);
    clearTimeout(restartTimeout);

    timerInterval = null;
    previewInterval = null;
    flipTimeout = null;
    restartTimeout = null;
}

function setStatus(title, message) {
    statusDisplay.textContent = title;
    messageDisplay.textContent = message;
}

function updateDisplay() {
    matchedDisplay.textContent = matchedPairs;
    scoreDisplay.textContent = score;
    mistakesDisplay.textContent = mistakes;

    const percentage = (matchedPairs / TOTAL_PAIRS) * 100;

    progressBar.style.width = `${percentage}%`;
    progressText.textContent = `${Math.round(percentage)}%`;
}

function updateTimerDisplay() {
    timerDisplay.textContent = timeRemaining;

    if (timeRemaining <= 15) {
        timerBox.classList.add("warning");
    } else {
        timerBox.classList.remove("warning");
    }
}

function updateRoundDisplay() {
    const round = getCurrentRound();

    roundLabel.textContent = round.title;
    roundTitle.textContent = round.question;
}

// ==========================================
// CREATE CARDS
// ==========================================

function createDeck() {
    grid.innerHTML = "";

    cards = [];
    firstCard = null;
    secondCard = null;

    const deck = [];

    costumeItems.forEach(item => {
        deck.push({ ...item });
        deck.push({ ...item });
    });

    const shuffledDeck = shuffleArray(deck);

    shuffledDeck.forEach((item, index) => {
        const card = document.createElement("button");

        card.type = "button";
        card.className = "card";

        card.dataset.id = item.id;
        card.dataset.name = item.name;

        card.style.order = index;

        card.setAttribute("aria-label", "ไพ่คว่ำอยู่");
        card.setAttribute("aria-pressed", "false");

        card.innerHTML = `
            <div class="card-inner">

                <div class="card-face card-back">
                    ✦
                </div>

                <div class="card-face card-front">
                    <img
                        src="assets/images/${item.image}"
                        alt="${item.name}"
                        draggable="false"
                    >
                </div>

            </div>
        `;

        card.addEventListener("click", () => {
            flipCard(card);
        });

        grid.appendChild(card);
        cards.push(card);
    });
}

// ==========================================
// SHUFFLE ANIMATION
// ==========================================

async function shuffleCards(session) {
    const shuffleMoves = 12;
    const moveDuration = 200;

    grid.classList.add("shuffling");

    cards.forEach((card, index) => {
        card.style.order = index;
    });

    await sleep(100);

    for (let move = 0; move < shuffleMoves; move++) {
        if (session !== gameSession) return;

        const indexA = Math.floor(Math.random() * cards.length);

        let indexB = Math.floor(Math.random() * cards.length);

        while (indexA === indexB) {
            indexB = Math.floor(Math.random() * cards.length);
        }

        const cardA = cards.find(
            card => Number(card.style.order) === indexA
        );

        const cardB = cards.find(
            card => Number(card.style.order) === indexB
        );

        if (!cardA || !cardB) continue;

        const oldPositions = new Map();

        cards.forEach(card => {
            oldPositions.set(card, card.getBoundingClientRect());
        });

        // สลับตำแหน่งไพ่สองใบ
        cardA.style.order = indexB;
        cardB.style.order = indexA;

        // บังคับให้เบราว์เซอร์คำนวณตำแหน่งใหม่
        grid.offsetHeight;

        // สร้างแอนิเมชันการเคลื่อนที่ของไพ่
        const animations = cards.map(card => {
            const oldRect = oldPositions.get(card);
            const newRect = card.getBoundingClientRect();

            const deltaX = oldRect.left - newRect.left;
            const deltaY = oldRect.top - newRect.top;

            return card.animate(
                [
                    {
                        transform: `translate(${deltaX}px, ${deltaY}px)`
                    },
                    {
                        transform: "translate(0, 0)"
                    }
                ],
                {
                    duration: moveDuration,
                    easing: "ease-in-out"
                }
            );
        });

        await Promise.all(
            animations.map(animation =>
                animation.finished.catch(() => {})
            )
        );

        if (session !== gameSession) return;
    }

    grid.classList.remove("shuffling");
}

// ==========================================
// START ATTEMPT
// ==========================================

async function startAttempt() {
    clearGameTimers();

    const session = gameSession;

    matchedPairs = 0;
    score = 0;

    timeRemaining = GAME_SECONDS;
    previewRemaining = PREVIEW_SECONDS;

    gameStarted = false;
    locked = true;
    phase = "shuffling";

    firstCard = null;
    secondCard = null;

    updateDisplay();
    updateTimerDisplay();
    updateRoundDisplay();

    introModal.classList.remove("visible");
    resultsModal.classList.remove("visible");

    startButton.disabled = true;
    modalStartButton.disabled = true;
    restartButton.disabled = true;

    createDeck();

    setStatus(
        "กำลังสลับไพ่",
        "สังเกตตำแหน่งไพ่ให้ดี!"
    );

    hintDisplay.textContent =
        "หากจับคู่ผิด จะต้องเริ่มรอบใหม่ทั้งหมด";

    // เริ่มแอนิเมชันสลับไพ่
    await shuffleCards(session);

    if (session !== gameSession) return;

    // เปิดไพ่ทั้งหมดเพื่อให้ผู้เล่นจดจำ
    phase = "preview";

    cards.forEach(card => {
        card.classList.add("flipped");

        card.setAttribute("aria-pressed", "true");
        card.setAttribute("aria-label", `ภาพ ${card.dataset.name}`);
    });

    previewRemaining = PREVIEW_SECONDS;

    setStatus(
        "จดจำตำแหน่งไพ่",
        `คุณมีเวลา ${previewRemaining} วินาที`
    );

    previewInterval = setInterval(() => {
        if (session !== gameSession) return;

        previewRemaining--;

        if (previewRemaining > 0) {
            messageDisplay.textContent =
                `จดจำตำแหน่งไพ่! เหลือเวลา ${previewRemaining} วินาที`;
        } else {
            clearInterval(previewInterval);
            previewInterval = null;

            closePreview(session);
        }
    }, 1000);
}

// ==========================================
// CLOSE PREVIEW
// ==========================================

async function closePreview(session) {
    if (session !== gameSession) return;

    phase = "closing";
    locked = true;

    setStatus(
        "เตรียมตัวให้พร้อม",
        "เริ่มจับคู่เครื่องแต่งกายได้เลย!"
    );

    cards.forEach(card => {
        card.classList.remove("flipped");

        card.setAttribute("aria-pressed", "false");
        card.setAttribute("aria-label", "ไพ่คว่ำอยู่");
    });

    await sleep(450);

    if (session !== gameSession) return;

    beginGame();
}

// ==========================================
// BEGIN GAME TIMER
// ==========================================

function beginGame() {
    phase = "playing";

    gameStarted = true;
    locked = false;

    startButton.disabled = true;
    modalStartButton.disabled = false;
    restartButton.disabled = false;

    // ไม่บอกชื่อชิ้นส่วนที่ต้องจับคู่ถัดไป
    setStatus(
        "เริ่มเกมแล้ว",
        "จับคู่เครื่องแต่งกายให้ถูกต้องตามลำดับ"
    );

    hintDisplay.textContent =
        "จับคู่ให้ครบทั้ง 5 คู่ โดยไม่ให้ผิดพลาด";

    timerInterval = setInterval(() => {
        if (!gameStarted) return;

        timeRemaining--;

        updateTimerDisplay();

        if (timeRemaining <= 0) {
            timeRemaining = 0;

            updateTimerDisplay();

            endGame(false);
        }
    }, 1000);
}

// ==========================================
// FLIP CARD
// ==========================================

function flipCard(card) {
    if (!gameStarted) return;
    if (locked) return;
    if (phase !== "playing") return;
    if (card.classList.contains("flipped")) return;
    if (card.classList.contains("matched")) return;

    card.classList.add("flipped");

    card.setAttribute("aria-pressed", "true");
    card.setAttribute("aria-label", card.dataset.name);

    if (!firstCard) {
        firstCard = card;

        setStatus(
            "เลือกไพ่ใบแรกแล้ว",
            "เลือกไพ่อีกหนึ่งใบเพื่อจับคู่"
        );

        return;
    }

    secondCard = card;

    locked = true;

    checkMatch();
}

// ==========================================
// CHECK MATCH
// ==========================================

function checkMatch() {
    const firstId = firstCard.dataset.id;
    const secondId = secondCard.dataset.id;

    const expectedId = getCurrentRound().order[matchedPairs];

    const isSamePair = firstId === secondId;
    const isCorrectOrder = firstId === expectedId;

    if (isSamePair && isCorrectOrder) {
        handleCorrectMatch();
    } else {
        handleWrongMatch();
    }
}

// ==========================================
// CORRECT MATCH
// ==========================================

function handleCorrectMatch() {
    firstCard.classList.add("matched");
    secondCard.classList.add("matched");

    firstCard.disabled = true;
    secondCard.disabled = true;

    matchedPairs++;

    // จับคู่ถูกหนึ่งคู่ ได้หนึ่งคะแนน
    score = matchedPairs;

    updateDisplay();

    firstCard = null;
    secondCard = null;

    if (matchedPairs >= TOTAL_PAIRS) {
        setStatus(
            "สำเร็จ!",
            "คุณจับคู่เครื่องแต่งกายครบทั้ง 5 คู่แล้ว"
        );

        setTimeout(() => {
            if (gameStarted) {
                endGame(true);
            }
        }, 700);

        return;
    }

    // ไม่เฉลยว่าคู่ถัดไปคืออะไร
    setStatus(
        "จับคู่ถูกต้อง!",
        "ทำได้ดี! จับคู่ชิ้นต่อไปให้ถูกต้อง"
    );

    locked = false;
}

// ==========================================
// WRONG MATCH
// ==========================================

function handleWrongMatch() {
    mistakes++;

    updateDisplay();

    setStatus(
        "จับคู่ไม่ถูกต้อง!",
        "คะแนนและความคืบหน้าจะถูกรีเซ็ต กำลังเริ่มรอบใหม่"
    );

    firstCard = null;
    secondCard = null;

    // หยุดเกมและเวลา
    clearInterval(timerInterval);
    timerInterval = null;

    gameStarted = false;
    locked = true;
    phase = "resetting";

    // รีเซ็ตคะแนนและความคืบหน้า
    matchedPairs = 0;
    score = 0;

    updateDisplay();

    // เว้นเวลาให้ผู้เล่นเห็นข้อความก่อนเริ่มใหม่
    restartTimeout = setTimeout(() => {
        if (phase !== "resetting") return;

        startAttempt();
    }, 900);
}

// ==========================================
// END GAME
// ==========================================

function endGame(won) {
    if (!gameStarted) return;

    gameStarted = false;
    locked = true;
    phase = "finished";

    clearInterval(timerInterval);
    clearInterval(previewInterval);

    timerInterval = null;
    previewInterval = null;

    startButton.disabled = false;
    restartButton.disabled = false;

    finalScore.textContent = score;
    finalMistakes.textContent = mistakes;
    finalTime.textContent = timeRemaining;

    if (won) {
        resultEyebrow.textContent = "ภารกิจสำเร็จ";
        resultTitle.textContent = "ยินดีด้วย!";

        resultMessage.textContent =
            "คุณจับคู่เครื่องแต่งกายหนุมานครบทั้ง 5 คู่ตามลำดับที่ถูกต้องแล้ว";

        nextRoundButton.style.display = "block";
    } else {
        resultEyebrow.textContent = "หมดเวลา";
        resultTitle.textContent = "จบเกม";

        resultMessage.textContent =
            `คุณจับคู่ได้ ${matchedPairs} จาก ${TOTAL_PAIRS} คู่ ลองอีกครั้งนะ!`;

        nextRoundButton.style.display = "none";
    }

    resultsModal.classList.add("visible");
}

// ==========================================
// RESTART CURRENT ROUND
// ==========================================

function restartGame() {
    mistakes = 0;

    startAttempt();
}

// ==========================================
// NEXT ROUND
// ==========================================

function nextRound() {
    currentRound++;

    mistakes = 0;

    updateRoundDisplay();

    startAttempt();
}

// ==========================================
// BUTTON EVENTS
// ==========================================

startButton.addEventListener("click", () => {
    startAttempt();
});

modalStartButton.addEventListener("click", () => {
    startAttempt();
});

restartButton.addEventListener("click", () => {
    restartGame();
});

nextRoundButton.addEventListener("click", () => {
    nextRound();
});

playAgainButton.addEventListener("click", () => {
    restartGame();
});

// ==========================================
// VALIDATE ROUND CONFIGURATION
// ==========================================

function validateRounds() {
    roundProblems.forEach((round, index) => {
        if (!Array.isArray(round.order) || round.order.length !== TOTAL_PAIRS) {
            throw new Error(
                `รอบที่ ${index + 1} ต้องมีรหัสเครื่องแต่งกาย ${TOTAL_PAIRS} รายการ`
            );
        }

        const uniqueIds = new Set(round.order);

        if (uniqueIds.size !== TOTAL_PAIRS) {
            throw new Error(
                `รอบที่ ${index + 1} มีรหัสเครื่องแต่งกายซ้ำกัน`
            );
        }

        round.order.forEach(id => {
            const exists = costumeItems.some(item => item.id === id);

            if (!exists) {
                throw new Error(
                    `รอบที่ ${index + 1} มีรหัสที่ไม่ถูกต้อง: ${id}`
                );
            }
        });
    });
}

// ==========================================
// INITIALIZE GAME
// ==========================================

function initializeGame() {
    validateRounds();

    updateRoundDisplay();
    updateDisplay();
    updateTimerDisplay();

    createDeck();

    setStatus(
        "เตรียมตัวให้พร้อม",
        "กดปุ่มเริ่มเกมเมื่อคุณพร้อม"
    );

    hintDisplay.textContent =
        "จดจำตำแหน่งไพ่ก่อนเริ่มจับคู่";

    startButton.disabled = false;
    modalStartButton.disabled = false;
    restartButton.disabled = false;
}

initializeGame();
