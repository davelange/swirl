import * as THREE from "three";

export type RippleMesh = THREE.Mesh<
  THREE.PlaneGeometry,
  THREE.MeshBasicMaterial
>;

export class Ripple {
  geometry = new THREE.PlaneGeometry(180, 180, 1, 1);

  material: THREE.MeshBasicMaterial;
  mesh: RippleMesh;

  material2: THREE.MeshBasicMaterial;
  mesh2: RippleMesh;

  constructor({
    texture,
    texture2,
    scene,
  }: {
    texture: THREE.Texture;
    texture2: THREE.Texture;
    scene: THREE.Scene;
  }) {
    this.material = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      depthTest: false,
      depthWrite: false,
    });
    this.mesh = new THREE.Mesh(this.geometry, this.material);

    this.material2 = new THREE.MeshBasicMaterial({
      map: texture2,
      transparent: true,
      depthTest: false,
      depthWrite: false,
    });
    this.mesh2 = new THREE.Mesh(this.geometry, this.material2);

    this.mesh.visible = false;
    this.mesh2.visible = false;

    scene.add(this.mesh);
    scene.add(this.mesh2);
  }

  place({ x, y }: { x: number; y: number }) {
    for (const mesh of [this.mesh2]) {
      mesh.position.x = x;
      mesh.position.y = y;
      mesh.visible = true;
      mesh.material.opacity = 0.5;
      mesh.scale.setX(1);
      mesh.scale.setY(1);
      mesh.rotateZ(Math.PI * Math.random());
    }
  }

  update() {
    for (const mesh of [this.mesh2]) {
      if (mesh.material.opacity < 0.001) {
        mesh.visible = false;
      } else {
        mesh.material.opacity *= 0.97;
        mesh.scale.x = mesh.scale.x * 0.982 + 0.07;
        mesh.scale.y = mesh.scale.y * 0.982 + 0.07;
        mesh.rotateZ(0.003);
      }
    }
  }
}
