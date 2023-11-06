import CustomOBJModel from "./modelLoader";
const partURL = 'https://raw.githubusercontent.com/nafiul-nipu/brain-epilepsy-interface-react/master/frontend/src/models/'

export const BrainViewer = (props) => {
    return (
        <group>
            <CustomOBJModel
                url={`${partURL}${props.patientID}/${props.patientID}_brain.obj`}
                color="#505050"
                opacity={0.15}
                transparent={true}
                type="brain"
            />
            {props.lesionArray.map((lesion, index) => {
                return (
                    <CustomOBJModel
                        key={index}
                        url={`${partURL}${props.patientID}/${props.patientID}_lesion${lesion}.obj`}
                        color="#505050"
                        opacity={1}
                        transparent={false}
                        type="lesion"
                    />);
            })}
        </group>
    );
}
