function shuffleArray(array) {
    const shuffled = [...array];

    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));

        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    return shuffled;
}

function wait(milliseconds) {
    return new Promise(resolve => setTimeout(resolve, milliseconds));
}

/* CREATE CARDS */

function createCards() {
    const grid = document.getElementById("game-grid");

    grid.innerHTML = "";

    cards = [];

    const cardData = [];

    costumeItems.forEach(item => {
        cardData.push({
            id: item.id,
            type: "image",
            name: item.name,
            image: item.image
        });

        cardData.push({
            id: item.id,
            type: "text",
            name: item.name
        });
    });

    const shuffledData = shuffleArray(cardData);

    shuffledData.forEach((item, index) => {
        const card = document.createElement("div");

        card.className = "card";
        card.dataset.id = item.id;
        card.dataset.type = item.type;
        card.dataset.index = index;

        const frontContent = item.type === "image"
            ? `<img src="${item.image}" alt="${item.name}">`
            : `<span class="card-name">${item.name}</span>`;

        card.innerHTML = `
            <div class="card-inner">
                <div class="card-face card-back"></div>
                <div class="card-face card-front ${item.type}-card">
                    ${frontContent}
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

/* SHUFFLE ANIMATION */

async function shuffleCards(session) {
    const grid = document.getElementById("game-grid");

    const cardElements = [...grid.children];

    playShuffleSound();

    for (let i = 0; i < 8; i++) {
        if (session !== gameSession) return;

        const shuffled = shuffleArray(cardElements);

        shuffled.forEach(card => {
            grid.appendChild(card);
        });

        await wait(180);
    }

    stopShuffleSound();
}

/* PREVIEW */

async function showPreview(session) {
    if (session !== gameSession) return;

    inputLocked = true;

    cards.forEach(card => {
        card.classList.add("flipped");
    });

    setStatus("จดจำตำแหน่งและชื่อของเครื่องแต่งกายให้ดี!");

    await wait(PREVIEW_SECONDS * 1000);

    if (session !== gameSession || !gameStarted) return;

    cards.forEach(card => {
        card.classList.remove("flipped");
    });

    inputLocked = false;

    setStatus("เริ่มจับคู่ได้เลย!");

    startTimer();
}

/* FLIP CARD */

function flipCard(card) {
    if (!gameStarted) return;
    if (inputLocked) return;
    if (card.classList.contains("flipped")) return;
    if (card.classList.contains("matched")) return;

    card.classList.add("flipped");

    playFlipSound();

    selectedCards.push(card);

    if (selectedCards.length === 2) {
        inputLocked = true;

        checkAnswer(gameSession);
    }
}

/* CHECK MATCH */

async function checkAnswer(session) {
    if (selectedCards.length !== 2) return;

    const [firstCard, secondCard] = selectedCards;

    const isMatch =
        firstCard.dataset.id === secondCard.dataset.id &&
        firstCard.dataset.type !== secondCard.dataset.type;

    if (isMatch) {
        handleCorrectAnswer(session);
    } else {
        handleWrongAnswer(session);
    }
}

/* CORRECT MATCH */

function handleCorrectAnswer(session) {
    if (session !== gameSession) return;

    const [firstCard, secondCard] = selectedCards;

    firstCard.classList.add("matched");
    secondCard.classList.add("matched");

    score++;
    matchedPairs++;

    selectedCards = [];

    playCorrectSound();

    updateStats();
    updateProgress();

    setStatus("ถูกต้อง! จับคู่ได้แล้ว");

    if (matchedPairs === TOTAL_ITEMS) {
        endGame(true);
        return;
    }

    inputLocked = false;
}

/* WRONG MATCH */

async function handleWrongAnswer(session) {
    if (session !== gameSession) return;

    const [firstCard, secondCard] = selectedCards;

    mistakes++;
    score = Math.max(0, score - 1);

    firstCard.classList.add("wrong");
    secondCard.classList.add("wrong");

    playWrongSound();

    updateStats();

    setStatus("ยังไม่ถูกต้อง ลองจับคู่ใหม่อีกครั้ง");

    await wait(900);

    if (session !== gameSession || !gameStarted) return;

    firstCard.classList.remove("flipped", "wrong");
    secondCard.classList.remove("flipped", "wrong");

    selectedCards = [];

    inputLocked = false;
}
