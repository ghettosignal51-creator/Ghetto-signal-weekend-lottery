import Phaser from 'phaser';
import airtelHandler from '../utils/airtelTransactionHandler';

class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
        this.userBalance = 5000; // Starting balance in UGX
        this.transactionHistory = [];
        this.currentUser = {
            country: 'Uganda',
            network: 'Airtel',
            acceptedTermsAndConditions: true,
            username: 'Player1'
        };
    }

    preload() {
        // Load any assets here
        this.load.setBaseURL('/');
    }

    create() {
        // Title
        this.add.text(250, 40, 'Quick Odds Uganda 🎮', {
            fontSize: '28px',
            fill: '#00ff00',
            fontStyle: 'bold',
            align: 'center'
        }).setOrigin(0.5);

        // Balance Display
        this.balanceText = this.add.text(250, 100, `Balance: ${this.userBalance} UGX`, {
            fontSize: '20px',
            fill: '#ffffff',
            align: 'center'
        }).setOrigin(0.5);

        // User Info
        this.add.text(250, 140, `${this.currentUser.network} Uganda`, {
            fontSize: '16px',
            fill: '#ffff00',
            align: 'center'
        }).setOrigin(0.5);

        // Deposit Section
        this.add.text(250, 200, '--- DEPOSIT ---', {
            fontSize: '18px',
            fill: '#00ff00',
            fontStyle: 'bold',
            align: 'center'
        }).setOrigin(0.5);

        this.depositInput = this.add.text(250, 240, 'Enter amount:', {
            fontSize: '14px',
            fill: '#ffffff'
        }).setOrigin(0.5);

        this.depositAmount = 0;

        // Deposit Buttons
        const depositButtons = [
            { label: '+500', value: 500, x: 100, y: 280 },
            { label: '+1000', value: 1000, x: 250, y: 280 },
            { label: '+5000', value: 5000, x: 400, y: 280 }
        ];

        depositButtons.forEach(btn => {
            this.createButton(btn.x, btn.y, btn.label, () => this.quickDeposit(btn.value));
        });

        // Withdrawal Section
        this.add.text(250, 340, '--- WITHDRAWAL ---', {
            fontSize: '18px',
            fill: '#ff6666',
            fontStyle: 'bold',
            align: 'center'
        }).setOrigin(0.5);

        // Withdrawal Buttons
        const withdrawalButtons = [
            { label: '-500', value: 500, x: 100, y: 380 },
            { label: '-1000', value: 1000, x: 250, y: 380 },
            { label: '-5000', value: 5000, x: 400, y: 380 }
        ];

        withdrawalButtons.forEach(btn => {
            this.createButton(btn.x, btn.y, btn.label, () => this.quickWithdraw(btn.value));
        });

        // Transaction History
        this.add.text(250, 440, '--- TRANSACTION HISTORY ---', {
            fontSize: '16px',
            fill: '#00ccff',
            fontStyle: 'bold',
            align: 'center'
        }).setOrigin(0.5);

        this.historyText = this.add.text(20, 480, 'No transactions yet', {
            fontSize: '12px',
            fill: '#cccccc',
            wordWrap: { width: 460 }
        });

        // Fee Info
        this.add.text(250, 680, 'Airtel Fee: 50 UGX per transaction', {
            fontSize: '12px',
            fill: '#ffaa00',
            align: 'center'
        }).setOrigin(0.5);

        this.add.text(250, 710, 'Sent to: 0743712691', {
            fontSize: '12px',
            fill: '#ffaa00',
            align: 'center'
        }).setOrigin(0.5);

        // Info Box
        this.add.text(250, 750, '✓ Terms & Conditions Accepted', {
            fontSize: '12px',
            fill: '#00ff00',
            align: 'center'
        }).setOrigin(0.5);

        // Keyboard input
        this.input.keyboard.on('keydown', (event) => {
            this.handleKeyInput(event);
        });
    }

    createButton(x, y, label, callback) {
        const button = this.add.rectangle(x, y, 80, 40, 0x2a5a2a);
        button.setInteractive({ useHandCursor: true });

        button.on('pointerover', () => {
            button.setFillStyle(0x00ff00);
        });

        button.on('pointerout', () => {
            button.setFillStyle(0x2a5a2a);
        });

        button.on('pointerdown', callback);

        const text = this.add.text(x, y, label, {
            fontSize: '14px',
            fill: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);
    }

    quickDeposit(amount) {
        const transaction = airtelHandler.processDeposit(amount, this.currentUser);

        if (transaction.finalAmount >= 0) {
            this.userBalance += transaction.finalAmount;
            this.addTransactionHistory(`Deposit: +${transaction.finalAmount} UGX (Fee: ${transaction.fee} UGX)`);
            this.updateBalanceDisplay();
            this.showMessage(`✓ Deposit successful!\n+${transaction.finalAmount} UGX`, '#00ff00');
        } else {
            this.showMessage('❌ Insufficient balance!', '#ff6666');
        }
    }

    quickWithdraw(amount) {
        const transaction = airtelHandler.processWithdrawal(amount, this.currentUser);

        if (this.userBalance >= amount) {
            this.userBalance -= transaction.finalAmount;
            this.addTransactionHistory(`Withdrawal: -${transaction.finalAmount} UGX (Fee: ${transaction.fee} UGX)`);
            this.updateBalanceDisplay();
            this.showMessage(`✓ Withdrawal successful!\n-${transaction.finalAmount} UGX`, '#ffaa00');
        } else {
            this.showMessage('❌ Insufficient balance!', '#ff6666');
        }
    }

    handleKeyInput(event) {
        const key = event.key.toLowerCase();
        if (key === 'd') this.quickDeposit(1000);
        if (key === 'w') this.quickWithdraw(1000);
    }

    addTransactionHistory(message) {
        const timestamp = new Date().toLocaleTimeString();
        this.transactionHistory.unshift(`[${timestamp}] ${message}`);
        
        if (this.transactionHistory.length > 3) {
            this.transactionHistory.pop();
        }
        
        this.historyText.setText(this.transactionHistory.join('\n'));
    }

    updateBalanceDisplay() {
        this.balanceText.setText(`Balance: ${this.userBalance} UGX`);
    }

    showMessage(message, color) {
        const messageText = this.add.text(250, 600, message, {
            fontSize: '16px',
            fill: color,
            align: 'center',
            fontStyle: 'bold',
            backgroundColor: '#000000',
            padding: { x: 10, y: 10 }
        }).setOrigin(0.5);

        this.time.delayedCall(2000, () => {
            messageText.destroy();
        });
    }

    update() {
        // Game loop updates
    }
}

export default GameScene;
