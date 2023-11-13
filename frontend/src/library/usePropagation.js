import { useState, useEffect } from "react";

export const usePropagation = ({ patientID, sampleID, eventID }) => {
  const [electrodeData, setElectrodeData] = useState(null);
  const [propagationData, setPropogationData] = useState(null);
  const [enrichedData, setEnrichedData] = useState([]);

    // Function to find electrode by its number
    const findElectrode = (electrodeNumber) => {
      return electrodeData.find(e => e.electrode_number === electrodeNumber);
    };
  
    // Function to enrich propagation data with electrode positions
    const enrichPropagationData = () => {
      if (propagationData && electrodeData) {
        console.log('yes')
        return propagationData[0].network.map(link => ({
          source: findElectrode(link.source),
          target: findElectrode(link.target)
        }));
      }
      return [];
    };

  useEffect(() => {
    if (patientID && sampleID && eventID) {
      fetch(`/data/electrodes/${patientID}`)
        .then((res) => res.json())
        .then((data) => {
          setElectrodeData(data);
        });

      fetch(`/data/electrodes/propagation/${patientID}/${sampleID}/${eventID}`)
        .then((res) => res.json())
        .then((data) => {
          setPropogationData(data);
        })
    }
  }, [patientID, sampleID, eventID]);

  useEffect(() => {
    setEnrichedData(enrichPropagationData());
  }, [electrodeData, propagationData]);

  return enrichedData;
};
