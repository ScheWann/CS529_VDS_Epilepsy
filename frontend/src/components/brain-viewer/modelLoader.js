import React, { useEffect, useMemo, useState } from "react";
import { useLoader } from "@react-three/fiber";
import * as THREE from "three";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader";

export const ModelLoader = ({
  url,
  color,
  opacity,
  transparent,
  type,
  subType,
  renderOrder,
}) => {
  const obj = useLoader(OBJLoader, url);

  // get the brain center for projection
  const center = useMemo(() => {
    if (type === "brain") {
      const box = new THREE.Box3().setFromObject(obj);
      const objCenter = new THREE.Vector3();
      box.getCenter(objCenter);
      return objCenter;
    }
    return new THREE.Vector3();
  }, [obj, type]);

  useEffect(() => {
    if (type === "brain") {
      const offset = center.clone().negate();
      obj.position.add(offset);
      if (subType === "left") {
        obj.position.x -= 28;
        obj.position.z += 10;
      } else if (subType === "right") {
        obj.position.x += 28;
        obj.position.z += 10;
      }
    }
    obj.renderOrder = renderOrder;
  }, [center, type, subType, renderOrder]);

  obj.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      child.material = new THREE.MeshStandardMaterial({
        color: new THREE.Color(color),
        opacity: opacity,
        roughness: 0.8,
        metalness: 0.0,
        transparent: transparent,
      });
    }
  });

  return (
    <group>
      <primitive object={obj} />
    </group>
  );
};
