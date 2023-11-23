import React, {useEffect, useMemo, useState} from "react";
import { useLoader } from "@react-three/fiber";
import * as THREE from "three";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader";

export const ModelLoader = ({ url, color, opacity, transparent, type, setObjCenter, subType }) => {
  const obj = useLoader(OBJLoader, url);
  
  // get the brain center for projection
  const center = useMemo(() => {
    if (type === 'brain') {
      const box = new THREE.Box3().setFromObject(obj);
      const objCenter = new THREE.Vector3();
      box.getCenter(objCenter);
      return objCenter;
    }
    return new THREE.Vector3();
  }, [obj, type]);

  useEffect(() => {
    if (type === 'brain' && typeof setObjCenter === 'function') {
      const offset = center.clone().negate();
      obj.position.add(offset);
            if (subType === 'left') {
              obj.position.x -= 30;
            } else if (subType === 'right') {
              obj.position.x += 30;
            }
      setObjCenter(center);
    }
  }, [center, type, setObjCenter]);

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
