import { Canvas } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import { useEffect, useState } from "react";
import dataRegisty from "../../data/dataRegistry.json";
import { BrainObjectLoader } from "./brainObjectLoader";
import { ElectrodeLoader } from "./electrodeLoader";

const width = window.innerWidth / 3 - 10;
const height = window.innerHeight / 2.6 - 10;

export const BrainViewer = (props) => {
  
  const [allEvents, setAllEvents] = useState({});

  useEffect(() => {
    fetch(`/data/all_events/${props.patientInformation.patientID}`)
      .then((res) => res.json())
      .then((data) => {
        setAllEvents(data);
        console.log(data, '////')
      });
  }, []);

  return (
    <div style={{ height: height, width: width }}>
      <Canvas>
        <PerspectiveCamera
          makeDefault
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
          patientID={props.patientInformation.patientID}
          lesionArray={props.lesionArray}
        />
        <ElectrodeLoader
          electrodeData={props.electrodeData}
          sampleData={props.sampleData}
          bbox={dataRegisty[props.patientInformation.patientID].bbox}
          selectedEventRange={props.selectedEventRange}
          timeRange={props.timeRange}
          events={props.events}
          buttonValue={'Play'}
          allnetwork={props.allnetworks}
          allnetworkWithEvent={props.allnetworksWithEvent}
          patientID={props.patientInformation.patientID}
        />
        <OrbitControls enablePan={true} />
      </Canvas>
    </div>
  );
};
