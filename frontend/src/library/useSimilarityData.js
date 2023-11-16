import { useState, useEffect } from "react";
import { json } from "d3";

export const useSimilarityData = ({ patientID, sampleID }) => {
  const [data, setData] = useState(null);

  useEffect(() => {
    if (patientID && sampleID) {
      const url = `https://raw.githubusercontent.com/ScheWann/CS529_VDS_Epilepsy/main/frontend/src/data/electrodes/${patientID}/${sampleID}/${patientID}_${sampleID}_similarRegion_pca.json`;

      json(url).then((jdata) => {
        setData(jdata);
      });
    }
  }, [patientID, sampleID]);

  return data;
};
