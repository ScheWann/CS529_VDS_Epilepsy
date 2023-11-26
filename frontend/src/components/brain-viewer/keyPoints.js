import React from 'react';
import * as THREE from 'three';
import { useThree } from '@react-three/fiber';

export const KeyPoints = ({ points, color, position }) => {
  const { scene } = useThree();

  React.useEffect(() => {
    // Parse and flatten the points data
    const vertices = points.flat();

    // Create geometry
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));

    // Create material
    const material = new THREE.PointsMaterial({ color: color, size: 2 });

    // Create Points
    const pointsMesh = new THREE.Points(geometry, material);
    if (position) {
        pointsMesh.position.set(position.x, position.y, position.z);
      }
    scene.add(pointsMesh);

    // Clean up
    return () => {
      scene.remove(pointsMesh);
      geometry.dispose();
      material.dispose();
    };
  }, [points, color, scene, position]);

  return null; // This component does not render anything itself
};
