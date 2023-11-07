import React from "react";
import { useLoader } from "@react-three/fiber";
import * as THREE from "three";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader";

export const ModelLoader = ({ url, color, opacity, transparent, type }) => {
  const obj = useLoader(OBJLoader, url);

  obj.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      child.material.color = new THREE.Color(color);
      child.material.opacity = opacity;
      child.material.transparent = transparent;
    }
  });

  return (
    <group>
      <primitive object={obj} />
    </group>
  );
};
