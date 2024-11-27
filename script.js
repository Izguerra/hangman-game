import { auth, db, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from './firebase-config.js';

let game = null;

// Initialize game when DOM is fully loaded
window.addEventListener('load', () => {
    console.log('Window loaded, initializing game...');
    try {
        game = new HangmanGame();
        game.init();
        console.log('Game initialized successfully');
    } catch (error) {
        console.error('Failed to initialize game:', error);
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = 'position: fixed; top: 20px; left: 50%; transform: translateX(-50%); background: #ff4444; color: white; padding: 10px; border-radius: 5px; z-index: 1000;';
        errorDiv.textContent = 'Failed to initialize game. Please refresh the page.';
        document.body.appendChild(errorDiv);
    }
});

class HangmanGame {
    constructor() {
        // Initialize Firebase
        this.auth = auth;
        this.db = db;
        console.log('HangmanGame instance created');
    }

    init() {
        try {
            console.log('Initializing game...');
            // Get DOM Elements first
            this.getDOMElements();
            
            // Then set up event listeners
            this.setupEventListeners();
            
            // Then set up auth UI
            this.setupAuthUI();
            
            // Finally initialize game
            this.initializeGame();
            
            console.log('Game initialized successfully');
        } catch (error) {
            console.error('Initialization error:', error);
            // Show user-friendly error
            const errorDiv = document.createElement('div');
            errorDiv.style.cssText = 'position: fixed; top: 20px; left: 50%; transform: translateX(-50%); background: #ff4444; color: white; padding: 10px; border-radius: 5px; z-index: 1000;';
            errorDiv.textContent = 'Failed to initialize game. Please refresh the page.';
            document.body.appendChild(errorDiv);
        }
    }

    getDOMElements() {
        console.log('Getting DOM elements...');
        // Get all required DOM elements
        const elements = {
            wordDisplay: document.getElementById('word-display'),
            keyboard: document.getElementById('keyboard'),
            messageDisplay: document.getElementById('message'),
            categoryDisplay: document.getElementById('category'),
            hangmanSvg: document.getElementById('hangman'),
            gameOverModal: document.getElementById('game-over-modal'),
            gameOverTitle: document.getElementById('game-over-title'),
            gameOverMessage: document.getElementById('game-over-message'),
            playAgainBtn: document.getElementById('play-again'),
            whatsappShareBtn: document.getElementById('whatsapp-share'),
            copyResultBtn: document.getElementById('copy-result'),
            themeToggle: document.getElementById('theme-toggle'),
            newGameBtn: document.getElementById('new-game-btn')
        };

        // Log which elements were found and which weren't
        Object.entries(elements).forEach(([key, value]) => {
            if (!value) {
                console.warn(`Missing DOM element: ${key}`);
            }
        });

        // Assign elements to instance
        Object.assign(this, elements);

        // Check for required elements
        const required = ['wordDisplay', 'keyboard', 'messageDisplay', 'categoryDisplay', 'hangmanSvg'];
        const missing = required.filter(key => !elements[key]);
        
        if (missing.length > 0) {
            console.error('Missing required DOM elements:', missing);
            throw new Error(`Required DOM elements not found: ${missing.join(', ')}`);
        }
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
        
        // Start new game
        this.startNewGame();
    }

    setupEventListeners() {
        // Keyboard clicks
        if (this.keyboard) {
            this.keyboard.addEventListener('click', (e) => {
                const key = e.target.closest('.key');
                if (key) {
                    this.handleKeyClick(e);
                }
            });
        }

        // Physical keyboard input
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));

        // Theme toggle
        this.themeToggle?.addEventListener('click', () => this.toggleTheme());

        // New game button
        this.newGameBtn?.addEventListener('click', () => this.startNewGame());

        // Play again button
        this.playAgainBtn?.addEventListener('click', () => {
            if (this.gameOverModal) {
                this.gameOverModal.style.display = 'none';
            }
            this.startNewGame();
        });

        // Share buttons
        this.whatsappShareBtn?.addEventListener('click', () => this.shareOnWhatsApp());
        this.copyResultBtn?.addEventListener('click', () => this.copyResult());
    }

    setupAuthUI() {
        const elements = {
            loginForm: document.getElementById('login-form'),
            signupForm: document.getElementById('signup-form'),
            loginModal: document.getElementById('login-modal'),
            signupModal: document.getElementById('signup-modal'),
            loginLink: document.getElementById('login-link'),
            signupLink: document.getElementById('signup-link'),
            loginGuest: document.getElementById('login-guest'),
            signupGuest: document.getElementById('signup-guest'),
            guestBtnMain: document.getElementById('guest-btn-main'),
            logoutBtn: document.getElementById('logout-btn')
        };

        // Show login modal by default
        if (elements.loginModal) {
            elements.loginModal.style.display = 'flex';
        }

        // Switch between login and signup modals
        elements.loginLink?.addEventListener('click', (e) => {
            e.preventDefault();
            if (elements.signupModal) elements.signupModal.style.display = 'none';
            if (elements.loginModal) elements.loginModal.style.display = 'flex';
        });

        elements.signupLink?.addEventListener('click', (e) => {
            e.preventDefault();
            if (elements.loginModal) elements.loginModal.style.display = 'none';
            if (elements.signupModal) elements.signupModal.style.display = 'flex';
        });

        // Handle guest mode
        const handleGuestMode = () => {
            if (elements.loginModal) elements.loginModal.style.display = 'none';
            if (elements.signupModal) elements.signupModal.style.display = 'none';
            this.updateAuthUI(false);
            this.startNewGame();
        };

        // Add guest mode handlers to all guest buttons
        [elements.loginGuest, elements.signupGuest, elements.guestBtnMain].forEach(btn => {
            btn?.addEventListener('click', handleGuestMode);
        });

        // Handle login
        elements.loginForm?.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('login-email')?.value;
            const password = document.getElementById('login-password')?.value;

            if (!email || !password) {
                console.error('Email or password missing');
                return;
            }

            try {
                await signInWithEmailAndPassword(this.auth, email, password);
                if (elements.loginModal) elements.loginModal.style.display = 'none';
                this.updateAuthUI(true);
                this.startNewGame();
            } catch (error) {
                console.error('Login error:', error);
                alert(error.message);
            }
        });

        // Handle signup
        elements.signupForm?.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('signup-email')?.value;
            const password = document.getElementById('signup-password')?.value;

            if (!email || !password) {
                console.error('Email or password missing');
                return;
            }

            try {
                await createUserWithEmailAndPassword(this.auth, email, password);
                if (elements.signupModal) elements.signupModal.style.display = 'none';
                this.updateAuthUI(true);
                this.startNewGame();
            } catch (error) {
                console.error('Signup error:', error);
                alert(error.message);
            }
        });

        // Handle logout
        elements.logoutBtn?.addEventListener('click', async () => {
            try {
                await signOut(this.auth);
                this.updateAuthUI(false);
                this.startNewGame();
            } catch (error) {
                console.error('Logout error:', error);
                alert('Error signing out: ' + error.message);
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
