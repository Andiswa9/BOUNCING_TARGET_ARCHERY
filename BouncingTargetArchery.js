const canvas = document.getElementById("glCanvas");
const gl = canvas.getContext("webgl");

const gameOverScreen = document.getElementById("gameOverScreen");
const restartBtn = document.getElementById("restartBtn");
const hud = document.getElementById("hud");

function resizeCanvas(){
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    gl.viewport(0, 0, canvas.width, canvas.height);
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

// Clear Color (sky fallback)
gl.clearColor(0.7, 0.9, 1.0, 1.0);

//******************************//
// Shaders
//******************************//
const vertexShaderSource = `
attribute vec2 pos;
attribute vec3 color;
uniform mat4 u_matrix;
varying vec3 v_color;

void main(){
gl_Position = u_matrix * vec4(pos, 0.0, 1.0);
v_color = color; 
}`;

const fragmentShaderSource = `
precision mediump float;
varying vec3 v_color;

void main(){
gl_FragColor = vec4(v_color, 1.0);
}`;

function createShader(type, source){
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    return shader;
}

const vertexShader = createShader(gl.VERTEX_SHADER, vertexShaderSource);
const fragmentShader = createShader(gl.FRAGMENT_SHADER, fragmentShaderSource);

const program = gl.createProgram();
gl.attachShader(program, vertexShader);
gl.attachShader(program, fragmentShader);
gl.linkProgram(program);
gl.useProgram(program);

//**************************//
//LOCATIONS
//**************************//
const posLocation = gl.getAttribLocation(program, "pos");
const colorLocation = gl.getAttribLocation(program, "color");
const matrixLocation = gl.getUniformLocation(program, "u_matrix");

//*******************************//
//BACKGROUND VERTICES (Sky, Grass, Trees)
//*******************************//
    const vertices = new Float32Array([

    // Formatting data
    // x, y,      r, g, b
    // Drawing the Sky
    -1.0, 1.0,   0.6, 0.85, 1.0, 
    -1.0, 0.0,   0.6, 0.85, 1.0, 
     1.0, 1.0,   0.6, 0.85, 1.0, 

     1.0, 1.0,   0.6, 0.85, 1.0, 
    -1.0, 0.0,   0.6, 0.85, 1.0, 
     1.0, 0.0,   0.6, 0.85, 1.0, 

     // Grass
    -1.0,  0.0,   0.2, 0.7, 0.2, 
    -1.0, -1.0,   0.2, 0.7, 0.2,
     1.0,  0.0,   0.2, 0.7, 0.2,

     1.0,  0.0,   0.2, 0.7, 0.2,
    -1.0, -1.0,   0.2, 0.7, 0.2,
     1.0, -1.0,   0.2, 0.7, 0.2,

    //Tree 1 trunk
    -0.8, -0.2,   0.55, 0.27, 0.07,
    -0.75,-0.2,   0.55, 0.27, 0.07,
    -0.8,  0.1,   0.55, 0.27, 0.07,

    -0.75,-0.2,   0.55, 0.27, 0.07,
    -0.8,  0.1,   0.55, 0.27, 0.07,
    -0.75, 0.1,   0.55, 0.27, 0.07,

    // Tree 1 leaves
    -0.9,  0.1,    0.0, 0.5, 0.0,
    -0.65, 0.1,    0.0, 0.5, 0.0,
    -0.775,0.35,   0.0, 0.5, 0.0,

    // Tree 2 trunk
    0.1, -0.2,     0.55, 0.27, 0.07, 
    0.15,-0.2,     0.55, 0.27, 0.07, 
    0.1,  0.1,     0.55, 0.27, 0.07,

    0.15,-0.2,     0.55, 0.27, 0.07,
    0.1,  0.1,     0.55, 0.27, 0.07,
    0.15, 0.1,     0.55, 0.27, 0.07,
    
    // Tree 2 leaves
    0.05, 0.1,     0.0, 0.5, 0.0, 
    0.20, 0.1,     0.0, 0.5, 0.0, 
    0.125,0.35,    0.0, 0.5, 0.0, 
]);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
    gl.uniformMatrix4fv(matrixLocation, false, identity());

    //****************************//
    //ARROW VERTICES
    //****************************//
    const arrowVertices = new Float32Array([
    //Shaft -- light brown
    -0.02, -0.01,  0.78, 0.60, 0.42, 
     0.12, -0.01,  0.78, 0.60, 0.42, 
    -0.02,  0.01,  0.78, 0.60, 0.42, 

    -0.02,  0.01,  0.78, 0.60, 0.42, 
     0.12, -0.01,  0.78, 0.60, 0.42, 
     0.12,  0.01,  0.78, 0.60, 0.42, 

     //Arrow Head -- silver
     0.12, -0.03,  0.8, 0.8, 0.8, 
     0.18,  0.0,   0.8, 0.8, 0.8, 
     0.12, 0.03,   0.8, 0.8, 0.8, 

     //Fletching Left -- red
    -0.05, 0.015,  1.0, 0.0, 0.0, 
    -0.02, 0.01,   1.0, 0.0, 0.0, 
    -0.02, 0.03,   1.0, 0.0, 0.0, 

    //Fletchin right -- red
    -0.05, -0.015,  1.0, 0.0, 0.0, 
    -0.02, -0.01,   1.0, 0.0, 0.0, 
    -0.02, -0.03,   1.0, 0.0, 0.0

]);

const arrowBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, arrowBuffer);
gl.bufferData(gl.ARRAY_BUFFER, arrowVertices, gl.STATIC_DRAW);

//*********************************//
//TARGET -- red
//*********************************//
function createCircle(radius, color, segments = 50){
    const vertices = [];

    // center vertex
    vertices.push(0, 0, color[0], color[1], color[2]);

    for(let i = 0; i <= segments; i++){
        let angle = i/segments * Math.PI*2;

        //Outer vertex
        vertices.push(
            Math.cos(angle) * radius,
            Math.sin(angle) * radius,
            color[0], color[1], color[2]
        );
        
    }
    return new Float32Array(vertices);
}

const layers = [
    {radius: 0.15, score: 25, color: [1.0, 0.0, 0.0]} //red
];

const circleBuffers = [];
layers.forEach(layer => {
    const circle = createCircle(layer.radius, layer.color);
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, circle, gl.STATIC_DRAW);
    circleBuffers.push({
        buffer: buffer, 
        count: circle.length / 5
    });
});

//*********************************//
//GAME STATE
//*********************************//
//let gameState = "menu";
// "menu" | "playing" | "gameOver"

let targetX = 0.7;
let targetY = 0.0;
let targetSpeed = 0.01;
let targetDirection = 1;
let targetAngle = 0;

let arrowX = -0.8
let arrowY = -0.2;
let arrowFlying = false;
let arrowDX = 0;
let arrowDY = 0;
let arrowAngle = 0;
let arrowSpeed = 0.5;

let level = 1;
let score = 0;
let lives = 5;

let gameState = "playing"; //playing | gameOver | win
let particles = [];

let mouseDown = false;

let power = 0;
let rainParticles = [];
let snowParticles = [];

let TARGET_RADIUS = 0.15;

//**************************************//
//MOUSE CONTROL
//**************************************//

canvas.addEventListener("mousedown", ()=> {
    if(!arrowFlying && gameState === "playing"){
        mouseDown = true;

    }
});

canvas.addEventListener("mouseup", ()=> {
    if(!arrowFlying && gameState === "playing"){
        
        if(power < 0.2) power = 0.2;

        const dx = targetX - arrowX;
        const dy = targetY - arrowY;

        const length = Math.sqrt(dx*dx + dy*dy);

        arrowDX = dx * power * arrowSpeed;
        arrowDY = dy * power * arrowSpeed;

        arrowFlying = true;
        power = 0;
    }
    mouseDown = false;
});

canvas.addEventListener("mousemove", function(e) {

    if(!arrowFlying && gameState === "playing"){
        const rect = canvas.getBoundingClientRect();
        const mouseX = (e.clientX - rect.left) / canvas.width * 2 - 1;
        const mouseY = -((e.clientY - rect.top) / canvas.height * 2 - 1);

        const dx = mouseX - arrowX;
        const dy = mouseY - arrowY;

        targetAngle = Math.atan2(dy, dx);
    }
});

        //**************************************//
        //BUTTONS
        //**************************************//
        document.getElementById("restartBtn").onclick = () => {
            resetGame();
            restartBtn.style.display = "none"
        };

        restartBtn.addEventListener("click", () => {
            score = 0;
            level = 1;
            lives = 5;
            arrowFlying = false;
            gameState = "playing";

            arrowX = -0.8;
            arrowY = -0.2;
            arrowDX = 0;
            arrowDY = 0;

            gameOverScreen.style.display = "none";
            restartBtn.style.display = "none";
        });

        //**************************************//
        //SOUNDS
        //**************************************//
        const hitSound = document.getElementById("hitSound");
        const missSound = document.getElementById("missSound");

//*********************************//
//MATRIX
//*********************************//
   function identity(){
    return new Float32Array([
        1, 0, 0, 0, 
        0, 1, 0, 0, 
        0, 0, 1, 0, 
        0, 0, 0, 1 
    ]);
   }

    function translate(Tx, Ty, Tz){
    return new Float32Array([
        1, 0, 0, 0, 
        0, 1, 0, 0, 
        0, 0, 1, 0, 
        Tx,Ty,Tz,1
    ]);
}

   function rotate(angle){
    const c = Math.cos(angle);
    const s = Math.sin(angle);
    return new Float32Array([
         c, s, 0, 0, 
        -s, c, 0, 0, 
         0, 0, 1, 0, 
         0, 0, 0, 1
    ]);
   }

   function multiply(A, B){
    const out = new Float32Array(16);
    for(let i = 0; i < 4; i++){
        for(let j = 0; j < 4; j++){
            out[i * 4 + j] = 
            A[i * 4 + 0] * B[0 * 4 + j] + 
            A[i * 4 + 1] * B[1 * 4 + j] + 
            A[i * 4 + 2] * B[2 * 4 + j] + 
            A[i * 4 + 3] * B[3 * 4 + j];
        }
    }
    return out;
   }

   //*******************************//
   //EXPLOSION
   //*******************************//

   function createExplosion(x, y){
    for(let i = 0; i < 25; i++){
        particles.push({
            x: x,
            y: y,
            dx: (Math.random() - 0.5) * 0.05,
            dy: (Math.random() - 0.5) * 0.05,
            life: 1.0
        });
    }
}

   //*********************************//
   //RESET
   //**********************************//
   function resetGame(){
    score = 0;
    level = 1;
    lives = 5;
    targetSpeed = 0.01;

    arrowX = -0.8;
    arrowY = -0.2;
    arrowFlying = false;

    gameState = "playing";
    gameOverScreen.style.display = "none";
   }

   //********************************//
   //WEATHER
   //********************************//
   function createRain() {
       rainParticles = [];
       for(let i = 0; i < 120; i++){
        rainParticles.push({
            x: Math.random() * 2 - 1,
            y: Math.random() * 2 - 1,
            speed: 0.02 + 
            Math.random() * 0.02
        });
        
       }
   }

   function createSnow() {
    snowParticles = [];
    for(let i = 0; i < 180; i++){
        snowParticles.push({
            x: Math.random() * 2 - 1,
            y: Math.random() * 2 - 1, 
            speed: 0.004 + 
            Math.random() * 0.006
        });
    }
   }

//********************************//
//DRAW LOOP
//********************************//
function draw(){

    gl.uniformMatrix4fv(matrixLocation, false, identity());

    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);

    //Position
    gl.vertexAttribPointer(posLocation, 2, gl.FLOAT, false, 5 * 4, 0);
    gl.enableVertexAttribArray(posLocation);

    //Color
    gl.vertexAttribPointer(colorLocation, 3, gl.FLOAT, false, 5 * 4, 2 * 4);
    gl.enableVertexAttribArray(colorLocation);

    //SKY
    gl.drawArrays(gl.TRIANGLES, 0, 6);

    //GRASS
    gl.drawArrays(gl.TRIANGLES, 6, 6);

    //TREE 1 TRUNK 
    gl.drawArrays(gl.TRIANGLES, 12, 6);

    // TREE 1 LEAVES
    gl.drawArrays(gl.TRIANGLES, 18, 3);

    // TREE 2 TRUNK
    gl.drawArrays(gl.TRIANGLES, 21, 6);

    // TREE 2 LEAVES
    gl.drawArrays(gl.TRIANGLES, 27, 3);

    if(mouseDown && !arrowFlying){
        power += 0.01;
        if(power > 1) power = 1;
    }


    //*********** TARGET ************//
    //           BOUNCING            //
    //*******************************//

    if(gameState === "playing"){
        targetY += targetSpeed * targetDirection;

        if(targetY > 0.8 )
        targetDirection = -1;

        if(targetY < -0.8)
        targetDirection = 1;
       }

       const targetMatrix = translate(targetX, targetY, 0);
       gl.uniformMatrix4fv(matrixLocation, false, targetMatrix);

       layers.forEach((layer, index ) => {

        gl.bindBuffer(gl.ARRAY_BUFFER, circleBuffers[index].buffer);

        //Circle attributes
        gl.vertexAttribPointer(posLocation, 2, gl.FLOAT, false, 5 * 4, 0);
        gl.enableVertexAttribArray(posLocation);

        gl.vertexAttribPointer(colorLocation, 3, gl.FLOAT, false, 5 * 4, 2 * 4);
        gl.enableVertexAttribArray(colorLocation);
        gl.drawArrays(gl.TRIANGLE_FAN, 0, circleBuffers[index].count);

        gl.uniformMatrix4fv(matrixLocation, false, identity());
    });

    //*************************************//
    //RAIN EFFECT
    //*************************************//
    if(level >= 2){
        rainParticles.forEach(p => {
            p.y -= p.speed;
            if(p.y < -1){
                p.y = 1;
                p.x = Math.random() * 2 - 1;
            }

            const matrix = translate(p.x, p.y,  0);
            gl.uniformMatrix4fv(matrixLocation, false, matrix);

            const rainData = new Float32Array([
                0, 0,  0.6, 0.8, 1,
                0, -0.04, 0.6, 0.8, 1, 
                0.005, -0.04, 0.6, 0.8, 1
            ]);

            const rainBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, rainBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, rainData, gl.STREAM_DRAW);

            gl.vertexAttribPointer(posLocation, 2, gl.FLOAT, false, 5 * 4, 0);
            gl.enableVertexAttribArray(posLocation);

            gl.vertexAttribPointer(colorLocation, 3, gl.FLOAT, false, 5 * 4, 2 * 4);
            gl.enableVertexAttribArray(colorLocation);

            gl.drawArrays(gl.TRIANGLES, 0, 3);
        });
    }

    //************************************//
    //SNOW EFFECT
    //************************************//
    if(level >=  3){
        snowParticles.forEach(p =>{
            p.y -= p.speed;
            p.x += Math.sin(Date.now() * 0.001) * 0.0005;

            if(p.y < -1){
                p.y = 1;
                p.x = Math.random() * 2 - 1;
            }
            const matrix = translate(p.x, p.y, 0);
            gl.uniformMatrix4fv(matrixLocation, false, matrix);

            const snowData = new Float32Array([
                0, 0,   1, 1, 1,
                0.1, 0,  1, 1, 1, 
                0.01, 0.01, 1, 1, 1
            ]);
            const snowBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, snowBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, snowData, gl.STREAM_DRAW);
            
            gl.vertexAttribPointer(posLocation, 2, gl.FLOAT, false, 5 * 4, 0);
            gl.enableVertexAttribArray(posLocation);

            gl.vertexAttribPointer(colorLocation, 3, gl.FLOAT, false, 5 * 4, 2 * 4);
            gl.enableVertexAttribArray(colorLocation);

            gl.drawArrays(gl.TRIANGLES, 0, 3);
        });
        arrowDX *= 0.999;

    }

     //**********************************//
     //           PARTICLES
     //**********************************//
     gl.enable(gl.BLEND);
     gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

      const particleData = new Float32Array([
            0, 0, 
            0.02, 0, 
            0, 0.02
        ]);

        const particleBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, particleBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, particleData, gl.STREAM_DRAW);
        
        function drawParticles() {
            particles.forEach(p => {
            p.x += p.dx;
            p.y += p.dy;
            p.life -= 0.02;

            if(p.life > 0){
                const matrix = translate(p.x, p.y, 0);
                gl.uniformMatrix4fv(matrixLocation, false, matrix);

                gl.bindBuffer(gl.ARRAY_BUFFER, particleBuffer);
                gl.vertexAttribPointer(posLocation, 2, gl.FLOAT, false, 0, 0);
                gl.enableVertexAttribArray(posLocation);

                gl.vertexAttrib3f(colorLocation, 1, 0.5, 0);

                gl.drawArrays(gl.TRIANGLES, 0, 3);
            }
        });
        particles = particles.filter(p => p.life > 0);
    }
    drawParticles();

    //********************************//
    // ARROW 
    //********************************//
    if(arrowFlying && gameState === "playing"){
        arrowX += arrowDX;
        arrowY += arrowDY;

        //Distance check
        const dx = arrowX - targetX;
        const dy = arrowY - targetY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        //Collision check
        const arrowTipX = arrowX + Math.cos(arrowAngle) * 0.18;
        const arrowTipY = arrowY + Math.sin(arrowAngle) * 0.18;

        const dxTip = arrowTipX - targetX;
        const dyTip = arrowTipY - targetY;
        const distanceTip = Math.sqrt(dxTip * dxTip + dyTip * dyTip);

            if (distance < TARGET_RADIUS || distanceTip <TARGET_RADIUS){
                
                score += 25;

                // CREATE EXPLOSION 
                createExplosion(targetX, targetY);

                //Level Up every 100 points
                const newLevel = Math.floor(score / 100) + 1;

                if(newLevel > level){
                    level = newLevel;
                    targetSpeed = 0.01 + (level - 1) * 0.005;

                    if(level === 2) createRain();
                    
                    if(level === 3) createSnow();
                    

                }

                arrowFlying = false;
                arrowX = -0.8;
                arrowY = -0.2;
                arrowDX = 0;
                arrowDY = 0;
                }

            //MISS

            else if(arrowX > 1.2 || arrowY > 1.2 || arrowY < -1.2){

            arrowFlying = false;
            arrowX = -0.8;
            arrowY = 0.0;
            arrowDX = 0;
            arrowDY = 0;
            lives--;

            if(lives <= 0){
                gameState = "gameOver";
                gameOverScreen.style.display = "flex";
                restartBtn.style.display = "block";
            }
        }
    }

     //**************************************//
     //DRAW ARROW
     //**************************************//

    arrowAngle += (targetAngle - arrowAngle) * 0.15;

    const rotation = rotate(arrowAngle);
    const translation = translate(arrowX, arrowY, 0);
    const finalMatrix = multiply(translation, rotation);

    //Arrow Draw 
     gl.uniformMatrix4fv(matrixLocation, false, finalMatrix);
     gl.bindBuffer(gl.ARRAY_BUFFER, arrowBuffer);

     gl.vertexAttribPointer(posLocation, 2, gl.FLOAT, false, 5 * 4, 0);
     gl.enableVertexAttribArray(posLocation);

     gl.vertexAttribPointer(colorLocation, 3, gl.FLOAT, false, 5 * 4, 2 * 4);
     gl.enableVertexAttribArray(colorLocation);
     
     gl.drawArrays(gl.TRIANGLES, 0, 15);

     
    //**********************************//
    //              HUD
    //**********************************// 
     if(gameState === "playing"){
        hud.innerText = `Score: ${score} | Level: ${level} | Lives: ${lives}`;
     }
     requestAnimationFrame(draw);

        }
        draw();
        


