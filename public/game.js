class Demo extends Phaser.Scene {
    constructor() {
        super({ key: 'Demo' });
        this.player1 = null;
        this.player2 = null;
        this.cursors = null;
        this.keyA = null;
        this.keyD = null;
        this.keyW = null;
        this.keyS = null;
        this.keySwitch1 = null;
        this.keySwitch2 = null;
        this.healthText1 = null;
        this.healthText2 = null;
        this.player1State = 'Alpha';
        this.player2State = 'Alpha';
    }

    preload() {
        this.load.image('player', 'https://labs.phaser.io/assets/sprites/phaser-dude.png');
    }

    create() {
        this.createPlayers();
        this.createHealthDisplay();
        this.createControls();
    }

    createPlayers() {
        // Player 1
        this.player1 = this.physics.add.sprite(100, 300, 'player').setScale(0.5);
        this.player1.health = 100;
        this.player1.state = 'Alpha';

        // Player 2
        this.player2 = this.physics.add.sprite(700, 300, 'player').setScale(0.5).setFlipX(true);
        this.player2.health = 100;
        this.player2.state = 'Alpha';
    }

    createHealthDisplay() {
        // Health display
        this.healthText1 = this.add.text(16, 16, 'P1 Health: 100', { fontSize: '16px', fill: '#fff' });
        this.healthText2 = this.add.text(600, 16, 'P2 Health: 100', { fontSize: '16px', fill: '#fff' });
    }

    createControls() {
        // Controls
        this.cursors = this.input.keyboard.createCursorKeys();
        this.keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        this.keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
        this.keyW = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
        this.keyS = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
        this.keySwitch1 = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Q);
        this.keySwitch2 = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
    }

    attack(attacker, target) {
        let damage = 10;

        // Adjust damage based on state
        if (attacker.state === 'Alpha') {
            damage = 15;
        } else if (attacker.state === 'Beta') {
            damage = 5;
        }

        // Check for proximity
        if (Phaser.Math.Distance.Between(attacker.x, attacker.y, target.x, target.y) < 50) {
            target.health -= damage;

            if (target.health <= 0) {
                target.health = 0;
                console.log(`${attacker === this.player1 ? 'Player 1' : 'Player 2'} Wins!`);
                this.scene.restart();
            }
        }
    }

    switchState(player) {
        if (player.state === 'Alpha') {
            player.state = 'Beta';
            player.setTint(0xff0000); // Red tint for Beta
        } else {
            player.state = 'Alpha';
            player.setTint(0x00ff00); // Green tint for Alpha
        }
    }

    update() {
        this.handlePlayerMovement();
        this.handlePlayerActions();
        this.updateHealthDisplay();
    }

    handlePlayerMovement() {
        // Player 1 Movement
        if (this.keyA.isDown) {
            this.player1.setVelocityX(-160);
        } else if (this.keyD.isDown) {
            this.player1.setVelocityX(160);
        } else {
            this.player1.setVelocityX(0);
        }

        // Player 2 Movement
        if (this.cursors.left.isDown) {
            this.player2.setVelocityX(-160);
        } else if (this.cursors.right.isDown) {
            this.player2.setVelocityX(160);
        } else {
            this.player2.setVelocityX(0);
        }
    }

    handlePlayerActions() {
        // Player 1 Attack
        if (this.keyW.isDown) {
            this.attack(this.player1, this.player2);
        }

        // Player 2 Attack
        if (this.cursors.up.isDown) {
            this.attack(this.player2, this.player1);
        }

        // Player 1 State Switching
        if (Phaser.Input.Keyboard.JustDown(this.keySwitch1)) {
            this.switchState(this.player1);
        }

        // Player 2 State Switching
        if (Phaser.Input.Keyboard.JustDown(this.keySwitch2)) {
            this.switchState(this.player2);
        }
    }

    updateHealthDisplay() {
        // Update Health UI
        this.healthText1.setText('P1 Health: ' + this.player1.health);
        this.healthText2.setText('P2 Health: ' + this.player2.health);
    }
}

let width = window.innerWidth * window.devicePixelRatio;
let height = window.innerHeight * window.devicePixelRatio;

var config = {
    type: Phaser.AUTO,
    parent: 'phaser-example',
    width: width,
    height: height,
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    physics: {
        default: 'arcade',
        matter: {
            debug: true, // Enable debug to see physics bodies
            gravity: { y: 0.5 } // Adjust gravity if needed
        }
    },
    scene: Demo,
    backgroundColor: '#8ccff',
};

var game = new Phaser.Game(config);