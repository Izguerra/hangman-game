class HangmanGame {
    constructor() {
        this.words = {
            programming: ['PYTHON', 'JAVASCRIPT', 'JAVA', 'HTML', 'CSS', 'REACT', 'ANGULAR', 'VUE', 'TYPESCRIPT', 'PHP'],
            animals: ['ELEPHANT', 'GIRAFFE', 'PENGUIN', 'KANGAROO', 'DOLPHIN', 'LION', 'TIGER', 'ZEBRA', 'MONKEY', 'PANDA'],
            countries: ['CANADA', 'JAPAN', 'BRAZIL', 'AUSTRALIA', 'FRANCE', 'GERMANY', 'ITALY', 'SPAIN', 'INDIA', 'MEXICO'],
            sports: ['SOCCER', 'BASKETBALL', 'TENNIS', 'VOLLEYBALL', 'BASEBALL', 'CRICKET', 'RUGBY', 'GOLF', 'HOCKEY', 'BOXING'],
            foodAndDrinks: ['PIZZA', 'SUSHI', 'BURGER', 'PASTA', 'TACO', 'COFFEE', 'WINE', 'BEER', 'JUICE', 'WATER']
        };
        this.maxTries = 6;
        this.currentWord = '';
        this.guessedLetters = new Set();
        this.triesLeft = this.maxTries;
        this.usedWords = new Set();
        this.gameOver = false;

        // Initialize theme
        this.currentTheme = localStorage.getItem('theme') || 'light';
        document.documentElement.setAttribute('data-theme', this.currentTheme);

        // Auth related elements
        this.loginBtn = document.getElementById('login-btn');
        this.signupBtn = document.getElementById('signup-btn');
        this.logoutBtn = document.getElementById('logout-btn');
        this.loginModal = document.getElementById('login-modal');
        this.signupModal = document.getElementById('signup-modal');
        this.loginForm = document.getElementById('login-form');
        this.signupForm = document.getElementById('signup-form');
        this.userDisplay = document.getElementById('user-display');
        this.playGuestButtons = document.querySelectorAll('.play-guest-btn');
        
        // Setup menu elements
        this.menuToggle = document.getElementById('menu-toggle');
        this.closeMenu = document.getElementById('close-menu');
        this.sidebarMenu = document.getElementById('sidebar-menu');
        this.historyList = document.getElementById('history-list');
        
        // Initialize Firebase Auth
        this.auth = firebase.auth();
        this.currentUser = null;
        
        // Initialize game and setup listeners
        this.setupEventListeners();
        this.setupAuthListeners();
        this.createKeyboard();
        this.startNewGame();
    }

    initializeGame() {
        this.setupEventListeners();
        this.createKeyboard();
        this.startNewGame();
    }

    setupEventListeners() {
        // Theme toggle
        const themeToggle = document.getElementById('theme-toggle');
        themeToggle.addEventListener('click', () => this.toggleTheme());

        // New game button
        const newGameBtn = document.getElementById('new-game');
        newGameBtn.addEventListener('click', () => this.startNewGame());

        // Play again button
        const playAgainBtn = document.getElementById('play-again');
        playAgainBtn.addEventListener('click', () => this.startNewGame());

        // Physical keyboard support
        document.addEventListener('keydown', (e) => {
            if (this.gameOver) return;
            const key = e.key.toUpperCase();
            if (/^[A-Z]$/.test(key)) {
                this.handleGuess(key);
            }
        });

        // Share buttons
        document.getElementById('share-whatsapp').addEventListener('click', () => this.shareToWhatsApp());
        document.getElementById('share-text').addEventListener('click', () => this.shareToMessages());

        // Add menu toggle listeners
        this.menuToggle.addEventListener('click', () => this.toggleMenu());
        this.closeMenu.addEventListener('click', () => this.toggleMenu());
        
        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (this.sidebarMenu.classList.contains('open') &&
                !this.sidebarMenu.contains(e.target) &&
                !this.menuToggle.contains(e.target)) {
                this.toggleMenu();
            }
        });
    }

    toggleTheme() {
        this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', this.currentTheme);
        localStorage.setItem('theme', this.currentTheme);
    }

    createKeyboard() {
        const keyboardEl = document.getElementById('keyboard');
        keyboardEl.innerHTML = ''; // Clear existing keyboard
        
        const keyboard = [
            ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
            ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
            ['Z', 'X', 'C', 'V', 'B', 'N', 'M']
        ];
        
        keyboard.forEach((row, i) => {
            const keyboardRow = document.createElement('div');
            keyboardRow.classList.add('keyboard-row');
            
            // Add left padding for ASDFGHJKL row
            if (i === 1) {
                const leftPad = document.createElement('div');
                leftPad.classList.add('key-pad');
                leftPad.style.width = '20px';
                keyboardRow.appendChild(leftPad);
            }
            
            // Add left padding for ZXCVBNM row
            if (i === 2) {
                const leftPad = document.createElement('div');
                leftPad.classList.add('key-pad');
                leftPad.style.width = '60px';
                keyboardRow.appendChild(leftPad);
            }
            
            row.forEach(letter => {
                const button = document.createElement('button');
                button.classList.add('key');
                button.textContent = letter;
                button.dataset.letter = letter;
                button.addEventListener('click', () => this.handleGuess(letter));
                keyboardRow.appendChild(button);
            });
            
            // Add right padding for ASDFGHJKL row
            if (i === 1) {
                const rightPad = document.createElement('div');
                rightPad.classList.add('key-pad');
                rightPad.style.width = '20px';
                keyboardRow.appendChild(rightPad);
            }
            
            // Add right padding for ZXCVBNM row
            if (i === 2) {
                const rightPad = document.createElement('div');
                rightPad.classList.add('key-pad');
                rightPad.style.width = '60px';
                keyboardRow.appendChild(rightPad);
            }
            
            keyboardEl.appendChild(keyboardRow);
        });
    }

    startNewGame() {
        // Reset game state
        this.guessedLetters.clear();
        this.triesLeft = this.maxTries;
        this.gameOver = false;
        
        // Reset hangman drawing
        const hangmanParts = document.querySelectorAll('.hangman-part:not(.show)');
        hangmanParts.forEach(part => part.classList.remove('show'));

        // Get new word
        this.currentWord = this.getRandomWord();
        
        // Reset UI
        this.resetKeyboard();
        this.updateWordDisplay();
        this.updateMessage('');
        this.updateTriesDisplay();
        this.hideModal();
    }

    getRandomWord() {
        // Get all available words
        const allWords = Object.values(this.words).flat();
        const unusedWords = allWords.filter(word => !this.usedWords.has(word));
        
        // If all words have been used, reset the used words
        if (unusedWords.length === 0) {
            this.usedWords.clear();
            return this.getRandomWord();
        }
        
        // Select a random unused word
        const randomIndex = Math.floor(Math.random() * unusedWords.length);
        const word = unusedWords[randomIndex];
        this.usedWords.add(word);
        
        // Save used words to localStorage
        localStorage.setItem('usedWords', JSON.stringify([...this.usedWords]));
        
        return word;
    }

    handleGuess(letter) {
        if (this.guessedLetters.has(letter)) return;
        
        this.guessedLetters.add(letter);
        
        if (!this.currentWord.includes(letter)) {
            this.triesLeft--;
            this.updateTriesDisplay();
            this.showNextHangmanPart();
            this.updateKeyboard(letter, 'absent');
            
            if (this.triesLeft === 0) {
                this.gameOver = true;
                this.showModal(false);
                return;
            }
        } else {
            this.updateKeyboard(letter, 'correct');
        }

        this.updateWordDisplay();
        
        if (this.hasWon()) {
            this.gameOver = true;
            this.showModal(true);
        }
    }

    showNextHangmanPart() {
        const parts = document.querySelectorAll('.hangman-part:not(.show)');
        if (parts.length > 0) {
            parts[0].classList.add('show');
        }
    }

    updateKeyboard(letter, status) {
        const key = document.querySelector(`.key[data-letter="${letter}"]`);
        if (key) {
            key.classList.add(status);
            key.disabled = true;
        }
    }

    resetKeyboard() {
        const keys = document.querySelectorAll('.key');
        keys.forEach(key => {
            key.className = 'key';
            key.disabled = false;
        });
    }

    updateWordDisplay() {
        const wordContainer = document.getElementById('word');
        wordContainer.innerHTML = '';
        
        this.currentWord.split('').forEach(letter => {
            const letterElement = document.createElement('div');
            letterElement.className = 'letter';
            letterElement.textContent = this.guessedLetters.has(letter) ? letter : '';
            wordContainer.appendChild(letterElement);
        });
    }

    updateMessage(message) {
        document.getElementById('message').textContent = message;
    }

    updateTriesDisplay() {
        document.getElementById('tries').textContent = `Remaining attempts: ${this.triesLeft}`;
    }

    hasWon() {
        return this.currentWord.split('').every(letter => this.guessedLetters.has(letter));
    }

    showModal(won) {
        const modal = document.getElementById('game-over-modal');
        const title = document.getElementById('game-over-title');
        const message = document.getElementById('game-over-message');
        const wordReveal = document.getElementById('word-reveal');

        title.textContent = won ? 'Congratulations!' : 'Game Over';
        message.textContent = won ? 'You won!' : 'You lost!';
        wordReveal.textContent = `The word was: ${this.currentWord}`;

        modal.classList.add('show');
        this.updateSharePreview(won);
        
        // Save game to history
        if (this.currentUser) {
            this.saveGameToHistory(this.currentWord, won);
        }
    }

    hideModal() {
        const modal = document.getElementById('game-over-modal');
        modal.classList.remove('show');
    }

    updateSharePreview(won) {
        const sharePreview = document.querySelector('.share-preview');
        sharePreview.textContent = this.generateShareText(won);
    }

    generateShareText(won) {
        const emoji = won ? '🎉' : '😢';
        return `Hangman ${emoji}\nWord: ${this.currentWord}\nRemaining attempts: ${this.triesLeft}`;
    }

    shareToWhatsApp() {
        const text = encodeURIComponent(this.generateShareText(this.hasWon()));
        window.open(`whatsapp://send?text=${text}`);
    }

    shareToMessages() {
        const text = this.generateShareText(this.hasWon());
        if (navigator.share) {
            navigator.share({
                text: text
            }).catch(console.error);
        } else {
            navigator.clipboard.writeText(text).then(() => {
                alert('Result copied to clipboard!');
            }).catch(console.error);
        }
    }

    setupAuthListeners() {
        // Auth state changes
        this.auth.onAuthStateChanged((user) => {
            this.currentUser = user;
            this.updateUIForAuth();
            if (user) {
                this.loadGameHistory();
            } else {
                this.clearGameHistory();
            }
        });

        // Login button
        this.loginBtn.addEventListener('click', () => {
            this.loginModal.style.display = 'block';
        });

        // Signup button
        this.signupBtn.addEventListener('click', () => {
            this.signupModal.style.display = 'block';
        });

        // Logout button
        this.logoutBtn.addEventListener('click', async () => {
            try {
                await this.auth.signOut();
                this.currentUser = null;
                this.updateUIForAuth();
            } catch (error) {
                console.error('Error signing out:', error);
            }
        });

        // Login form submission
        this.loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;

            try {
                await this.auth.signInWithEmailAndPassword(email, password);
                this.loginModal.style.display = 'none';
                this.loginForm.reset();
            } catch (error) {
                console.error('Error logging in:', error);
                alert('Login failed: ' + error.message);
            }
        });

        // Signup form submission
        this.signupForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('signup-email').value;
            const password = document.getElementById('signup-password').value;

            try {
                await this.auth.createUserWithEmailAndPassword(email, password);
                this.signupModal.style.display = 'none';
                this.signupForm.reset();
            } catch (error) {
                console.error('Error signing up:', error);
                alert('Signup failed: ' + error.message);
            }
        });

        // Close buttons for modals
        const closeButtons = document.querySelectorAll('.modal-close');
        closeButtons.forEach(button => {
            button.addEventListener('click', () => {
                this.loginModal.style.display = 'none';
                this.signupModal.style.display = 'none';
            });
        });

        // Play as guest buttons
        this.playGuestButtons.forEach(button => {
            button.addEventListener('click', () => {
                this.loginModal.style.display = 'none';
                this.signupModal.style.display = 'none';
                this.currentUser = null;
                this.updateUIForAuth();
            });
        });

        // Close modals when clicking outside
        window.addEventListener('click', (e) => {
            if (e.target === this.loginModal) {
                this.loginModal.style.display = 'none';
            }
            if (e.target === this.signupModal) {
                this.signupModal.style.display = 'none';
            }
        });
    }

    async saveGameToHistory(word, won) {
        if (!this.currentUser) return;

        const gameData = {
            word: word,
            won: won,
            timestamp: new Date().toISOString(),
            triesLeft: this.triesLeft
        };

        try {
            const userRef = firebase.firestore().collection('users').doc(this.currentUser.uid);
            const historyRef = userRef.collection('gameHistory');
            await historyRef.add(gameData);
            this.loadGameHistory();
        } catch (error) {
            console.error('Error saving game history:', error);
        }
    }

    async loadGameHistory() {
        if (!this.currentUser) return;

        try {
            const userRef = firebase.firestore().collection('users').doc(this.currentUser.uid);
            const historyRef = userRef.collection('gameHistory');
            const snapshot = await historyRef.orderBy('timestamp', 'desc').limit(10).get();

            this.historyList.innerHTML = '';
            snapshot.forEach(doc => {
                const data = doc.data();
                const historyItem = document.createElement('div');
                historyItem.className = 'history-item';
                historyItem.innerHTML = `
                    <span class="word">${data.word}</span> - 
                    <span class="result">${data.won ? 'Won' : 'Lost'}</span>
                    <span class="tries">(${data.triesLeft} tries left)</span>
                `;
                this.historyList.appendChild(historyItem);
            });
        } catch (error) {
            console.error('Error loading game history:', error);
        }
    }

    clearGameHistory() {
        this.historyList.innerHTML = '<p>Login to see your game history</p>';
    }

    updateUIForAuth() {
        if (this.currentUser) {
            this.loginBtn.style.display = 'none';
            this.signupBtn.style.display = 'none';
            this.logoutBtn.style.display = 'inline-block';
            this.userDisplay.textContent = this.currentUser.email;
        } else {
            this.loginBtn.style.display = 'inline-block';
            this.signupBtn.style.display = 'inline-block';
            this.logoutBtn.style.display = 'none';
            this.userDisplay.textContent = 'Guest';
        }
    }

    toggleMenu() {
        this.sidebarMenu.classList.toggle('open');
    }
}

// Initialize game on page load
document.addEventListener('DOMContentLoaded', () => {
    new HangmanGame();
});
