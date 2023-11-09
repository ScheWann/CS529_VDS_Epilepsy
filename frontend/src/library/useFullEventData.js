import { useEffect, useState } from "react";
import { json } from "d3";

export const useFullEventData = ({ patientID }) => {
  const [data, setData] = useState(null);

  useEffect(() => {
    if (patientID) {
      const url = `https://raw.githubusercontent.com/ScheWann/CS529_VDS_Epilepsy/main/frontend/src/data/electrodes/${patientID}/${patientID}_all_events.json`;

      json(url).then((jData) => {
        const formattedData = {};
        for (const key in jData) {
          const item = jData[key];

          formattedData[key] = item.map(function (d) {
            return {
              index: +d.index,
              count: +d.count,
              electrode: d.electrode.map(function (e) {
                return +e;
              }),
              time: d.time.map(function (t) {
                return +t;
              }),
            };
          });
        }

        setData(formattedData);
      });
    }
  }, [patientID]);

  return data;
};
