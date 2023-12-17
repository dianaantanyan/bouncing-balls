import './style.css';

interface Circle {
  x: number;
  y: number;
  radius: number;
  color: string;
  velocityY: number;
  createTime: number;
  weight: number;
  damping?: number;
  rotation: number;
  trail: { x: number; y: number; alpha: number }[];
}

const canvas: HTMLCanvasElement = document.getElementById('canvas') as HTMLCanvasElement;
const ctx: CanvasRenderingContext2D = canvas.getContext('2d') as CanvasRenderingContext2D;

const circles: Circle[] = [];
const gravity: number = 9.8 / 30;
const trailAlpha: number = 0.2;
const trailLifetime: number = 500;
const maxTrailLength: number = 200;

function randomColor(): string {
  const hue: number = Math.floor(Math.random() * 360);
  const saturation: number = Math.floor(Math.random() * 50) + 90;
  const lightness: number = Math.floor(Math.random() * 30) + 50;

  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}

function randomRadius(): number {
  return Math.random() * (30 - 10) + 10;
}

function createCircle(x: number, y: number, radius: number, weight: number): Circle {
  return {
    x,
    y,
    radius,
    color: randomColor(),
    velocityY: 0,
    createTime: Date.now(),
    weight,
    rotation: Math.random() * Math.PI * 2,
    trail: [],
  };
}

function drawTrail(circle: Circle) {
  for (let i = circle.trail.length - 1; i >= 0; i--) {
    const point = circle.trail[i];
    const alpha = point.alpha * trailAlpha * 1;
    const trailRadius = circle.radius * 0.0001;

    ctx.beginPath();
    ctx.arc(point.x, point.y, trailRadius, 0, 2 * Math.PI);
    ctx.fillStyle = `rgba(${parseInt(circle.color.slice(1, 3), 16)}, ${parseInt(
      circle.color.slice(3, 5),
      16
    )}, ${parseInt(circle.color.slice(5, 7), 16)}, ${alpha})`;
    ctx.fill();
    ctx.closePath();
  }
}

function drawCircle(circle: Circle) {
  const gradient = ctx.createRadialGradient(
    circle.x,
    circle.y - circle.radius / 4,
    0,
    circle.x,
    circle.y,
    circle.radius
  );
  gradient.addColorStop(0, `rgba(0, 0, 0, 0.6)`);
  gradient.addColorStop(1, circle.color);

  ctx.beginPath();
  ctx.arc(circle.x, circle.y, circle.radius, circle.rotation, circle.rotation + 2 * Math.PI);
  ctx.fillStyle = gradient;
  ctx.fill();
  ctx.closePath();
}

function updateCircle(circle: Circle, deltaTime: number) {
  circle.velocityY += gravity * circle.weight;
  circle.y += circle.velocityY;

  circle.rotation += 0.02;

  if (circle.y + circle.radius > canvas.height) {
    circle.y = canvas.height - circle.radius;
    circle.velocityY *= -circle.damping!;
    // Introduce a damping effect on rotation as well
    circle.rotation *= circle.damping!; 
  }

  const currentTime = Date.now();
  const alpha = Math.max(0, (circle.createTime + trailLifetime - currentTime) / trailLifetime);

  circle.trail.push({ x: circle.x, y: circle.y, alpha });

  if (circle.trail.length > maxTrailLength) {
    circle.trail.shift();
  }
}

function drawFrame() {
  ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  circles.forEach((circle) => {
    updateCircle(circle, 16); // Assuming 60fps, deltaTime is approximately 16ms
    drawTrail(circle);
    drawCircle(circle);
  });
}

function spawnCircle(x: number, y: number) {
  const radius = randomRadius();
  const weight = 1;
  const damping = 0.95;

  const newCircle = createCircle(x, y, radius, weight);
  newCircle.damping = damping;
  circles.push(newCircle);
}

canvas.addEventListener('click', (event) => {
  spawnCircle(event.clientX, event.clientY);

  // Flash effect on background color change
  canvas.style.backgroundColor = '#f0f0f0';
  setTimeout(() => {
    canvas.style.backgroundColor = '#ffffff';
  }, 100);
});

let lastTime = 0;
function tick(currentTime: number) {
  const deltaTime = currentTime - lastTime;
  drawFrame();
  lastTime = currentTime;
  requestAnimationFrame(tick);
}

requestAnimationFrame(tick);
