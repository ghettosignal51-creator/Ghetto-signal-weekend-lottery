import Phaser from 'phaser';
import GameScene from './scenes/GameScene';

const config = {
    type: Phaser.AUTO,
    parent: 'app',
    width: 500,
    height: 800,
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        min: {
            width: 320,
            height: 568
        },
        max: {
            width: 1024,
            height: 1024
        }
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 200 }
        }
    },
    scene: [GameScene],
    backgroundColor: '#1a1a1a'
};

const game = new Phaser.Game(config);
