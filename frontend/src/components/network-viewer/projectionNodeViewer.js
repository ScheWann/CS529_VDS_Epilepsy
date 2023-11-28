import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { Card, Spin } from "antd";

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
  const svgRefs = useRef({});

  const [svgDimensions, setSvgDimensions] = useState({ width: 0, height: 0 });
  const [selectedRoi, setSelectedRoi] = useState(null);

  // Create a mapping from ROI to color
  const roiColorMapping = allnetwork.reduce((acc, data, index) => {
    acc[data.roi] = colorslist[index % colorslist.length];
    return acc;
  }, {});

  const selectRoi = (roi) => {
    setSelectedRoi(roi);
  };

  // Handler to reset selection on outside clicks
  const handleOutsideClick = (event) => {
    if (selectedRoi && !event.target.closest('.roiBrainCard')) {
      setSelectedRoi(null);
    }
  };

  // Attach event listener
  useEffect(() => {
    document.addEventListener('click', handleOutsideClick);
    return () => {
      document.removeEventListener('click', handleOutsideClick);
    };
  }, [selectedRoi]);

  // Updating SVG Dimensions
  useEffect(() => {
    const updateSvgDimensions = () => {
      allnetwork.forEach(({ roi }) => {
        const svgContainer = svgRefs.current[roi];
        if (svgContainer) {
          const { clientWidth, clientHeight } = svgContainer;
          setSvgDimensions((prevDimensions) => ({
            ...prevDimensions,
            [roi]: { width: clientWidth, height: clientHeight },
          }));
        }
      });
    };

    window.addEventListener("resize", updateSvgDimensions);
    // Initial update
    updateSvgDimensions();

    return () => window.removeEventListener("resize", updateSvgDimensions);
  }, [allnetwork]);

  // Updating the SVG of the Selected ROI
  useEffect(() => {
    if (selectedRoi === null) return; // Skip if no ROI is selected

    const svgContainer = svgRefs.current[selectedRoi];
    if (svgContainer && svgDimensions[selectedRoi]) {
      const { width, height } = svgDimensions[selectedRoi];
      d3.select(svgContainer).selectAll("svg").remove(); // Clear previous SVG
      const svg = d3
        .select(svgContainer)
        .append("svg")
        .attr("width", width)
        .attr("height", height);

      // Drawing logic for the selected ROI
      const centerX = width / 2;
      const centerY = height / 2;

      // Assuming brainSvgData is relevant to all ROIs
      const brainOutline = d3.polygonHull(brainSvgData.map((d) => [d.x, d.y]));

      const xExtent = d3.extent(brainOutline, (d) => d[0]);
      const yExtent = d3.extent(brainOutline, (d) => d[1]);
      const outlineWidth = xExtent[1] - xExtent[0];
      const outlineHeight = yExtent[1] - yExtent[0];

      const scaleX = width / outlineWidth;
      const scaleY = height / outlineHeight;
      const scale = Math.min(scaleX, scaleY) * 0.8;

      const translateX = centerX - (xExtent[0] + outlineWidth / 2) * scale;
      const translateY = centerY - (yExtent[0] + outlineHeight / 2) * scale;

      const translatedOutline = brainOutline.map((point) => [
        point[0] * scale + translateX,
        point[1] * scale + translateY,
      ]);

      // Draw the convex hull as a path
      svg
        .append("path")
        .data([translatedOutline])
        .attr(
          "d",
          d3
            .line()
            .x((d) => d[0])
            .y((d) => d[1])
        )
        .attr("stroke", "black")
        .attr("fill", "none");

      // Draw electrodes for this selected ROI
      electrodeScreenPositions.forEach((electrode) => {
        const position = electrode.label === String(selectedRoi) ? true : false;
        if (position) {
          const transformedX = electrode.x * scale + translateX * 0.5;
          const transformedY = electrode.y * scale + 70;
          svg
            .append("circle")
            .attr("cx", transformedX)
            .attr("cy", transformedY)
            .attr("r", 3) // Adjust radius as needed
            .attr("fill", roiColorMapping[selectedRoi] || "blue");
        }
      });
    }
  }, [selectedRoi, allnetwork, svgDimensions]);

  // Initial Rendering of All SVGs
  useEffect(() => {
    if (!selectedRoi) {
      allnetwork.forEach(({ roi, electrodes }) => {
        const svgContainer = svgRefs.current[roi];
        if (svgContainer && svgDimensions[roi]) {
          const { width, height } = svgDimensions[roi];
          d3.select(svgContainer).selectAll("svg").remove();
          const svg = d3
            .select(svgContainer)
            .append("svg")
            .attr("width", width)
            .attr("height", height);

          const centerX = width / 2;
          const centerY = height / 2;

          const brainOutline = d3.polygonHull(
            brainSvgData.map((d) => [d.x, d.y])
          );

          const xExtent = d3.extent(brainOutline, (d) => d[0]);
          const yExtent = d3.extent(brainOutline, (d) => d[1]);
          const outlineWidth = xExtent[1] - xExtent[0];
          const outlineHeight = yExtent[1] - yExtent[0];

          const scaleX = width / outlineWidth;
          const scaleY = height / outlineHeight;
          const scale = Math.min(scaleX, scaleY) * 0.8;

          const translateX = centerX - (xExtent[0] + outlineWidth / 2) * scale;
          const translateY = centerY - (yExtent[0] + outlineHeight / 2) * scale;

          // Apply translation to each point in the brain outline
          const translatedOutline = brainOutline.map((point) => [
            point[0] * scale + translateX,
            point[1] * scale + translateY,
          ]);

          // Draw the convex hull as a path
          svg
            .append("path")
            .data([translatedOutline])
            .attr(
              "d",
              d3
                .line()
                .x((d) => d[0])
                .y((d) => d[1])
            )
            .attr("stroke", "black")
            .attr("fill", "none");

          // Draw electrodes for this ROI
          electrodeScreenPositions.forEach((electrode) => {
            const position = electrode.label === String(roi) ? true : false;
            if (position) {
              const transformedX = electrode.x * scale + translateX * 0.5;
              const transformedY = electrode.y * scale + 70;

              svg
                .append("circle")
                .attr("cx", transformedX)
                .attr("cy", transformedY)
                .attr("r", 3) // Adjust radius as needed
                .attr("fill", roiColorMapping[roi] || "blue"); // Use ROI color mapping
            }
          });
        }
      });
    }
  }, [svgDimensions, brainSvgData, allnetwork]);

  return (
    <Card style={{ marginTop: 10, width: "49%" }}>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "space-around",
          height: "100%",
        }}
      >
        {allnetwork.map(({ roi }) => (
          <Card
            size="small"
            hoverable
            title={"ROI" + " " + roi}
            key={roi}
            className="roiBrainCard"
            style={{
              position: "relative",
              width: "20%",
              margin: 1,
              maxHeight: 175,
              border:
                roi === selectedRoi
                  ? "2px solid #6495ED"
                  : "1px solid rgba(0, 0, 0, 0.125)",
            }}
            onClick={() => selectRoi(roi)}
          >
            <div
              style={{
                height: "99%",
                width: "99%",
              }}
              key={roi}
              ref={(el) => (svgRefs.current[roi] = el)}
            ></div>
          </Card>
        ))}
      </div>
    </Card>
  );
};
