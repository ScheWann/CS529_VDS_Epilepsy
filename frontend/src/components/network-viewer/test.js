import React, { useRef, useEffect } from "react";
import * as d3 from "d3";

export const Test = ({ electrodeScreenPositions }) => {
  const svgRef = useRef();

  useEffect(() => {
    if (!electrodeScreenPositions) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove(); // Clear SVG to prevent duplicate elements

    // Append a circle for each electrode
    svg.selectAll("circle")
      .data(electrodeScreenPositions)
      .enter()
      .append("circle")
      .attr("cx", d => d.x)
      .attr("cy", d => d.y)
      .attr("r", 5) // Radius of circles
      .attr("fill", "red");

  }, [electrodeScreenPositions]);

  return <svg ref={svgRef} width={400} height={400}></svg>;
};
