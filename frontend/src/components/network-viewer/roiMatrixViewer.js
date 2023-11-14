import React, { useEffect, useRef } from "react";
import { Card } from "antd";
import * as d3 from "d3";

export const RoiMatrixViewer = ({ allnetworksWithEvent, setSelectedROINetwork, setSelectedROIColor }) => {
  const filteredAllnetworksWithEvent = allnetworksWithEvent.slice(0, 3);
  const svgRefs = useRef(
    filteredAllnetworksWithEvent.map(() => React.createRef())
  );
  const size = 300;
  const margin = { top: 20, right: 50, bottom: 20, left: 10 };
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

  const handleCardClick = (networkData, index) => {
    setSelectedROINetwork(networkData)
    setSelectedROIColor(colorslist[index])
    console.log(networkData, "checknetwork bro");
  };

  useEffect(() => {
    filteredAllnetworksWithEvent.forEach((network, index) => {
      const svg = d3.select(svgRefs.current[index].current);
      svg.selectAll("matrixViewer").remove();

      const matrixData = network.matrix;
      const numRows = matrixData.length;
      const numCols = matrixData[0].length;
      const cellSize = size * 0.9 / Math.max(numRows, numCols);

      // Define the color scale
      const colorScale = d3
        .scaleLinear()
        .domain([0, 1])
        .range(["#f0efeb", colorslist[index % colorslist.length]]);

      matrixData.forEach((row, i) => {
        row.forEach((value, j) => {
          svg
            .append("rect")
            .attr("x", margin.left + j * cellSize)
            .attr("y", margin.top + i * cellSize)
            .attr("width", cellSize)
            .attr("height", cellSize)
            .attr("rx", cellSize * 0.3)
            .attr("ry", cellSize * 0.3)
            .style("fill", colorScale(value));
        });
      });
    });
  }, [filteredAllnetworksWithEvent, setSelectedROINetwork, setSelectedROIColor]);

  return (
    <div style={{ display: "flex", marginTop: 10 }}>
      {filteredAllnetworksWithEvent.map((network, index) => (
        <Card key={`card-${index}`}
        title={`ROI ${index}`}
        style={{marginRight: 5, padding: 0, cursor: "pointer"}}
        onClick={() => handleCardClick(network, index)}
        >
          <svg
            className="matrixViewer"
            ref={svgRefs.current[index]}
            width={size}
            height={size}
            key={index}
          ></svg>
        </Card>
      ))}
    </div>
  );
};
