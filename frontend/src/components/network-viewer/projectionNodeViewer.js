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
    if (
      electrodeScreenPositions &&
      d3Container.current &&
      svgDimensions.width &&
      svgDimensions.height
    ) {
      const svg = d3.select(d3Container.current);
      svg.selectAll("*").remove();
      const { width, height } = svgDimensions;

      // Calculate range of x,y values
      const xValues = electrodeScreenPositions.map((d) => d.x);
      const yValues = electrodeScreenPositions.map((d) => d.y);
      const xMin = Math.min(...xValues);
      const xMax = Math.max(...xValues);
      const yMin = Math.min(...yValues);
      const yMax = Math.max(...yValues);

      // Calculate dynamic xOffset and yOffset to center circles
      const xOffset = (width - (xMax - xMin)) / 2 - xMin;
      const yOffset = (height - (yMax - yMin)) / 2 - yMin;
      svg.attr("width", width).attr("height", height);

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
      <svg ref={d3Container}></svg>
    </Card>
  );
};
