import * as THREE from "three";
import {
  DotScreenShader,
  EffectComposer,
  OrbitControls,
  RenderPass,
  ShaderPass,
} from "three/examples/jsm/Addons.js";
import { customPass } from "./customPass.js";
import Stats from "three/examples/jsm/libs/stats.module.js";
import { loadTexture } from "./utils";
import fragment from "./shaders/bg/fragment.glsl";
import vertex from "./shaders/bg/vertex.glsl";
import wobFragment from "./shaders/wob/fragment.glsl";
import wobVertex from "./shaders/wob/vertex.glsl";
import "./app.css";
import GUI from "lil-gui";

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

  brushScene = new THREE.Scene();
  //textureScene = new THREE.Scene();
  //baseTexture = new THREE.WebGLRenderTarget();
  brushTexture = new THREE.WebGLRenderTarget();
  //textureMaterial = new THREE.ShaderMaterial();
  composer: EffectComposer;
  stats = new Stats();

  settings: Record<string, any> = {
    scale: 1.76,
    smoothStepStart: 0.41,
    smoothStepEnd: 0.85,
  };

  gui = new GUI();

  background: THREE.Mesh;

  constructor() {
    this.setupRenderer();
    this.setupCamera();
    this.setupResize();
    this.controls = new OrbitControls(this.camera, this.canvas);
    this.trackMouse();
    this.addObjects();
    this.initPost();
  }

  effect1: ShaderPass;

  initPost() {
    this.composer = new EffectComposer(this.renderer);
    this.composer.addPass(new RenderPass(this.scene, this.camera));

    this.effect1 = new ShaderPass(customPass);

    // Uniforms
    this.effect1.uniforms["scale"].value = this.settings.scale;
    this.effect1.uniforms["time"].value = 0;
    this.effect1.uniforms["grainTexture"] = new THREE.Uniform(
      loadTexture("./perlin1.png")
    );
    this.effect1.uniforms["displacement"] = new THREE.Uniform(
      loadTexture("./brush.png")
    );
    this.effect1.uniforms["smoothStepStart"].value =
      this.settings.smoothStepStart;
    this.effect1.uniforms["smoothStepEnd"].value = this.settings.smoothStepEnd;

    this.composer.addPass(this.effect1);

    this.gui.add(this.settings, "scale", 0, 10, 0.01);
    this.gui.add(this.settings, "smoothStepStart", 0, 1, 0.01);
    this.gui.add(this.settings, "smoothStepEnd", 0, 1, 0.01);
  }

  setupRenderer() {
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      alpha: true,
    });
    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    this.brushTexture = new THREE.WebGLRenderTarget(this.width, this.height, {
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
    //this.addBackground();
    this.addRipples();
    //this.addWobbly();
  }

  rippleMeshes: Array<
    THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>
  > = [];
  rippleCount = 50;
  currentRipple = 0;

  addRipples() {
    let geo = new THREE.PlaneGeometry(140, 140, 1, 1);
    for (let index = 0; index < this.rippleCount; index++) {
      let mat = new THREE.MeshBasicMaterial({
        map: loadTexture("./brush.png"),
        transparent: true,
        depthTest: false,
        depthWrite: false,
      });
      let mesh = new THREE.Mesh(geo, mat);
      mesh.visible = false;
      this.rippleMeshes.push(mesh);
      this.brushScene.add(mesh);
    }
    window.addEventListener("mousemove", this.createRipple.bind(this));
  }

  createRipple() {
    if (
      Math.abs(this.mouse.x - this.prevMouse.x) < 2 &&
      Math.abs(this.mouse.y - this.prevMouse.y) < 2
    ) {
      return;
    }

    let nextMesh = this.rippleMeshes[this.currentRipple];
    nextMesh.position.x = this.mouse.x;
    nextMesh.position.y = this.mouse.y;
    nextMesh.visible = true;
    nextMesh.material.opacity = 0.5;
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
        ripple.scale.x = ripple.scale.x * 0.992 + 0.07;
        ripple.scale.y = ripple.scale.y * 0.992 + 0.07;
      }
    }
  }

  clock = new THREE.Clock();

  render() {
    const elapsedTime = this.clock.getElapsedTime();

    // Update controls
    this.controls.update();

    this.updateRipples();

    //this.updateWobbly();

    /* this.renderer.setRenderTarget(this.baseTexture);
    this.renderer.render(this.scene, this.camera);
    this.textureMaterial.uniforms.uDisplacement.value =
      this.baseTexture.texture;
    this.textureMaterial.uniforms.uTime.value = elapsedTime;
    this.textureMaterial.uniforms.uMouse.value = new THREE.Vector2(
      this.uMouse.x,
      this.uMouse.y
    ); */

    this.renderer.setRenderTarget(this.brushTexture);
    this.renderer.render(this.brushScene, this.camera);

    // BG
    this.effect1.uniforms.displacement.value = this.brushTexture.texture;
    this.effect1.uniforms.time.value = elapsedTime;
    this.effect1.uniforms.scale.value = this.settings.scale;
    this.effect1.uniforms.smoothStepStart.value = this.settings.smoothStepStart;
    this.effect1.uniforms.smoothStepEnd.value = this.settings.smoothStepEnd;

    //this.renderer.setRenderTarget(null);
    //this.renderer.clear();
    //this.renderer.render(this.textureScene, this.camera);

    this.composer.render();

    // Render
    //this.renderer.render(this.scene, this.camera);

    // Call tick again on the next frame
    window.requestAnimationFrame(this.render.bind(this));
  }
}

let myScene = new MyScene();
myScene.render();
