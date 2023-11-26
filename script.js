const $ = selector => document.querySelector(selector)

function updateOnWindowChange() {
    document.body.style.setProperty("--page-height", `${window.innerHeight}px`)
    document.body.style.setProperty("--page-width", `${window.innerWidth}px`)
    $(".background-canvas").width = window.innerWidth;
    $(".background-canvas").height = window.innerHeight;
}

updateOnWindowChange();
addEventListener("resize", updateOnWindowChange);
addEventListener("load", updateOnWindowChange);

function lerpFloat(start, end, progress) {
    return Math.round((start + (end-start)*progress)*10)/10;
} 

function lerpRGBA(start, end, progress) {
    return {
        r: lerpFloat(start.r, end.r, progress), 
        g: lerpFloat(start.g, end.g, progress), 
        b: lerpFloat(start.b, end.b, progress), 
        a: lerpFloat(start.a, end.a, progress) 
    }
}

function rgba(r,g,b,a) {
    return { r, g, b, a }
}

function rgbaToString(rgba) {
    return `rgba(${rgba.r},${rgba.g},${rgba.b},${rgba.a})`
}

class linearGradient3 {
    constructor(deg, color1, progress1, color2, progress2, color3, progress3) {
        Object.assign(this, {deg, color1, progress1, color2, progress2, color3, progress3})
    }

    toString() {
        return `linear-gradient(${this.deg}deg, ${rgbaToString(this.color1)} ${this.progress1}%, ${rgbaToString(this.color2)} ${this.progress2}%, ${rgbaToString(this.color3)} ${this.progress3}%)`
    }

    withOpacity(value) {
        let clone = Object.assign(new linearGradient3(), this);
        clone.color1.a *= value;
        clone.color2.a *= value;
        clone.color3.a *= value;
        return clone
    }
}
 
function lerpLinearGradient3(start, end, progress) {
    return new linearGradient3(
        lerpFloat(start.deg, end.deg, progress),
        lerpRGBA(start.color1, end.color1, progress),
        lerpFloat(start.progress1, end.progress1, progress),
        lerpRGBA(start.color2, end.color2, progress),
        lerpFloat(start.progress2, end.progress2, progress),
        lerpRGBA(start.color3, end.color3, progress),
        lerpFloat(start.progress3, end.progress3, progress),
    )
}

function randomRange(l, r) {
    return (l + Math.random()*(r-l))
}

function randomRGBA() {
    return rgba( randomRange(0, 255), randomRange(0, 255), randomRange(0, 255), 1 );
}

function getRandomGradient() {
    let a = 0;
    let b = 50//randomRange(0, 100);
    let c = 100;
    return new linearGradient3( randomRange(0,0), randomRGBA(), a, randomRGBA(), b, randomRGBA(), c,)
}

function colorAvg() {
    colors = [...arguments]
    let r = colors.reduce((a,c)=>a+c.r, 0)/colors.length
    let g = colors.reduce((a,c)=>a+c.g, 0)/colors.length
    let b = colors.reduce((a,c)=>a+c.b, 0)/colors.length
    let a = colors.reduce((a,c)=>a+c.a, 0)/colors.length
    return rgba(r,g,b,a);
}

window.animationState = {
    "header_gradient": { 
        gradientQueue: [
            new linearGradient3(90, rgba(131,58,180,1), 0, rgba(253,29,29,1), 50, rgba(252,176,69,1), 100),
            new linearGradient3(0, rgba(52, 232, 158, 1), 0, rgba(88,193,97,1), 50, rgba(15, 52, 67, 1), 100),
            new linearGradient3(0, rgba(52,200,134,1), 0, rgba(88,193,97,1), 50, rgba(253,187,45,1), 100),
        ],
        queueIndex: 0,
        progress: 0, 
        animationLength: 2500, 
        direction: 1 
    }
}

function animateHeaderGradient(deltaTime) {
    let state = animationState["header_gradient"];
    if ( state.progress >= state.animationLength ) {
        state.queueIndex = (state.queueIndex + 1 ) % state.gradientQueue.length;
        state.progress = 0;
    }
    state.progress = Math.max(0, Math.min(state.animationLength, state.progress + deltaTime));
    let t = (state.progress / state.animationLength);
    let progress = t

    // let begin = new linearGradient3(90, rgba(131,58,180,1), 0, rgba(253,29,29,1), 60, rgba(252,176,69,1), 100);
    // let final = new linearGradient3(0, rgba(52,200,134,1), 0, rgba(88,193,97,1), 26, rgba(253,187,45,1), 100);

    let begin = state.gradientQueue[state.queueIndex];
    let final = state.gradientQueue[(state.queueIndex + 1 ) % state.gradientQueue.length];
    // console.log(state.queueIndex)
    let grad = lerpLinearGradient3(begin, final, progress);
    $(".name-header>p").style.background = grad.toString();
    $(".name-header>p").style['backgroundClip'] = 'text';
    $(".name-header>p").style['-webkit-background-clip'] = 'text';
    let textshadowcolor = colorAvg(grad.color1, grad.color2, grad.color3)
    textshadowcolor.a = 0.2;
    $(".name-header>p").style['textShadow'] = `${rgbaToString(textshadowcolor)} 0px 0px 36px`;
    document.body.style["background"] = grad.withOpacity(0.08).toString();
    // console.log( colorAvg(grad.color1, grad.color2, grad.color3) )
    // console.log(lerpLinearGradient3(begin, final, progress).toString())
    // console.log($(".name-header>p").style.background)
    // console.log();
}


setInterval(()=>{
    // call all animations
    // animateHeaderGradient(16);
}, 16)

function minmax(min, max, v) {
    return Math.max(min, Math.min(max, v));
}

document.addEventListener("mousemove", (e) => {
    $(".name-header>p").style["transform"] = `translate(0,0)`
    let br = $(".name-header>p").getBoundingClientRect();
    let center = [br.x + br.width/2, br.y + br.height/2];
    let delta = [-e.clientX+center[0], -e.clientY+center[1]]
    let length = Math.sqrt(delta[0] * delta[0] + delta[1] * delta[1])
    let RANGE = 1050;
    length = minmax(0, RANGE, length+250)
    let progress = (1-((length)/RANGE))**3;

    let begin = new linearGradient3(90, rgba(131,58,180,1), 0, rgba(253,29,29,1), 50, rgba(252,176,69,1), 100);
    let final = new linearGradient3(0, rgba(52,200,134,1), 0, rgba(88,193,97,1), 26, rgba(253,187,45,1), 100);

    // console.log(state.queueIndex)
    // let grad = lerpLinearGradient3(begin, final, progress);
    // $(".name-header>p").style.background = grad.toString();
    // $(".name-header>p").style['backgroundClip'] = 'text';
    // $(".name-header>p").style['-webkit-background-clip'] = 'text';
    // $(".name-header>p").style["letter-spacing"] = `${2 - progress * 2}rem`
    // $(".name-header>p").style["line-height"] = `${13.5 - progress * 2}rem`
})