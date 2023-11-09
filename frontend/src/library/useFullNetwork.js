import { useEffect, useState } from "react";
import { json } from "d3";

export const useFullNetwork = ({ patientID, sampleID }) => {
  const [data, setData] = useState(null);

  useEffect(() => {
    if (patientID && sampleID) {
      const url = `https://raw.githubusercontent.com/ScheWann/CS529_VDS_Epilepsy/main/frontend/src/data/electrodes/${patientID}/${sampleID}/${patientID}_${sampleID}_full_network.json`;

      json(url).then((jData) => {
        let numericData = jData.map(function (d) {
          d.roi = d.roi === "rest" ? d.roi : +d.roi;
          d.network.forEach(function (n) {
            n.source = +n.source;
            n.target = +n.target;
          });
          if (d.matrix) {
            d.matrix = d.matrix.map(function (m) {
              return m.map(function (val) {
                return +val;
              });
            });
          }
          if (d.roi === "rest") {
            d["roi-network"].forEach(function (n) {
              n.source = +n.source;
              n.target = +n.target;
            });
            d.roiWithCount.forEach(function (n) {
              n.source = +n.source;
              n.target = +n.target;
              n.count = +n.count;
            });
          }
          return d;
        });
        setData(numericData);
      });
    }
  }, [patientID, sampleID]);

  return data;
};
