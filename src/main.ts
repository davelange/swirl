import * as THREE from "three";
import {
  EffectComposer,
  OrbitControls,
  RenderPass,
  ShaderPass,
} from "three/examples/jsm/Addons.js";
import { SwirlPass } from "./swirlPass.ts";
import Stats from "three/examples/jsm/libs/stats.module.js";
import { loadTexture, randomInRange } from "./utils";
import GUI from "lil-gui";
import { Ripple } from "./ripple.ts";

class MyScene {
  scene = new THREE.Scene();
  composer: EffectComposer;
  renderer = new THREE.WebGLRenderer();
  canvas = document.querySelector("canvas.webgl") as HTMLCanvasElement;
  camera = new THREE.OrthographicCamera();

  width = window.innerWidth;
  height = window.innerHeight;

  brushScene = new THREE.Scene();
  brushTexture = new THREE.WebGLRenderTarget();

  stats = new Stats();
  controls = new OrbitControls(this.camera, this.canvas);

  settings: Record<string, any> = {
    scale: 1.76,
    smoothStepStart: 0.41,
    smoothStepEnd: 0.85,
    showWaves: false,
    showRipples: false,
    showGrain: false,
  };
  mouse = new THREE.Vector2(0, 0);
  prevMouse = new THREE.Vector2(0, 0);

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

  shaderPass: ShaderPass;

  initPost() {
    this.composer = new EffectComposer(this.renderer);
    this.composer.addPass(new RenderPass(this.scene, this.camera));

    this.shaderPass = new ShaderPass(SwirlPass);

    this.shaderPass.uniforms.scale = new THREE.Uniform(this.settings.scale);
    this.shaderPass.uniforms.showWaves = new THREE.Uniform(
      this.settings.showWaves
    );
    this.shaderPass.uniforms.showRipples = new THREE.Uniform(
      this.settings.showRipples
    );
    this.shaderPass.uniforms.showGrain = new THREE.Uniform(
      this.settings.showGrain
    );
    this.shaderPass.uniforms.smoothStepStart = new THREE.Uniform(
      this.settings.smoothStepStart
    );
    this.shaderPass.uniforms.smoothStepEnd = new THREE.Uniform(
      this.settings.smoothStepEnd
    );
    const delay = randomInRange(0, 2);
    this.shaderPass.uniforms.delay = new THREE.Uniform(delay);
    this.shaderPass.uniforms.time = new THREE.Uniform(0);
    this.shaderPass.uniforms.grainTexture = new THREE.Uniform(
      loadTexture("./perlin1.png")
    );
    this.shaderPass.uniforms.displacement = new THREE.Uniform(
      loadTexture("./brush.png")
    );

    this.composer.addPass(this.shaderPass);

    this.gui.add(this.settings, "scale", 0, 10, 0.01);
    this.gui.add(this.settings, "smoothStepStart", 0, 1, 0.01);
    this.gui.add(this.settings, "smoothStepEnd", 0, 1, 0.01);
    this.gui.add(this.settings, "showGrain");
    this.gui.add(this.settings, "showWaves");
    this.gui.add(this.settings, "showRipples");
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
    });
  }

  addObjects() {
    this.addRipples();
  }

  ripples: Array<Ripple> = [];
  rippleCount = 50;
  currentRipple = 0;

  addRipples() {
    let texture = loadTexture("./brush.png");
    let texture2 = loadTexture("./brush2.png");

    for (let index = 0; index < this.rippleCount; index++) {
      this.ripples.push(
        new Ripple({ texture, texture2, scene: this.brushScene })
      );
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

    this.ripples[this.currentRipple].place({
      x: this.mouse.x,
      y: this.mouse.y,
    });

    this.currentRipple = (this.currentRipple + 1) % this.rippleCount;
    this.prevMouse.x = this.mouse.x;
    this.prevMouse.y = this.mouse.y;
  }

  updateRipples() {
    for (const ripple of this.ripples) {
      ripple.update();
    }
  }

  clock = new THREE.Clock();

  render() {
    const elapsedTime = this.clock.getElapsedTime();

    this.controls.update();

    this.updateRipples();

    // Create brush comp texture
    this.renderer.setRenderTarget(this.brushTexture);
    this.renderer.render(this.brushScene, this.camera);

    // Set shader uniforms
    this.shaderPass.uniforms.displacement.value = this.brushTexture.texture;
    this.shaderPass.uniforms.time.value = elapsedTime;
    this.shaderPass.uniforms.scale.value = this.settings.scale;
    this.shaderPass.uniforms.smoothStepStart.value =
      this.settings.smoothStepStart;
    this.shaderPass.uniforms.smoothStepEnd.value = this.settings.smoothStepEnd;
    this.shaderPass.uniforms.showGrain.value = this.settings.showGrain;
    this.shaderPass.uniforms.showRipples.value = this.settings.showRipples;
    this.shaderPass.uniforms.showWaves.value = this.settings.showWaves;

    // Render
    this.composer.render();
    //this.renderer.render(this.scene, this.camera);

    window.requestAnimationFrame(this.render.bind(this));
  }
}

let myScene = new MyScene();
myScene.render();
