// 기본 p5.js 스케치 (별도 파일)
function setup() {
  const canvas = createCanvas(800, 600);
  canvas.parent('canvas-container');
  background(30);
  noStroke();
}

function draw() {
  background(20, 24, 30);
  fill(255, 200);
  const x = width / 2 + sin(frameCount * 0.02) * 200;
  const y = height / 2 + cos(frameCount * 0.015) * 80;
  ellipse(x, y, 60, 60);
}

function mousePressed() {
  // 클릭하면 배경색 변경 예시
  background(random(20,60), random(20,60), random(30,80));
}

function windowResized() {
  // 캔버스 크기를 창 너비에 맞춰 조정하려면 아래 주석 해제
  // resizeCanvas(windowWidth, windowHeight);
}
