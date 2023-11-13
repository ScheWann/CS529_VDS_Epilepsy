import { Canvas } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import { useEffect, useState, useRef } from "react";
import dataRegisty from "../../data/dataRegistry.json";
import { BrainObjectLoader } from "./brainObjectLoader";
import { ElectrodeLoader } from "./electrodeLoader";
import { CurveLoader } from "./curveLoader";
import { Segmented } from "antd";
import { Test } from "../network-viewer/test";

const width = window.innerWidth / 3 - 10;
const height = window.innerHeight / 2.6 - 10;

export const BrainViewer = (props) => {
  const [allEvents, setAllEvents] = useState({});
  const [objCenter, setObjCenter] = useState({});
  const [electrodeScreenPositions, setElectrodeScreenPositions] = useState([]);
  const [selectedElectrode, setSelectedElectrode] = useState(null);
  const [segement, setSegment] = useState("ROI");
  const cameraRef = useRef();

  useEffect(() => {
    fetch(`/data/all_events/${props.patientInformation.patientID}`)
      .then((res) => res.json())
      .then((data) => {
        setAllEvents(data);
      });
  }, [
    setObjCenter,
    objCenter,
    setElectrodeScreenPositions,
    electrodeScreenPositions,
  ]);

  const changeSegement = (value) => {
    console.log(value);
    setSegment(value);
  };

  return (
    <div style={{ display: "flex" }}>
      <div style={{ height: height, width: width }}>
        <Segmented
          options={["ROI", "Frequncy", "Propogation", "Curve"]}
          onChange={changeSegement}
          defaultValue={"ROI"}
        />
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
          <BrainObjectLoader
            setObjCenter={setObjCenter}
            patientID={props.patientInformation.patientID}
            lesionArray={props.lesionArray}
          />
          <ElectrodeLoader
            segement={segement}
            objCenter={objCenter}
            cameraRef={cameraRef.current}
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
          {segement == "Curve" ? 
          <CurveLoader
            bbox={dataRegisty[props.patientInformation.patientID].bbox}
            patientID={props.patientInformation.patientID}
            electrodeData={props.electrodeData} 
            propagationData={props.propagationData}
            selectedElectrode={selectedElectrode}
          /> : null}

          <OrbitControls enablePan={true} />
        </Canvas>
      </div>
      <Test electrodeScreenPositions={electrodeScreenPositions} />
    </div>
  );
};
