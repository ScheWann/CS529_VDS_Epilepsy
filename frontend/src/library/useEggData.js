import { useState, useEffect } from "react";
import { json } from "d3";

export const useEggData = ({ patientID, sampleID }) => {
  const [data, setData] = useState(null);

  useEffect(() => {
    if (patientID === "ep129" && sampleID) {
      const url = `https://raw.githubusercontent.com/ScheWann/CS529_VDS_Epilepsy/main/frontend/src/data/electrodes/${patientID}/${sampleID}/${patientID}_${sampleID}_0_500_egg.json`;

      json(url).then((jdata) => {
        setData(jdata);
      });
    } else {
      const url = `https://raw.githubusercontent.com/ScheWann/CS529_VDS_Epilepsy/Siyuan/frontend/src/data/electrodes/${patientID}/${sampleID}/${patientID}_${sampleID}_14000_14500_egg.json`;

      json(url).then((jdata) => {
        setData(jdata);
      });
    }
  }, [patientID, sampleID]);

  return data;
};
