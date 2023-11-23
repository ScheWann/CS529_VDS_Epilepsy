import { useEffect, useState } from "react";
import { json } from "d3";

export const useFullNetworkPerEvent = ({ patientID, sampleID }) => {
  const [data, setData] = useState(null);

  useEffect(() => {
    if (patientID === 'ep129' && sampleID) {
      const url = `https://raw.githubusercontent.com/ScheWann/CS529_VDS_Epilepsy/main/frontend/src/data/electrodes/${patientID}/${sampleID}/${patientID}_${sampleID}_full_network_event_new.json`;

      json(url).then((jData) => {
        const formattedData = {};

        for (const key in jData) {
          const item = jData[key];
          formattedData[key] = item.map(function (d) {
            return {
              roi: d.roi === "rest" ? d.roi : +d.roi,
              network: d.network.map(function (n) {
                return {
                  source: +n.source,
                  target: +n.target,
                };
              }),
              matrix: d.matrix
                ? d.matrix.map(function (row) {
                    return row.map(function (value) {
                      return +value;
                    });
                  })
                : null,
            };
          });
        }
        setData(formattedData);
      });
    }
    if (patientID === 'ep187' && sampleID) {
      const url = `https://raw.githubusercontent.com/ScheWann/CS529_VDS_Epilepsy/main/frontend/src/data/electrodes/${patientID}/${sampleID}/${patientID}_${sampleID}_full_network_event_new.json`;

      json(url).then((jData) => {
        const formattedData = {};

        for (const key in jData) {
          const item = jData[key];
          formattedData[key] = item.map(function (d) {
            return {
              roi: d.roi === "rest" ? d.roi : +d.roi,
              network: d.network.map(function (n) {
                return {
                  source: +n.source,
                  target: +n.target,
                };
              }),
              matrix: d.matrix
                ? d.matrix.map(function (row) {
                    return row.map(function (value) {
                      return +value;
                    });
                  })
                : null,
            };
          });
        }
        setData(formattedData);
      });
    }
  }, [patientID, sampleID]);

  return data;
};
