// gambar all objek bagian atas

import { Mat3 } from "./matrix3.js";
import { gl, canvas, positionLocation, colorLocation, matrixLocation } from "./main.js";

const HORIZON_Y = -0.05; // harus sama seperti main.js

function circleFanPoints(cx, cy, rx, ry, segments) {
  const pts = [[cx, cy]]; // titik pusat = pivot fan
  for (let i = 0; i <= segments; i++) {
    const a = (Math.PI * 2 * i) / segments;
    pts.push([cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]);
  }
  return pts;
}

function circleRingPoints(cx, cy, rx, ry, segments) { // outline (LINE_LOOP, tanpa titik pusat)
  const pts = [];
  for (let i = 0; i < segments; i++) {
    const a = (Math.PI * 2 * i) / segments;
    pts.push([cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]);
  }
  return pts;
}

function birdPoints(cx, cy, w, h) {
  return [
    [cx - w, cy], [cx - w * 0.5, cy + h], [cx, cy + h * 0.25],
    [cx + w * 0.5, cy + h], [cx + w, cy],
  ];
}

// state yang dipakai di luar initAtas()
// baseX, y = posisi tengah awan & amplitude = seberapa jauh awan gerak dari baseX (kiri & kanan)
const cloud = { baseX: -0.30, y: 0.80, amplitude: 0.45, speed: 0.750 };
let cloudTime = 0;
let initialized = false;

// variabel-variabel ini baru diisi di dalam initAtas()
let aspect;
let atasPositionBuffer, atasColorBuffer, draws;
let cloudPositionBuffer, cloudColorBuffer, cloudDraws;

// fungsi ini baru dipanggil belakangan (dari updateAtas)
function initAtas() {
  if (initialized) return; // cuma boleh jalan 1x
  initialized = true;

  aspect = canvas.height / canvas.width; // koreksi supaya lingkaran tidak lonjong

  // next : objek yang diam (langit, 2 gunung, matahari, 2 burung)
  const positions = [];
  const colors = [];
  draws = [];

  function pushShape(mode, pts, color, label) {
    const start = positions.length / 2;
    for (const [x, y] of pts) {
      positions.push(x, y);
      colors.push(color[0], color[1], color[2]);
    }
    draws.push({ mode, start, count: pts.length, label });
  }

  // langit : isinya satu persegi panjang biru muda di atas garis horizon
  pushShape(
    gl.TRIANGLE_STRIP,
    [[-1.0, HORIZON_Y], [1.0, HORIZON_Y], [-1.0, 1.0], [1.0, 1.0]],
    [0.65, 0.85, 0.95],
    "Langit"
  );

  // matahari : isinya lingkaran & akan tertutup gunung
  // x, y = posisi pusat matahari & r = radius / ukuran matahari
  const SUN = { x: 0.0, y: 0.20, r: 0.25 };
  pushShape(
    gl.TRIANGLE_FAN,
    circleFanPoints(SUN.x, SUN.y, SUN.r * aspect, SUN.r, 28),
    [1.0, 0.7, 0.1], // warna matahari nya (R,G,B), contoh lain 1.0, 0.4, 0.1 untuk matahari senja
    "Matahari (isi)"
  );
  pushShape(
    gl.LINE_LOOP,
    circleRingPoints(SUN.x, SUN.y, SUN.r * aspect, SUN.r, 28),
    [0.0, 0.0, 0.0],
    "Matahari (outline)"
  );

  // sunRayAngles = sudut tiap garis dalam derajat, 90° = lurus ke atas.
  // +/- angka di array untuk +/- jumlah sinar
  // rInner / rOuter = jarak garis dari pusat matahari
  const sunRayAngles = [30, 60, 90, 120, 150];
  const rInner = SUN.r * 1.15; // rInner lebih besar = garis makin menjauh dari matahari
  const rOuter = SUN.r * 1.55; // rOuter - rInner lebih besar = garis makin panjang
  const sunRayPts = [];
  for (const deg of sunRayAngles) {
    const a = (deg * Math.PI) / 180;
    sunRayPts.push(
      [SUN.x + Math.cos(a) * rInner * aspect, SUN.y + Math.sin(a) * rInner],
      [SUN.x + Math.cos(a) * rOuter * aspect, SUN.y + Math.sin(a) * rOuter]
    );
  }
  pushShape(gl.LINES, sunRayPts, [0, 0, 0], "Sinar Matahari");

  // gunung kiri & kanan : isinya TRIANGLE_FAN dari titik dasar
  // HORIZON_Y = titik dasar, so no no diubah, karena harus tetap nempel dengan tanah
  const mountainLeft = [
    [-1.00, HORIZON_Y],   // titik dasar kiri
    [-0.72, 0.18],        // lereng naik
    [-0.45, 0.52],        // titik puncak gunung kiri
    [-0.20, 0.20],        // lereng turun
    [0.05, HORIZON_Y],    // titik dasar kanan (ketemu lembah)
  ];
  const mountainRight = [
    [-0.05, HORIZON_Y],   
    [0.20, 0.15],         
    [0.45, 0.52],         
    [0.72, 0.18],         
    [1.00, HORIZON_Y],    
  ];
  pushShape(gl.TRIANGLE_FAN, mountainLeft, [0.55, 0.45, 0.40], "Gunung Kiri (isi)");
  pushShape(gl.TRIANGLE_FAN, mountainRight, [0.55, 0.45, 0.40], "Gunung Kanan (isi)");
  pushShape(gl.LINE_STRIP, mountainLeft.slice(0, 4), [0, 0, 0], "Gunung Kiri (outline)");
  pushShape(gl.LINE_STRIP, mountainRight.slice(1), [0, 0, 0], "Gunung Kanan (outline)");

  // burung : isinya bentuk sayap M sederhana, LINE_STRIP
  // birdPoints(cx, cy, w, h):
  pushShape(gl.LINE_STRIP, birdPoints(
    0.55,                     // x = posisi pusat burung
    0.78,                     // y = posisi pusat burung
    0.05,                     // w = lebar sayap (makin besar = burung makin lebar)
    0.05),                    // h = tinggi kepakan sayap (makin besar = sayap makin runcing / tajam)
    [0, 0, 0], "Burung 1");

  pushShape(gl.LINE_STRIP, birdPoints(
    0.72, 
    0.60, 
    0.1, 
    0.1), 
    [0, 0, 0], "Burung 2");

  // upload semua bentuk objek yang statis ke 1 buffer (STATIC_DRAW, karena tidak pernah berubah tiap frame)
  atasPositionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, atasPositionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

  atasColorBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, atasColorBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);

  // next : objek yang bergerak = awan
  // geometri lokal berpusat di (0,0), lalu tiap frame cuma kirim u_matrix = Mat3.translation(x, y) yang baru
  const cloudLocalPositions = [];
  const cloudLocalColors = [];
  cloudDraws = [];

  function pushCloudLobe(cx, cy, r) {
    const start = cloudLocalPositions.length / 2;
    const pts = circleFanPoints(cx, cy, r * aspect, r, 20);
    for (const [x, y] of pts) { cloudLocalPositions.push(x, y); cloudLocalColors.push(1, 1, 1); }
    cloudDraws.push({ start, count: pts.length });
  }

  // isinya 3 lingkaran yang bertumpuk
  // pushCloudLobe(cx, cy, r): cx,cy = posisi gumpalan nawan
  // awan (0,0), r = radius gumpalan awan, perbesar jika ingin lebih besar
  pushCloudLobe(0.00, 0.00, 0.0825);
  pushCloudLobe(-0.07, -0.012, 0.060);
  pushCloudLobe(0.07, -0.010, 0.0675);

  cloudPositionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, cloudPositionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(cloudLocalPositions), gl.STATIC_DRAW);

  cloudColorBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, cloudColorBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(cloudLocalColors), gl.STATIC_DRAW);
}

export function updateAtas(dt) {
  initAtas();
  cloudTime += dt;
}

function drawStaticAtas() {
  gl.bindBuffer(gl.ARRAY_BUFFER, atasPositionBuffer);
  gl.enableVertexAttribArray(positionLocation);
  gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

  gl.bindBuffer(gl.ARRAY_BUFFER, atasColorBuffer);
  gl.enableVertexAttribArray(colorLocation);
  gl.vertexAttribPointer(colorLocation, 3, gl.FLOAT, false, 0, 0);

  // objek statis tidak perlu translasi / rotasi = pakai matriks identitas
  gl.uniformMatrix3fv(matrixLocation, false, Mat3.identity());

  for (const d of draws) gl.drawArrays(d.mode, d.start, d.count);
}

function drawCloud() {
  gl.bindBuffer(gl.ARRAY_BUFFER, cloudPositionBuffer);
  gl.enableVertexAttribArray(positionLocation);
  gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

  gl.bindBuffer(gl.ARRAY_BUFFER, cloudColorBuffer);
  gl.enableVertexAttribArray(colorLocation);
  gl.vertexAttribPointer(colorLocation, 3, gl.FLOAT, false, 0, 0);

  const x = cloud.baseX + cloud.amplitude * Math.sin(cloudTime * cloud.speed);
  const matrix = Mat3.translation(x, cloud.y);   // ini objek bergerak nya
  gl.uniformMatrix3fv(matrixLocation, false, matrix);

  for (const c of cloudDraws) gl.drawArrays(gl.TRIANGLE_FAN, c.start, c.count);
}

export function drawAtas() {
  initAtas();
  drawStaticAtas();
  drawCloud();
}
