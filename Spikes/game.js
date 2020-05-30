// retrieve document's canvas to draw to
const canvas = document.getElementById("canvas");
const context = canvas.getContext("2d");
const framerate = 60;

// initialize canvas size
canvas.height = 500;
canvas.width = 500;

// spike properties
let spikeWidth = 20;
let spikeHeight = 30;
let spikeX;
let spikeY;

// list of spikes
let spikeCount;
let spikes = [];

// player score
let score = 0;

// spike declaration
class Spike {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = spikeWidth;
        this.height = spikeHeight;
        
        if (this.x < canvas.width / 2) {
            this.v1x = this.x;
            this.v1y = this.y;
            this.v2x = this.width;
            this.v2y = this.y + this.height / 2;
            this.v3x = this.x;
            this.v3y = this.y + this.height;
        }
        else {
            this.v1x = canvas.width;
            this.v1y = this.y;
            this.v2x = canvas.width - this.width;
            this.v2y = this.y + this.height / 2;
            this.v3x = canvas.width;
            this.v3y = this.y + this.height;
        }
    }
    drawTriangle() {
        context.fillStyle = "#23F0C7";

        context.beginPath();
        context.moveTo(this.v1x, this.v1y);
        context.lineTo(this.v2x, this.v2y);
        context.lineTo(this.v3x, this.v3y);
        context.closePath();

        context.fill();
    }
}

// player declaration
const player = {
    x : canvas.width / 2,
    y : canvas.height / 2,
    radius : 20,
    velX : 5,
    velY : 2,
    jumpForce : 10,
    gravity: 0.5
};

// draws rectangle of given size
function drawRect(x, y, w, h, color) {
    context.fillStyle = color;
    context.fillRect(x, y, w, h);
}

// draws circle of given radius
function drawCircle(x, y, r, color) {
    context.fillStyle = color;

    context.beginPath();
    context.arc(x, y, r, 0, Math.PI * 2, false);
    context.closePath();

    context.fill();
}

// draws text to screen
function drawText(text, color) {
    context.fillStyle = color;
    context.font = "700 10em Poppins";
    context.textBaseline = 'middle';
    context.textAlign = "center"; 
    context.fillText(text, canvas.width / 2, canvas.height / 2 + 20);
}

// checks for overlapping spikes
function overlaps() {
    for (let i = 0; i < spikes.length; i++) {
        if ((spikes[i].y < spikeY && (spikes[i].y + spikes[i].height) > spikeY)
        ||  (spikes[i].y < (spikeY + spikeHeight) && spikes[i].y > spikeY))
            return true;
    }
    return false;
}

// checks player-spike collision
function collides() {
    for (let i = 0; i < spikes.length; i++) {
        // spike vertex within player
        let c1x = player.x - spikes[i].v1x;
        let c1y = player.y - spikes[i].v1y;
        if (c1x * c1x + c1y * c1y - player.radius * player.radius <= 0)
            return true;

        let c2x = player.x - spikes[i].v2x;
        let c2y = player.y - spikes[i].v2y;
        if (c2x * c2x + c2y * c2y - player.radius * player.radius <= 0)
            return true;

        let c3x = player.x - spikes[i].v3x;
        let c3y = player.y - spikes[i].v3y;
        if (c3x * c3x + c3y * c3y - player.radius * player.radius <= 0)
            return true;

        // player center withing spike
        let e1x = spikes[i].v2x - spikes[i].v1x;
        let e1y = spikes[i].v2y - spikes[i].v1y;

        let e2x = spikes[i].v3x - spikes[i].v2x;
        let e2y = spikes[i].v3y - spikes[i].v2y;

        let e3x = spikes[i].v1x - spikes[i].v3x;
        let e3y = spikes[i].v1y - spikes[i].v3y;

        if (e1y * c1x - e1x * c1y >= 0 && e2y * c2x - e2x * c2y >= 0 && e3y * c3x - e3x * c3y >= 0)
            return true;
    }
    return false;
}

// generates random amount of spikes at random positions
function generateSpikes() {
    // removes all current spikes
    spikes = [];
    // picks number of spikes
    spikeCount = (Math.random() * 5) + 1;
    for (let i = 0; i < spikeCount; i++) {
        do {
            spikeY = ((Math.random() * 14) + 1) * spikeHeight;
        } while(overlaps());
        let temp = new Spike(spikeX, spikeY);
        spikes.push(temp);
    }
}

// draws each individual spike to the screen
function drawSpikes() {
    for (let i = 0; i < spikes.length; i++) {
        spikes[i].drawTriangle();
    }
}

// draws frames to canvas
function draw() {
    // clears screen
    drawRect(0, 0, canvas.width, canvas.height, "#EA3546");
    // draws spikes
        drawSpikes();
    // draws player
    drawCircle(player.x, player.y, player.radius, "#F7E733");
    // draws score
    drawText(score, "#00000050");
}

// checks for mouse clicks
window.addEventListener("mousedown", jump);

// simulates jump (negative gravity)
function jump() {
    player.velY = -player.jumpForce;
}

// sets player's properties to default
function resetGame() {
    player.x = canvas.width / 2;
    player.y = canvas.height / 2;
    player.velX = 5;
    player.velY = 2;
    spikeCount = 0;
    spikes = [];
    score = 0;
}

// updates game properties
function update() {
    // updates player's position
    player.x += player.velX;
    player.y += player.velY;

    // increases vertical veolocity (simulates gravity)
    player.velY += player.gravity;

    // switches direction if bounds hit
    if (player.x + player.radius > canvas.width || player.x - player.radius < 0) {
        player.velX *= -1;
        score++;

        if (player.x > canvas.width / 2)
            spikeX = 0;
        else
            spikeX = canvas.width - spikeWidth * 2;

        generateSpikes();
    }

    // game over
    if (player.y + player.radius > canvas.height || player.y - player.radius < 0 || collides())
        resetGame();
}

// repeats game logic
function loop() {
    update();
    draw();
}

// updates every *framerate* frames
setInterval(loop, 1000 / framerate);