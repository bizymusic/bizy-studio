// 简约粒子动态背景（无需外部库）
const canvas = document.getElementById('bg');
const ctx = canvas.getContext('2d');

let width, height;
let particles = [];

// 自适应尺寸
function resize() {
  width = canvas.width = window.innerWidth;
  height = canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

// 粒子类
class Particle {
  constructor() {
    this.x = Math.random() * width;
    this.y = Math.random() * height;
    this.vx = (Math.random() - 0.5) * 0.5;
    this.vy = (Math.random() - 0.5) * 0.5;
    this.radius = Math.random() * 1.5 + 0.5;
    this.color = `hsla(${Math.random() * 60 + 180}, 100%, 70%, 0.6)`;
  }
  
  update() {
    this.x += this.vx;
    this.y += this.vy;
    
    // 边界反弹
    if (this.x < 0 || this.x > width) this.vx *= -1;
    if (this.y < 0 || this.y > height) this.vy *= -1;
  }
  
  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();
  }
}

// 初始化粒子
function init() {
  particles = [];
  const count = Math.min(100, Math.floor(width * height / 10000));
  for (let i = 0; i < count; i++) {
    particles.push(new Particle());
  }
}

// 连线效果
function connect() {
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const dx = particles[i].x - particles[j].x;
      const dy = particles[i].y - particles[j].y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      if (dist < 120) {
        ctx.beginPath();
        ctx.strokeStyle = `rgba(100, 200, 255, ${0.2 - dist/600})`;
        ctx.lineWidth = 0.5;
        ctx.moveTo(particles[i].x, particles[i].y);
        ctx.lineTo(particles[j].x, particles[j].y);
        ctx.stroke();
      }
    }
  }
}

// 动画循环
function animate() {
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = 'rgba(0, 0, 0, 0.1)'; // 拖尾效果
  ctx.fillRect(0, 0, width, height);
  
  particles.forEach(p => {
    p.update();
    p.draw();
  });
  connect();
  
  requestAnimationFrame(animate);
}

init();
animate();