// TODO:
// fill empty square on icon grid
// update bash script to handle keyboard interrupt and end server
// update icons
// check if meme is wider than window, then scale other way
// volume variable
// change window title for each washing

let numOfMemes = 5;
let numOfVO = 3;
let bgColour;
let highlights = [];
let categories = [ // names of folders containing media
    "White Washing",
    "Sports Washing",
    "Green Washing",
    "AI Washing",
    "Red Washing",
    "Blue Washing",
    "Purple Washing",
    "Vegan Washing",
    "Pink Washing"
];
let selector;
let cols = 5;
let rows = 2;
let mode = "menu";
let icons = [];
let menuTimer;
let captionEn;
let captionAr;
let idleCapEn;
let idleCapAr;

window.addEventListener('load', function () {
    captionEn = document.getElementById("captions-en");
    captionAr = document.getElementById("captions-ar");
    idleCapEn = captionEn.innerHTML;
    idleCapAr = captionAr.innerHTML;
});

function preload() {
    categories.forEach(category => {
        let memes = [];
        for (let i = 1; i <= numOfMemes; i++) {
            let meme = loadImage(`./assets/memes/${category}/${i}.jpeg`, (loadedImage) => {
                meme.resize(0, 620);
                memes[i-1] = meme;
            }, (error) => {
                console.log("could not find image file ", error);
            });
        }
        let voiceovers = [];
        for (let i = 1; i <= numOfVO; i++) {
            let voiceover = loadSound(`./assets/memes/${category}/audio/audio${i}.mp3`, (loadedAudio) => {
                voiceovers[i-1] = voiceover;
            }, (error) => {
                console.log("could not find audio file ", error);
            });
        }
        let captions = [];
        for (let i = 1; i <= numOfVO; i++) {
            fetch(`./assets/memes/${category}/audio/audio${i}.json`)
                .then(response => response.json())
                .then(jsonData => {
                    captions[i-1] = jsonData;
                })
                .catch(error => console.error("could not read caption json ", error));
        }
        highlights.push(new Highlight(category, memes, captions, voiceovers));
    });
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
}

function draw() {
    background(bgColour);
    if (mode == "menu") {
        icons.forEach(icon => {
            icon.draw();
        })
        selector.draw();
    } else if (mode == "highlight") {
        highlights[selector.selected].update();
        highlights[selector.selected].draw();
    }
}

function keyPressed() {
    if (keyCode === LEFT_ARROW) {
        if (mode == "menu") { selector.goLeft(); }
    } else if (keyCode === RIGHT_ARROW) {
        if (mode == "menu") { selector.goRight(); }
    } else if (keyCode === UP_ARROW) {
        if (mode == "menu") { selector.goUp(); }
    } else if (keyCode === DOWN_ARROW) {
        if (mode == "menu") { selector.goDown(); }
    } else if (keyCode === 32) { //space
        if (mode != "highlight") {
            mode = "highlight";
            highlights[selector.selected].start();
            menuTimer = setTimeout(() => {
                mode = "menu";
                highlights[selector.selected].reset();
            }, 37000); // return to menu after 35 secs
        }
    } else if (keyCode === ESCAPE) {
        mode = "menu";
        highlights[selector.selected].reset();
        clearTimeout(menuTimer);
    }
}

function createIconGrid() {
    for (let row = 0; row < 2; row++) {
        for (let col = 0; col < 5; col++) {
            if (col == 4 && row == 1) {
                break;
            }
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
        this.timers = [];
        this.playcount = 0;
        this.audioIndex = 0;
        this.captionTimers = [];
    }

    setCaptions(index) {
        console.log(this.captions[index]["sentences"]);
        this.captions[index]["sentences"].forEach((sentence) => {
            // console.log(sentence["start"]);
            this.captionTimers.push(setTimeout(() => {
                captionEn.innerHTML = sentence["sentence"];
                // captionEn.innerHTML = sentence["sentence"];
            }, sentence["start"] * 1000));
        });
    }

    reset() {
        this.audio[this.audioIndex].stop();
        this.title.reset();
        this.carousel.reset();
        captionEn.innerHTML = idleCapEn;
        captionAr.innerHTML = idleCapAr;
        // remove timers
        while (this.timers.length > 0) {
            clearTimeout(this.timers.pop());
        }
        while (this.captionTimers.length > 0) {
            clearTimeout(this.captionTimers.pop());
        }
    }

    start() {
        this.playcount++;
        this.audioIndex = this.playcount % 3;
        // start audio

        console.log(this.audio[this.audioIndex], this.audioIndex);
        this.audio[this.audioIndex].play();
        // time captions
        this.setCaptions(this.audioIndex);

        // animation timers
        // fade in title
        this.title.reset();
        this.title.fadeIn();
        // fade out title and fade in carousel
        this.timers.push(setTimeout(() => {
            this.title.fadeOut();
            this.carousel.fadeIn();
            this.carousel.next();
            // for each meme, 
            this.carousel.memes.forEach((meme, i) => {
                this.timers.push(setTimeout(() => {
                    // console.log(i);
                    this.carousel.next();
                }, 32000 * (i + 1) / this.carousel.memes.length));
            });
        }, 3000));
        this.timers.push(setTimeout(() => {
            this.carousel.fadeOut();
        }, 35000));
    }

    update() {
        this.title.update();
        this.carousel.update();
    }

    draw() {
        this.title.draw();
        this.carousel.draw();
    }
}

function toSeconds(frameCount) {
    return frameCount / getTargetFrameRate();
}

class Carousel {
    constructor(memes) {
        this.memes = memes;
        this.angle = 0; // 0-360
        this.targetAngle = 72;
        this.dAngle = 0.05;
        this.transparency = 0; // 0-255
        this.targetTransparency = 0;
        this.dTransparency = 0.05;
        this.position = 0;
    }

    fadeOut() {
        this.targetTransparency = 0;
    }

    fadeIn() {
        this.targetTransparency = 255;
    }

    next() {
        this.position++;
        if (this.position > this.memes.length) {
            // this.targetAngle -= 1080;
            // this.targetTransparency = 0;
        } else {
            let angleBetweenImages = 360 / this.memes.length;
            this.targetAngle -= angleBetweenImages + 360;
        }
        // console.log(this.position);
    }

    reset() {
        this.angle = 0;
        this.targetAngle = 72;
        this.transparency = 0;
        this.targetTransparency = 0;
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
        let angleBetweenImages = 360 / this.memes.length;
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
            x: width * 2,
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
            x: width * 2,
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
        imageMode(CENTER);
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