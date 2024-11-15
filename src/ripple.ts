import * as THREE from "three";

export type RippleMesh = THREE.Mesh<
  THREE.PlaneGeometry,
  THREE.MeshBasicMaterial
>;

const geometry = new THREE.PlaneGeometry(180, 180, 1, 1);

export class Ripple {
  material: THREE.MeshBasicMaterial;
  mesh: RippleMesh;

  constructor({
    texture,
    scene,
  }: {
    texture: THREE.Texture;
    scene: THREE.Scene;
  }) {
    this.material = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      depthTest: false,
      depthWrite: false,
    });
    this.mesh = new THREE.Mesh(geometry, this.material);
    this.mesh.visible = false;

    scene.add(this.mesh);
  }

  place({ x, y }: { x: number; y: number }) {
    this.mesh.position.x = x;
    this.mesh.position.y = y;
    this.mesh.visible = true;
    this.mesh.material.opacity = 0.5;
    this.mesh.scale.setX(1);
    this.mesh.scale.setY(1);
    this.mesh.rotateZ(Math.PI * Math.random());
  }

  update() {
    if (this.mesh.material.opacity < 0.001) {
      this.mesh.visible = false;
    } else {
      this.mesh.material.opacity *= 0.97;
      this.mesh.scale.x = this.mesh.scale.x * 0.982 + 0.07;
      this.mesh.scale.y = this.mesh.scale.y * 0.982 + 0.07;
      this.mesh.rotateZ(0.003);
    }
  }
}
