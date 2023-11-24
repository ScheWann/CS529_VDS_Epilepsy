import {ModelLoader} from "./modelLoader.js";
const partURL = 'https://raw.githubusercontent.com/ScheWann/CS529_VDS_Epilepsy/Siyuan/frontend/src/data/models/'

export const BrainObjectLoader = (props) => {
    return (
        <group>
            <ModelLoader
                url={`${partURL}${props.patientID}/${props.patientID}_brain_left.obj`}
                color="#F6D5A2"
                opacity={1}
                transparent={true}
                type="brain"
                subType="left"
                renderOrder={2}
                onLoaded={props.onModelLoaded} 
            />
            <ModelLoader
                url={`${partURL}${props.patientID}/${props.patientID}_brain_right.obj`}
                color="#D6D0BA"
                opacity={1}
                transparent={true}
                type="brain"
                subType="right"
                renderOrder={1}
                onLoaded={props.onModelLoaded} 
            />
            <ModelLoader
                url={`${partURL}${props.patientID}/${props.patientID}_brain.obj`}
                color="#B0C4DE"
                opacity={0.15}
                transparent={true}
                type="brain"
                subType="none"
                renderOrder={3}
                onLoaded={props.onModelLoaded}  
            />
            {props.lesionArray.map((lesion, index) => {
                return (
                    <ModelLoader
                        key={index}
                        url={`${partURL}${props.patientID}/${props.patientID}_lesion${lesion}.obj`}
                        color="#999"
                        opacity={1}
                        transparent={false}
                        type="lesion"
                        subType="none"
                    />);
            })}
        </group>
    );
}