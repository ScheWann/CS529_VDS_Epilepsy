import { useState, useEffect } from "react";
import { csv } from "d3";

// loading and saving electrode data

export const useElectrodeData = ({ id }) => {
  const [data, setData] = useState(null);

  useEffect(() => {
    if (id) {
      let electrodeURL;
      if (id === "ep187") {
        electrodeURL = `https://raw.githubusercontent.com/ScheWann/CS529_VDS_Epilepsy/main/frontend/src/data/electrodes/${id}/${id}_rois.csv`;
      } else {
        electrodeURL = `https://raw.githubusercontent.com/ScheWann/CS529_VDS_Epilepsy/main/frontend/src/data/electrodes/${id}/${id}_electrodes_new.csv`;
      }
      const row = (d) => {
        d.electrode_number = +d.electrode_number;
        d.position = JSON.parse(d.position);
        return d;
      };
      csv(electrodeURL, row).then(setData);
    }
  }, [id]);

  return data;
};
