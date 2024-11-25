import random
import os

# List of words for the game
words = ['PYTHON', 'PROGRAMMING', 'COMPUTER', 'ALGORITHM', 'DATABASE', 'NETWORK', 
         'SOFTWARE', 'DEVELOPER', 'INTERFACE', 'VARIABLE']

# Hangman display states
HANGMAN_STATES = [
    '''
      +---+
          |
          |
          |
         ===''',
    '''
      +---+
      O   |
          |
          |
         ===''',
    '''
      +---+
      O   |
      |   |
          |
         ===''',
    '''
      +---+
      O   |
     /|   |
          |
         ===''',
    '''
      +---+
      O   |
     /|\  |
          |
         ===''',
    '''
      +---+
      O   |
     /|\  |
     /    |
         ===''',
    '''
      +---+
      O   |
     /|\  |
     / \  |
         ==='''
]

def clear_screen():
    """Clear the console screen."""
    os.system('cls' if os.name == 'nt' else 'clear')

def get_word():
    """Return a random word from the word list."""
    return random.choice(words)

def display_game(word, guessed_letters, wrong_guesses):
    """Display the current game state."""
    clear_screen()
    
    # Display hangman
    print(HANGMAN_STATES[len(wrong_guesses)])
    print()
    
    # Display word with guessed letters
    display_word = ''
    for letter in word:
        if letter in guessed_letters:
            display_word += letter + ' '
        else:
            display_word += '_ '
    print(display_word)
    print()
    
    # Display wrong guesses
    if wrong_guesses:
        print('Wrong guesses:', ' '.join(sorted(wrong_guesses)))
    print(f'Remaining tries: {6 - len(wrong_guesses)}')

def play_game():
    """Main game function."""
    word = get_word()
    guessed_letters = set()
    wrong_guesses = set()
    
    while True:
        display_game(word, guessed_letters, wrong_guesses)
        
        # Check if player has won
        if all(letter in guessed_letters for letter in word):
            print('\nCongratulations! You won!')
            print(f'The word was: {word}')
            break
        
        # Check if player has lost
        if len(wrong_guesses) >= 6:
            print('\nGame Over! You lost!')
            print(f'The word was: {word}')
            break
        
        # Get player's guess
        guess = input('\nGuess a letter: ').upper()
        
        # Validate input
        if len(guess) != 1:
            input('Please enter a single letter. Press Enter to continue...')
            continue
        if not guess.isalpha():
            input('Please enter a letter. Press Enter to continue...')
            continue
        if guess in guessed_letters or guess in wrong_guesses:
            input('You already guessed that letter. Press Enter to continue...')
            continue
            
        # Process guess
        if guess in word:
            guessed_letters.add(guess)
        else:
            wrong_guesses.add(guess)

def main():
    """Main game loop."""
    while True:
        clear_screen()
        print('Welcome to Hangman!')
        play_game()
        
        if input('\nPlay again? (y/n): ').lower() != 'y':
            break
    
    print('\nThanks for playing!')

if __name__ == '__main__':
    main()
