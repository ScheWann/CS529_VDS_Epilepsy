import {ModelLoader} from "./modelLoader.js";
const partURL = 'https://raw.githubusercontent.com/ScheWann/CS529_VDS_Epilepsy/Siyuan/frontend/src/data/models/'

export const BrainObjectLoader = (props) => {
    return (
        <group>
            <ModelLoader
                setObjCenter={props.setObjCenter}
                url={`${partURL}${props.patientID}/${props.patientID}_brain_left.obj`}
                color="red"
                opacity={0.8}
                transparent={true}
                depthWrite={false}
                type="brain"
                subType="left"
                renderOrder={2}
            />
            <ModelLoader
                setObjCenter={props.setObjCenter}
                url={`${partURL}${props.patientID}/${props.patientID}_brain_right.obj`}
                color="blue"
                opacity={0.8}
                transparent={true}
                depthWrite={false}
                type="brain"
                subType="right"
                renderOrder={1}
            />
            <ModelLoader
                setObjCenter={props.setObjCenter}
                url={`${partURL}${props.patientID}/${props.patientID}_brain.obj`}
                color="#505050"
                opacity={0.15}
                transparent={true}
                depthWrite={false}
                type="brain"
                subType="none"
                renderOrder={3}
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