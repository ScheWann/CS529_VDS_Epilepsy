import {ModelLoader} from "./modelLoader.js";
const partURL = 'https://raw.githubusercontent.com/ScheWann/CS529_VDS_Epilepsy/main/frontend/src/data/models/'

export const BrainObjectLoader = (props) => {
    return (
        <group>
            <ModelLoader
                url={`${partURL}${props.patientID}/${props.patientID}_brain.obj`}
                color="#505050"
                opacity={0.15}
                transparent={true}
                type="brain"
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
                    />);
            })}
        </group>
    );
}
