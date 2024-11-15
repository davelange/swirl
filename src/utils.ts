import { RepeatWrapping, TextureLoader } from "three";

const textureLoader = new TextureLoader();

const noop = () => null;

export function loadTexture(path: string) {
  let texture = textureLoader.load(path, noop, noop, () => {
    throw new Error(`Failed to load texture ${path}`);
  });

  texture.wrapS = RepeatWrapping;
  texture.wrapT = RepeatWrapping;

  return texture;
}

export function randomInRange(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
