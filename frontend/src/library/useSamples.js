import { useState, useEffect } from "react";
import { json } from "d3";

export const useSamples = ({ patientID, sampleID, range }) => {
  const [data, setData] = useState(null);

  useEffect(() => {
    if (patientID && sampleID && range) {
      const url = `https://raw.githubusercontent.com/ScheWann/CS529_VDS_Epilepsy/main/frontend/src/data/electrodes/${patientID}/${sampleID}/${sampleID}_${range}.json`;

      json(url).then((jdata) => {
        let numericData = jdata.map(function (item) {
          return item.map(function (d) {
            d.start = +d.start;
            d.startPosition = d.startPosition.map(function (val) {
              return +val;
            });
            d.frequency = +d.frequency;

            return d;
          });
        });

        setData(numericData);
      });
    }
  }, [patientID, range, sampleID]);

  return data;
};
