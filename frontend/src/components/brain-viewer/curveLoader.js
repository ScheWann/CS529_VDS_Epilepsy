import React, { useEffect, useRef } from "react";
import {
  Vector3,
  CatmullRomCurve3,
  BufferGeometry,
  LineBasicMaterial,
  Line,
} from "three";
import { useThree } from "@react-three/fiber";

export const CurveLoader = ({
  electrodeData,
  propagationData,
  patientID,
  segement,
  bbox,
  selectedElectrode,
}) => {
  const { scene } = useThree();
  const curveObjectsRef = useRef([]);

  const calculateRadialOffset = (sourcePos, targetPos, radian, radialDistance) => {
    // Calculate midpoint
    const midPoint = new Vector3(
      (sourcePos.x + targetPos.x) / 2,
      (sourcePos.y + targetPos.y) / 2 + 20,
      (sourcePos.z + targetPos.z) / 2 + 20
    );
  
    // Calculate radial offset
    const direction = new Vector3().subVectors(targetPos, sourcePos).normalize();
    const perpendicular = new Vector3(-direction.z, 0, direction.x).normalize();
  
    // Offset midpoint
    midPoint.addScaledVector(perpendicular, Math.cos(radian) * radialDistance);
    midPoint.y += Math.sin(radian) * radialDistance; // Adjust Y to create a 3D curve effect
  
    return midPoint;
  };  

  const drawCurve = (sourcePos, targetPos) => {
    const radian = 1
    const radialDistance = 20;
  
    const midPoint = calculateRadialOffset(sourcePos, targetPos, radian, radialDistance);
  
    const curve = new CatmullRomCurve3([sourcePos, midPoint, targetPos]);
    const points = curve.getPoints(50);
    const geometry = new BufferGeometry().setFromPoints(points);
    const material = new LineBasicMaterial({ color: 0xff0000 });
  
    return new Line(geometry, material);
  };
  

  // initial curves
  const initialCurves = () => {
    selectedElectrode = null;
  };

  // clear all curves when changing tabs or electrodes
  const clearCurves = () => {
    curveObjectsRef.current.forEach((curve) => {
      scene.remove(curve);
      if (curve.geometry) curve.geometry.dispose();
      if (curve.material) curve.material.dispose();
    });
    curveObjectsRef.current = [];
  };

  useEffect(() => {
    // initial curves
    initialCurves();
  }, [segement]);

  useEffect(() => {
    // Clear existing curves
    clearCurves();

    if (
      propagationData &&
      electrodeData &&
      selectedElectrode != null
    ) {
      const filteredPropagationData = propagationData.filter(
        (link) => link.source.electrode_number === selectedElectrode
      );
      filteredPropagationData.forEach((link) => {
        const sourceElectrode = electrodeData.find(
          (e) => e.electrode_number === link.source.electrode_number
        );
        const targetElectrode = electrodeData.find(
          (e) => e.electrode_number === link.target.electrode_number
        );

        if (sourceElectrode && targetElectrode) {
          const sourcePos = new Vector3(
            sourceElectrode.position[0] + bbox.x,
            sourceElectrode.position[1] + bbox.y,
            sourceElectrode.position[2] + bbox.z
          );

          const targetPos = new Vector3(
            targetElectrode.position[0] + bbox.x,
            targetElectrode.position[1] + bbox.y,
            targetElectrode.position[2] + bbox.z
          );

          const curveObject = drawCurve(sourcePos, targetPos);
          scene.add(curveObject);
          curveObjectsRef.current.push(curveObject);
        }
      });
    }
    return () => clearCurves();
  }, [electrodeData, propagationData, scene, selectedElectrode]);

  return null;
};
