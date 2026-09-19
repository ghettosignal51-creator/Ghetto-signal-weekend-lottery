import Phaser from 'phaser';
import GameScene from './scenes/GameScene';

const state = {
  game: null,
};

const createGame = () => {
  if (state.game) {
    return;
  }

  const config = {
    type: Phaser.AUTO,
    width: window.innerWidth,
    height: window.innerHeight,
    parent: 'game',
    physics: {
      default: 'arcade',
      arcade: {
        gravity: { y: 300 },
        debug: false,
      },
    },
    scene: [GameScene],
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      orientation: Phaser.Scale.Orientation.PORTRAIT,
    },
  };

  state.game = new Phaser.Game(config);

  window.addEventListener('resize', () => {
    if (state.game) {
      state.game.scale.resize(window.innerWidth, window.innerHeight);
    }
  });
};

window.startGame = createGame;

window.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('quickOddsToken');
  if (token) {
    createGame();
  }
});
