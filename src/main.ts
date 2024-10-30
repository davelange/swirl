import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/Addons.js";
import Stats from "three/examples/jsm/libs/stats.module.js";
import { loadTexture } from "./utils";
import fragment from "./shaders/bg/fragment.glsl";
import vertex from "./shaders/bg/vertex.glsl";
import "./index.css";

class MyScene {
  scene = new THREE.Scene();
  width = window.innerWidth;
  height = window.innerHeight;
  renderer = new THREE.WebGLRenderer();
  camera = new THREE.OrthographicCamera();
  canvas = document.querySelector("canvas.webgl") as HTMLCanvasElement;
  controls = new OrbitControls(this.camera, this.canvas);
  mouse = new THREE.Vector2(0, 0);
  prevMouse = new THREE.Vector2(0, 0);

  textureScene = new THREE.Scene();
  baseTexture = new THREE.WebGLRenderTarget();
  textureMaterial = new THREE.ShaderMaterial();

  stats = new Stats();

  background: THREE.Mesh;

  constructor() {
    this.setupRenderer();
    this.setupCamera();
    this.setupResize();
    this.controls = new OrbitControls(this.camera, this.canvas);
    this.trackMouse();
    this.addObjects();
  }

  setupRenderer() {
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      alpha: true,
    });
    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    this.baseTexture = new THREE.WebGLRenderTarget(this.width, this.height, {
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      format: THREE.RGBAFormat,
    });
  }

  setupCamera() {
    let frustrum = this.height;
    let aspect = this.width / this.height;
    this.camera = new THREE.OrthographicCamera(
      (frustrum * aspect) / -2,
      (frustrum * aspect) / 2,
      frustrum / 2,
      frustrum / -2,
      -1000,
      1000
    );
    this.camera.position.set(0, 0, 2);
  }

  setupResize() {
    window.addEventListener("resize", () => {
      // Update sizes
      this.width = window.innerWidth;
      this.height = window.innerHeight;

      // Update camera
      this.camera.updateProjectionMatrix();

      // Update renderer
      this.renderer.setSize(this.width, this.height);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    });
  }

  trackMouse() {
    window.addEventListener("mousemove", (event) => {
      this.mouse.x = event.clientX - this.width / 2;
      this.mouse.y = this.height / 2 - event.clientY;
    });
  }

  addObjects() {
    this.addBackground();
    this.addRipples();
  }

  addBackground() {
    let geo = new THREE.PlaneGeometry(this.width, this.height, 1, 1);
    this.textureMaterial = new THREE.ShaderMaterial({
      uniforms: {
        uTexture: new THREE.Uniform(loadTexture("./bg.webp")),
        uDisplacement: new THREE.Uniform(null),
      },
      vertexShader: vertex,
      fragmentShader: fragment,
    });
    let mesh = new THREE.Mesh(geo, this.textureMaterial);
    this.textureScene.add(mesh);
  }

  rippleMeshes: Array<
    THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>
  > = [];
  rippleCount = 50;
  currentRipple = 0;

  addRipples() {
    let geo = new THREE.PlaneGeometry(100, 100, 1, 1);

    for (let index = 0; index < this.rippleCount; index++) {
      let mat = new THREE.MeshBasicMaterial({
        map: loadTexture("./ripple.png"),
        transparent: true,
        depthTest: false,
        depthWrite: false,
      });
      let mesh = new THREE.Mesh(geo, mat);
      mesh.visible = false;
      this.rippleMeshes.push(mesh);
      this.scene.add(mesh);
    }

    window.addEventListener("mousemove", this.createRipple.bind(this));
  }

  createRipple() {
    if (
      Math.abs(this.mouse.x - this.prevMouse.x) < 25 &&
      Math.abs(this.mouse.y - this.prevMouse.y) < 25
    ) {
      return;
    }

    let nextMesh = this.rippleMeshes[this.currentRipple];
    nextMesh.position.x = this.mouse.x;
    nextMesh.position.y = this.mouse.y;
    nextMesh.visible = true;
    nextMesh.material.opacity = 0.7;
    nextMesh.scale.setX(1);
    nextMesh.scale.setY(1);
    nextMesh.rotation.z = Math.PI * Math.random();

    this.currentRipple = (this.currentRipple + 1) % this.rippleCount;
    this.prevMouse.x = this.mouse.x;
    this.prevMouse.y = this.mouse.y;
  }

  updateRipples() {
    for (const ripple of this.rippleMeshes) {
      if (ripple.material.opacity < 0.001) {
        ripple.visible = false;
      } else {
        ripple.material.opacity *= 0.97;
        ripple.scale.x = ripple.scale.x * 0.982 + 0.08;
        ripple.scale.y = ripple.scale.y * 0.982 + 0.08;
      }
    }
  }

  render() {
    // Update controls
    this.controls.update();

    this.renderer.setRenderTarget(this.baseTexture);
    this.renderer.render(this.scene, this.camera);
    this.textureMaterial.uniforms.uDisplacement.value =
      this.baseTexture.texture;

    this.renderer.setRenderTarget(null);
    this.renderer.clear();
    this.renderer.render(this.textureScene, this.camera);

    this.updateRipples();

    // Render

    // Call tick again on the next frame
    window.requestAnimationFrame(this.render.bind(this));
  }
}

let myScene = new MyScene();
myScene.render();
