let width = 1500;
let height = window.innerHeight;

const numBoids = 100;
let visualRange = document.getElementById("VR_Slider").value; //gets the oninput value // Visual Range
let centeringFactor = document.getElementById("CH_Slider").value / 10000; // Cohesion 0.007
let avoidFactor = document.getElementById("SP_Slider").value / 1000; // Seperartion  0.05
let matchingFactor = document.getElementById("CO_Slider").value / 1000; // Allignmen 0.05

var boids = [];

function initBoids() {
    for (var i = 0; i < numBoids; i += 1) {
        boids[boids.length] = {
            x: Math.random() * width,
            y: Math.random() * height,
            dx: Math.random() * 10 - 5,
            dy: Math.random() * 10 - 5,
            history: []
        };
    }
}
function distance(boid1, boid2) {
    return Math.sqrt(
        (boid1.x - boid2.x) * (boid1.x - boid2.x) +
        (boid1.y - boid2.y) * (boid1.y - boid2.y),
    );
}

function nClosestBoids(boid, n) {
    const sorted = boids.slice();
    sorted.sort((a, b) => distance(boid, a) - distance(boid, b));
    return sorted.slice(1, n + 1);
}

function sizeCanvas() {
    const canvas = document.getElementById("boids");
    width = window.innerWidth;
    height = document.getElementById('boid_canvas').offsetHeight / 1.25;
    canvas.width = width;
    canvas.height = height;
}

// Function to keep the boid folk within the frame of window
function keepWithinBounds(boid) {
    const margin = 200;
    const turnFactor = 1;

    if (boid.x < margin) {
        boid.dx += turnFactor;
    }
    if (boid.x > width - margin) {
        boid.dx -= turnFactor
    }
    if (boid.y < margin) {
        boid.dy += turnFactor;
    }
    if (boid.y > height - margin) {
        boid.dy -= turnFactor;
    }
}

function flyTowardsCenter(boid) // Cohesion
{
    let centerX = 0;
    let centerY = 0;
    let numNeighbors = 0;

    for (let otherBoid of boids) {
        if (distance(boid, otherBoid) < visualRange) {
            centerX += otherBoid.x;
            centerY += otherBoid.y;
            numNeighbors += 1;
        }
    }

    if (numNeighbors) {
        centerX = centerX / numNeighbors;
        centerY = centerY / numNeighbors;

        boid.dx += (centerX - boid.x) * centeringFactor;
        boid.dy += (centerY - boid.y) * centeringFactor;
    }
}

function avoidOthers(boid) // Seperation 
{
    const minDistance = 20;
    let moveX = 0;
    let moveY = 0;
    for (let otherBoid of boids) {
        if (otherBoid !== boid) {
            if (distance(boid, otherBoid) < minDistance) {
                moveX += boid.x - otherBoid.x;
                moveY += boid.y - otherBoid.y;
            }
        }
    }

    boid.dx += moveX * avoidFactor;
    boid.dy += moveY * avoidFactor;
}

function matchVelocity(boid) // Allignment
{
    let avgDX = 0;
    let avgDY = 0;
    let numNeighbors = 0;

    for (let otherBoid of boids) {
        if (distance(boid, otherBoid) < visualRange) {
            avgDX += otherBoid.dx;
            avgDY += otherBoid.dy;
            numNeighbors += 1;
        }
    }

    if (numNeighbors) {
        avgDX = avgDX / numNeighbors;
        avgDY = avgDY / numNeighbors;

        boid.dx += (avgDX - boid.dx) * matchingFactor;
        boid.dy += (avgDY - boid.dy) * matchingFactor;
    }
}

function limitSpeed(boid) {
    const speedLimit = 15;

    const speed = Math.sqrt(boid.dx * boid.dx + boid.dy * boid.dy);
    if (speed > speedLimit) {
        boid.dx = (boid.dx / speed) * speedLimit;
        boid.dy = (boid.dy / speed) * speedLimit;
    }
}

const DRAW_TRAIL = false;

function drawBoid(ctx, boid) {
    const angle = Math.atan2(boid.dy, boid.dx);
    ctx.translate(boid.x, boid.y);
    ctx.rotate(angle);
    ctx.translate(-boid.x, -boid.y);
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.moveTo(boid.x, boid.y);
    ctx.lineTo(boid.x - 10, boid.y + 4);
    ctx.lineTo(boid.x - 10, boid.y - 4);
    ctx.lineTo(boid.x, boid.y);
    ctx.fill();
    ctx.setTransform(1, 0, 0, 1, 0, 0);

    if (DRAW_TRAIL) {
        ctx.strokeStyle = "#cfcfcf66";
        ctx.beginPath();
        ctx.moveTo(boid.history[0][0], boid.history[0][1]);
        for (const point of boid.history) {
            ctx.lineTo(point[0], point[1]);
        }
        ctx.stroke();
    }
}

function updateValues(){
    visualRange = document.getElementById("VR_Slider").value; //gets the oninput value // Visual Range
    centeringFactor = document.getElementById("CH_Slider").value / 10000; // Cohesion 0.007
    avoidFactor = document.getElementById("SP_Slider").value / 1000; // Seperartion  0.05
}

function animationLoop() {
    updateValues();
    for (let boid of boids) {
        flyTowardsCenter(boid);
        avoidOthers(boid);
        matchVelocity(boid);
        limitSpeed(boid);
        keepWithinBounds(boid);

        boid.x += boid.dx;
        boid.y += boid.dy;
        boid.history.push([boid.x, boid.y])
        boid.history = boid.history.slice(-50);
    }
    const ctx = document.getElementById("boids").getContext("2d");
    ctx.clearRect(0, 0, width, height);
    for (let boid of boids) {
        drawBoid(ctx, boid);
    }

    window.requestAnimationFrame(animationLoop);
}

window.onload = () => {
    window.addEventListener("resize", sizeCanvas, false);
    sizeCanvas();
    initBoids();
    window.requestAnimationFrame(animationLoop);
};

