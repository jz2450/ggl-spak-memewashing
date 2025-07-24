// timeline animations
// handle multiple highlights
// add audio
// add captions
// hide cursor


let numOfMemes = 6;
let numOfVO = 1;
let bgColour;
let memes = [];
let voiceovers = [];
let icons = [];
let categories = [
    "White Washing",
    "Sports Washing",
    "Green Washing",
    "AI Washing",
    "Red Washing",
    "Blue Washing",
    "Purple Washing",
    "Bee Washing",
    "Vegan Washing",
    "Pink Washing"
];
let selector;
let cols = 5;
let rows = 2;
let mode = "menu";
// let highlight;
let highlights = [];

function preload() {
    // categories.forEach(category => {
    //     for (let i = 1; i <= numOfMemes; i++) {
    //         let meme = loadImage(`./assets/memes/${category}/${i}.jpg`, (loadedImage) => {
    //             memes.push(meme);
    //         }, (error) => {
    //             console.log("could not find file", error);
    //         });
    //     }
    // });

    // comment out when all memes are present
    for (let i = 1; i <= numOfMemes; i++) {
        let meme = loadImage(`./assets/memes/Green Washing/${i}.jpg`, (loadedImage) => {
            meme.resize(0, 640);
            memes.push(meme);
        }, (error) => {
            console.log("could not find file", error);
        });
    }
    for (let i = 1; i <= numOfVO; i++) {
        let voiceover = loadSound(`./assets/memes/Green Washing/audio/${i}.mp3`, (loadedAudio) => {
            voiceovers.push(voiceover);
        }, (error) => {
            console.log("could not find file", error);
        });
    }
}

function setup() {
    angleMode(DEGREES);
    let cnv = createCanvas(1000, 750);
    cnv.parent('mainwindow')
    // bgColour = color(31, 68, 118); // windows movie maker blue
    bgColour = color("#00807F"); // windows 95 teal
    background(bgColour);
    createIconGrid();
    selector = new Selector(0, 0);
    highlights.push(new Highlight("Green Washing", memes, "captionsjson", "audiofiles"));
}

function draw() {
    background(bgColour);
    if (mode == "menu") {
        icons.forEach(icon => {
            icon.draw();
        })
        selector.draw();
    } else if (mode == "highlight") {
        // highlights[0].update();
        highlights[0].draw();
    }
}

function mouseClicked() {
    highlights[0].progress();
    // voiceovers[0].play();
}

function keyPressed() {
    if (keyCode === LEFT_ARROW) {
        selector.goLeft();
    } else if (keyCode === RIGHT_ARROW) {
        selector.goRight();
    } else if (keyCode === UP_ARROW) {
        selector.goUp();
    } else if (keyCode === DOWN_ARROW) {
        selector.goDown();
    } else if (keyCode === 32) { //space
        mode = "highlight";
    } else if (keyCode === ESCAPE) {
        mode = "menu";
        highlights[selector.selected].reset();
    }
}

function createIconGrid() {
    for (let row = 0; row < 2; row++) {
        for (let col = 0; col < 5; col++) {
            let iconimage = loadImage(`./assets/memes/${categories[col + (row * 5)]}/icon.ico`)
            icons.push(new Icon(categories[col + (row * 5)], iconimage, col, row))
        }
    }
}

class Highlight {
    constructor(name, memes, captions, audio) {
        this.title = new Title(name);
        this.carousel = new Carousel(memes);
        this.memes = memes;
        this.captions = captions;
        this.audio = audio;
        this.frame = 0;
    }

    progress() {
        this.carousel.next();
    }

    reset() {
        this.frame = 0;
        this.title.reset();
        this.carousel.reset();
    }

    draw() { // timing animation elements
        this.frame++;
        if (toSeconds(this.frame) < 2) {
            this.title.fadeIn();
            this.title.update();
            this.title.draw();
        } else if (toSeconds(this.frame) < 4) {
            this.title.update();
            this.title.draw();
        } else if (toSeconds(this.frame) < 5) {
            this.title.fadeOut();
            this.title.update();
            this.title.draw();

            this.carousel.update();
            this.carousel.draw();
        } else if (true) {

            this.carousel.update();
            this.carousel.draw();
        }
    }
}

function toSeconds(frameCount) {
    return frameCount / getTargetFrameRate();
}

class Carousel {
    constructor(memes) {
        this.num = memes.length;
        this.memes = memes;
        this.angle = 0; // 0-360
        this.targetAngle = -720;
        this.dAngle = 0.05;
        this.transparency = 0; // 0-255
        this.targetTransparency = 255;
        this.dTransparency = 0.03;
        this.position = 0;
    }

    next() {
        this.position++;
        if (this.position >= this.num) {
            this.targetAngle -= 1080;
            this.targetTransparency = 0;
        } else {
            let angleBetweenImages = 360 / this.num;
            this.targetAngle -= angleBetweenImages;
        }

    }

    reset() {
        this.angle = 0;
        this.targetAngle = 360;
        this.transparency = 0;
        this.targetTransparency = 255;
        this.position = 0;
    }

    update() {
        this.angle += (this.targetAngle - this.angle) * this.dAngle;
        this.transparency += (this.targetTransparency - this.transparency) * this.dTransparency;
    }

    draw() {
        push();
        translate(width / 2, height * 3);
        imageMode(CENTER);
        let angleBetweenImages = 360 / this.num;
        this.memes.forEach((meme, i) => {
            push();
            rotate(i * angleBetweenImages + this.angle);
            translate(0, -height * 2.5);
            tint(255, this.transparency);
            image(meme, 0, 0);
            pop();
        });
        pop();
    }
}

class Title {
    constructor(string) {
        this.string = string;
        this.fgPos = {
            x: width * 2 / 3,
            y: height * 2 / 3
        }
        this.bgPos = {
            x: width / 4,
            y: height / 4
        }
        this.fadeMult = 0;
        this.targetMult = 255;
        this.dMult = 0.1;
        this.fontSize = 128;
    }

    fadeIn() {
        this.targetMult = 255;
    }

    fadeOut() {
        this.targetMult = 0;
    }

    update() {
        this.bgPos.x++;
        this.fgPos.x--;
        this.fadeMult += (this.targetMult - this.fadeMult) * this.dMult;
    }

    reset() {
        this.fgPos = {
            x: width * 2 / 3,
            y: height * 2 / 3
        }
        this.bgPos = {
            x: width / 4,
            y: height / 4
        }
        this.fadeMult = 0;
        this.targetTransparency = 0;
    }

    draw() {
        textAlign(CENTER, CENTER);
        // foreground text
        fill(255, 255, 255, 0.25 * this.fadeMult);
        textFont('Times', this.fontSize * 6);
        text(this.string, this.fgPos.x, this.fgPos.y);
        // background text
        fill(255, 255, 255, 0.5 * this.fadeMult);
        textFont('Times', this.fontSize * 2);
        text(this.string, this.bgPos.x, this.bgPos.y);
        // center text
        fill(255, 255, 255, 1 * this.fadeMult);
        textFont('Times', this.fontSize);
        text(this.string, width / 2, height / 2);
    }
}

class Icon {
    constructor(name, image, col, row) {
        this.name = name;
        this.image = image;
        this.col = col;
        this.row = row;
    }

    draw() {
        push();
        translate((this.col + 1) * width / (cols + 1), (this.row + 1) * height / (rows + 1))
        fill("white");
        // rect(-25, -50, 50, 50);
        image(this.image, -50, -100, 100, 100)
        textAlign(CENTER, TOP);
        textFont('Times');
        textSize(24);
        text(this.name, -50, 5, 100, 100);
        pop();
    }
}

class Selector {
    constructor(col, row) {
        this.col = col;
        this.row = row;
        this.cursor = loadImage("assets/Cursor active.ico");
    }

    get selected() {
        return (this.col + (this.row * cols));
    }

    draw() {
        push();
        translate((this.col + 1) * width / (cols + 1), (this.row + 1) * height / (rows + 1))
        noStroke();
        fill("rgba(0, 0, 255, 0.3)");
        rect(-60, -110, 120, 180);
        imageMode(CENTER, CENTER);
        image(this.cursor, -50, 0, 50, 50)
        pop();
    }

    goLeft() {
        this.col--;
        if (this.col < 0) { this.col = cols - 1 };
    }

    goRight() {
        this.col++;
        if (this.col > cols - 1) { this.col = 0 };
    }

    goUp() {
        this.row--;
        if (this.row < 0) { this.row = rows - 1 };
    }

    goDown() {
        this.row++;
        if (this.row > rows - 1) { this.row = 0 };
    }
}