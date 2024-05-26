const audio = document.getElementById("audio");
const canvas = document.getElementById("canvas");

const timeOverlay = document.querySelector("#overlay .time");
const playBtn = document.querySelector("#overlay .time .btn.play");
const pauseBtn = document.querySelector("#overlay .time .btn.pause");


canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
let WIDTH = canvas.width;
let HEIGHT = canvas.height;
const ctx = canvas.getContext("2d");

const simplex = new SimplexNoise();

let context;
let src;
let analyser;
let bufferLength;
let dataArray;
let circles;



const nbParticles = 100;
let fftSize = 2048;

let radius;
let dPI = Math.PI * 2;

class Circle {
    constructor(index) {
        this.index = index;

        this.xR = Math.random();
        this.yR = Math.random();

        this.i = 0;
        this.value = 0;
    }

    update() {
        this.cachedValue = this.value;
        this.value = dataArray[this.index];

        if (this.value !== this.cachedValue) {
            this.xC = radius * (2 * this.xR) * Math.cos(this.index + this.i) + WIDTH / 2;
            this.yC =
                radius * (2 * this.yR) * Math.sin(this.index + this.i) + HEIGHT / 2;

            this.p = (210 - this.value) * 0.5;

            this.y = simplex.noise2D(this.xR, this.i) * this.p + this.yC;
            this.x = simplex.noise2D(this.yR, this.i) * this.p + this.xC;

            this.i += 0.01;
        }
    }

    draw() {
        if (this.value !== this.cachedValue) {
            this.rgb = getColor(this.value)
        }

        drawCircle(
            Math.round(this.x),
            Math.round(this.y),
            this.value * 0.1,
            this.rgb);

    }
}

const getColor = (size) => {
    switch (true) {
        case (size >= 25 && size <= 50):
            return 'rgb(255, 255, 0)'
        case (size > 50 && size <= 75):
            return 'rgb(255, 209, 48)'
        case (size > 75 && size <= 90):
            return 'rgb(217, 255, 218)'
        case (size > 90):
            return 'rgb(124, 248, 156)'
        default:
            return 'rgb(255, 255, 255)'
    }
}

 const createCircles = () => {
    return Array.from({ length: nbParticles }, (value, index) => new Circle(index))
}

const showCircles = () => {
    circles.forEach((circle) => {
        circle.update()
        circle.draw()
    })
}

const firstLaunch = () => {
    firstPlay = false;
    audio.load();
    audio.play();
    audio.volume = 0.5;
    context = new AudioContext();

    src = context.createMediaElementSource(audio);
    analyser = context.createAnalyser();
    src.connect(analyser);
    analyser.connect(context.destination);
    analyser.fftSize = fftSize;
    analyser.smoothingTimeConstant = 0.5;
    analyser.maxDecibels = -10;
    bufferLength = analyser.frequencyBinCount;
    dataArray = new Uint8Array(bufferLength);
    isPause = false;
    update();
    timeOverlay.classList.remove("pause");
    timeOverlay.classList.add("play");
}

let isPause = false;

pauseBtn.addEventListener("click",  () => {
    audio.pause();
    isPause = true;
    timeOverlay.classList.remove("play");
    timeOverlay.classList.add("pause");
});

let firstPlay = true;

playBtn.addEventListener("click",  () => {
    if (firstPlay) {
        firstLaunch()
    }
    audio.play();
    isPause = false;
    update();
    timeOverlay.classList.remove("pause");
    timeOverlay.classList.add("play");
});

const  update = () => {
    if (isPause === false) {
        analyser.getByteFrequencyData(dataArray);
        background('rgb(8, 17, 26)');
        radius = circles[3].value;
        showCircles();
        requestAnimationFrame(update);
    }
}

const background = (color) => {
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
}

const drawCircle = (x, y, size, fill) => {
    ctx.save();
    ctx.beginPath();
    ctx.fillStyle = fill;
    ctx.translate(x, y);
    ctx.arc(0, 0, size, 0, dPI);
    ctx.fill();
    ctx.closePath();
    ctx.restore();
}

window.addEventListener("resize",  () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    WIDTH = canvas.width;
    HEIGHT = canvas.height;
});

window.addEventListener("load", (event) => {
   circles = createCircles();
});
