import random
import os
import time
from colorama import init, Fore, Back, Style

# Initialize colorama
init(autoreset=True)

# List of words for the game
words = ['PYTHON', 'PROGRAMMING', 'COMPUTER', 'ALGORITHM', 'DATABASE', 'NETWORK', 
         'SOFTWARE', 'DEVELOPER', 'INTERFACE', 'VARIABLE']

# Modern Hangman display states with colors
HANGMAN_STATES = [
    f'''
    {Fore.CYAN}╔══════╗{Style.RESET_ALL}
    {Fore.CYAN}║      {Style.RESET_ALL}
    {Fore.CYAN}║      {Style.RESET_ALL}
    {Fore.CYAN}║      {Style.RESET_ALL}
    {Fore.CYAN}║      {Style.RESET_ALL}
    {Fore.CYAN}║      {Style.RESET_ALL}
    {Fore.CYAN}╚══════╝{Style.RESET_ALL}''',
    f'''
    {Fore.CYAN}╔══════╗{Style.RESET_ALL}
    {Fore.CYAN}║      {Fore.YELLOW}O{Style.RESET_ALL}
    {Fore.CYAN}║      {Style.RESET_ALL}
    {Fore.CYAN}║      {Style.RESET_ALL}
    {Fore.CYAN}║      {Style.RESET_ALL}
    {Fore.CYAN}║      {Style.RESET_ALL}
    {Fore.CYAN}╚══════╝{Style.RESET_ALL}''',
    f'''
    {Fore.CYAN}╔══════╗{Style.RESET_ALL}
    {Fore.CYAN}║      {Fore.YELLOW}O{Style.RESET_ALL}
    {Fore.CYAN}║      {Fore.YELLOW}│{Style.RESET_ALL}
    {Fore.CYAN}║      {Style.RESET_ALL}
    {Fore.CYAN}║      {Style.RESET_ALL}
    {Fore.CYAN}║      {Style.RESET_ALL}
    {Fore.CYAN}╚══════╝{Style.RESET_ALL}''',
    f'''
    {Fore.CYAN}╔══════╗{Style.RESET_ALL}
    {Fore.CYAN}║      {Fore.YELLOW}O{Style.RESET_ALL}
    {Fore.CYAN}║     {Fore.YELLOW}/│{Style.RESET_ALL}
    {Fore.CYAN}║      {Style.RESET_ALL}
    {Fore.CYAN}║      {Style.RESET_ALL}
    {Fore.CYAN}║      {Style.RESET_ALL}
    {Fore.CYAN}╚══════╝{Style.RESET_ALL}''',
    f'''
    {Fore.CYAN}╔══════╗{Style.RESET_ALL}
    {Fore.CYAN}║      {Fore.YELLOW}O{Style.RESET_ALL}
    {Fore.CYAN}║     {Fore.YELLOW}/│\\{Style.RESET_ALL}
    {Fore.CYAN}║      {Style.RESET_ALL}
    {Fore.CYAN}║      {Style.RESET_ALL}
    {Fore.CYAN}║      {Style.RESET_ALL}
    {Fore.CYAN}╚══════╝{Style.RESET_ALL}''',
    f'''
    {Fore.CYAN}╔══════╗{Style.RESET_ALL}
    {Fore.CYAN}║      {Fore.RED}O{Style.RESET_ALL}
    {Fore.CYAN}║     {Fore.RED}/│\\{Style.RESET_ALL}
    {Fore.CYAN}║     {Fore.RED}/{Style.RESET_ALL}
    {Fore.CYAN}║      {Style.RESET_ALL}
    {Fore.CYAN}║      {Style.RESET_ALL}
    {Fore.CYAN}╚══════╝{Style.RESET_ALL}''',
    f'''
    {Fore.CYAN}╔══════╗{Style.RESET_ALL}
    {Fore.CYAN}║      {Fore.RED}O{Style.RESET_ALL}
    {Fore.CYAN}║     {Fore.RED}/│\\{Style.RESET_ALL}
    {Fore.CYAN}║     {Fore.RED}/ \\{Style.RESET_ALL}
    {Fore.CYAN}║      {Style.RESET_ALL}
    {Fore.CYAN}║      {Style.RESET_ALL}
    {Fore.CYAN}╚══════╝{Style.RESET_ALL}'''
]

def clear_screen():
    """Clear the console screen."""
    os.system('cls' if os.name == 'nt' else 'clear')

def get_word():
    """Return a random word from the word list."""
    return random.choice(words)

def display_title():
    """Display the game title."""
    title = f'''
    {Fore.CYAN}╔══════════════════════════════════════╗
    ║     {Fore.YELLOW}M O D E R N  H A N G M A N{Fore.CYAN}     ║
    ╚══════════════════════════════════════╝{Style.RESET_ALL}
    '''
    print(title)

def display_game(word, guessed_letters, wrong_guesses):
    """Display the current game state."""
    clear_screen()
    display_title()
    
    # Display hangman
    print(HANGMAN_STATES[len(wrong_guesses)])
    print()
    
    # Display word with guessed letters
    display_word = ''
    for letter in word:
        if letter in guessed_letters:
            display_word += f'{Fore.GREEN}{letter}{Style.RESET_ALL} '
        else:
            display_word += f'{Fore.WHITE}_{Style.RESET_ALL} '
    print(f'    Word: {display_word}')
    print()
    
    # Display wrong guesses
    if wrong_guesses:
        wrong_letters = ' '.join(sorted(wrong_guesses))
        print(f'    Wrong guesses: {Fore.RED}{wrong_letters}{Style.RESET_ALL}')
    
    # Display remaining tries with color-coded status
    tries_left = 6 - len(wrong_guesses)
    color = Fore.GREEN if tries_left > 2 else Fore.YELLOW if tries_left > 1 else Fore.RED
    print(f'    Remaining tries: {color}{tries_left}{Style.RESET_ALL}')

def display_game_over(won, word):
    """Display game over message."""
    time.sleep(1)
    clear_screen()
    if won:
        message = f'''
    {Fore.GREEN}╔══════════════════════════════════════╗
    ║        C O N G R A T U L A T I O N S    ║
    ║              YOU   WON!                  ║
    ╚══════════════════════════════════════╝{Style.RESET_ALL}
        '''
    else:
        message = f'''
    {Fore.RED}╔══════════════════════════════════════╗
    ║            GAME   OVER                  ║
    ║           Better luck next time!        ║
    ╚══════════════════════════════════════╝{Style.RESET_ALL}
        '''
    print(message)
    print(f"\n    The word was: {Fore.CYAN}{word}{Style.RESET_ALL}")

def play_game():
    """Main game function."""
    word = get_word()
    guessed_letters = set()
    wrong_guesses = set()
    
    while True:
        display_game(word, guessed_letters, wrong_guesses)
        
        # Check if player has won
        if all(letter in guessed_letters for letter in word):
            display_game_over(True, word)
            break
        
        # Check if player has lost
        if len(wrong_guesses) >= 6:
            display_game_over(False, word)
            break
        
        # Get player's guess
        guess = input(f'\n    {Fore.CYAN}Guess a letter:{Style.RESET_ALL} ').upper()
        
        # Validate input
        if len(guess) != 1:
            print(f'\n    {Fore.YELLOW}Please enter a single letter.{Style.RESET_ALL}')
            time.sleep(1)
            continue
        if not guess.isalpha():
            print(f'\n    {Fore.YELLOW}Please enter a letter.{Style.RESET_ALL}')
            time.sleep(1)
            continue
        if guess in guessed_letters or guess in wrong_guesses:
            print(f'\n    {Fore.YELLOW}You already guessed that letter.{Style.RESET_ALL}')
            time.sleep(1)
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
        display_title()
        play_game()
        
        play_again = input(f'\n    {Fore.CYAN}Play again? (y/n):{Style.RESET_ALL} ').lower()
        if play_again != 'y':
            clear_screen()
            print(f'''
    {Fore.CYAN}╔══════════════════════════════════════╗
    ║        Thanks for playing!              ║
    ╚══════════════════════════════════════╝{Style.RESET_ALL}
            ''')
            break

if __name__ == '__main__':
    main()
