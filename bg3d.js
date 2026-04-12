const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });

renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('canvas-container').appendChild(renderer.domElement);

// 创建一个粒子球体，更有 Hip-hop 的那种颗粒感
const geometry = new THREE.IcosahedronGeometry(15, 1);
const material = new THREE.MeshBasicMaterial({ 
    color: 0x000000, 
    wireframe: true, 
    transparent: true, 
    opacity: 0.1 
});
const sphere = new THREE.Mesh(geometry, material);
scene.add(sphere);

camera.position.z = 30;

function animate() {
    requestAnimationFrame(animate);
    sphere.rotation.y += 0.002;
    sphere.rotation.x += 0.001;
    renderer.render(scene, camera);
}

animate();

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});