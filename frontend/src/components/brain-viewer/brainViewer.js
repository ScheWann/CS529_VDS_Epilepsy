import { Canvas } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import { useEffect, useState, useRef } from "react";
import dataRegisty from "../../data/dataRegistry.json";
import { BrainObjectLoader } from "./brainObjectLoader";
import { ElectrodeLoader } from "./electrodeLoader";
import { CurveLoader } from "./curveLoader";
import { Segmented } from "antd";

const width = window.innerWidth / 2.5;
const height = window.innerHeight / 2.5;

export const BrainViewer = (props) => {
  const [objCenter, setObjCenter] = useState({});
  const [electrodeScreenPositions, setElectrodeScreenPositions] = useState([]);
  const [selectedElectrode, setSelectedElectrode] = useState(null);
  const [segement, setSegment] = useState("ROI");
  const cameraRef = useRef();

  const changeSegement = (value) => {
    setSegment(value);
  };
  const changeROI = (value) => {
    let roiIndex = parseInt(value.replace(/[^\d]/g, ""));
    props.setROI(roiIndex);
  };

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
      </div>
      <div style={{ height: height, width: width }}>
        <Canvas>
          <PerspectiveCamera
            makeDefault
            ref={cameraRef}
            position={[-250, -50, -50]}
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
          <directionalLight
            position={[-250, -10, 0]}
          />
          <BrainObjectLoader
            setObjCenter={setObjCenter}
            patientID={props.patientInformation.patientID}
            lesionArray={props.lesionArray}
          />
          <ElectrodeLoader
            segement={segement}
            objCenter={objCenter}
            cameraRef={cameraRef.current}
            propagationData={props.propagationData}
            setSelectedElectrode={setSelectedElectrode}
            setElectrodeScreenPositions={setElectrodeScreenPositions}
            electrodeData={props.electrodeData}
            sampleData={props.sampleData}
            bbox={dataRegisty[props.patientInformation.patientID].bbox}
            selectedEventRange={props.selectedEventRange}
            timeRange={props.timeRange}
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

          <OrbitControls enablePan={true} />
        </Canvas>
      </div>
    </div>
  );
};
