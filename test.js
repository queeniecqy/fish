// sketch.js
let renderer, scene, camera;
let orbitControls;
let mainFish, otherFishes = [];
const OTHER_FISH_COUNT = 60;

function setup() {
  // 创建 p5.js canvas，并切换到 WEBGL
  createCanvas(windowWidth, windowHeight, WEBGL);

  // ———————— Three.js 设置 ————————
  renderer = new THREE.WebGLRenderer({ canvas: p5.instance.canvas});
  renderer.setSize(width, height);

  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
  camera.position.set(0, 0, 20);

  orbitControls = new THREE.OrbitControls(camera, renderer.domElement);

  // 环境光 + 物体光
  scene.add(new THREE.AmbientLight(0x404040, 1.5));
  const dl = new THREE.DirectionalLight(0xffffff, 1);
  dl.position.set(5, 10, 7.5);
  scene.add(dl);

    // GLTFLoader
  const loader = new THREE.GLTFLoader();

  // ————— 主鱼 —————
  mainFish = {
    model: null,
    pos: new THREE.Vector3(0, 0, -50),
    dir: new THREE.Vector3(0, 0, 1),
    speed: 0.3
  };
  loader.load(
    'https://raw.githubusercontent.com/queeniecqy/fish/main/fish01.glb',
    function (gltf) {
      mainFish.model = gltf.scene;
      mainFish.model.scale.set(2.5, 2.5, 2.5);
      scene.add(mainFish.model);
    },
    undefined, // 可替换为进度回调
    function (error) {
      console.error('加载主鱼失败：', error);
    }
  );

  // ————— 其他鱼 —————
  loader.load(
    'https://raw.githubusercontent.com/queeniecqy/fish/main/fish02.glb',
    function (gltf) {
      for (let i = 0; i < OTHER_FISH_COUNT; i++) {
        const fishMesh = gltf.scene.clone(true);
        const pos = new THREE.Vector3(
          random(-30, 30),
          random(-15, 15),
          random(-80, 20)
        );
        const dir = new THREE.Vector3(
          random(-1, 1),
          random(-0.5, 0.5),
          random(-1, 1)
        ).normalize().multiplyScalar(0.1);

        fishMesh.position.copy(pos);
        fishMesh.scale.set(1.2, 1.2, 1.2);

        scene.add(fishMesh);
        otherFishes.push({ model: fishMesh, pos, dir });
      }
    },
    undefined,
    function (error) {
      console.error('加载其他鱼失败：', error);
    }
  );
}

function draw() {
  background(30);

  // 更新主鱼的位置和朝向
  if (mainFish.model) {
    mainFish.pos.addScaledVector(mainFish.dir, mainFish.speed);
    // 到达 z 边界反向
    if (mainFish.pos.z > 20 || mainFish.pos.z < -80) {
      mainFish.dir.z *= -1;
    }
    mainFish.model.position.copy(mainFish.pos);
    // 让模型朝运动方向旋转
    const target = mainFish.pos.clone().add(mainFish.dir);
    mainFish.model.lookAt(target);
  }

  // 更新其他鱼
  for (let f of otherFishes) {
    // 轻微随机抖动
    f.dir.x += random(-0.005, 0.005);
    f.dir.y += random(-0.005, 0.005);
    f.dir.z += random(-0.005, 0.005);
    f.dir.normalize().multiplyScalar(0.1);

    f.pos.add(f.dir);
    // 世界边界：x ∈ [-30,30], y ∈ [-15,15], z ∈ [-80,20]
    if (abs(f.pos.x) > 30) f.dir.x *= -1;
    if (abs(f.pos.y) > 15) f.dir.y *= -1;
    if (f.pos.z < -80 || f.pos.z > 20) f.dir.z *= -1;

    f.model.position.copy(f.pos);
    // 朝向当前运动方向
    const t = f.pos.clone().add(f.dir);
    f.model.lookAt(t);
  }

  orbitControls.update();
  renderer.render(scene, camera);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  renderer.setSize(windowWidth, windowHeight);
  camera.aspect = windowWidth / windowHeight;
  camera.updateProjectionMatrix();
}
