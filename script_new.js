class HangmanGame {
    constructor() {
        // Combined word list
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
        document.documentElement.setAttribute('data-theme', this.currentTheme);
        
        // DOM Elements
        this.wordElement = document.getElementById('word');
        this.messageElement = document.getElementById('message');
        this.triesElement = document.getElementById('tries');
        this.keyboardElement = document.getElementById('keyboard');
        this.modal = document.getElementById('game-over-modal');
        this.modalTitle = document.getElementById('game-over-title');
        this.modalMessage = document.getElementById('game-over-message');
        this.playAgainButton = document.getElementById('play-again');
        this.shareButton = document.getElementById('share-result');
        this.shareCanvas = document.getElementById('share-canvas');
        this.sharePreview = document.querySelector('.share-preview');
        this.copyImageButton = document.getElementById('copy-image');
        this.shareWhatsAppButton = document.getElementById('share-whatsapp');
        this.shareTextButton = document.getElementById('share-text');
        this.shareOtherButton = document.getElementById('share-other');
        
        // Load used words from localStorage
        const storedUsedWords = localStorage.getItem('usedWords');
        if (storedUsedWords) {
            this.usedWords = new Set(JSON.parse(storedUsedWords));
        }
        
        // Bind event listeners
        this.setupEventListeners();
        
        // Initialize keyboard
        this.createKeyboard();
        
        // Start new game
        this.startNewGame();
    }
    
    setupEventListeners() {
        document.getElementById('new-game').addEventListener('click', () => this.startNewGame());
        document.getElementById('play-again').addEventListener('click', () => this.startNewGame());
        document.getElementById('share-whatsapp').addEventListener('click', () => this.shareToWhatsApp());
        document.getElementById('share-text').addEventListener('click', () => this.shareToMessages());
        document.getElementById('share-other').addEventListener('click', () => this.shareToOther());
        document.getElementById('copy-image').addEventListener('click', () => this.copyImage());
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));

        // Theme toggle
        document.getElementById('theme-toggle').addEventListener('click', () => this.toggleTheme());
    }

    toggleTheme() {
        this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', this.currentTheme);
        localStorage.setItem('theme', this.currentTheme);
    }

    startNewGame() {
        // Get unused words
        const unusedWords = Object.values(this.words).flat().filter(word => !this.usedWords.has(word));
        
        // If all words have been used, reset the used words
        if (unusedWords.length === 0) {
            this.usedWords.clear();
            localStorage.removeItem('usedWords');
            this.currentWord = Object.values(this.words).flat()[Math.floor(Math.random() * Object.values(this.words).flat().length)];
        } else {
            // Select a random unused word
            this.currentWord = unusedWords[Math.floor(Math.random() * unusedWords.length)];
        }
        
        // Add the word to used words and save to localStorage
        this.usedWords.add(this.currentWord);
        localStorage.setItem('usedWords', JSON.stringify([...this.usedWords]));
        
        // Reset game state
        this.guessedLetters.clear();
        this.triesLeft = this.maxTries;
        this.gameOver = false;
        
        // Update UI
        this.updateWordDisplay();
        this.updateTriesDisplay();
        this.resetKeyboard();
        this.hideModal();
    }

    createKeyboard() {
        console.log('Creating keyboard...');
        const keyboard = document.getElementById('keyboard');
        console.log('Keyboard element:', keyboard);
        keyboard.innerHTML = '';
        
        const rows = [
            ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
            ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
            ['Z', 'X', 'C', 'V', 'B', 'N', 'M']
        ];

        rows.forEach((row, i) => {
            console.log('Creating row:', i);
            const rowDiv = document.createElement('div');
            rowDiv.className = 'keyboard-row';
            
            row.forEach(letter => {
                const key = document.createElement('button');
                key.className = 'key';
                key.textContent = letter;
                key.dataset.key = letter;
                key.addEventListener('click', () => this.handleGuess(letter));
                rowDiv.appendChild(key);
            });
            
            keyboard.appendChild(rowDiv);
        });
        console.log('Keyboard creation complete');
    }

    resetKeyboard() {
        const keys = document.querySelectorAll('.key');
        keys.forEach(key => {
            key.className = 'key';
        });
    }

    updateWordDisplay() {
        const wordContainer = document.getElementById('word');
        wordContainer.innerHTML = '';
        
        [...this.currentWord].forEach(letter => {
            const letterDiv = document.createElement('div');
            letterDiv.className = 'letter';
            letterDiv.textContent = this.guessedLetters.has(letter) ? letter : '';
            wordContainer.appendChild(letterDiv);
        });
    }

    updateTriesDisplay() {
        this.triesElement.textContent = this.triesLeft;
    }

    handleKeyPress(e) {
        if (/^[A-Za-z]$/.test(e.key) && !this.gameOver) {
            this.handleGuess(e.key.toUpperCase());
        }
    }

    handleGuess(letter) {
        letter = letter.toUpperCase();
        
        if (this.gameOver || this.guessedLetters.has(letter)) {
            return;
        }

        this.guessedLetters.add(letter);
        
        if (!this.currentWord.includes(letter)) {
            this.triesLeft--;
            this.updateKeyboard(letter, 'absent');
        } else {
            this.updateKeyboard(letter, 'correct');
        }

        this.updateWordDisplay();
        this.updateTriesDisplay();

        // Check win/lose conditions
        if (this.hasWon()) {
            this.gameOver = true;
            this.showModal(true);
        } else if (this.triesLeft === 0) {
            this.gameOver = true;
            this.showModal(false);
        }
    }

    updateKeyboard(letter, status) {
        const key = document.querySelector(`.key[data-key="${letter}"]`);
        if (key) {
            key.classList.remove('correct', 'present', 'absent');
            key.classList.add(status);
            key.disabled = true;
        }
    }

    showModal(won) {
        const modal = document.getElementById('game-over-modal');
        const title = document.getElementById('game-over-title');
        const message = document.getElementById('game-over-message');
        
        title.textContent = won ? 'Congratulations!' : 'Game Over';
        message.textContent = won 
            ? `You won! The word was ${this.currentWord}`
            : `Sorry, you lost. The word was ${this.currentWord}`;
        
        this.generateResultImage();
        modal.classList.add('show');
    }

    hideModal() {
        const modal = document.getElementById('game-over-modal');
        modal.classList.remove('show');
        // Remove any lingering enter key listeners
        document.removeEventListener('keydown', this.handleEnterKey);
    }

    hasWon() {
        return [...this.currentWord].every(letter => this.guessedLetters.has(letter));
    }

    generateResultImage() {
        const canvas = this.shareCanvas;
        const ctx = canvas.getContext('2d');
        const preview = this.sharePreview;
        
        // Set canvas size
        canvas.width = 600;
        canvas.height = 400;
        
        // Set background based on theme
        ctx.fillStyle = getComputedStyle(document.documentElement)
            .getPropertyValue('--color-background').trim();
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw title with theme-aware color
        ctx.fillStyle = getComputedStyle(document.documentElement)
            .getPropertyValue('--color-text').trim();
        ctx.font = 'bold 40px "Clear Sans", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('HANGMAN', canvas.width/2, 60);
        
        // Draw result
        const won = this.hasWon();
        const usedTries = this.maxTries - this.triesLeft;
        ctx.font = '30px "Clear Sans", sans-serif';
        ctx.fillText(`${won ? 'Victory' : 'Game Over'} - ${usedTries}/${this.maxTries} tries`, canvas.width/2, 120);
        
        // Draw word
        ctx.font = 'bold 36px "Clear Sans", sans-serif';
        ctx.fillText(this.currentWord, canvas.width/2, 180);
        
        // Draw squares with theme-aware colors
        const squareSize = 40;
        const startX = (canvas.width - (this.maxTries * (squareSize + 10))) / 2;
        const startY = 240;
        
        const absentColor = getComputedStyle(document.documentElement)
            .getPropertyValue('--color-absent').trim();
        const keyboardBgColor = getComputedStyle(document.documentElement)
            .getPropertyValue('--color-keyboard-bg').trim();
        
        for (let i = 0; i < this.maxTries; i++) {
            ctx.fillStyle = i < usedTries ? absentColor : keyboardBgColor;
            ctx.fillRect(startX + i * (squareSize + 10), startY, squareSize, squareSize);
        }
        
        // Add watermark with theme-aware color
        ctx.font = '16px "Clear Sans", sans-serif';
        ctx.fillStyle = getComputedStyle(document.documentElement)
            .getPropertyValue('--color-absent').trim();
        ctx.fillText('play at yourgame.com/hangman', canvas.width/2, 350);
        
        // Show preview
        preview.innerHTML = '';
        const img = new Image();
        img.src = canvas.toDataURL();
        img.style.width = '100%';
        img.style.height = 'auto';
        preview.appendChild(img);
        
        return canvas.toDataURL();
    }

    async shareToWhatsApp() {
        const imageUrl = this.generateResultImage();
        const text = `Check out my Hangman result!\n${window.location.href}`;
        const whatsappUrl = `whatsapp://send?text=${encodeURIComponent(text)}`;
        window.location.href = whatsappUrl;
    }

    async shareToMessages() {
        const imageUrl = this.generateResultImage();
        const text = `Check out my Hangman result!\n${window.location.href}`;
        const smsUrl = `sms:?&body=${encodeURIComponent(text)}`;
        window.location.href = smsUrl;
    }

    async shareToOther() {
        const imageUrl = this.generateResultImage();
        const blob = await (await fetch(imageUrl)).blob();
        const file = new File([blob], 'hangman-result.png', { type: 'image/png' });
        
        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'My Hangman Result',
                    text: `Check out my Hangman result!`,
                    url: window.location.href,
                    files: [file]
                });
            } catch (err) {
                console.error('Share failed:', err);
                this.copyImage(); // Fallback to copy
            }
        } else {
            this.copyImage(); // Fallback to copy
        }
    }

    async copyImage() {
        const imageUrl = this.generateResultImage();
        const blob = await (await fetch(imageUrl)).blob();
        
        try {
            await navigator.clipboard.write([
                new ClipboardItem({
                    'image/png': blob
                })
            ]);
            const copyBtn = this.copyImageButton;
            copyBtn.classList.add('copied');
            copyBtn.textContent = 'Copied!';
            setTimeout(() => {
                copyBtn.classList.remove('copied');
                copyBtn.innerHTML = '<img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJ3aGl0ZSI+PHBhdGggZD0iTTE2IDFINGMtMS4xIDAtMiAuOS0yIDJ2MTRoMlVzaDEyVjF6bTMgNEg4Yy0xLjEgMC0yIC45LTIgMnYxNGMwIDEuMS45IDIgMiAyaDExYzEuMSAwIDItLjkgMi0yVjdjMC0xLjEtLjktMi0yLTJ6bTAgMTZIOFY3aDExdjE0eiIvPjwvc3ZnPg=="/> Copy';
            }, 2000);
        } catch (err) {
            console.error('Copy failed:', err);
            // Fallback to download
            const link = document.createElement('a');
            link.href = imageUrl;
            link.download = 'hangman-result.png';
            link.click();
        }
    }
}

// Initialize game on page load
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM Content Loaded');
    new HangmanGame();
});
