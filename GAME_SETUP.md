# Quick Odds Uganda 🎮

A mobile gaming application built with **Phaser 3** and **JavaScript**, optimized for smartphones.

## Features

- ✅ Phaser 3 game framework
- ✅ Mobile-responsive design
- ✅ Touch and keyboard input support
- ✅ Webpack bundling and dev server
- ✅ Built for smartphones

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/ghettosignal51-creator/Ghetto-signal-weekend-lottery.git
cd Ghetto-signal-weekend-lottery
```

2. Install dependencies:
```bash
npm install
```

### Development

Start the development server:
```bash
npm run dev
```

The game will open at `http://localhost:8080` and automatically reload on changes.

### Build for Production

Create an optimized production build:
```bash
npm run build
```

The built files will be in the `dist/` directory.

## Project Structure

```
Ghetto-signal-weekend-lottery/
├── public/
│   └── index.html          # Main HTML file
├── src/
│   ├── index.js            # Game initialization
│   └── scenes/
│       └── GameScene.js    # Main game scene
├── package.json            # Dependencies and scripts
├── webpack.config.js       # Webpack configuration
└── README.md               # This file
```

## How to Use

### Adding Game Assets

Place images, audio, and other assets in a `public/assets/` directory and preload them in `GameScene.js`:

```javascript
preload() {
    this.load.image('player', 'assets/player.png');
    this.load.audio('jump', 'assets/jump.mp3');
}
```

### Creating New Scenes

Create additional scenes in `src/scenes/` and add them to the config in `src/index.js`:

```javascript
import MyNewScene from './scenes/MyNewScene';

const config = {
    // ...
    scene: [GameScene, MyNewScene],
};
```

### Handling Input

Touch and keyboard input are already set up in `GameScene.js`. Modify the `handleTap()` and `handleKeyboard()` methods to add your game logic.

## Mobile Optimization

The game is configured for mobile with:
- Responsive scaling
- Touch input handling
- Full-screen support
- Meta tags for app-like experience

## Resources

- [Phaser 3 Documentation](https://newdocs.phaser.io/)
- [Phaser 3 Examples](https://phaser.io/examples)
- [Phaser Community](https://phaser.discourse.group/)

## License

MIT License - feel free to use this project however you like!

## Next Steps

1. Replace placeholder UI with your game content
2. Add game assets (sprites, sounds, etc.)
3. Implement game mechanics and logic
4. Test on real mobile devices
5. Deploy to hosting platform (Vercel, Netlify, GitHub Pages, etc.)

---

**Happy coding! 🚀** Build something awesome!
