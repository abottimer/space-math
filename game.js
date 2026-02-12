// Space Math Mission - Game Logic

// Planet progression (Pluto -> Sun) with fun facts
// Difficulty: 1-2 single digit, 3-4 double digit, 5-6-7 triple digit, 8-9 four digit, Sun = BOSS (5 digit)
const PLANETS = [
    { 
        name: 'Pluto', 
        emoji: '🪐',
        image: 'assets/planets/pluto.png',
        difficulty: 'single', 
        maxNum: 9,
        fact: "Pluto is smaller than Earth's Moon! It was discovered in 1930."
    },
    { 
        name: 'Neptune', 
        emoji: '🔵',
        image: 'assets/planets/neptune.png',
        difficulty: 'single', 
        maxNum: 9,
        fact: "Neptune has the strongest winds in the solar system — up to 1,200 mph!"
    },
    { 
        name: 'Uranus', 
        emoji: '💎',
        image: 'assets/planets/uranus.png',
        difficulty: 'double', 
        maxNum: 99,
        fact: "Uranus rotates on its side like a rolling ball! It's the only planet that does this."
    },
    { 
        name: 'Saturn', 
        emoji: '🪐',
        image: 'assets/planets/saturn.png',
        difficulty: 'double', 
        maxNum: 99,
        fact: "Saturn's rings are made of ice and rock. You could fit 764 Earths inside Saturn!"
    },
    { 
        name: 'Jupiter', 
        emoji: '🟠',
        image: 'assets/planets/jupiter.png',
        difficulty: 'triple', 
        maxNum: 999,
        fact: "Jupiter is so big that all the other planets could fit inside it! It has 95 moons."
    },
    { 
        name: 'Mars', 
        emoji: '🔴',
        image: 'assets/planets/mars.png',
        difficulty: 'triple', 
        maxNum: 999,
        fact: "Mars has the tallest volcano in the solar system — Olympus Mons is 3x taller than Mt. Everest!"
    },
    { 
        name: 'Earth', 
        emoji: '🌍',
        image: 'assets/planets/earth.png',
        difficulty: 'triple', 
        maxNum: 999,
        fact: "You're passing by home! Earth is the only planet we know has life."
    },
    { 
        name: 'Venus', 
        emoji: '🟡',
        image: 'assets/planets/venus.png',
        difficulty: 'quad', 
        maxNum: 9999,
        fact: "A day on Venus is longer than its year! It spins very, very slowly."
    },
    { 
        name: 'Mercury', 
        emoji: '⚫',
        image: 'assets/planets/mercury.png',
        difficulty: 'quad', 
        maxNum: 9999,
        fact: "Mercury is the fastest planet — it zooms around the Sun in just 88 Earth days!"
    },
    { 
        name: 'Sun', 
        emoji: '☀️',
        image: 'assets/planets/sun.png',
        difficulty: 'boss', 
        maxNum: 99999,
        fact: "🏆 BOSS DEFEATED! You conquered the Sun! It's so big that 1.3 million Earths could fit inside!"
    },
];

// Game state
let gameState = {
    pilotName: 'Austin',
    currentPlanetIndex: 0,
    score: 0,
    streak: 0,
    problemsOnPlanet: 0,
    problemsNeededToAdvance: 3,
    currentProblem: null,
    answer: [],
    carries: [],
};

// DOM elements
let elements = {};

// Initialize the game
function init() {
    // Cache DOM elements
    elements = {
        startScreen: document.getElementById('start-screen'),
        victoryScreen: document.getElementById('victory-screen'),
        startBtn: document.getElementById('start-btn'),
        playAgainBtn: document.getElementById('play-again-btn'),
        pilotNameInput: document.getElementById('pilot-name'),
        planetTracker: document.getElementById('planet-tracker'),
        currentPlanetEmoji: document.getElementById('current-planet-emoji'),
        currentPlanetName: document.getElementById('current-planet-name'),
        planetProgressBar: document.getElementById('planet-progress-bar'),
        planetProgressText: document.getElementById('planet-progress-text'),
        streak: document.getElementById('streak'),
        score: document.getElementById('score'),
        carryRow: document.getElementById('carry-row'),
        number1Row: document.getElementById('number1-row'),
        number2Row: document.getElementById('number2-row'),
        operator: document.getElementById('operator'),
        answerRow: document.getElementById('answer-row'),
        problemContainer: document.getElementById('problem-container'),
        scratchpad: document.getElementById('scratchpad'),
        clearCanvas: document.getElementById('clear-canvas'),
        colorBtns: document.querySelectorAll('.color-btn'),
        tiles: document.querySelectorAll('.tile[data-value]'),
        backspaceBtn: document.getElementById('backspace-btn'),
        submitBtn: document.getElementById('submit-btn'),
        feedback: document.getElementById('feedback'),
        feedbackEmoji: document.getElementById('feedback-emoji'),
        feedbackText: document.getElementById('feedback-text'),
        planetFact: document.getElementById('planet-fact'),
        planetFactEmoji: document.getElementById('planet-fact-emoji'),
        planetFactTitle: document.getElementById('planet-fact-title'),
        planetFactText: document.getElementById('planet-fact-text'),
        rocket: document.getElementById('rocket'),
        finalStats: document.getElementById('final-stats'),
        resetBtn: document.getElementById('reset-btn'),
    };

    // Create stars background
    createStars();

    // Setup event listeners
    setupEventListeners();

    // Setup scratchpad
    setupScratchpad();

    // Render planet tracker
    renderPlanetTracker();

    // Position rocket initially
    setTimeout(positionRocket, 100);

    // Load saved state
    loadState();
}

// Create animated stars background
function createStars() {
    const starsContainer = document.getElementById('stars');
    for (let i = 0; i < 100; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        star.style.left = `${Math.random() * 100}%`;
        star.style.top = `${Math.random() * 100}%`;
        star.style.width = star.style.height = `${Math.random() * 3 + 1}px`;
        star.style.animationDelay = `${Math.random() * 2}s`;
        starsContainer.appendChild(star);
    }
}

// Setup event listeners
function setupEventListeners() {
    // Start game
    elements.startBtn.addEventListener('click', startGame);
    elements.playAgainBtn.addEventListener('click', restartGame);
    elements.resetBtn.addEventListener('click', resetProgress);

    // Tile drag events - use custom pointer-based drag system
    elements.tiles.forEach(tile => {
        // Pointer events for custom drag
        tile.addEventListener('pointerdown', handlePointerDown);
        // Also allow simple click to add (for quick taps)
        tile.addEventListener('click', (e) => {
            // Only handle click if we didn't just drag
            if (!wasDragging) {
                handleTileClick(tile.dataset.value);
            }
            wasDragging = false;
        });
    });

    // Global pointer events for dragging
    document.addEventListener('pointermove', handlePointerMove);
    document.addEventListener('pointerup', handlePointerUp);
    document.addEventListener('pointercancel', handlePointerUp);

    // Backspace and submit
    elements.backspaceBtn.addEventListener('click', handleBackspace);
    elements.submitBtn.addEventListener('click', checkAnswer);

    // Color buttons
    elements.colorBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            elements.colorBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            scratchpadColor = btn.dataset.color;
        });
    });

    // Clear scratchpad
    elements.clearCanvas.addEventListener('click', clearScratchpad);

    // Keyboard support
    document.addEventListener('keydown', handleKeydown);

    // Close planet fact on click
    elements.planetFact.addEventListener('click', () => {
        elements.planetFact.classList.add('hidden');
    });
}

// Handle keyboard input
function handleKeydown(e) {
    if (elements.startScreen.classList.contains('hidden') === false) return;
    if (elements.victoryScreen.classList.contains('hidden') === false) return;
    if (!elements.planetFact.classList.contains('hidden')) {
        elements.planetFact.classList.add('hidden');
        return;
    }

    if (e.key >= '0' && e.key <= '9') {
        handleTileClick(e.key);
    } else if (e.key === 'Backspace') {
        handleBackspace();
    } else if (e.key === 'Enter') {
        checkAnswer();
    }
}

// Custom pointer-based drag and drop system
let dragState = {
    isDragging: false,
    value: null,
    clone: null,
    startX: 0,
    startY: 0,
    originTile: null
};
let wasDragging = false;

function handlePointerDown(e) {
    const tile = e.target.closest('.tile');
    if (!tile || tile.classList.contains('action-tile')) return;
    
    // Prevent default to avoid text selection
    e.preventDefault();
    
    dragState.isDragging = false; // Will become true on move
    dragState.value = tile.dataset.value;
    dragState.startX = e.clientX;
    dragState.startY = e.clientY;
    dragState.originTile = tile;
    
    // Capture pointer for reliable tracking
    tile.setPointerCapture(e.pointerId);
    
    sounds.click();
}

function handlePointerMove(e) {
    if (dragState.value === null) return;
    
    const dx = e.clientX - dragState.startX;
    const dy = e.clientY - dragState.startY;
    
    // Start dragging after moving a bit (5px threshold)
    if (!dragState.isDragging && (Math.abs(dx) > 5 || Math.abs(dy) > 5)) {
        dragState.isDragging = true;
        wasDragging = true;
        
        // Create floating clone
        dragState.clone = document.createElement('div');
        dragState.clone.className = 'drag-clone';
        dragState.clone.textContent = dragState.value;
        document.body.appendChild(dragState.clone);
        
        // Mark origin as being dragged
        if (dragState.originTile) {
            dragState.originTile.classList.add('dragging');
        }
    }
    
    if (dragState.isDragging && dragState.clone) {
        // Position clone at cursor
        dragState.clone.style.left = `${e.clientX}px`;
        dragState.clone.style.top = `${e.clientY}px`;
        
        // Highlight slot under cursor
        highlightSlotUnderPoint(e.clientX, e.clientY);
    }
}

function handlePointerUp(e) {
    if (dragState.isDragging && dragState.value !== null) {
        // Find slot under cursor and drop
        const slot = getSlotUnderPoint(e.clientX, e.clientY);
        if (slot) {
            const index = parseInt(slot.dataset.index);
            placeDigit(index, dragState.value);
            sounds.drop();
        }
    }
    
    // Cleanup
    cleanupDrag();
}

function highlightSlotUnderPoint(x, y) {
    // Clear all highlights
    document.querySelectorAll('.answer-slot').forEach(slot => {
        slot.classList.remove('drag-over');
    });
    
    // Highlight slot under point
    const slot = getSlotUnderPoint(x, y);
    if (slot) {
        slot.classList.add('drag-over');
    }
}

function getSlotUnderPoint(x, y) {
    const slots = document.querySelectorAll('.answer-slot');
    for (const slot of slots) {
        const rect = slot.getBoundingClientRect();
        if (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) {
            return slot;
        }
    }
    return null;
}

function cleanupDrag() {
    if (dragState.clone) {
        dragState.clone.remove();
    }
    if (dragState.originTile) {
        dragState.originTile.classList.remove('dragging');
    }
    
    // Clear all slot highlights
    document.querySelectorAll('.answer-slot').forEach(slot => {
        slot.classList.remove('drag-over');
    });
    
    dragState = {
        isDragging: false,
        value: null,
        clone: null,
        startX: 0,
        startY: 0,
        originTile: null
    };
}

function setupAnswerSlotListeners() {
    const slots = document.querySelectorAll('.answer-slot');
    slots.forEach((slot, index) => {
        // Store index on slot for easy lookup
        slot.dataset.index = index;
        
        // Click on slot to clear it
        slot.addEventListener('click', (e) => {
            if (gameState.answer[index] !== null) {
                // Clear this slot
                gameState.answer[index] = null;
                sounds.remove();
                renderAnswer();
            }
        });
    });
}

// Handle tile click (add digit to first empty slot from right)
function handleTileClick(value) {
    // Find first empty slot from right
    for (let i = gameState.answer.length - 1; i >= 0; i--) {
        if (gameState.answer[i] === null) {
            placeDigit(i, value);
            sounds.drop();
            return;
        }
    }
}

// Place a digit in a slot
function placeDigit(index, value) {
    gameState.answer[index] = value;
    renderAnswer();
}

// Handle backspace
function handleBackspace() {
    // Remove the last filled digit (from left, since we fill right to left)
    for (let i = 0; i < gameState.answer.length; i++) {
        if (gameState.answer[i] !== null) {
            gameState.answer[i] = null;
            sounds.remove();
            renderAnswer();
            return;
        }
    }
}

// Select a specific slot
function selectSlot(index) {
    // Visual feedback could be added here
}

// Scratchpad drawing
let scratchpadCtx;
let isDrawing = false;
let scratchpadColor = '#ffff00'; // Yellow default for visibility

function setupScratchpad() {
    const canvas = elements.scratchpad;
    scratchpadCtx = canvas.getContext('2d');
    
    // Set canvas size to match container
    resizeScratchpad();

    // Drawing events
    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseout', stopDrawing);

    // Touch support
    canvas.addEventListener('touchstart', (e) => {
        e.preventDefault();
        const touch = e.touches[0];
        const rect = canvas.getBoundingClientRect();
        startDrawing({ offsetX: touch.clientX - rect.left, offsetY: touch.clientY - rect.top });
    });
    canvas.addEventListener('touchmove', (e) => {
        e.preventDefault();
        const touch = e.touches[0];
        const rect = canvas.getBoundingClientRect();
        draw({ offsetX: touch.clientX - rect.left, offsetY: touch.clientY - rect.top });
    });
    canvas.addEventListener('touchend', stopDrawing);

    // Set first color as active
    elements.colorBtns[0].classList.add('active');
}

function resizeScratchpad() {
    const canvas = elements.scratchpad;
    const container = elements.problemContainer;
    canvas.width = container.offsetWidth;
    canvas.height = container.offsetHeight;
}

function startDrawing(e) {
    isDrawing = true;
    scratchpadCtx.beginPath();
    scratchpadCtx.moveTo(e.offsetX, e.offsetY);
}

function draw(e) {
    if (!isDrawing) return;
    scratchpadCtx.lineTo(e.offsetX, e.offsetY);
    scratchpadCtx.strokeStyle = scratchpadColor;
    scratchpadCtx.lineWidth = 4;
    scratchpadCtx.lineCap = 'round';
    scratchpadCtx.stroke();
}

function stopDrawing() {
    isDrawing = false;
}

function clearScratchpad() {
    const canvas = elements.scratchpad;
    scratchpadCtx.clearRect(0, 0, canvas.width, canvas.height);
}

// Render planet tracker
function renderPlanetTracker() {
    elements.planetTracker.innerHTML = PLANETS.map((planet, i) => {
        let classes = 'planet';
        if (i < gameState.currentPlanetIndex) classes += ' reached';
        if (i === gameState.currentPlanetIndex) classes += ' current';
        return `<span class="${classes}" title="${planet.name}" data-index="${i}"><img src="${planet.image}" alt="${planet.name}"></span>`;
    }).join('');
}

// Position rocket at current planet (vertical sidebar - rocket flies up)
function positionRocket() {
    const currentPlanet = document.querySelector('#planet-tracker .planet.current');
    const sidebar = document.getElementById('planet-sidebar');
    if (currentPlanet && sidebar) {
        const planetRect = currentPlanet.getBoundingClientRect();
        const sidebarRect = sidebar.getBoundingClientRect();
        // Position rocket to the left of the sidebar, aligned with current planet
        const relativeTop = planetRect.top - sidebarRect.top + (planetRect.height / 2) - 20;
        elements.rocket.style.top = `${relativeTop}px`;
    }
}

// Animate rocket to new planet (flying up)
function animateRocketToTarget(targetIndex) {
    const targetPlanet = document.querySelector(`#planet-tracker .planet[data-index="${targetIndex}"]`);
    const sidebar = document.getElementById('planet-sidebar');
    if (targetPlanet && sidebar) {
        elements.rocket.classList.add('flying');
        sounds.rocket();
        
        const planetRect = targetPlanet.getBoundingClientRect();
        const sidebarRect = sidebar.getBoundingClientRect();
        const relativeTop = planetRect.top - sidebarRect.top + (planetRect.height / 2) - 20;
        elements.rocket.style.top = `${relativeTop}px`;
        
        setTimeout(() => {
            elements.rocket.classList.remove('flying');
        }, 1000);
    }
}

// Update progress bar
function updateProgressBar() {
    const progress = (gameState.problemsOnPlanet / gameState.problemsNeededToAdvance) * 100;
    elements.planetProgressBar.style.setProperty('--progress', `${progress}%`);
    elements.planetProgressText.textContent = `${gameState.problemsOnPlanet}/${gameState.problemsNeededToAdvance}`;
}

// Generate a math problem
function generateProblem() {
    const planet = PLANETS[gameState.currentPlanetIndex];
    const maxNum = planet.maxNum;
    
    // Randomly choose addition or subtraction
    const isAddition = Math.random() > 0.3; // 70% addition for younger kids
    
    let num1, num2, answer;
    
    if (isAddition) {
        num1 = Math.floor(Math.random() * maxNum) + 1;
        num2 = Math.floor(Math.random() * maxNum) + 1;
        answer = num1 + num2;
    } else {
        // For subtraction, ensure positive result
        num1 = Math.floor(Math.random() * maxNum) + 1;
        num2 = Math.floor(Math.random() * num1) + 1;
        // Swap to ensure larger number is first
        if (num2 > num1) [num1, num2] = [num2, num1];
        answer = num1 - num2;
    }

    gameState.currentProblem = {
        num1,
        num2,
        operator: isAddition ? '+' : '-',
        answer: answer.toString(),
    };

    // Initialize answer array with nulls
    gameState.answer = new Array(gameState.currentProblem.answer.length).fill(null);
    
    // Initialize carries array
    const maxDigits = Math.max(num1.toString().length, num2.toString().length);
    gameState.carries = new Array(maxDigits + 1).fill(false);

    renderProblem();
}

// Render the current problem
function renderProblem() {
    const { num1, num2, operator, answer } = gameState.currentProblem;
    
    const num1Str = num1.toString();
    const num2Str = num2.toString();
    const maxDigits = Math.max(num1Str.length, num2Str.length, answer.length);

    // Render carry row
    elements.carryRow.innerHTML = '';
    for (let i = 0; i < maxDigits + 1; i++) {
        const slot = document.createElement('div');
        slot.className = 'carry-slot';
        slot.dataset.index = i;
        slot.addEventListener('click', () => toggleCarry(i));
        elements.carryRow.appendChild(slot);
    }

    // Render numbers (right-aligned)
    elements.number1Row.innerHTML = num1Str.padStart(maxDigits, ' ')
        .split('')
        .map(d => `<div class="digit">${d === ' ' ? '' : d}</div>`)
        .join('');

    elements.number2Row.innerHTML = num2Str.padStart(maxDigits, ' ')
        .split('')
        .map(d => `<div class="digit">${d === ' ' ? '' : d}</div>`)
        .join('');

    // Use proper minus sign (−) instead of hyphen (-) for better visibility
    elements.operator.textContent = operator === '-' ? '−' : operator;

    // Render answer slots
    elements.answerRow.innerHTML = '';
    for (let i = 0; i < answer.length; i++) {
        const slot = document.createElement('div');
        slot.className = 'answer-slot';
        slot.dataset.index = i;
        elements.answerRow.appendChild(slot);
    }

    setupAnswerSlotListeners();
    renderAnswer();
    
    // Resize scratchpad to match new problem size
    setTimeout(resizeScratchpad, 50);
}

// Toggle carry mark
function toggleCarry(index) {
    gameState.carries[index] = !gameState.carries[index];
    const slots = elements.carryRow.querySelectorAll('.carry-slot');
    slots[index].textContent = gameState.carries[index] ? '¹' : '';
    slots[index].classList.toggle('has-carry', gameState.carries[index]);
}

// Render current answer
function renderAnswer() {
    const slots = document.querySelectorAll('.answer-slot');
    slots.forEach((slot, i) => {
        const value = gameState.answer[i];
        slot.textContent = value !== null ? value : '';
        slot.classList.toggle('filled', value !== null);
    });
}

// Check the answer
function checkAnswer() {
    const userAnswer = gameState.answer.join('');
    const correctAnswer = gameState.currentProblem.answer;

    // Check if any slots are still empty (null)
    if (gameState.answer.includes(null)) {
        showFeedback('🤔', 'Fill all the boxes!', false);
        return;
    }

    const slots = document.querySelectorAll('.answer-slot');

    if (userAnswer === correctAnswer) {
        // Correct!
        slots.forEach(slot => slot.classList.add('correct'));
        sounds.correct();
        
        gameState.score += 10 * (gameState.streak + 1);
        gameState.streak++;
        gameState.problemsOnPlanet++;

        updateStats();
        updateProgressBar();
        showFeedback('🎉', getPositiveFeedback(), true);

        // Check if ready to advance
        if (gameState.problemsOnPlanet >= gameState.problemsNeededToAdvance) {
            setTimeout(advancePlanet, 1500);
        } else {
            setTimeout(() => {
                clearScratchpad();
                generateProblem();
            }, 1500);
        }
    } else {
        // Wrong
        slots.forEach(slot => slot.classList.add('incorrect'));
        sounds.wrong();
        
        gameState.streak = 0;
        updateStats();
        
        showFeedback('💫', 'Try again!', false);

        setTimeout(() => {
            slots.forEach(slot => slot.classList.remove('incorrect'));
            // Clear the answer for retry
            gameState.answer = gameState.answer.map(() => null);
            renderAnswer();
        }, 1000);
    }

    saveState();
}

// Get random positive feedback
function getPositiveFeedback() {
    const messages = [
        'Awesome!',
        'Great job!',
        'Perfect!',
        'You got it!',
        'Amazing!',
        'Stellar!',
        'Fantastic!',
        '🚀 Blast off!',
        'Super!',
        'Brilliant!',
    ];
    return messages[Math.floor(Math.random() * messages.length)];
}

// Show feedback overlay
function showFeedback(emoji, text, success) {
    elements.feedbackEmoji.textContent = emoji;
    elements.feedbackText.textContent = text;
    elements.feedbackText.style.color = success ? 'var(--success-green)' : 'var(--gold)';
    elements.feedback.classList.remove('hidden');

    setTimeout(() => {
        elements.feedback.classList.add('hidden');
    }, 1200);

    if (success) {
        launchConfetti();
    }
}

// Show planet fact
function showPlanetFact(planet) {
    elements.planetFactEmoji.innerHTML = `<img src="${planet.image}" alt="${planet.name}">`;
    elements.planetFactTitle.textContent = `Welcome to ${planet.name}!`;
    elements.planetFactText.textContent = planet.fact;
    elements.planetFact.classList.remove('hidden');

    // Auto-hide after 4 seconds
    setTimeout(() => {
        elements.planetFact.classList.add('hidden');
    }, 4000);
}

// Advance to next planet
function advancePlanet() {
    gameState.currentPlanetIndex++;
    gameState.problemsOnPlanet = 0;

    sounds.levelUp();
    
    // Check if we've beaten the Sun (boss) - VICTORY!
    if (gameState.currentPlanetIndex >= PLANETS.length) {
        // Victory! Player beat the Sun boss
        setTimeout(showVictory, 1500);
        saveState();
        return;
    }
    
    // Animate rocket to new planet
    animateRocketToTarget(gameState.currentPlanetIndex);
    
    // Update planet tracker
    renderPlanetTracker();
    updateCurrentPlanet();
    updateProgressBar();

    // Show planet fact
    setTimeout(() => {
        const planet = PLANETS[gameState.currentPlanetIndex];
        // Special message for the Sun boss
        if (planet.difficulty === 'boss') {
            showPlanetFact({
                ...planet,
                fact: "⚠️ BOSS BATTLE! The Sun awaits with 5-digit challenges. Can you handle the heat?"
            });
        } else {
            showPlanetFact(planet);
        }
    }, 1500);
    
    setTimeout(() => {
        clearScratchpad();
        generateProblem();
    }, 3000);

    saveState();
}

// Update current planet display
function updateCurrentPlanet() {
    const planet = PLANETS[gameState.currentPlanetIndex];
    elements.currentPlanetEmoji.innerHTML = `<img src="${planet.image}" alt="${planet.name}">`;
    elements.currentPlanetName.textContent = planet.name;
}

// Update stats display
function updateStats() {
    elements.streak.textContent = `🔥 ${gameState.streak}`;
    elements.score.textContent = `⭐ ${gameState.score}`;
}

// Launch confetti
function launchConfetti() {
    const emojis = ['🌟', '✨', '⭐', '💫', '🚀'];
    for (let i = 0; i < 20; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.textContent = emojis[Math.floor(Math.random() * emojis.length)];
        confetti.style.left = `${Math.random() * 100}%`;
        confetti.style.fontSize = `${Math.random() * 20 + 15}px`;
        confetti.style.animationDelay = `${Math.random() * 0.5}s`;
        document.body.appendChild(confetti);
        setTimeout(() => confetti.remove(), 3000);
    }
}

// Show victory screen
function showVictory() {
    sounds.victory();
    
    elements.finalStats.innerHTML = `
        <p style="font-size: 4rem; margin-bottom: 20px;">☀️🏆</p>
        <p style="font-size: 1.5rem; color: var(--gold); margin-bottom: 15px;">BOSS DEFEATED!</p>
        <p>Pilot: <strong>${gameState.pilotName}</strong></p>
        <p>Final Score: ⭐ ${gameState.score}</p>
        <p style="margin-top: 20px; color: #aaa; font-size: 1rem;">You conquered the entire solar system!</p>
    `;
    elements.victoryScreen.classList.remove('hidden');
    
    // Big confetti
    for (let i = 0; i < 50; i++) {
        setTimeout(() => launchConfetti(), i * 100);
    }

    // Clear saved state
    localStorage.removeItem('spaceMathState');
}

// Start the game
function startGame() {
    gameState.pilotName = elements.pilotNameInput.value || 'Astronaut';
    sounds.init();
    sounds.rocket();
    
    elements.startScreen.classList.add('hidden');
    
    // Position rocket after screen hides
    setTimeout(() => {
        positionRocket();
        updateCurrentPlanet();
        updateStats();
        updateProgressBar();
        generateProblem();
    }, 100);
    
    saveState();
}

// Restart the game
function restartGame() {
    gameState = {
        pilotName: gameState.pilotName,
        currentPlanetIndex: 0,
        score: 0,
        streak: 0,
        problemsOnPlanet: 0,
        problemsNeededToAdvance: 3,
        currentProblem: null,
        answer: [],
        carries: [],
    };

    elements.victoryScreen.classList.add('hidden');
    renderPlanetTracker();
    positionRocket();
    updateCurrentPlanet();
    updateStats();
    updateProgressBar();
    clearScratchpad();
    generateProblem();
    
    saveState();
}

// Reset all progress (clear localStorage)
function resetProgress() {
    localStorage.removeItem('spaceMathState');
    gameState = {
        pilotName: 'Austin',
        currentPlanetIndex: 0,
        score: 0,
        streak: 0,
        problemsOnPlanet: 0,
        problemsNeededToAdvance: 3,
        currentProblem: null,
        answer: [],
        carries: [],
    };
    elements.pilotNameInput.value = gameState.pilotName;
    renderPlanetTracker();
    positionRocket();
    alert('Progress reset! Starting fresh from Pluto 🪐');
}

// Save state to localStorage
function saveState() {
    localStorage.setItem('spaceMathState', JSON.stringify(gameState));
}

// Load state from localStorage
function loadState() {
    const saved = localStorage.getItem('spaceMathState');
    if (saved) {
        try {
            const parsed = JSON.parse(saved);
            gameState = { ...gameState, ...parsed };
            elements.pilotNameInput.value = gameState.pilotName;
        } catch (e) {
            console.log('Could not load saved state');
        }
    }
}

// Initialize on load
document.addEventListener('DOMContentLoaded', init);

// Handle window resize
window.addEventListener('resize', () => {
    resizeScratchpad();
    positionRocket();
});
