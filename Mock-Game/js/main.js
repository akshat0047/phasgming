var config = {
    type: Phaser.AUTO,
    width: 1366,
    height: 630,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: {
                y: 300
            },
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

//INITIALIZING PHASER OBJECT WITH CONFIG
var game = new Phaser.Game(config);

//LOADING ASSETS
function preload() {
    this.load.image('sky', 'assets/sky.jpg');
    this.load.image('star', 'assets/star.png');
    this.load.image('bomb', 'assets/bomb.png');
    this.load.image('platform', 'assets/platform.png');
    this.load.spritesheet('bird',
        'assets/dude.png', {
            frameWidth: 32,
            frameHeight: 48
        }
    );

}

var stars;
var platforms;
var score = 0;
var scoreText;
var bombs;

function create() {

    stars = this.physics.add.staticGroup();
    platforms = this.physics.add.staticGroup();
    this.add.image(400, 300, 'sky');

    //ADDING PLATFORMS

    platforms.create(380, 280, 'platform');
    platforms.create(980, 180, 'platform');
    platforms.create(580, 430, 'platform');
    platforms.create(650, 630, 'platform').setScale(5).refreshBody();


    //ADDING PLAYER

    player = this.physics.add.sprite(100, 450, 'bird');
    player.setCollideWorldBounds(true);
    player.body.setGravityY(300)

    //ADDING STARS

    stars = this.physics.add.group({
        key: 'star',
        repeat: 11,
        setXY: {
            x: 180,
            y: 0,
            stepX: 70
        }
    });

    stars.children.iterate(function (child) {
        child.setScale(0.05);
        child.setBounceY(Phaser.Math.FloatBetween(0.1, 0.3));

    });

    bombs = this.physics.add.group();

    //COLLISIONS
    this.physics.add.collider(player, platforms);
    this.physics.add.collider(stars, platforms);
    this.physics.add.overlap(player, stars, collectStar, null, this);
    this.physics.add.collider(bombs, platforms);

    this.physics.add.collider(player, bombs, hitBomb, null, this);

    function hitBomb(player, bomb) {
        this.physics.pause();

        player.setTint(0xff0000);

        player.anims.play('turn');

        gameOver = true;
    }

    function collectStar(player, star) {
        star.disableBody(true, true);

        score += 10;
        scoreText.setText('Score: ' + score);

        if (stars.countActive(true) === 0) {
            stars.children.iterate(function (child) {

                child.enableBody(true, child.x, 0, true, true);

            });

            var x = (player.x < 650) ? Phaser.Math.Between(650, 800) : Phaser.Math.Between(0, 650);

            var bomb = bombs.create(x, 16, 'bomb');
            bomb.setBounce(1);
            bomb.setCollideWorldBounds(true);
            bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);

        }
    }

    //SCORES
    scoreText = this.add.text(16, 16, 'score: 0', {
        fontSize: '32px',
        fill: '#000'
    });

    //CHARACTER ANIMATIONS

    this.anims.create({
        key: 'left',
        frames: this.anims.generateFrameNumbers('bird', {
            start: 0,
            end: 3
        }),
        frameRate: 10,
        repeat: -1
    });

    this.anims.create({
        key: 'turn',
        frames: [{
            key: 'bird',
            frame: 4
        }],
        frameRate: 20
    });

    this.anims.create({
        key: 'right',
        frames: this.anims.generateFrameNumbers('bird', {
            start: 5,
            end: 8
        }),
        frameRate: 10,
        repeat: -1
    });

    cursors = this.input.keyboard.createCursorKeys();
}

//UPDATING BODY 

function update() {
    if (cursors.left.isDown) {
        player.setVelocityX(-160);

        player.anims.play('left', true);
    } else if (cursors.right.isDown) {
        player.setVelocityX(160);

        player.anims.play('right', true);
    } else {
        player.setVelocityX(0);

        player.anims.play('turn');
    }

    if (cursors.up.isDown && player.body.touching.down) {
        player.setVelocityY(-530);
    }
}