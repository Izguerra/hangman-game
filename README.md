# Modern Hangman Game

A modern, responsive web-based Hangman game with authentication and dark/light theme support.

## Features

- 🎮 Classic Hangman gameplay with multiple categories
- 🌓 Dark/Light theme support
- 🔐 Firebase Authentication (Email/Password)
- 👥 Guest mode support
- 📱 Responsive design for all devices
- 🎯 Score tracking and game statistics
- 💫 Smooth animations and transitions
- 🎨 Modern, minimalist UI
- 📢 Share results on WhatsApp
- 📋 Copy results to clipboard

## Technologies Used

- Vanilla JavaScript (ES6+)
- Firebase Authentication (v9.6.0)
- CSS3 with CSS Variables
- HTML5

## Getting Started

1. Clone the repository:
```bash
git clone <repository-url>
```

2. Set up Firebase:
   - Create a new Firebase project at [Firebase Console](https://console.firebase.google.com)
   - Enable Email/Password authentication
   - Update `firebase-config.js` with your Firebase configuration

3. Deploy:
   - Deploy to Netlify or your preferred hosting service
   - Add your domain to Firebase authorized domains

## Development

The project structure is organized as follows:

```
hangman-game/
├── index.html          # Main HTML file
├── styles.css          # Styles and themes
├── script.js           # Game logic and authentication
├── firebase-config.js  # Firebase configuration
└── assets/            # Images and icons
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Firebase team for the excellent authentication service
- The open-source community for inspiration and resources
