window.addEventListener('load', () => {
    // 1. 文字进场动画：那种从下面滑上来的高级感
    gsap.from(".reveal-text", {
        y: 100,
        opacity: 0,
        duration: 1.2,
        stagger: 0.2,
        ease: "power4.out"
    });

    // 2. 卡片滚动显示
    gsap.from(".card", {
        scrollTrigger: ".card", // 以后你可以加滚动插件，现在先简单出场
        y: 50,
        opacity: 0,
        duration: 1,
        stagger: 0.1,
        delay: 0.5
    });

    // 3. 简单的鼠标跟随 3D 偏移
    document.addEventListener("mousemove", (e) => {
        const x = (e.clientX / window.innerWidth - 0.5) * 2;
        const y = (e.clientY / window.innerHeight - 0.5) * 2;
        
        gsap.to(scene.rotation, {
            duration: 1.5,
            x: y * 0.2,
            y: x * 0.2,
            ease: "power2.out"
        });
    });
});

// main.js
const midiCard = document.querySelector('a[href="midi-lab/index.html"]');

midiCard.addEventListener('click', (e) => {
    e.preventDefault(); // 阻止立即跳转
    const target = e.currentTarget.href;

    // 做一个黑屏淡出的酷炫转场
    gsap.to("body", {
        opacity: 0,
        duration: 0.5,
        onComplete: () => {
            window.location.href = target;
        }
    });
});




const nav = document.getElementById("nav");
const navInner = document.getElementById("navInner");

// ===== 滚动变实色 =====
window.addEventListener("scroll", () => {
  if (window.scrollY > 50) {
    nav.classList.add("scrolled");
  } else {
    nav.classList.remove("scrolled");
  }
});

// ===== 磁吸效果（高级感核心）=====
document.addEventListener("mousemove", (e) => {
  const rect = navInner.getBoundingClientRect();

  const x = e.clientX - (rect.left + rect.width / 2);
  const y = e.clientY - (rect.top + rect.height / 2);

  const distance = Math.sqrt(x * x + y * y);

  // 只有靠近才触发
  if (distance < 200) {
    navInner.style.transform = `
      translate(${x * 0.05}px, ${y * 0.05}px)
      scale(1)
    `;
  } else {
    navInner.style.transform = `translate(0,0) scale(1)`;
  }
});

// ===== 鼠标离开恢复 =====
document.addEventListener("mouseleave", () => {
  navInner.style.transform = `translate(0,0) scale(1)`;
});