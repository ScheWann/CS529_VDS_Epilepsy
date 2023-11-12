import React, { useRef, useEffect } from "react";
import * as d3 from "d3";

export const NetworkViewer = ({
  allnetwork,
  selectedEventRange,
  electrodeData,
  events,
}) => {
  const svgRef = useRef();
  const scaleFactor = 5; 
  const colorslist = [
    "#1f77b4",
    "#ff7f0e",
    "#2ca02c",
    "#d62728",
    "#9467bd",
    "#8c564b",
    "#e377c2",
    "#bfa3a3",
  ];
  useEffect(() => {
    let filteredData, freqData;
    if (selectedEventRange) {
      filteredData = events.filter((el) =>
        el.time.some(
          (t) =>
            t >= selectedEventRange[0] &&
            t <= selectedEventRange[selectedEventRange.length - 1]
        )
      );
      freqData = [];

      // use for calculate the frequency of active electrodes and array
      for (let i = 0; i < allnetwork.length - 1; i++) {
        const arr = allnetwork[i].electrodes;
        const result = arr.reduce(
          (acc, curr) => {
            const frequency = filteredData.reduce((freq, obj) => {
              if (obj.electrode.includes(curr)) {
                freq++;
              }
              return freq;
            }, 0);

            acc.activeElectrode.push(curr);
            acc.frequency.push(frequency);
            return acc;
          },
          { activeElectrode: [], frequency: [] }
        );

        freqData.push(result);
      }

      const electrodeMap = new Map(
        electrodeData.map((item) => [item.electrode_number, item])
      );

      freqData.forEach((obj) => {
        obj.activeElectrode.forEach((electrodeNumber, index) => {
          const correspondingData = electrodeMap.get(electrodeNumber);
          if (correspondingData) {
            // Update X, Y, Z positions in each object of the freqData
            obj.activeElectrode[index] = {
              electrode_number: electrodeNumber,
              X: correspondingData.X * scaleFactor,
              Y: correspondingData.Y * scaleFactor,
              Z: correspondingData.Z,
            };
          }
        });
      });

      console.log(freqData, "chekchceck");
    }

    const projection = d3.geoOrthographic().scale(100).translate([200, 200]);

    const svg = d3.select(svgRef.current);

    const regions = svg
      .selectAll(".region")
      .data(freqData)
      .enter()
      .append("g")
      .attr("class", "region")
      .attr("transform", (d, i) => `translate(${i * 250}, 0)`)
      .style("fill", (d, i) => colorslist[i % colorslist.length])

    regions
      .selectAll("circle")
      .data((d) => d.activeElectrode)
      .enter()
      .append("circle")
      .attr("cx", (d) => projection([d.X, d.Y])[0])
      .attr("cy", (d) => projection([d.X, d.Y])[1])
      .attr("r", 5)
      .style("fill", (d, i, nodes) => d3.select(nodes[i].parentNode).style("fill"));

  }, []);

  return <svg ref={svgRef} width={1800} height={400}></svg>;
};
