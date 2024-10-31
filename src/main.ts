import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/Addons.js";
import Stats from "three/examples/jsm/libs/stats.module.js";
import { loadTexture } from "./utils";
import fragment from "./shaders/bg/fragment.glsl";
import vertex from "./shaders/bg/vertex.glsl";
import wobFragment from "./shaders/wob/fragment.glsl";
import wobVertex from "./shaders/wob/vertex.glsl";
import "./app.css";

class MyScene {
  scene = new THREE.Scene();
  width = window.innerWidth;
  height = window.innerHeight;
  renderer = new THREE.WebGLRenderer();
  camera = new THREE.OrthographicCamera();
  canvas = document.querySelector("canvas.webgl") as HTMLCanvasElement;
  controls = new OrbitControls(this.camera, this.canvas);
  mouse = new THREE.Vector2(0, 0);
  uMouse = new THREE.Vector2(0, 0);
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

      this.uMouse.x = event.clientX / window.innerWidth;
      this.uMouse.y = 1.0 - event.clientY / window.innerHeight;
    });
  }

  addObjects() {
    this.addBackground();
    this.addWobbly();
  }

  addBackground() {
    let geo = new THREE.PlaneGeometry(this.width, this.height, 1, 1);
    this.textureMaterial = new THREE.ShaderMaterial({
      uniforms: {
        uTexture: new THREE.Uniform(loadTexture("./bg.webp")),
        uDisplacement: new THREE.Uniform(null),
        uDisplacementG: new THREE.Uniform(null),
        uTime: new THREE.Uniform(null),
        uMouse: new THREE.Uniform(new THREE.Vector2(0, 0)),
      },
      vertexShader: vertex,
      fragmentShader: fragment,
    });
    let mesh = new THREE.Mesh(geo, this.textureMaterial);
    this.textureScene.add(mesh);
  }

  wobbly: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>;

  wobblyInner: THREE.Mesh<THREE.PlaneGeometry, THREE.ShaderMaterial>;

  addWobbly() {
    let geo = new THREE.PlaneGeometry(300, 300, 1, 1);
    let mat = new THREE.MeshBasicMaterial({
      map: loadTexture("./disco6.png"),
    });
    this.wobbly = new THREE.Mesh(geo, mat);
    this.scene.add(this.wobbly);

    let displacementTexture = loadTexture("./Manifold1.png");
    displacementTexture.wrapS = THREE.RepeatWrapping;
    displacementTexture.wrapT = THREE.RepeatWrapping;

    let matInner = new THREE.ShaderMaterial({
      transparent: true,
      uniforms: {
        uTexture: new THREE.Uniform(loadTexture("./ripple.png")),
        uDisplacement: new THREE.Uniform(displacementTexture),
        uTime: new THREE.Uniform(0),
      },
      depthTest: false,
      depthWrite: false,
      vertexShader: wobVertex,
      fragmentShader: wobFragment,
    });
    this.wobblyInner = new THREE.Mesh(geo, matInner);
    //this.scene.add(this.wobblyInner);
  }

  updateWobbly() {
    this.wobbly.position.x = this.mouse.x;
    this.wobbly.position.y = this.mouse.y;

    this.wobblyInner.position.x = this.mouse.x;
    this.wobblyInner.position.y = this.mouse.y;
  }

  clock = new THREE.Clock();

  render() {
    const elapsedTime = this.clock.getElapsedTime();

    // Update controls
    this.controls.update();

    this.wobblyInner.material.uniforms.uTime.value = elapsedTime;

    this.updateWobbly();

    this.renderer.setRenderTarget(this.baseTexture);
    this.renderer.render(this.scene, this.camera);
    this.textureMaterial.uniforms.uDisplacement.value =
      this.baseTexture.texture;
    this.textureMaterial.uniforms.uTime.value = elapsedTime;
    this.textureMaterial.uniforms.uMouse.value = new THREE.Vector2(
      this.uMouse.x,
      this.uMouse.y
    );

    this.renderer.setRenderTarget(null);
    this.renderer.clear();
    this.renderer.render(this.textureScene, this.camera);

    // Render
    //this.renderer.render(this.scene, this.camera);

    // Call tick again on the next frame
    window.requestAnimationFrame(this.render.bind(this));
  }
}

let myScene = new MyScene();
myScene.render();
