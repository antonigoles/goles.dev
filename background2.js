(() => { 
const canvas = $(".background-canvas");
const ctx = canvas.getContext("2d");
const boatImage = new Image();
boatImage.src = "./boat.png";

let scrollShift = 0;


function waveFunction(x) {
    let a = 2.8;
    let u = 1.2;
    let k1 = 1.1;
    let k2 = 2.5
    return ((1/a) * (Math.cos(x/k1) + Math.cos(x/k2)) + u)/6;
}

function waveFunctionDeriviative(x) 
{
    h = 0.00000009;
    let y1 = waveFunction(x);
    let y2 = waveFunction(x+h)
    return (y2-y1)/h;
}

function drawWave(t, color) {
    for ( let x = 0; x<canvas.width; x++ ) {
        let v = waveFunction(t + x/400);
        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.lineWidth = 5;
        ctx.moveTo(x, canvas.height*(1-v) - scrollShift);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }
}


let boatPosition = [200,0];
let boatClickCounter = 0;
let boatShift = 0;
let boatBumpInterval = null;

function playBoatBumpAnimation() {
    let progress = 0;
    if ( boatBumpInterval != null ) return;
    boatClickCounter++;
    if ( boatClickCounter > 5 ) {
        boatBumpInterval = setInterval( () => {
            let length = 25000;
            progress += 6;
            const f = (x) => -1*(x-1)**2+1;
            boatShift = 2000 * f(progress/length);
            if ( progress/length >= 1 ) {
                clearInterval(boatBumpInterval)
                boatBumpInterval = null;
            }
        }, 6)
        return;
    }
    let seed = Math.random();
    boatBumpInterval = setInterval( () => {
        let length = 700;
        progress += 6;
        const f = (x) => -4*(x-0.5)**2+1;
        boatShift = (20 + 20*seed) * f(progress/length);
        if ( progress/length >= 1 ) {
            clearInterval(boatBumpInterval)
            boatBumpInterval = null;
        }
    }, 6)
}

function drawBoat(t) {
    ctx.beginPath();
    let x = 200; 
    let v = waveFunction(t + x/400);
    let y = canvas.height*(1-v) - scrollShift
    boatPosition = [x,y-75+boatShift];

    let slope = waveFunctionDeriviative(t + x/400);
    let angle = Math.atan(-slope);
    // console.log(angle)

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle * Math.PI);
    ctx.translate(-x,-y);
    ctx.drawImage(boatImage, x-75, y-150+boatShift, 150, 150);
    ctx.restore();
}

function textAnimation(t) {
    // let v = (1+waveFunction(t + 800/400))/1.2;
    // let y = canvas.height*(1-v) - scrollShift
    // $(".name-header>p").style["transform"] = `translate(0px, ${y}px)`
}

function canvasAnimationLoop(t, dt)
{
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    drawWave((t+200)/1600, "rgba(131,58,180,0.1)")
    drawWave((t-500)/1600, "rgba(252,176,69,0.1)")
    drawBoat(t/1600);
    drawWave(t/1600, "rgba(253,29,29,0.1)")
    textAnimation(t/1600)
    requestAnimationFrame((t2) => canvasAnimationLoop(t2, t2-t))
}



addEventListener("scroll", () => {
    scrollShift = window.scrollY;
})

window.addEventListener("mousemove", e=> {
    let distance = Math.sqrt((e.pageX-boatPosition[0])**2 + (e.pageY-(boatPosition[1]+scrollShift))**2);
    if ( distance < 80 ) document.body.style.cursor = "pointer";
    else document.body.style.cursor = "";
})

window.addEventListener("click", (e) => {
    let distance = Math.sqrt((e.pageX-boatPosition[0])**2 + (e.pageY-(boatPosition[1]+scrollShift))**2);
    if ( distance < 80 ) {
        playBoatBumpAnimation();
    }
})

canvasAnimationLoop()

})();