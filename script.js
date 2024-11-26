import { auth, db, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from './firebase-config.js';

class HangmanGame {
    constructor() {
        // Initialize Firebase
        this.auth = auth;
        this.db = db;
        
        // Wait for DOM content to be loaded
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.init());
        } else {
            this.init();
        }
    }

    init() {
        this.setupAuthUI();
        this.initializeGame();
    }

    initializeGame() {
        // Combined word list
        this.words = {
            programming: ['PYTHON', 'JAVASCRIPT', 'JAVA', 'HTML', 'CSS', 'REACT', 'ANGULAR', 'VUE', 'TYPESCRIPT', 'PHP'],
            animals: ['ELEPHANT', 'GIRAFFE', 'PENGUIN', 'KANGAROO', 'DOLPHIN', 'LION', 'TIGER', 'ZEBRA', 'MONKEY', 'PANDA'],
            countries: ['CANADA', 'JAPAN', 'BRAZIL', 'AUSTRALIA', 'FRANCE', 'GERMANY', 'ITALY', 'SPAIN', 'INDIA', 'MEXICO'],
            sports: ['SOCCER', 'BASKETBALL', 'TENNIS', 'VOLLEYBALL', 'BASEBALL', 'CRICKET', 'RUGBY', 'GOLF', 'HOCKEY', 'BOXING'],
            foodAndDrinks: ['PIZZA', 'SUSHI', 'BURGER', 'PASTA', 'TACO', 'COFFEE', 'WINE', 'BEER', 'JUICE', 'WATER']
        };

        // Initialize game state
        this.usedWords = new Set();
        this.maxTries = 6;
        this.currentWord = '';
        this.guessedLetters = new Set();
        this.triesLeft = this.maxTries;
        this.gameOver = false;
        
        // Initialize theme
        this.currentTheme = localStorage.getItem('theme') || 'light';
        document.body.classList.toggle('dark-theme', this.currentTheme === 'dark');

        // Get DOM Elements
        this.getDOMElements();
        
        // Set up event listeners
        this.setupEventListeners();
        
        // Start new game
        this.startNewGame();
    }

    getDOMElements() {
        this.wordDisplay = document.getElementById('word-display');
        this.keyboard = document.getElementById('keyboard');
        this.messageDisplay = document.getElementById('message');
        this.categoryDisplay = document.getElementById('category');
        this.hangmanSvg = document.getElementById('hangman');
        this.gameOverModal = document.getElementById('game-over-modal');
        this.gameOverTitle = document.getElementById('game-over-title');
        this.gameOverMessage = document.getElementById('game-over-message');
        this.newGameBtn = document.getElementById('new-game-btn');
        this.whatsappShareBtn = document.getElementById('whatsapp-share');
        this.copyResultBtn = document.getElementById('copy-result');
        this.themeToggle = document.querySelector('.theme-toggle');

        // Verify all required elements exist
        const requiredElements = [
            this.wordDisplay,
            this.keyboard,
            this.messageDisplay,
            this.categoryDisplay,
            this.hangmanSvg,
            this.gameOverModal,
            this.gameOverTitle,
            this.gameOverMessage,
            this.newGameBtn,
            this.themeToggle
        ];

        if (requiredElements.some(element => !element)) {
            throw new Error('Required DOM elements not found');
        }
    }

    setupEventListeners() {
        // Keyboard clicks
        this.keyboard?.addEventListener('click', (e) => {
            if (e.target.classList.contains('key')) {
                this.handleKeyClick(e);
            }
        });

        // Physical keyboard input
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));

        // Theme toggle
        const themeToggle = document.getElementById('theme-toggle');
        themeToggle?.addEventListener('click', () => this.toggleTheme());

        // Play again button
        const playAgainBtn = document.getElementById('play-again');
        playAgainBtn?.addEventListener('click', () => {
            this.gameOverModal.style.display = 'none';
            this.startNewGame();
        });

        // Share buttons
        const whatsappShare = document.getElementById('whatsapp-share');
        whatsappShare?.addEventListener('click', () => this.shareOnWhatsApp());

        const copyResult = document.getElementById('copy-result');
        copyResult?.addEventListener('click', () => this.copyResult());
    }

    setupAuthUI() {
        const loginForm = document.getElementById('login-form');
        const signupForm = document.getElementById('signup-form');
        const loginModal = document.getElementById('login-modal');
        const signupModal = document.getElementById('signup-modal');
        const loginLink = document.getElementById('login-link');
        const signupLink = document.getElementById('signup-link');
        const loginGuestBtn = document.getElementById('login-guest-btn');
        const signupGuestBtn = document.getElementById('signup-guest-btn');
        const logoutBtn = document.getElementById('logout-btn');

        // Show login modal by default
        loginModal.style.display = 'flex';

        // Switch between login and signup modals
        loginLink?.addEventListener('click', (e) => {
            e.preventDefault();
            signupModal.style.display = 'none';
            loginModal.style.display = 'flex';
        });

        signupLink?.addEventListener('click', (e) => {
            e.preventDefault();
            loginModal.style.display = 'none';
            signupModal.style.display = 'flex';
        });

        // Handle guest mode
        const handleGuestMode = () => {
            loginModal.style.display = 'none';
            signupModal.style.display = 'none';
            this.updateAuthUI(false);
        };

        loginGuestBtn?.addEventListener('click', handleGuestMode);
        signupGuestBtn?.addEventListener('click', handleGuestMode);

        // Handle login
        loginForm?.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('login-email')?.value;
            const password = document.getElementById('login-password')?.value;

            if (!email || !password) return;

            try {
                await signInWithEmailAndPassword(this.auth, email, password);
                loginModal.style.display = 'none';
                this.updateAuthUI(true);
            } catch (error) {
                alert(error.message);
            }
        });

        // Handle signup
        signupForm?.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('signup-email')?.value;
            const password = document.getElementById('signup-password')?.value;

            if (!email || !password) return;

            try {
                await createUserWithEmailAndPassword(this.auth, email, password);
                signupModal.style.display = 'none';
                this.updateAuthUI(true);
            } catch (error) {
                alert(error.message);
            }
        });

        // Handle logout
        logoutBtn?.addEventListener('click', async () => {
            try {
                await signOut(this.auth);
                this.updateAuthUI(false);
            } catch (error) {
                console.error('Error signing out:', error);
            }
        });
    }

    updateAuthUI(isLoggedIn) {
        const authButtons = document.querySelector('.auth-buttons');
        const userInfo = document.querySelector('.user-info');
        
        if (authButtons && userInfo) {
            if (isLoggedIn) {
                authButtons.style.display = 'none';
                userInfo.style.display = 'flex';
            } else {
                authButtons.style.display = 'flex';
                userInfo.style.display = 'none';
            }
        }
    }

    startNewGame() {
        // Reset game state
        this.guessedLetters.clear();
        this.triesLeft = this.maxTries;
        this.gameOver = false;
        
        // Select new word
        const categories = Object.keys(this.words);
        const randomCategory = categories[Math.floor(Math.random() * categories.length)];
        const categoryWords = this.words[randomCategory];
        
        // Filter out used words
        const availableWords = categoryWords.filter(word => !this.usedWords.has(word));
        
        // If all words in the category have been used, reset the used words
        if (availableWords.length === 0) {
            this.usedWords.clear();
            this.currentWord = categoryWords[Math.floor(Math.random() * categoryWords.length)];
        } else {
            this.currentWord = availableWords[Math.floor(Math.random() * availableWords.length)];
        }
        
        this.usedWords.add(this.currentWord);
        
        // Update UI
        this.updateWordDisplay();
        this.updateHangman();
        this.resetKeyboard();
        this.categoryDisplay.textContent = `Category: ${randomCategory.charAt(0).toUpperCase() + randomCategory.slice(1)}`;
        this.messageDisplay.textContent = '';
        this.gameOverModal.style.display = 'none';
    }

    updateWordDisplay() {
        this.wordDisplay.innerHTML = this.currentWord
            .split('')
            .map(letter => `<span class="letter">${this.guessedLetters.has(letter) ? letter : '_'}</span>`)
            .join('');
    }

    updateHangman() {
        // Hide all body parts first
        const bodyParts = this.hangmanSvg.querySelectorAll('.body-part');
        bodyParts.forEach(part => part.style.opacity = '0');
        
        // Show body parts based on remaining tries
        const partsToShow = bodyParts.length - this.triesLeft;
        for (let i = 0; i < partsToShow; i++) {
            if (bodyParts[i]) {
                bodyParts[i].style.opacity = '1';
            }
        }
    }

    resetKeyboard() {
        const keys = this.keyboard.querySelectorAll('.key');
        keys.forEach(key => {
            key.classList.remove('correct', 'wrong');
            key.disabled = false;
        });
    }

    handleKeyClick(e) {
        const key = e.target.closest('.key');
        if (key && !key.disabled && !this.gameOver) {
            const letter = key.textContent;
            this.makeGuess(letter);
        }
    }

    handleKeyPress(e) {
        if (this.gameOver) return;
        
        const letter = e.key.toUpperCase();
        if (/^[A-Z]$/.test(letter) && !this.guessedLetters.has(letter)) {
            const key = this.keyboard.querySelector(`[data-key="${letter}"]`);
            if (key && !key.disabled) {
                this.makeGuess(letter);
            }
        }
    }

    makeGuess(letter) {
        if (this.guessedLetters.has(letter) || this.gameOver) return;
        
        this.guessedLetters.add(letter);
        const key = this.keyboard.querySelector(`[data-key="${letter}"]`);
        
        if (this.currentWord.includes(letter)) {
            // Correct guess
            key?.classList.add('correct');
            this.updateWordDisplay();
            
            // Check for win
            if (this.currentWord.split('').every(l => this.guessedLetters.has(l))) {
                this.endGame(true);
            }
        } else {
            // Wrong guess
            key?.classList.add('wrong');
            this.triesLeft--;
            this.updateHangman();
            
            // Check for loss
            if (this.triesLeft === 0) {
                this.endGame(false);
            }
        }
        
        key.disabled = true;
    }

    endGame(won) {
        this.gameOver = true;
        this.gameOverTitle.textContent = won ? 'Congratulations!' : 'Game Over';
        this.gameOverMessage.textContent = won ? 
            `You won! The word was ${this.currentWord}` : 
            `You lost. The word was ${this.currentWord}`;
        this.gameOverModal.style.display = 'flex';
    }

    shareOnWhatsApp() {
        const result = `Hangman Game Result\n${this.gameOverTitle.textContent}\n${this.gameOverMessage.textContent}`;
        const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(result)}`;
        window.open(url, '_blank');
    }

    copyResult() {
        const result = `Hangman Game Result\n${this.gameOverTitle.textContent}\n${this.gameOverMessage.textContent}`;
        navigator.clipboard.writeText(result)
            .then(() => alert('Result copied to clipboard!'))
            .catch(console.error);
    }

    toggleTheme() {
        this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        document.body.classList.toggle('dark-theme');
        localStorage.setItem('theme', this.currentTheme);
        
        // Update theme toggle icon
        const sunIcon = this.themeToggle.querySelector('.sun-icon');
        const moonIcon = this.themeToggle.querySelector('.moon-icon');
        if (sunIcon && moonIcon) {
            sunIcon.style.display = this.currentTheme === 'light' ? 'none' : 'block';
            moonIcon.style.display = this.currentTheme === 'light' ? 'block' : 'none';
        }
    }
}

// Initialize game on page load
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM Content Loaded');
    new HangmanGame();
});
