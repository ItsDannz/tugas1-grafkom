import {
  Mat3
} from "./matrix3.js";

// tambahan : import fungsi update & gambar dari file atas.js.
import { updateAtas, drawAtas } from "./atas.js";

const canvas =
  document.getElementById(
    "webgl-canvas"
  );

const gl =
  canvas.getContext(
    "webgl2"
  );

if (!gl) {
  throw new Error(
    "WebGL2 tidak tersedia."
  );
}

gl.viewport(
  0,
  0,
  canvas.width,
  canvas.height
);

//vertex shader
const vertexShaderSource = `#version 300 es

in vec2 a_position;

in vec3 a_color;

uniform mat3 u_matrix;

out vec3 v_color;

void main() {
  vec3 p =
    u_matrix *
    vec3(
      a_position,
      1.0
    );

  gl_Position =
    vec4(
      p.xy,
      0.0,
      1.0
    );

  v_color =
    a_color;
}`;

//fragment shader
const fragmentShaderSource = `#version 300 es

precision highp float;

in vec3 v_color;

out vec4 outColor;

void main() {
  outColor =
    vec4(
      v_color,
      1.0
    );
}
`;

function createShader(
  gl,
  type,
  source
) {
  const shader =
    gl.createShader(type);

  gl.shaderSource(
    shader,
    source
  );

  gl.compileShader(
    shader
  );

  const success =
    gl.getShaderParameter(
      shader,
      gl.COMPILE_STATUS
    );

  if (!success) {
    const info =
      gl.getShaderInfoLog(
        shader
      );

    gl.deleteShader(
      shader
    );

    throw new Error(
      "Shader compile error:\n" +
      info
    );
  }

  return shader;
}

function createProgram(
  gl,
  vs,
  fs
) {
  const program =
    gl.createProgram();

  gl.attachShader(
    program,
    vs
  );

  gl.attachShader(
    program,
    fs
  );

  gl.linkProgram(
    program
  );

  const success =
    gl.getProgramParameter(
      program,
      gl.LINK_STATUS
    );

  if (!success) {
    const info =
      gl.getProgramInfoLog(
        program
      );

    gl.deleteProgram(
      program
    );

    throw new Error(
      "Program link error:\n" +
      info
    );
  }

  return program;
}

const vertexShader =
  createShader(
    gl,
    gl.VERTEX_SHADER,
    vertexShaderSource
  );

const fragmentShader =
  createShader(
    gl,
    gl.FRAGMENT_SHADER,
    fragmentShaderSource
  );

const program =
  createProgram(
    gl,
    vertexShader,
    fragmentShader
  );

gl.useProgram(
  program
);

const positionLocation =
  gl.getAttribLocation(
    program,
    "a_position"
  );

const colorLocation =
  gl.getAttribLocation(
    program,
    "a_color"
  );

const matrixLocation =
  gl.getUniformLocation(
    program,
    "u_matrix"
  );

const horizonX = 0.0, horizonY = -0.05; //titik hilang jalan

const positions = [
  //rumput
  -1.0, -1.0,
  1.0, -1.0,
  -1.0,  horizonY,
  1.0,  horizonY,

  //jalan
  0.16, -1.0,
  0.52, -1.0,
  horizonX, horizonY,

  0.52, -1.0,
  0.16, -1.0,
  horizonX, horizonY,

  //kotak kanan
  -0.3, -0.75,
  -0.11, -0.75,
  -0.3, -0.53,
  -0.11, -0.53,

  -0.3, -0.75,
  -0.11, -0.75,
  -0.11, -0.53,
  -0.3, -0.53,

  //kotak kiri
  -0.52, -0.70,
  -0.3, -0.75,
  -0.52, -0.50,
  -0.3, -0.53,

  -0.52, -0.70,
  -0.3, -0.75,
  -0.3, -0.53,
  -0.52, -0.50,

  //atap segitiga
  -0.32, -0.53,
  -0.09, -0.53,
  -0.205, -0.32,

  -0.32, -0.53,
  -0.09, -0.53,
  -0.205, -0.32,

  //atap kiri
  -0.54, -0.50,
  -0.32, -0.53,
  -0.44, -0.32,
  -0.205, -0.32,

  -0.54, -0.50,
  -0.32, -0.53,
  -0.205, -0.32,
  -0.44, -0.32,

  //pintu
  -0.14, -0.75,
  -0.19, -0.75,
  -0.14, -0.58,
  -0.19, -0.58,

  -0.14, -0.75,
  -0.19, -0.75,
  -0.19, -0.58,
  -0.14, -0.58,

  //jendela1
  -0.22, -0.68,
  -0.27, -0.68,
  -0.22, -0.58,
  -0.27, -0.58,

  -0.22, -0.68,
  -0.27, -0.68,
  -0.27, -0.58,
  -0.22, -0.58,

  //jendela2
  -0.32, -0.68,
  -0.36, -0.67,
  -0.32, -0.58,
  -0.36, -0.575,

  -0.32, -0.68,
  -0.36, -0.67,
  -0.36, -0.575,
  -0.32, -0.58,

  //jendela3
  -0.39, -0.67,
  -0.43, -0.66,
  -0.39, -0.57,
  -0.43, -0.565,

  -0.39, -0.67,
  -0.43, -0.66,
  -0.43, -0.565,
  -0.39, -0.57,

  //jendela4
  -0.46, -0.66,
  -0.50, -0.65,
  -0.46, -0.56,
  -0.50, -0.555,

  -0.46, -0.66,
  -0.50, -0.65,
  -0.50, -0.555,
  -0.46, -0.56,

  //batang
  -0.73, -0.70,
  -0.66, -0.70,
  -0.72, -0.40,
  -0.68, -0.40,

  -0.73, -0.70,
  -0.66, -0.70,
  -0.68, -0.40,
  -0.72, -0.40,

  //marka jalan
  0.3400, -1.0000,  0.3230, -0.9525,
  0.2975, -0.8812,  0.2805, -0.8337,
  0.2550, -0.7625,  0.2380, -0.7150,
  0.2125, -0.6437,  0.1955, -0.5962,
  0.1700, -0.5250, 0.1530, -0.4775,

  //padi
  0.26, -0.28, 0.30, -0.35,
  0.30, -0.35, 0.30, -0.26,

  0.55, -0.21, 0.58, -0.28,
  0.58, -0.28, 0.59, -0.19,

  0.63, -0.33, 0.67, -0.38,
  0.67, -0.38, 0.69, -0.32,

  0.43, -0.35, 0.46, -0.42,
  0.46, -0.42, 0.48, -0.365,

  0.54, -0.45, 0.57, -0.50,
  0.57, -0.50, 0.58, -0.43,

  0.38, -0.49, 0.41, -0.54,
  0.41, -0.54, 0.42, -0.47,

  0.46, -0.62, 0.50, -0.69,
  0.50, -0.69, 0.52, -0.63,

  0.51, -0.80, 0.55, -0.86,
  0.55, -0.86, 0.56, -0.79,

  0.57, -0.59, 0.605, -0.65,
  0.605, -0.65, 0.62, -0.55,

  0.60, -0.73, 0.63, -0.77,
  0.63, -0.77, 0.65, -0.71,

  0.62, -0.87, 0.65, -0.91,
  0.65, -0.91, 0.68, -0.86,

  0.67, -0.51, 0.72, -0.58,
  0.72, -0.58, 0.73, -0.52,

  0.73, -0.75, 0.75, -0.77,
  0.75, -0.77, 0.77, -0.71,

  0.81, -0.37, 0.84, -0.41,
  0.84, -0.41, 0.85, -0.34,

];

const colors = [
  //rumput
  0.55, 0.75, 0.45,
  0.55, 0.75, 0.45,
  0.55, 0.75, 0.45,
  0.55, 0.75, 0.45,

  //outline jalan
  0.65, 0.72, 0.66,
  0.65, 0.72, 0.66,
  0.65, 0.72, 0.66,

  0.0, 0.0, 0.0,
  0.0, 0.0, 0.0,
  0.0, 0.0, 0.0,

  //kotak kanan
  1, 1, 1,
  1, 1, 1,
  1, 1, 1,
  1, 1, 1,

  0.0, 0.0, 0.0,
  0.0, 0.0, 0.0,
  0.0, 0.0, 0.0,
  0.0, 0.0, 0.0,

  //kotak kiri
  1, 1, 1,
  1, 1, 1,
  1, 1, 1,
  1, 1, 1,

  0.0, 0.0, 0.0,
  0.0, 0.0, 0.0,
  0.0, 0.0, 0.0,
  0.0, 0.0, 0.0,

  //atap segitiga
  0.8, 0.3, 0.2,
  0.8, 0.3, 0.2,
  0.8, 0.3, 0.2,

  0.0, 0.0, 0.0,
  0.0, 0.0, 0.0,
  0.0, 0.0, 0.0,

  //atap kiri
  0.8, 0.3, 0.2,
  0.8, 0.3, 0.2,
  0.8, 0.3, 0.2,
  0.8, 0.3, 0.2,

  0.0, 0.0, 0.0,
  0.0, 0.0, 0.0,
  0.0, 0.0, 0.0,
  0.0, 0.0, 0.0,

  //pintu
  0.98, 1, 0.89,
  0.98, 1, 0.89,
  0.98, 1, 0.89,
  0.98, 1, 0.89,

  0.0, 0.0, 0.0,
  0.0, 0.0, 0.0,
  0.0, 0.0, 0.0,
  0.0, 0.0, 0.0,

  //jendela1
  0.98, 1, 0.89,
  0.98, 1, 0.89,
  0.98, 1, 0.89,
  0.98, 1, 0.89,

  0.0, 0.0, 0.0,
  0.0, 0.0, 0.0,
  0.0, 0.0, 0.0,
  0.0, 0.0, 0.0,

  //jendela2
  0.98, 1, 0.89,
  0.98, 1, 0.89,
  0.98, 1, 0.89,
  0.98, 1, 0.89,

  0.0, 0.0, 0.0,
  0.0, 0.0, 0.0,
  0.0, 0.0, 0.0,
  0.0, 0.0, 0.0,

  //jendela3
  0.98, 1, 0.89,
  0.98, 1, 0.89,
  0.98, 1, 0.89,
  0.98, 1, 0.89,

  0.0, 0.0, 0.0,
  0.0, 0.0, 0.0,
  0.0, 0.0, 0.0,
  0.0, 0.0, 0.0,

  //jendela4
  0.98, 1, 0.89,
  0.98, 1, 0.89,
  0.98, 1, 0.89,
  0.98, 1, 0.89,

  0.0, 0.0, 0.0,
  0.0, 0.0, 0.0,
  0.0, 0.0, 0.0,
  0.0, 0.0, 0.0,

  //batang
  0.15, 0.3, 0.15,
  0.15, 0.3, 0.15,
  0.15, 0.3, 0.15,
  0.15, 0.3, 0.15,

  0.0, 0.0, 0.0,
  0.0, 0.0, 0.0,
  0.0, 0.0, 0.0,
  0.0, 0.0, 0.0,

  //marka jalan
  0, 0, 0,
  0, 0, 0,
  0, 0, 0,
  0, 0, 0,
  0, 0, 0,
  0, 0, 0,
  0, 0, 0,
  0, 0, 0,
  0, 0, 0,
  0, 0, 0,


  //padi
  0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0,

  0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0,

  0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0,

  0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0,

  0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0,

  0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0,

  0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0,

  0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0,

  0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0,

  0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0,

  0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0,

  0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0,

  0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0,

  0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0,

];

//daun
const aspect = canvas.height / canvas.width;
const leafSegments = 16;
const leafFanCount = leafSegments + 2;

const leafUnit = 0.1; //ukuran daun
const leafBorder = 0.014; //tebal outline hitam
const trunkTopY = -0.40;  //titik atas batang

const leafCenterX = -0.70; //titik tengah daun
const leafCenterY = trunkTopY + 0.5 * leafUnit;  //ujung batang berada di dalam daun

//geser x, geser y, arah cekung, jari-jari
//0 = kanan, 90 = atas, 180 = kiri, 270 = bawah
const leafDomes = [
  [ 0.0,  0.0,   180, 1.6],
  [ 0.0,  0.0,     0, 1.6],
  [ 0.0,   0.85,   90, 1.1],
  [-1.17,  0.675, 150, 0.7],
  [ 1.17,  0.675,  30, 0.7],
  [-1.17, -0.675, 210, 0.7],
  [ 1.17, -0.675, 330, 0.7],
];

//hitung angle cekung
function addSemicircle(cx, cy, r, dirDeg, color) {
  positions.push(cx, cy);
  colors.push(color[0], color[1], color[2]);
  const start = ((dirDeg - 90) * Math.PI) / 180;
  for (let i = 0; i <= leafSegments; i++) {
    const angle = start + (Math.PI * i) / leafSegments;
    positions.push(cx + r * aspect * Math.cos(angle), cy + r * Math.sin(angle));
    colors.push(color[0], color[1], color[2]);
  }
}

const leafStart = positions.length / 2;

//setengah lingkaran hitam
for (const [ox, oy, deg, rad] of leafDomes) {
  addSemicircle(
    leafCenterX + ox * leafUnit * aspect,
    leafCenterY + oy * leafUnit,
    rad * leafUnit + leafBorder, deg, [0, 0, 0]
  );
}

//setengah lingkaran hijau
for (const [ox, oy, deg, rad] of leafDomes) {
  addSemicircle(
    leafCenterX + ox * leafUnit * aspect,
    leafCenterY + oy * leafUnit,
    rad * leafUnit, deg, [0.2, 0.75, 0.15]
  );
}

const allPositions = new Float32Array(positions);
const allColors = new Float32Array(colors);

//geometri bola
const ballAspect = canvas.height / canvas.width;
const ballSegments = 20;
const ballRadius = 0.045;
const ballColorValue = [0.95, 0.35, 0.25];

const ballVertexCount = ballSegments + 2; //1 titik pusat + (segmen+1) titik busur
const ballPositionsLocal = new Array(ballVertexCount * 2);
const ballColorsLocal = new Array(ballVertexCount * 3);

//buat titik pusat
ballPositionsLocal[0] = 0;
ballPositionsLocal[1] = 0;
ballColorsLocal[0] = ballColorValue[0];
ballColorsLocal[1] = ballColorValue[1];
ballColorsLocal[2] = ballColorValue[2];

//menentukan titik-titik busur bola
for (let i = 0; i <= ballSegments; i++) {
  const angle = (Math.PI * 2 * i) / ballSegments;
  const posIndex = (i + 1) * 2;
  const colIndex = (i + 1) * 3;

  ballPositionsLocal[posIndex] = Math.cos(angle) * ballRadius * ballAspect;
  ballPositionsLocal[posIndex + 1] = Math.sin(angle) * ballRadius;

  ballColorsLocal[colIndex] = ballColorValue[0];
  ballColorsLocal[colIndex + 1] = ballColorValue[1];
  ballColorsLocal[colIndex + 2] = ballColorValue[2];
}

//position buffer
const positionBuffer =
  gl.createBuffer();

gl.bindBuffer(
  gl.ARRAY_BUFFER,
  positionBuffer,
);

gl.bufferData(
  gl.ARRAY_BUFFER,
  allPositions,
  gl.STATIC_DRAW,
);

//color buffer
const colorBuffer =
  gl.createBuffer();

gl.bindBuffer(
  gl.ARRAY_BUFFER,
  colorBuffer,
);

gl.bufferData(
  gl.ARRAY_BUFFER,
  allColors,
  gl.STATIC_DRAW,
);

//position ball buffer
const ballPositionBuffer =
  gl.createBuffer();
gl.bindBuffer(
  gl.ARRAY_BUFFER,
  ballPositionBuffer,
);

gl.bufferData(
  gl.ARRAY_BUFFER,
  new Float32Array(ballPositionsLocal),
  gl.STATIC_DRAW,
);

//color ball buffer
const ballColorBuffer =
  gl.createBuffer();

gl.bindBuffer(
  gl.ARRAY_BUFFER,
  ballColorBuffer,
);

gl.bufferData(
  gl.ARRAY_BUFFER,
  new Float32Array(ballColorsLocal),
  gl.STATIC_DRAW,
);

//bind position & color
gl.bindBuffer(
  gl.ARRAY_BUFFER,
  positionBuffer,
);

gl.enableVertexAttribArray(
  positionLocation,
);

gl.vertexAttribPointer(
  positionLocation,
  2,
  gl.FLOAT,
  false,
  0,
  0,
);

gl.bindBuffer(
  gl.ARRAY_BUFFER,
  colorBuffer,
);

gl.enableVertexAttribArray(
  colorLocation,
);

gl.vertexAttribPointer(
  colorLocation,
  3,
  gl.FLOAT,
  false,
  0,
  0,
);

//bola
const ballX = -0.05;
const ballBottomY = -0.85; //titik terendah pantulan
const ballTopY = -0.55; //titik tertinggi pantulan
let ballY = ballBottomY;
let ballDirection = 1;  //1 = naik, -1 = turun
const ballSpeed = 0.9;

//update objek bola
function updateBall(dt) {
  ballY += ballDirection * ballSpeed * dt;
  if (ballY >= ballTopY) {
    ballY = ballTopY;
    ballDirection = -1;
  }
  if (ballY <= ballBottomY) {
    ballY = ballBottomY;
    ballDirection = 1;
  }
}

//gambar scene
function drawScene() {
  gl.clear(gl.COLOR_BUFFER_BIT);

  //rumput
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

  //jalan
  gl.drawArrays(gl.TRIANGLES, 4, 3);
  gl.drawArrays(gl.LINE_LOOP, 7, 3);

  //kotak kanan
  gl.drawArrays(gl.TRIANGLE_STRIP, 10, 4);
  gl.drawArrays(gl.LINE_LOOP, 14, 4);

  //kotak kiri
  gl.drawArrays(gl.TRIANGLE_STRIP, 18, 4);
  gl.drawArrays(gl.LINE_LOOP, 22, 4);

  //atap segitiga
  gl.drawArrays(gl.TRIANGLES, 26, 3);
  gl.drawArrays(gl.LINE_LOOP, 29, 3);

  //atap kiri
  gl.drawArrays(gl.TRIANGLE_STRIP, 32, 4);
  gl.drawArrays(gl.LINE_LOOP, 36, 4);

  //pintu
  gl.drawArrays(gl.TRIANGLE_STRIP, 40, 4);
  gl.drawArrays(gl.LINE_LOOP, 44, 4);

  //jendela 1
  gl.drawArrays(gl.TRIANGLE_STRIP, 48, 4);
  gl.drawArrays(gl.LINE_LOOP, 52, 4);

  //jendela 2
  gl.drawArrays(gl.TRIANGLE_STRIP, 56, 4);
  gl.drawArrays(gl.LINE_LOOP, 60, 4);

  //jendela 3
  gl.drawArrays(gl.TRIANGLE_STRIP, 64, 4);
  gl.drawArrays(gl.LINE_LOOP, 68, 4);

  //jendela 4
  gl.drawArrays(gl.TRIANGLE_STRIP, 72, 4);
  gl.drawArrays(gl.LINE_LOOP, 76, 4);

  //daun
  for (let i = 0; i < leafDomes.length * 2; i++) {
    gl.drawArrays(gl.TRIANGLE_FAN, leafStart + i * leafFanCount, leafFanCount);
  }

  //batang
  gl.drawArrays(gl.TRIANGLE_STRIP, 80, 4);
  gl.drawArrays(gl.LINE_LOOP, 84, 4);

  //marka jalan
  gl.drawArrays(gl.LINES, 88, 10);

  //padi
  gl.drawArrays(gl.LINES, 98, 56);
}

//gambar bola
function drawBall() {
  gl.bindBuffer(gl.ARRAY_BUFFER, ballPositionBuffer);
  gl.enableVertexAttribArray(positionLocation);
  gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

  gl.bindBuffer(gl.ARRAY_BUFFER, ballColorBuffer);
  gl.enableVertexAttribArray(colorLocation);
  gl.vertexAttribPointer(colorLocation, 3, gl.FLOAT, false, 0, 0);

  const matrix = Mat3.translation(ballX, ballY);
  gl.uniformMatrix3fv(matrixLocation, false, matrix);

  gl.drawArrays(gl.TRIANGLE_FAN, 0, ballVertexCount);
}

//render loop
let lastTime = 0;

function render(time) {
  let dt = (time - lastTime) * 0.001;
  lastTime = time;
  dt = Math.min(dt, 0.05);

  updateBall(dt);

  gl.bindBuffer(
    gl.ARRAY_BUFFER,
    positionBuffer,
  );

  gl.enableVertexAttribArray(
    positionLocation,
  );

  gl.vertexAttribPointer(
    positionLocation,
    2,
    gl.FLOAT,
    false,
    0,
    0,
  );

  gl.bindBuffer(
    gl.ARRAY_BUFFER,
    colorBuffer,
  );

  gl.enableVertexAttribArray(
    colorLocation,
  );

  gl.vertexAttribPointer(
    colorLocation,
    3,
    gl.FLOAT,
    false,
    0,
    0,
  );

  gl.uniformMatrix3fv(
    matrixLocation,
    false,
    Mat3.identity(),
  );

  drawScene();

  // tambahan : gambar bagian atas (gunung, matahari, burung, awan)
  updateAtas(dt);
  drawAtas();

  drawBall();

  requestAnimationFrame(render);
}

//NDC mouse
function mouseToNDC(event) {
  const rect = canvas.getBoundingClientRect();
  const mouseX = event.clientX - rect.left;
  const mouseY = event.clientY - rect.top;
  const x = (mouseX / rect.width) * 2.0 - 1.0;
  const y = 1.0 - (mouseY / rect.height) * 2.0;
  return { x, y };
}

canvas.addEventListener("mousemove", (event) => {
  const p = mouseToNDC(event);
  document.getElementById("info").textContent =
    `Mouse NDC: (${p.x.toFixed(2)}, ${p.y.toFixed(2)})`;
});

requestAnimationFrame(render);

// tambahan : expor supaya atas.js bisa pakai gl / program yang sama sebelumnya
export { gl, canvas, positionLocation, colorLocation, matrixLocation };
