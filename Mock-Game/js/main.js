var config = {
    type: Phaser.AUTO,
    width: window.innerWidth,
    height: window.innerHeight,
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
    },
    scale: {
        mode: Phaser.Scale.RESIZE, // Adjust the game size when the window is resized
        autoCenter: Phaser.Scale.CENTER_BOTH, // Center the game in the window
    },
};

//INITIALIZING PHASER OBJECT WITH CONFIG
var game = new Phaser.Game(config);

//LOADING ASSETS
function preload() {
    this.load.image('sky', 'assets/sky.jpg');
    this.load.image('star', 'assets/star.png');
    this.load.image('bomb', 'assets/bomb.png');
    this.load.image('platform', 'assets/platform.png');
    this.load.spritesheet('hero',
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

    // Adding background image and making it responsive
    const background = this.add.image(0, 0, 'sky');
    background.setOrigin(0, 0);
    background.setDisplaySize(this.scale.width, this.scale.height);

    //Add platforms dynamically for game
    platforms.create(window.innerWidth/2, window.innerHeight, 'platform').setScale(5).refreshBody();

    const platformSpacing = window.innerHeight / 4;
    const screenWidth = window.innerWidth;

    const platformsData = [
        { x: screenWidth / 4, y: window.innerHeight - platformSpacing },       
        { x: screenWidth / 2, y: window.innerHeight - 2 * platformSpacing }, 
        { x: (3 * screenWidth) / 4, y: window.innerHeight - 3 * platformSpacing }
    ];

    platformsData.forEach(({ x, y }) => {
        platforms.create(x, y, 'platform');
    });


    // Adding the player
    player = this.physics.add.sprite(100, 450, 'hero');
    player.setCollideWorldBounds(true);
    player.body.setGravityY(300)


    // Adding stars
    const screenHeight = window.innerHeight;

    // Calculate the number of stars based on screen width
    const starSpacingX = 50;
    const starSpacingY = 100;
    const starsPerRow = Math.floor(screenWidth / starSpacingX);

    const totalStars = starsPerRow;

    stars = this.physics.add.group({
        key: 'star',
        repeat: totalStars - 1,
        setXY: {
            x: 0, 
            y: 0, 
            stepX: starSpacingX,
            stepY: starSpacingY,
        }
    });

    // Adjust the position of each star based on its row and column
    stars.getChildren().forEach((star, index) => {
        const row = Math.floor(index / starsPerRow);
        const column = index % starsPerRow;

        star.setX(column * starSpacingX + starSpacingX / 2);
        star.setY(row * starSpacingY + starSpacingY / 2);
    });

    stars.children.iterate(function (child) {
        child.setScale(0.05);
        child.setBounceY(Phaser.Math.FloatBetween(0.1, 0.3));

    });

    bombs = this.physics.add.group();

    // Add collission logic
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

    // Game score
    scoreText = this.add.text(16, 16, 'score: 0', {
        fontSize: '32px',
        fill: '#000'
    });

    // Character animations

    this.anims.create({
        key: 'left',
        frames: this.anims.generateFrameNumbers('hero', {
            start: 0,
            end: 3
        }),
        frameRate: 10,
        repeat: -1
    });

    this.anims.create({
        key: 'turn',
        frames: [{
            key: 'hero',
            frame: 4
        }],
        frameRate: 20
    });

    this.anims.create({
        key: 'right',
        frames: this.anims.generateFrameNumbers('hero', {
            start: 5,
            end: 8
        }),
        frameRate: 10,
        repeat: -1
    });

    cursors = this.input.keyboard.createCursorKeys();
}

// Updating movements

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