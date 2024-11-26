class HangmanGame {
    constructor() {
        // Combined word list
        this.words = [
            'JAVASCRIPT', 'PYTHON', 'JAVA', 'TYPESCRIPT', 'REACT', 'ANGULAR', 'NODEJS', 'DATABASE', 'ALGORITHM', 'FUNCTION',
            'ELEPHANT', 'GIRAFFE', 'PENGUIN', 'KANGAROO', 'DOLPHIN', 'CHEETAH', 'OCTOPUS', 'BUTTERFLY', 'RHINOCEROS', 'PANDA',
            'AUSTRALIA', 'BRAZIL', 'CANADA', 'DENMARK', 'EGYPT', 'FRANCE', 'GERMANY', 'HUNGARY', 'ICELAND', 'JAPAN',
            'BASKETBALL', 'FOOTBALL', 'TENNIS', 'VOLLEYBALL', 'CRICKET', 'HOCKEY', 'BASEBALL', 'SWIMMING', 'BOXING', 'GOLF',
            'PIZZA', 'BURGER', 'SUSHI', 'PASTA', 'TACOS', 'SANDWICH', 'PANCAKE', 'CHOCOLATE', 'ICECREAM', 'NOODLES'
        ];
        
        // Track used words
        this.usedWords = new Set();
        
        this.maxTries = 6;
        this.currentWord = '';
        this.guessedLetters = new Set();
        this.wrongLetters = new Set();
        this.triesLeft = this.maxTries;
        this.gameOver = false;
        
        // DOM Elements
        this.wordElement = document.getElementById('word');
        this.messageElement = document.getElementById('message');
        this.triesElement = document.getElementById('tries');
        this.wrongLettersElement = document.getElementById('wrong-letters');
        this.newGameButton = document.getElementById('new-game');
        this.keyboardElement = document.getElementById('keyboard');
        this.modal = document.getElementById('game-over-modal');
        this.modalTitle = document.getElementById('game-over-title');
        this.modalMessage = document.getElementById('game-over-message');
        this.playAgainButton = document.getElementById('play-again');
        
        // Bind event listeners
        this.newGameButton.addEventListener('click', () => this.startNewGame());
        this.playAgainButton.addEventListener('click', () => this.startNewGame());
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));
        
        // Initialize keyboard
        this.createKeyboard();
        
        // Load saved game state if exists, otherwise start new game
        if (!this.loadGameState()) {
            this.startNewGame();
        }
    }
    
    createKeyboard() {
        const rows = [
            ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
            ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
            ['Z', 'X', 'C', 'V', 'B', 'N', 'M']
        ];
        
        this.keyboardElement.innerHTML = '';
        rows.forEach(row => {
            const rowDiv = document.createElement('div');
            rowDiv.className = 'keyboard-row';
            
            row.forEach(letter => {
                const button = document.createElement('button');
                button.className = 'key';
                button.textContent = letter;
                button.addEventListener('click', () => this.handleGuess(letter));
                rowDiv.appendChild(button);
            });
            
            this.keyboardElement.appendChild(rowDiv);
        });
    }
    
    updateKeyboardState() {
        const keys = document.querySelectorAll('.key');
        keys.forEach(key => {
            const letter = key.textContent;
            if (this.guessedLetters.has(letter)) {
                if (this.currentWord.includes(letter)) {
                    key.classList.add('correct');
                } else {
                    key.classList.add('absent');
                }
            }
        });
    }
    
    startNewGame() {
        // Load used words from localStorage or initialize empty set
        let storedUsedWords = localStorage.getItem('usedWords');
        this.usedWords = storedUsedWords ? new Set(JSON.parse(storedUsedWords)) : new Set();

        // Get unused words
        const unusedWords = this.words.filter(word => !this.usedWords.has(word));
        
        // If all words have been used, reset the used words
        if (unusedWords.length === 0) {
            this.usedWords.clear();
            localStorage.removeItem('usedWords');
            this.currentWord = this.words[Math.floor(Math.random() * this.words.length)];
        } else {
            // Select a random unused word
            const randomIndex = Math.floor(Math.random() * unusedWords.length);
            this.currentWord = unusedWords[randomIndex];
        }
        
        // Add the word to used words and save to localStorage
        this.usedWords.add(this.currentWord);
        localStorage.setItem('usedWords', JSON.stringify([...this.usedWords]));
        
        // Reset game state
        this.guessedLetters.clear();
        this.wrongLetters.clear();
        this.triesLeft = this.maxTries;
        this.gameOver = false;
        
        // Reset UI
        this.updateDisplay();
        this.hideModal();
        this.resetHangman();
        
        // Reset keyboard
        const keys = document.querySelectorAll('.key');
        keys.forEach(key => {
            key.className = 'key';
        });
        
        // Save game state
        this.saveGameState();
    }
    
    handleKeyPress(e) {
        if (this.gameOver) return;
        
        const letter = e.key.toUpperCase();
        if (/^[A-Z]$/.test(letter)) {
            this.handleGuess(letter);
        }
    }
    
    handleGuess(letter) {
        if (this.gameOver || this.guessedLetters.has(letter)) return;
        
        this.guessedLetters.add(letter);
        
        if (!this.currentWord.includes(letter)) {
            this.wrongLetters.add(letter);
            this.triesLeft--;
            this.showNextHangmanPart();
        }
        
        this.updateDisplay();
        this.updateKeyboardState();
        
        if (this.triesLeft === 0) {
            this.endGame(false);
        } else if (this.hasWon()) {
            this.endGame(true);
        }
        
        // Save game state
        this.saveGameState();
    }
    
    hasWon() {
        return [...this.currentWord].every(letter => this.guessedLetters.has(letter));
    }
    
    updateDisplay() {
        // Update word display
        this.wordElement.innerHTML = [...this.currentWord]
            .map(letter => `<span class="letter">${this.guessedLetters.has(letter) ? letter : ''}</span>`)
            .join('');
        
        // Update tries left
        this.triesElement.textContent = this.triesLeft;
        
        // Update wrong letters
        this.wrongLettersElement.textContent = [...this.wrongLetters].join(', ');
    }
    
    showNextHangmanPart() {
        const parts = document.querySelectorAll('.hangman-part');
        const partIndex = this.maxTries - this.triesLeft - 1;
        if (partIndex >= 0 && partIndex < parts.length) {
            parts[partIndex].classList.add('show');
        }
    }
    
    resetHangman() {
        const parts = document.querySelectorAll('.hangman-part');
        parts.forEach(part => part.classList.remove('show'));
    }
    
    endGame(won) {
        this.gameOver = true;
        this.modalTitle.textContent = won ? 'Congratulations!' : 'Game Over';
        this.modalMessage.textContent = won 
            ? `You've won! The word was: ${this.currentWord}`
            : `Better luck next time! The word was: ${this.currentWord}`;
        this.showModal();
        
        // Clear the game state from localStorage
        localStorage.removeItem('hangmanGameState');
    }
    
    showModal() {
        this.modal.style.display = 'flex';
    }
    
    hideModal() {
        this.modal.style.display = 'none';
    }
    
    saveGameState() {
        const gameState = {
            currentWord: this.currentWord,
            guessedLetters: [...this.guessedLetters],
            wrongLetters: [...this.wrongLetters],
            triesLeft: this.triesLeft,
            gameOver: this.gameOver,
        };
        localStorage.setItem('hangmanGameState', JSON.stringify(gameState));
    }
    
    loadGameState() {
        const savedState = localStorage.getItem('hangmanGameState');
        if (savedState) {
            const state = JSON.parse(savedState);
            this.currentWord = state.currentWord;
            this.guessedLetters = new Set(state.guessedLetters);
            this.wrongLetters = new Set(state.wrongLetters);
            this.triesLeft = state.triesLeft;
            this.gameOver = state.gameOver;
            
            this.updateDisplay();
            this.updateKeyboardState();
            
            // Show hangman parts based on wrong guesses
            for (let i = 0; i < this.maxTries - this.triesLeft; i++) {
                this.showNextHangmanPart();
            }
            
            if (this.gameOver) {
                this.endGame(this.hasWon());
            }
            return true;
        }
        return false;
    }
}

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new HangmanGame();
});
