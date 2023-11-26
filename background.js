const canvas = $(".background-canvas");
const ctx = canvas.getContext("2d");


let stripes = [];

class Stripe
{
    speedBoost=1;
    constructor(x, y, z, length, height, opacity, velocity) {
        // console.log("Zesrąłem sie przez", x, velocity, length, height )
        Object.assign(this, {x,y,z,length,height,opacity,velocity})
    }

    progress(dt) {
        this.x += dt * this.velocity * this.speedBoost;
        if ( this.x-this.height >= canvas.width ) {
            this.x = -(this.length + this.height)
        }    

        let colors = [ rgba(131,58,180,1), rgba(253,29,29,1), rgba(252,176,69,1) ];
        let progress = minmax(0, 1, this.x / canvas.width);
        if ( progress <= 0.5 ) this.color = lerpRGBA( colors[0], colors[1], progress/0.5 );
        else this.color = lerpRGBA( colors[1], colors[2], (progress-0.5)/0.5 );

        // this.opacity = progress > 0.4 ? 1-(progress-0.4)/0.4 : this.opacity;
    }

    draw() {
        ctx.beginPath();
        let shift = 0.40;
        let color = this.color || rgba(128, 210, 227, 1);
        color = lerpRGBA(rgba(255,255,255, 1), color, minmax(0, 1, this.opacity-shift));
        // darken
        color = lerpRGBA(rgba(0,0,0, 1), color, 0.9);
        ctx.fillStyle = rgbaToString(color);
        // console.log(color)
        ctx.arc(this.x, this.y, this.height, 0, 2 * Math.PI);
        ctx.rect(this.x, this.y-this.height, this.length, 2*this.height);
        ctx.arc(this.x+this.length, this.y, this.height, 0, 2 * Math.PI);
        ctx.fill();
    }
}

function spawnRandomStripe()
{
    let x = randomRange(0, canvas.width);
    let y = randomRange(0, canvas.height);
    let z = randomRange(3, 14);
    let length = 100;
    let height = 80 * (1/z);
    let opacity = (1/z)**(1/120);
    let velocity = 0.018137 * (z**(4/5));

    stripes.push( new Stripe( x, y, z, length, height, opacity, velocity ) );
}

function progressAllStripes(dt)
{
    for ( const stripe of stripes ) {
        stripe.progress(dt);
        stripe.speedBoost = mouseVelocity ** 1.2;
        stripe.draw();
    }
}

function spawnStripes(count) {
    for ( let i = 0; i<count; i++ ) spawnRandomStripe();
    stripes = stripes.sort( (a,b) => b.z - a.z  );
}


let mouseVelocity = 0;
function canvasAnimationLoop(t, dt)
{
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    progressAllStripes(dt | 6);
    console.log(mouseVelocity);
    requestAnimationFrame((t2) => canvasAnimationLoop(t2, t2-t))
}

addEventListener("resize", ()=>{
    stripes = [];
    spawnStripes(10);
});
spawnStripes(10);
canvasAnimationLoop();

let lastMouseMoveTimestamp = Date.now();
let lastMousePos = 0;
let timer = 0;
document.addEventListener("mousemove", (e) => {
    clearTimeout(timer);
    setTimeout(()=>{mouseVelocity=0}, 100)
    mouseVelocity = Math.abs(e.movementX)
})