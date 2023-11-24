import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { Card } from "antd";

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

export const ProjectionNodeViewer = ({
  electrodeScreenPositions,
  allnetwork,
  brainSvgData,
}) => {
  const d3Container = useRef(null);
  const [svgDimensions, setSvgDimensions] = useState({ width: 0, height: 0 });

  // Create a mapping from ROI to color
  const roiColorMapping = allnetwork.reduce((acc, data, index) => {
    acc[data.roi] = colorslist[index % colorslist.length];
    return acc;
  }, {});

  useEffect(() => {
    const updateSvgDimensions = () => {
      if (d3Container.current && d3Container.current.parentNode) {
        const cardWidth = d3Container.current.parentNode.clientWidth;
        const cardHeight = d3Container.current.parentNode.clientHeight;
        setSvgDimensions({ width: cardWidth, height: cardHeight });
      }
    };

    // Call the function and also set up a resize listener
    updateSvgDimensions();
    window.addEventListener("resize", updateSvgDimensions);

    // Cleanup the listener on component unmount
    return () => {
      window.removeEventListener("resize", updateSvgDimensions);
    };
  }, []);

  useEffect(() => {
    if (brainSvgData) {
      const container = document.getElementById("brainSvg");
      container.innerHTML = "";
      container.appendChild(brainSvgData.cloneNode(true));
    }
  }, [brainSvgData]);

  useEffect(() => {
    if (
      electrodeScreenPositions &&
      d3Container.current &&
      svgDimensions.width &&
      svgDimensions.height
    ) {

      d3.select(d3Container.current).selectAll("svg").remove();
      const svg = d3
        .select(d3Container.current)
        .append("svg")
        .attr("width", svgDimensions.width)
        .attr("height", svgDimensions.height);

      // Calculate range of x,y values
      const xValues = electrodeScreenPositions.map((d) => d.x);
      const yValues = electrodeScreenPositions.map((d) => d.y);
      const xMin = Math.min(...xValues);
      const xMax = Math.max(...xValues);
      const yMin = Math.min(...yValues);
      const yMax = Math.max(...yValues);

      // Calculate dynamic xOffset and yOffset to center circles
      const xOffset = (svgDimensions.width - (xMax - xMin)) / 2 - xMin;
      const yOffset = (svgDimensions.height - (yMax - yMin)) / 2 - yMin;

      svg
        .selectAll(".electrode-circle")
        .data(electrodeScreenPositions)
        .enter()
        .append("circle")
        .attr("class", "electrode-circle")
        .attr("cx", (d) => d.x + xOffset)
        .attr("cy", (d) => d.y + yOffset)
        .attr("r", 5)
        .attr("fill", (d) => roiColorMapping[d.label] || "blue");
    }
  }, [electrodeScreenPositions, roiColorMapping, svgDimensions]);

  return (
    <Card style={{ marginTop: 10, width: "49%" }}>
      <div style={{ position: "relative", width: "100%", height: "100%" }}>
        <div
          id="electrodeScreenPositionSvg"
          ref={d3Container}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
          }}
        ></div>
        <div
          id="brainSvg"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
          }}
        ></div>
      </div>
    </Card>
  );
};
