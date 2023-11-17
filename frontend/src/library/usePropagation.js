import { useState, useEffect } from "react";
import { json, csv } from "d3";

export const usePropagation = ({ patientID, sampleID, eventID }) => {
  const [electrodeData, setElectrodeData] = useState(null);
  const [propagationData, setPropogationData] = useState(null);
  const [enrichedData, setEnrichedData] = useState([]);

  const electrodeUrl = `https://raw.githubusercontent.com/ScheWann/CS529_VDS_Epilepsy/main/frontend/src/data/electrodes/${patientID}/${patientID}_electrodes_new.csv`;
  const propagationUrl = `https://raw.githubusercontent.com/ScheWann/CS529_VDS_Epilepsy/main/frontend/src/data/electrodes/${patientID}/${sampleID}/${patientID}_${sampleID}_electrode_event1.json`;
  // Function to find electrode by its number
  const findElectrode = (electrodeNumber) => {
    return electrodeData.find((e) => e.electrode_number === electrodeNumber);
  };

  // Function to enrich propagation data with electrode positions
  const enrichPropagationData = () => {
    if (propagationData && electrodeData) {
      return propagationData.network[0].map((link) => ({
        source: findElectrode(link.source),
        target: findElectrode(link.target),
      }));
    }
    return [];
  };

  useEffect(() => {
    if (patientID && sampleID && eventID) {
      csv(electrodeUrl).then((data) => {
        // Convert the 'electrode_number' from string to number for each item
        data = data.map((item) => {
          return {
            ...item,
            electrode_number: Number(item.electrode_number),
          };
        });
        setElectrodeData(data);
      });
      json(propagationUrl).then((data) => {
        setPropogationData(data);
      });
    }
  }, [patientID, sampleID, eventID]);

  useEffect(() => {
    setEnrichedData(enrichPropagationData());
  }, [electrodeData, propagationData]);

  return enrichedData;
};
