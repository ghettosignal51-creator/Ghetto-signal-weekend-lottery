import Phaser from 'phaser';

export default class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
        this.score = 0;
        this.isSpinning = false;
    }

    create() {
        // Background
        this.cameras.main.setBackgroundColor('#1a1a2e');

        // Title
        const titleText = this.add.text(
            this.cameras.main.centerX,
            50,
            'Quick Odds Uganda',
            { fontSize: '32px', fill: '#00ff00', fontStyle: 'bold' }
        ).setOrigin(0.5);

        // Score display
        this.scoreText = this.add.text(
            this.cameras.main.centerX,
            120,
            `Score: ${this.score}`,
            { fontSize: '24px', fill: '#ffff00' }
        ).setOrigin(0.5);

        // Lottery wheel (simple circle representation)
        const wheelX = this.cameras.main.centerX;
        const wheelY = this.cameras.main.centerY;
        const wheelRadius = 100;

        // Draw wheel segments
        this.drawLotteryWheel(wheelX, wheelY, wheelRadius);

        // Spin button
        this.spinButton = this.add.rectangle(
            this.cameras.main.centerX,
            this.cameras.main.height - 100,
            150,
            50,
            0xff6600
        ).setInteractive({ useHandCursor: true });

        this.add.text(
            this.cameras.main.centerX,
            this.cameras.main.height - 100,
            'SPIN',
            { fontSize: '20px', fill: '#fff', fontStyle: 'bold' }
        ).setOrigin(0.5);

        // Button hover effects
        this.spinButton.on('pointerover', () => {
            this.spinButton.setFillStyle(0xff8c42);
        });

        this.spinButton.on('pointerout', () => {
            this.spinButton.setFillStyle(0xff6600);
        });

        // Spin action
        this.spinButton.on('pointerdown', () => this.spin());

        // Instructions
        this.add.text(
            this.cameras.main.centerX,
            this.cameras.main.height - 30,
            'Tap or click SPIN to play!',
            { fontSize: '14px', fill: '#aaa', fontStyle: 'italic' }
        ).setOrigin(0.5);

        // Result display
        this.resultText = this.add.text(
            this.cameras.main.centerX,
            this.cameras.main.centerY + 160,
            '',
            { fontSize: '20px', fill: '#00ff00', fontStyle: 'bold' }
        ).setOrigin(0.5);

        // Handle touch input for mobile
        this.input.on('pointerdown', (pointer) => {
            if (!this.isSpinning) {
                // Check if touch is on the button area
                const buttonBounds = this.spinButton.getBounds();
                if (Phaser.Geom.Rectangle.Contains(buttonBounds, pointer.x, pointer.y)) {
                    this.spin();
                }
            }
        });
    }

    drawLotteryWheel(x, y, radius) {
        // Draw circle background
        this.add.circle(x, y, radius, 0x333333);

        // Draw colored segments
        const colors = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0xff00ff, 0x00ffff];
        const segmentCount = colors.length;
        const anglePerSegment = (Math.PI * 2) / segmentCount;

        for (let i = 0; i < segmentCount; i++) {
            const angle = anglePerSegment * i;
            const nextAngle = anglePerSegment * (i + 1);

            // Draw segment using lines (simplified)
            const points = [
                { x: x + Math.cos(angle) * radius, y: y + Math.sin(angle) * radius },
                { x: x + Math.cos(nextAngle) * radius, y: y + Math.sin(nextAngle) * radius }
            ];

            const graphics = this.make.graphics({ x: x, y: y, add: true });
            graphics.lineStyle(2, colors[i], 1);
            graphics.beginPath();
            graphics.moveTo(0, 0);
            graphics.lineTo(
                points[0].x - x,
                points[0].y - y
            );
            graphics.lineTo(
                points[1].x - x,
                points[1].y - y
            );
            graphics.closePath();
            graphics.strokePath();
        }

        // Center circle
        this.add.circle(x, y, 15, 0xffff00);
    }

    spin() {
        if (this.isSpinning) return;

        this.isSpinning = true;
        this.resultText.setText('Spinning...');
        this.resultText.setFill('#ffff00');

        // Simulate spin with animation
        this.tweens.add({
            targets: this,
            duration: 2000,
            ease: 'Cubic.easeOut',
            onComplete: () => {
                this.getResult();
                this.isSpinning = false;
            }
        });
    }

    getResult() {
        // Random result
        const prizes = [
            { name: '🎁 Lucky Draw!', amount: 1000 },
            { name: '💰 Bonus Win!', amount: 500 },
            { name: '🌟 Big Prize!', amount: 2000 },
            { name: '🎲 Try Again', amount: 0 },
            { name: '⭐ Silver Prize!', amount: 750 },
            { name: '👑 Jackpot!', amount: 5000 }
        ];

        const randomIndex = Math.floor(Math.random() * prizes.length);
        const result = prizes[randomIndex];

        if (result.amount > 0) {
            this.score += result.amount;
            this.scoreText.setText(`Score: ${this.score}`);
            this.resultText.setText(`${result.name} +${result.amount}!`);
            this.resultText.setFill('#00ff00');
        } else {
            this.resultText.setText(result.name);
            this.resultText.setFill('#ff0000');
        }
    }

    update() {
        // Game loop updates can go here
    }
}