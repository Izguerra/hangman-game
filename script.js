import { auth, db, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from './firebase-config.js';

class HangmanGame {
    constructor() {
        // Wait for DOM to be ready before initializing
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.init());
        } else {
            this.init();
        }
    }

    init() {
        try {
            console.log('Initializing game...');
            this.initializeGameState();
            this.getDOMElements();
            this.setupEventListeners();
            this.setupAuthUI();
            this.startNewGame();
        } catch (error) {
            console.error('Initialization error:', error);
            this.showError('Failed to initialize game. Please refresh the page.');
        }
    }

    initializeGameState() {
        // Initialize game state
        this.words = {
            programming: ['PYTHON', 'JAVASCRIPT', 'JAVA', 'HTML', 'CSS', 'REACT', 'ANGULAR', 'VUE', 'TYPESCRIPT', 'PHP'],
            animals: ['ELEPHANT', 'GIRAFFE', 'PENGUIN', 'KANGAROO', 'DOLPHIN', 'LION', 'TIGER', 'ZEBRA', 'MONKEY', 'PANDA'],
            countries: ['CANADA', 'JAPAN', 'BRAZIL', 'AUSTRALIA', 'FRANCE', 'GERMANY', 'ITALY', 'SPAIN', 'INDIA', 'MEXICO'],
            sports: ['SOCCER', 'BASKETBALL', 'TENNIS', 'VOLLEYBALL', 'BASEBALL', 'CRICKET', 'RUGBY', 'GOLF', 'HOCKEY', 'BOXING'],
            foodAndDrinks: ['PIZZA', 'SUSHI', 'BURGER', 'PASTA', 'TACO', 'COFFEE', 'WINE', 'BEER', 'JUICE', 'WATER']
        };
        
        this.usedWords = new Set();
        this.maxTries = 6;
        this.currentWord = '';
        this.guessedLetters = new Set();
        this.triesLeft = this.maxTries;
        this.gameOver = false;
        
        // Initialize theme
        this.currentTheme = localStorage.getItem('theme') || 'light';
        document.body.classList.toggle('dark-theme', this.currentTheme === 'dark');
    }

    getDOMElements() {
        // Get all required DOM elements
        this.elements = {
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
            newGameBtn: document.getElementById('new-game-btn'),
            loginForm: document.getElementById('login-form'),
            signupForm: document.getElementById('signup-form'),
            loginModal: document.getElementById('login-modal'),
            signupModal: document.getElementById('signup-modal'),
            loginLink: document.getElementById('login-link'),
            signupLink: document.getElementById('signup-link'),
            loginGuest: document.getElementById('login-guest-btn'),
            signupGuest: document.getElementById('signup-guest-btn'),
            guestBtnMain: document.getElementById('guest-btn-main'),
            logoutBtn: document.getElementById('logout-btn'),
            userEmail: document.getElementById('user-email')
        };

        // Verify required elements exist
        const required = ['wordDisplay', 'keyboard', 'messageDisplay', 'categoryDisplay', 'hangmanSvg'];
        const missing = required.filter(key => !this.elements[key]);
        
        if (missing.length > 0) {
            throw new Error(`Required DOM elements not found: ${missing.join(', ')}`);
        }
    }

    setupEventListeners() {
        // Keyboard clicks
        this.elements.keyboard?.addEventListener('click', (e) => {
            const key = e.target.closest('.key');
            if (key && !this.gameOver) {
                this.handleGuess(key.dataset.key);
            }
        });

        // Physical keyboard input
        document.addEventListener('keydown', (e) => {
            if (!this.gameOver && /^[a-zA-Z]$/.test(e.key)) {
                this.handleGuess(e.key.toUpperCase());
            }
        });

        // Theme toggle
        this.elements.themeToggle?.addEventListener('click', () => this.toggleTheme());

        // New game button
        this.elements.newGameBtn?.addEventListener('click', () => this.startNewGame());

        // Play again button
        this.elements.playAgainBtn?.addEventListener('click', () => {
            if (this.elements.gameOverModal) {
                this.elements.gameOverModal.style.display = 'none';
            }
            this.startNewGame();
        });

        // Share buttons
        this.elements.whatsappShareBtn?.addEventListener('click', () => this.shareOnWhatsApp());
        this.elements.copyResultBtn?.addEventListener('click', () => this.copyResult());
    }

    handleGuess(letter) {
        if (!letter || this.gameOver || this.guessedLetters.has(letter)) {
            return;
        }

        this.guessedLetters.add(letter);
        const key = this.elements.keyboard?.querySelector(`[data-key="${letter}"]`);
        
        if (this.currentWord.includes(letter)) {
            key?.classList.add('correct');
            this.updateWordDisplay();
            if (this.checkWin()) {
                this.endGame(true);
            }
        } else {
            key?.classList.add('wrong');
            this.triesLeft--;
            this.updateHangman();
            if (this.triesLeft === 0) {
                this.endGame(false);
            }
        }
    }

    showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = 'position: fixed; top: 20px; left: 50%; transform: translateX(-50%); background: #ff4444; color: white; padding: 10px; border-radius: 5px; z-index: 1000;';
        errorDiv.textContent = message;
        document.body.appendChild(errorDiv);
        setTimeout(() => errorDiv.remove(), 5000);
    }

    setupAuthUI() {
        const elements = {
            loginForm: this.elements.loginForm,
            signupForm: this.elements.signupForm,
            loginModal: this.elements.loginModal,
            signupModal: this.elements.signupModal,
            loginLink: this.elements.loginLink,
            signupLink: this.elements.signupLink,
            loginGuest: this.elements.loginGuest,
            signupGuest: this.elements.signupGuest,
            guestBtnMain: this.elements.guestBtnMain,
            logoutBtn: this.elements.logoutBtn,
            userEmail: this.elements.userEmail
        };

        // Show login modal by default for non-authenticated users
        if (!auth.currentUser && elements.loginModal) {
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
            if (btn) {
                console.log('Adding guest mode handler to button:', btn.id);
                btn.addEventListener('click', handleGuestMode);
            } else {
                console.warn('Guest button not found');
            }
        });

        // Handle login
        elements.loginForm?.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('login-email')?.value;
            const password = document.getElementById('login-password')?.value;

            if (!email || !password) {
                this.showError('Email and password are required');
                return;
            }

            try {
                await signInWithEmailAndPassword(auth, email, password);
                if (elements.loginModal) elements.loginModal.style.display = 'none';
                this.updateAuthUI(true, email);
                this.startNewGame();
            } catch (error) {
                console.error('Login error:', error);
                this.showError(error.message);
            }
        });

        // Handle signup
        elements.signupForm?.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('signup-email')?.value;
            const password = document.getElementById('signup-password')?.value;

            if (!email || !password) {
                this.showError('Email and password are required');
                return;
            }

            try {
                await createUserWithEmailAndPassword(auth, email, password);
                if (elements.signupModal) elements.signupModal.style.display = 'none';
                this.updateAuthUI(true, email);
                this.startNewGame();
            } catch (error) {
                console.error('Signup error:', error);
                this.showError(error.message);
            }
        });

        // Handle logout
        elements.logoutBtn?.addEventListener('click', async () => {
            try {
                await signOut(auth);
                this.updateAuthUI(false);
                if (elements.loginModal) elements.loginModal.style.display = 'flex';
            } catch (error) {
                console.error('Logout error:', error);
                this.showError('Error signing out: ' + error.message);
            }
        });

        // Update UI based on initial auth state
        auth.onAuthStateChanged((user) => {
            this.updateAuthUI(!!user, user?.email);
        });
    }

    updateAuthUI(isLoggedIn, email = '') {
        const authButtons = document.querySelector('.auth-buttons');
        const userInfo = document.querySelector('.user-info');
        const userEmail = this.elements.userEmail;
        
        if (authButtons && userInfo) {
            if (isLoggedIn) {
                authButtons.style.display = 'none';
                userInfo.style.display = 'flex';
                if (userEmail) userEmail.textContent = email;
            } else {
                authButtons.style.display = 'flex';
                userInfo.style.display = 'none';
                if (userEmail) userEmail.textContent = '';
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
        this.elements.categoryDisplay.textContent = `Category: ${randomCategory.charAt(0).toUpperCase() + randomCategory.slice(1)}`;
        this.elements.messageDisplay.textContent = '';
        this.elements.gameOverModal.style.display = 'none';
    }

    updateWordDisplay() {
        this.elements.wordDisplay.innerHTML = this.currentWord
            .split('')
            .map(letter => `<span class="letter">${this.guessedLetters.has(letter) ? letter : '_'}</span>`)
            .join('');
    }

    updateHangman() {
        // Hide all body parts first
        const bodyParts = this.elements.hangmanSvg.querySelectorAll('.body-part');
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
        const keys = this.elements.keyboard.querySelectorAll('.key');
        keys.forEach(key => {
            key.classList.remove('correct', 'wrong');
            key.disabled = false;
        });
    }

    checkWin() {
        return this.currentWord.split('').every(letter => this.guessedLetters.has(letter));
    }

    endGame(won) {
        this.gameOver = true;
        this.elements.gameOverTitle.textContent = won ? 'Congratulations!' : 'Game Over';
        this.elements.gameOverMessage.textContent = won ? 
            `You won! The word was ${this.currentWord}` : 
            `You lost. The word was ${this.currentWord}`;
        this.elements.gameOverModal.style.display = 'flex';
    }

    shareOnWhatsApp() {
        const result = `Hangman Game Result\n${this.elements.gameOverTitle.textContent}\n${this.elements.gameOverMessage.textContent}`;
        const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(result)}`;
        window.open(url, '_blank');
    }

    copyResult() {
        const result = `Hangman Game Result\n${this.elements.gameOverTitle.textContent}\n${this.elements.gameOverMessage.textContent}`;
        navigator.clipboard.writeText(result)
            .then(() => alert('Result copied to clipboard!'))
            .catch(console.error);
    }

    toggleTheme() {
        this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        document.body.classList.toggle('dark-theme');
        localStorage.setItem('theme', this.currentTheme);
        
        // Update theme toggle icon
        const sunIcon = this.elements.themeToggle?.querySelector('.sun-icon');
        const moonIcon = this.elements.themeToggle?.querySelector('.moon-icon');
        if (sunIcon && moonIcon) {
            sunIcon.style.display = this.currentTheme === 'light' ? 'none' : 'block';
            moonIcon.style.display = this.currentTheme === 'light' ? 'block' : 'none';
        }
    }
}

// Initialize game
const game = new HangmanGame();
