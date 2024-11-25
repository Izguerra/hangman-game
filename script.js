import { auth, db } from './firebase-config.js';

// Game state
let currentWord = '';
let guessedLetters = new Set();
let remainingTries = 6;
let gameActive = false;
let currentUser = null;

// DOM Elements
const wordElement = document.getElementById('word');
const messageElement = document.getElementById('message');
const triesElement = document.getElementById('tries');
const keyboardElement = document.getElementById('keyboard');
const newGameButton = document.getElementById('new-game');
const loginButton = document.getElementById('login-btn');
const logoutButton = document.getElementById('logout-btn');
const loginModal = document.getElementById('login-modal');
const signupModal = document.getElementById('signup-modal');
const gameOverModal = document.getElementById('game-over-modal');
const userDisplay = document.getElementById('user-display');
const themeToggle = document.querySelector('.theme-toggle');

// Words for the game - Various categories
const words = [
    // Animals
    'ELEPHANT', 'GIRAFFE', 'PENGUIN', 'DOLPHIN', 'KANGAROO',
    'OCTOPUS', 'BUTTERFLY', 'CHEETAH', 'ZEBRA', 'KOALA',
    
    // Countries
    'FRANCE', 'BRAZIL', 'JAPAN', 'EGYPT', 'CANADA',
    'ITALY', 'SPAIN', 'INDIA', 'MEXICO', 'AUSTRALIA',
    
    // Foods
    'PIZZA', 'SUSHI', 'BURGER', 'PASTA', 'TACO',
    'CHOCOLATE', 'BANANA', 'MANGO', 'COOKIE', 'SANDWICH',
    
    // Sports
    'SOCCER', 'TENNIS', 'BASEBALL', 'SWIMMING', 'BASKETBALL',
    'VOLLEYBALL', 'HOCKEY', 'BOXING', 'RUGBY', 'GOLF',
    
    // Colors
    'PURPLE', 'ORANGE', 'YELLOW', 'GREEN', 'BLUE',
    'SILVER', 'GOLDEN', 'BROWN', 'BLACK', 'WHITE',
    
    // Nature
    'MOUNTAIN', 'OCEAN', 'FOREST', 'RIVER', 'BEACH',
    'ISLAND', 'DESERT', 'VOLCANO', 'GLACIER', 'RAINBOW',
    
    // Fruits
    'APPLE', 'ORANGE', 'GRAPE', 'LEMON', 'CHERRY',
    'PEACH', 'MELON', 'KIWI', 'PLUM', 'PEAR',
    
    // Household
    'WINDOW', 'KITCHEN', 'GARDEN', 'BEDROOM', 'DOOR',
    'TABLE', 'CHAIR', 'MIRROR', 'PILLOW', 'BLANKET',
    
    // Weather
    'SUNNY', 'RAINY', 'CLOUDY', 'STORMY', 'WINDY',
    'THUNDER', 'SNOWY', 'FOGGY', 'BREEZY', 'HAIL',
    
    // Music
    'PIANO', 'GUITAR', 'VIOLIN', 'DRUMS', 'FLUTE',
    'TRUMPET', 'HARP', 'SAXOPHONE', 'CLARINET', 'BASS'
];

// Theme handling
function initializeTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.body.setAttribute('data-theme', savedTheme);
    updateThemeIcons(savedTheme);
}

function toggleTheme() {
    const currentTheme = document.body.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    document.body.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcons(newTheme);
}

function updateThemeIcons(theme) {
    const sunIcon = document.querySelector('.sun-icon');
    const moonIcon = document.querySelector('.moon-icon');
    if (theme === 'dark') {
        sunIcon.style.display = 'block';
        moonIcon.style.display = 'none';
    } else {
        sunIcon.style.display = 'none';
        moonIcon.style.display = 'block';
    }
}

// Authentication handling
function setupAuthListeners() {
    auth.onAuthStateChanged(user => {
        currentUser = user;
        updateUIForAuth(user);
    });

    // Login form submission
    document.getElementById('login-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        
        try {
            await auth.signInWithEmailAndPassword(email, password);
            loginModal.style.display = 'none';
        } catch (error) {
            alert('Login failed: ' + error.message);
        }
    });

    // Signup form submission
    document.getElementById('signup-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('signup-email').value;
        const password = document.getElementById('signup-password').value;
        
        try {
            await auth.createUserWithEmailAndPassword(email, password);
            signupModal.style.display = 'none';
        } catch (error) {
            alert('Signup failed: ' + error.message);
        }
    });

    // Logout handling
    logoutButton.addEventListener('click', () => {
        auth.signOut();
    });
}

function updateUIForAuth(user) {
    if (user) {
        loginButton.style.display = 'none';
        logoutButton.style.display = 'inline-block';
        userDisplay.textContent = user.email;
        loadGameHistory();
    } else {
        loginButton.style.display = 'inline-block';
        logoutButton.style.display = 'none';
        userDisplay.textContent = '';
    }
}

// Game logic
function initializeGame() {
    currentWord = words[Math.floor(Math.random() * words.length)];
    guessedLetters.clear();
    remainingTries = 6;
    gameActive = true;
    
    // Reset hangman display
    const parts = ['head', 'body', 'left-arm', 'right-arm', 'left-leg', 'right-leg'];
    parts.forEach(part => {
        const element = document.getElementById(part);
        if (element) {
            element.classList.remove('show');
        }
    });
    
    // Reset message
    if (messageElement) {
        messageElement.textContent = '';
    }
    
    updateDisplay();
    createKeyboard();
}

function createKeyboard() {
    keyboardElement.innerHTML = '';
    
    // QWERTY layout
    const rows = [
        ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
        ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
        ['Z', 'X', 'C', 'V', 'B', 'N', 'M']
    ];

    rows.forEach((row, index) => {
        const rowDiv = document.createElement('div');
        rowDiv.className = 'keyboard-row';
        
        // Add spacing elements for centering if needed
        if (index === 1) { // A-L row
            // Add half-width spacer at start and end
            const spacerStart = document.createElement('div');
            spacerStart.style.width = '22px'; // Half key width
            rowDiv.appendChild(spacerStart);
        } else if (index === 2) { // Z-M row
            // Add full-width spacer at start and end
            const spacerStart = document.createElement('div');
            spacerStart.style.width = '44px'; // Full key width
            rowDiv.appendChild(spacerStart);
        }

        row.forEach(letter => {
            const button = document.createElement('button');
            button.textContent = letter;
            button.className = 'keyboard-key';
            button.addEventListener('click', () => handleGuess(letter));
            rowDiv.appendChild(button);
        });

        // Add end spacer if needed
        if (index === 1) { // A-L row
            const spacerEnd = document.createElement('div');
            spacerEnd.style.width = '22px'; // Half key width
            rowDiv.appendChild(spacerEnd);
        } else if (index === 2) { // Z-M row
            const spacerEnd = document.createElement('div');
            spacerEnd.style.width = '44px'; // Full key width
            rowDiv.appendChild(spacerEnd);
        }

        keyboardElement.appendChild(rowDiv);
    });
}

function handleGuess(letter) {
    if (!gameActive || guessedLetters.has(letter)) return;

    guessedLetters.add(letter);
    if (!currentWord.includes(letter)) {
        remainingTries--;
        updateHangman();
    }

    updateDisplay();
    checkGameEnd();
}

function updateDisplay() {
    // Update word display
    wordElement.textContent = currentWord
        .split('')
        .map(letter => guessedLetters.has(letter) ? letter : '_')
        .join(' ');

    // Update tries display
    triesElement.textContent = `Remaining tries: ${remainingTries}`;

    // Update keyboard
    Array.from(keyboardElement.children).forEach(row => {
        Array.from(row.children).forEach(button => {
            if (guessedLetters.has(button.textContent)) {
                button.disabled = true;
                button.classList.add('guessed');
                if (currentWord.includes(button.textContent)) {
                    button.classList.add('correct');
                }
            }
        });
    });
}

function updateHangman() {
    const parts = ['head', 'body', 'left-arm', 'right-arm', 'left-leg', 'right-leg'];
    const partsToShow = 6 - remainingTries;
    
    parts.forEach((part, index) => {
        const element = document.getElementById(part);
        if (element) {
            element.classList.toggle('show', index < partsToShow);
        }
    });
}

function checkGameEnd() {
    const won = currentWord.split('').every(letter => guessedLetters.has(letter));
    const lost = remainingTries === 0;

    if (won || lost) {
        gameActive = false;
        showGameOver(won);
        if (currentUser) {
            saveGameResult(won);
        }
    }
}

function showGameOver(won) {
    const title = document.getElementById('game-over-title');
    const message = document.getElementById('game-over-message');
    
    if (title && message) {
        title.textContent = won ? 'Congratulations!' : 'Game Over';
        message.textContent = won ? 
            `You won! The word was: ${currentWord}` : 
            `You lost. The word was: ${currentWord}`;
        
        gameOverModal.style.display = 'block';
    }
}

// Game history
async function saveGameResult(won) {
    try {
        await db.collection('games').add({
            userId: currentUser.uid,
            word: currentWord,
            won: won,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        });
        loadGameHistory();
    } catch (error) {
        console.error('Error saving game result:', error);
    }
}

async function loadGameHistory() {
    if (!currentUser) return;

    try {
        const snapshot = await db.collection('games')
            .where('userId', '==', currentUser.uid)
            .orderBy('timestamp', 'desc')
            .limit(10)
            .get();

        const historyList = document.getElementById('history-list');
        historyList.innerHTML = '';

        snapshot.forEach(doc => {
            const game = doc.data();
            const div = document.createElement('div');
            div.className = 'history-item';
            div.textContent = `${game.word} - ${game.won ? 'Won' : 'Lost'}`;
            historyList.appendChild(div);
        });
    } catch (error) {
        console.error('Error loading game history:', error);
    }
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    initializeTheme();
    setupAuthListeners();
    
    // Theme toggle
    themeToggle.addEventListener('click', toggleTheme);

    // New game button
    newGameButton.addEventListener('click', () => {
        initializeGame();
        if (gameOverModal) {
            gameOverModal.style.display = 'none';
        }
    });

    // Modal handling
    loginButton.addEventListener('click', () => {
        loginModal.style.display = 'flex';
    });

    // Switch between login and signup
    document.getElementById('show-signup').addEventListener('click', () => {
        loginModal.style.display = 'none';
        signupModal.style.display = 'flex';
    });

    document.getElementById('show-login').addEventListener('click', () => {
        signupModal.style.display = 'none';
        loginModal.style.display = 'flex';
    });

    // Play as guest buttons
    document.querySelectorAll('.play-guest-btn').forEach(button => {
        button.addEventListener('click', () => {
            loginModal.style.display = 'none';
            signupModal.style.display = 'none';
        });
    });

    // Close modal buttons
    document.querySelectorAll('.modal-close').forEach(button => {
        button.addEventListener('click', (e) => {
            const modal = e.target.closest('.modal');
            if (modal) {
                modal.style.display = 'none';
            }
        });
    });

    // Close modals when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            e.target.style.display = 'none';
        }
    });

    // Share buttons
    document.getElementById('share-whatsapp').addEventListener('click', () => {
        const text = `I played Hangman! ${currentWord} - ${gameActive ? 'Still playing' : (remainingTries > 0 ? 'Won!' : 'Lost')}`;
        window.open(`https://wa.me/?text=${encodeURIComponent(text)}`);
    });

    document.getElementById('share-clipboard').addEventListener('click', () => {
        const text = `I played Hangman! ${currentWord} - ${gameActive ? 'Still playing' : (remainingTries > 0 ? 'Won!' : 'Lost')}`;
        navigator.clipboard.writeText(text).then(() => {
            alert('Result copied to clipboard!');
        });
    });

    // Initialize the first game
    initializeGame();
});
