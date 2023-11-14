import React, { useEffect, useRef } from "react";
import * as d3 from "d3";

export const EEGDataViewer = ({ data, containerWidth }) => {
  const chartContainerRef = useRef();

  useEffect(() => {
    if (data) {
      drawCharts();
    }
  }, [data, containerWidth]);

  const drawCharts = () => {
    // Clear existing charts before drawing new ones
    d3.select(chartContainerRef.current).selectAll("#eegDataViewer").remove();

    const keysToDraw = [18, 19, 20, 21, 22, 23, 26, 27, 28, 29];

    keysToDraw.forEach((key) => {
      const chartData = data[key];
      const margin = { top: 10, right: 20, bottom: 30, left: 20 };
      const width = containerWidth * 0.95 - margin.left - margin.right;
      const height = 100;

      const svg = d3
        .select(chartContainerRef.current)
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);
      // Define scales
      const xScale = d3
        .scaleLinear()
        .domain([0, chartData.length - 1])
        .range([0, width]);
      const yScale = d3.scaleLinear().domain([-2000, 2000]).range([height, 0]);
      const area = d3
        .area()
        .x((d, i) => xScale(i))
        .y0((d) => yScale(d[0]))
        .y1((d) => yScale(d[1]));

      // Transform single values into bands
      const bands = chartData.map((value) => [value, -value]);
      svg
        .append("path")
        .datum(bands)
        .attr("class", "area")
        .attr("d", area)
        .style("fill", "#0077b6");

      svg.selectAll(".area").selectAll("path").style("stroke-width", 50);

      svg
        .append("text")
        .attr("x", width / 2)
        .attr("y", height + 30)
        .attr("text-anchor", "middle")
        .text("Time (ms)");

      svg
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2)
        .attr("y", margin.left / 2 - 60)
        .attr("text-anchor", "middle")
        .text("Value");

      // Draw axes
      const xAxis = d3.axisBottom(xScale);
      const yAxis = d3
        .axisLeft(yScale)
        .tickValues([-2000, 0, 2000])
        .tickPadding(3);

      svg.append("g").attr("transform", `translate(0,${height})`).call(xAxis);
      svg.append("g").call(yAxis);
    });
  };

  return <div id="eegDataViewer" ref={chartContainerRef}></div>;
};
