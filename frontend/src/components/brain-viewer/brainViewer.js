import { Canvas } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera, Stats } from "@react-three/drei";
import { useEffect, useState } from "react";
import dataRegisty from "../../data/dataRegistry.json";
import { BrainObjectLoader } from "./brainObjectLoader";
import { ElectrodeLoader } from "./electrodeLoader";

const width = window.innerWidth / 3 - 10;
const height = window.innerHeight / 2.6 - 10;

export const BrainViewer = (props) => {
  
  const [allEvents, setAllEvents] = useState({});

  useEffect(() => {
    fetch(`/data/all_events/${props.patientID}`)
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
          patientID={props.patientID}
          lesionArray={props.lesionArray}
        />
        {/* <ElectrodeLoader
          electrodeData={electrodeData}
          sampleData={sample}
          bbox={dataRegisty[patientInformation.id].bbox}
          eegInBrain={eegInBrain}
          selectedEventRange={selectedEventRange}
          timeRange={time}
          eventData={events}
          allnetwork={allnetworks}
          allnetworkWithEvent={allnetworksWithEvent}
          patientID={patientInformation.id}
          eventid={eventid}
        /> */}
        <OrbitControls enablePan={true} />
        <Stats />
      </Canvas>
    </div>
  );
};
