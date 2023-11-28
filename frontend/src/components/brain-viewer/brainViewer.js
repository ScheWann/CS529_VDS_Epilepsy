import { Canvas } from "@react-three/fiber";
import * as THREE from "three";
import * as d3 from "d3";

import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import { useEffect, useState, useRef } from "react";
import dataRegisty from "../../data/dataRegistry.json";
import { BrainObjectLoader } from "./brainObjectLoader";
import { ElectrodeLoader } from "./electrodeLoader";
import { CurveLoader } from "./curveLoader";
import { KeyPoints } from "./keyPoints";
import { Segmented } from "antd";

const width = window.innerWidth / 2.5;
const height = window.innerHeight / 2.5;

export const BrainViewer = (props) => {
  const [selectedElectrode, setSelectedElectrode] = useState(null);
  const [segement, setSegment] = useState("ROI");
  const [brainModel, setBrainModel] = useState(null);
  // const [keyPointsData, setKeyPointsData] = useState([]);
  const cameraRef = useRef();

  const handleButtonClick = () => {
    if (!cameraRef.current || !brainModel || !props.electrodeData) return;
    updateProjections();
  };

  const updateProjections = () => {
    console.log("changed projection");

    if (!cameraRef.current || !brainModel || !props.electrodeData) return;
    const screenPositions = getElectrodeScreenPositions();
    props.setElectrodeScreenPositions(screenPositions);
    projectBrainModelTo2D();
  };

  const changeSegement = (value) => {
    setSegment(value);
  };

  const changeROI = (value) => {
    let roiIndex = parseInt(value.replace(/[^\d]/g, ""));
    props.setROI(roiIndex);
  };

  const getScreenPosition = (object3D) => {
    const vector = new THREE.Vector3();

    // Transform the 3D position to camera space
    vector.setFromMatrixPosition(object3D.matrixWorld);
    vector.project(cameraRef.current);

    // Convert the normalized device coordinates to screen space
    const x = (vector.x * 0.5 + 0.5) * width * 1.5;
    const y = -(vector.y * 0.5 - 0.5) * height * 1.5;

    return { x, y };
  };

  // Function to convert electrode data to 2D screen positions
  const getElectrodeScreenPositions = () => {
    return props.electrodeData.map((electrode) => {
      const position3D = new THREE.Vector3(...electrode.position);
      const screenPosition = getScreenPosition({
        matrixWorld: new THREE.Matrix4().setPosition(position3D),
      });

      // Include the label attribute in the returned object
      return {
        ...screenPosition,
        label: electrode.label,
      };
    });
  };

  const projectBrainModelTo2D = () => {
    if (!brainModel || !brainModel.children) return;

    let screenPositions = [];
    brainModel.children.forEach((child) => {
      if (!child.isMesh) return;

      const geometry = child.geometry;
      if (geometry.isBufferGeometry) {
        // Create an edge geometry
        const edges = new THREE.EdgesGeometry(geometry);
        const line = new THREE.LineSegments(edges);
        const positionAttribute = line.geometry.attributes.position;

        // Iterate over all vertices
        for (let i = 0; i < positionAttribute.count; i++) {
          const vertex = new THREE.Vector3();
          vertex.fromBufferAttribute(positionAttribute, i);
          const screenPos = projectToScreen(vertex, child, cameraRef.current);
          screenPositions.push(screenPos);
        }
      }
    });

    if (props.onSvgCreated) {
      props.onSvgCreated(screenPositions);
    }
  };

  const projectToScreen = (vertex, object3D, camera) => {
    const worldVertex = vertex.clone().applyMatrix4(object3D.matrixWorld);
    worldVertex.project(camera);
    return {
      x: (worldVertex.x * 0.5 + 0.5) * width,
      y: -(worldVertex.y * 0.5 - 0.5) * height,
    };
  };

  useEffect(() => {
    if (brainModel && cameraRef.current) {
      projectBrainModelTo2D();
    }
  }, [brainModel]);

  useEffect(() => {
    const checkCameraAndCalculatePositions = () => {
      if (cameraRef.current && props.electrodeData) {
        clearInterval(intervalId);
        const screenPositions = getElectrodeScreenPositions();
        props.setElectrodeScreenPositions(screenPositions);
      } else {
        console.log("Waiting for camera and electrode data...");
      }
    };

    // Set up an interval to repeatedly check for the camera and electrode data
    const intervalId = setInterval(checkCameraAndCalculatePositions, 500);

    // Clean up the interval
    return () => clearInterval(intervalId);
  }, [props.electrodeData]);
  // useEffect(() => {
  //   fetch("/key_points.json")
  //     .then((response) => response.json())
  //     .then((data) => setKeyPointsData(data));
  // }, []);
  return (
    <div style={{ display: "flex", flexDirection: "column", width: "100%" }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <Segmented
          options={["ROI", "Frequncy", "Propogation", "Curve"]}
          onChange={changeSegement}
          defaultValue={"ROI"}
        />
        <Segmented
          options={["ROI 0", "ROI 1", "ROI 2"]}
          onChange={changeROI}
          defaultValue={"ROI 2"}
        />
        <button onClick={handleButtonClick}>Update Projection</button>
      </div>
      <div style={{ height: height, width: width }}>
        <Canvas>
          <PerspectiveCamera
            makeDefault
            ref={cameraRef}
            position={[-250, -10, 0]}
            up={[0, 0, 1]}
            aspect={width / height}
            near={1}
            far={2000}
            fov={40}
          />
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} />
          <directionalLight
            castShadow
            position={[0, 5, 5]}
            intensity={1}
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
            shadow-camera-near={0.5}
            shadow-camera-far={500}
            shadow-camera-left={-5}
            shadow-camera-right={5}
            shadow-camera-top={5}
            shadow-camera-bottom={-5}
          />
          <directionalLight position={[-250, -10, 0]} />
          <BrainObjectLoader
            patientID={props.patientInformation.patientID}
            lesionArray={props.lesionArray}
            onModelLoaded={setBrainModel}
          />
          {/* {keyPointsData.length > 0 && (
            <KeyPoints points={keyPointsData} color="red" position={{ x: -100, y: -110, z: -120 }} />
          )} */}
          <ElectrodeLoader
            segement={segement}
            cameraRef={cameraRef.current}
            propagationData={props.propagationData}
            setSelectedElectrode={setSelectedElectrode}
            setElectrodeScreenPositions={props.setElectrodeScreenPositions}
            electrodeData={props.electrodeData}
            sampleData={props.sampleData}
            bbox={dataRegisty[props.patientInformation.patientID].bbox}
            selectedEventRange={props.selectedEventRange}
            events={props.events}
            allnetwork={props.allnetwork}
            allnetworkWithEvent={props.allnetworksWithEvent}
            patientID={props.patientInformation.patientID}
          />
          {segement == "Curve" ? (
            <CurveLoader
              segement={segement}
              bbox={dataRegisty[props.patientInformation.patientID].bbox}
              patientID={props.patientInformation.patientID}
              electrodeData={props.electrodeData}
              propagationData={props.propagationData}
              selectedElectrode={selectedElectrode}
            />
          ) : null}

          <OrbitControls
            ref={(control) => {
              // Attach the controls to the camera ref
              if (control && cameraRef.current) {
                cameraRef.current.controls = control;
              }
            }}
            enablePan={true}
          />
        </Canvas>
      </div>
    </div>
  );
};
