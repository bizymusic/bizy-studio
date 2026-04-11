const canvas = document.getElementById('bg');
const ctx = canvas.getContext('2d');

let width, height;
let notes = [];

// 定义音符符号库
const symbols = ['♪', '♫', '♩', '♬', '♯', '♭', '𝄞'];

function resize() {
  width = canvas.width = window.innerWidth;
  height = canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

// 音符类
class FloatingNote {
  constructor() {
    this.reset();
    this.y = Math.random() * height; // 初始随机分布
  }

  reset() {
    this.x = Math.random() * width;
    this.y = height + Math.random() * 50; // 从屏幕底部生成
    this.speed = Math.random() * 0.4 + 0.1; // 飘动速度较慢，营造梦幻感
    this.size = Math.random() * 24 + 12; // 字体大小 12px - 36px
    this.opacity = Math.random() * 0.3 + 0.2; ; // 极低透明度，若隐若现
    
    // 颜色：随机淡雅色
    const colors = [
      'rgba(102, 126, 234, COLOR)', // 淡蓝
      'rgba(118, 75, 162, COLOR)',  // 淡紫
      'rgba(72, 187, 120, COLOR)',  // 淡绿
      'rgba(237, 100, 166, COLOR)'  // 淡粉
    ];
    let colorTemplate = colors[Math.floor(Math.random() * colors.length)];
    this.color = colorTemplate.replace('COLOR', this.opacity);
    
    this.symbol = symbols[Math.floor(Math.random() * symbols.length)];
    this.wobble = Math.random() * Math.PI * 2; // 左右摇摆的起始相位
    this.wobbleSpeed = Math.random() * 0.02 + 0.01;
  }

  update() {
    this.y -= this.speed; // 向上飘
    this.wobble += this.wobbleSpeed;
    
    // 左右轻微摇摆 (正弦波)
    this.x += Math.sin(this.wobble) * 0.5;

    // 如果飘出顶部，重置到底部
    if (this.y < -50) {
      this.reset();
    }
  }

  draw() {
    ctx.font = `${this.size}px serif`; // 使用衬线体让音符更好看
    ctx.fillStyle = this.color;
    ctx.fillText(this.symbol, this.x, this.y);
  }
}

function init() {
  notes = [];
  // 根据屏幕宽度决定音符数量，避免太拥挤
  const count = Math.floor(window.innerWidth / 30); 
  for (let i = 0; i < count; i++) {
    notes.push(new FloatingNote());
  }
}

function animate() {
  ctx.clearRect(0, 0, width, height);

  notes.forEach(note => {
    note.update();
    note.draw();
  });

  requestAnimationFrame(animate);
}

init();
animate();


// 添加鼠标移动视差效果
document.addEventListener('mousemove', (e) => {
  const x = (e.clientX / width - 0.5) * 20;  // 调整 20 可以改变移动幅度
  const y = (e.clientY / height - 0.5) * 20;
  
  const nav = document.querySelector('.glass-nav');
  nav.style.transform = `translate(${x}px, ${y}px)`;
});
