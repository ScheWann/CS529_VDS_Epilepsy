import React, { useEffect, useRef, useState } from "react";
import { Select, Card, Empty } from "antd";
import * as d3 from "d3";

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

export const SimilarViewer = ({
  allnetworksWithEvent,
  patientID,
  similarityData,
  allnetwork,
  selectedRoi,
  brainSvgData,
  electrodeScreenPositions,
}) => {
  const svgRef = useRef(null);
  const cardRef = useRef();

  const [selectedEvent, setSelectedEvent] = useState(0);
  const [similarEventsOptions, SetSimilarEventsOptions] = useState({});
  const [similarNodesArray, setSimilarNodesArray] = useState([]);
  const [selectedNetwork, setSelectedNetwork] = useState(null);
  const [cardSize, setCardSize] = useState({});

  const changeEvent = (value) => {
    setSelectedEvent(value);
  };

  // For setting the right ROI color
  const roiColorMapping = allnetwork.reduce((acc, data, index) => {
    acc[data.roi] = colorslist[index % colorslist.length];
    return acc;
  }, {});

  // Use Card size to set the size of svg size
  useEffect(() => {
    if (cardRef.current) {
      const { width, height } = cardRef.current.getBoundingClientRect();
      setCardSize({ width, height });
    }
  }, [allnetworksWithEvent, selectedNetwork]);

  // Based on different patient to get different similar events and network data
  useEffect(() => {
    let tempSimilarNodesArray = [];
    let tempSimilarEventsOptions = [];
    if (patientID === "ep129") {
      similarityData[1].neighbors.forEach((element, index) => {
        let similarNodesObj = {
          id: element,
          network: allnetworksWithEvent[element],
        };

        let similarEventsObj = {
          label: element,
          value: index,
        };
        tempSimilarNodesArray.push(similarNodesObj);
        tempSimilarEventsOptions.push(similarEventsObj);
      });
    } else {
      similarityData[13].neighbors.forEach((element, index) => {
        let similarNodesObj = {
          id: element,
          network: allnetworksWithEvent[element],
        };

        let similarEventsObj = {
          label: element,
          value: index,
        };
        tempSimilarNodesArray.push(similarNodesObj);
        tempSimilarEventsOptions.push(similarEventsObj);
      });
    }
    setSimilarNodesArray(tempSimilarNodesArray);
    SetSimilarEventsOptions(tempSimilarEventsOptions);
    // Check and set the selected network after updating the similarNodesArray
    if (
      tempSimilarNodesArray.length > 0 &&
      tempSimilarNodesArray[selectedEvent].network
    ) {
      tempSimilarNodesArray[selectedEvent].network.forEach((element) => {
        if (element.roi === selectedRoi) {
          setSelectedNetwork(element.network);
        }
      });
    }
  }, [allnetworksWithEvent, similarityData, selectedRoi, selectedEvent]);

  useEffect(() => {
    if (similarNodesArray.length > 0 && similarNodesArray[selectedEvent]) {
      const networkForSelectedEvent = similarNodesArray[selectedEvent].network;
      networkForSelectedEvent.forEach((element) => {
        if (element.roi === selectedRoi) {
          setSelectedNetwork(element.network);
        }
      });
    }
  }, [selectedEvent, similarNodesArray, selectedRoi]);
  

  useEffect(() => {
    if (!brainSvgData || !electrodeScreenPositions) return;
    if (selectedNetwork && cardSize.width && cardSize.height) {
      const electrodeTextElements = {};
      // Function to map electrode number to screen position
      const mapElectrodeToPosition = (electrodeNumber) => {
        return electrodeScreenPositions.find(
          (e) => e.electrode_number === electrodeNumber
        );
      };

      // Function to determine if an electrode is a source
      const isSourceElectrode = (electrodeNumber) => {
        return selectedNetwork.some(
          (connection) => connection.source === electrodeNumber
        );
      };

      // Function to determine if an electrode is a target
      const isTargetElectrode = (electrodeNumber) => {
        return selectedNetwork.some(
          (connection) => connection.target === electrodeNumber
        );
      };

      const svg = d3
        .select(svgRef.current)
        .attr("width", cardSize.width)
        .attr("height", cardSize.height);

      svg.selectAll("*").remove();

      // Drawing logic for the selected ROI
      const centerX = cardSize.width / 2;
      const centerY = cardSize.height / 2;

      // Assuming brainSvgData is relevant to all ROIs
      const brainOutline = d3.polygonHull(brainSvgData.map((d) => [d.x, d.y]));

      const xExtent = d3.extent(brainOutline, (d) => d[0]);
      const yExtent = d3.extent(brainOutline, (d) => d[1]);
      const outlineWidth = xExtent[1] - xExtent[0];
      const outlineHeight = yExtent[1] - yExtent[0];

      const scaleX = cardSize.width / outlineWidth;
      const scaleY = cardSize.height / outlineHeight;
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

      // draw connection between electrodes
      const electrodeLines = selectedNetwork
        .map((connection) => {
          const sourcePosition = mapElectrodeToPosition(connection.source);
          const targetPosition = mapElectrodeToPosition(connection.target);

          if (sourcePosition && targetPosition) {
            const sourceX = sourcePosition.x * scale + translateX * 0.5;
            const sourceY = sourcePosition.y * scale + 280;
            const targetX = targetPosition.x * scale + translateX * 0.5;
            const targetY = targetPosition.y * scale + 280;

            return svg
              .append("line")
              .attr("x1", sourceX)
              .attr("y1", sourceY)
              .attr("x2", targetX)
              .attr("y2", targetY)
              .attr("stroke", "#ddd")
              .attr("stroke-width", 1)
              .attr("data-source", connection.source)
              .attr("data-target", connection.target)
              .style("opacity", 0.5);
          }

          return null;
        })
        .filter((line) => line);

      // Draw electrodes for this selected ROI
      electrodeScreenPositions.forEach((electrode) => {
        const position = electrode.label === String(selectedRoi) ? true : false;
        if (position) {
          const transformedX = electrode.x * scale + translateX * 0.5;
          const transformedY = electrode.y * scale + 280;
          const electrodeCircle = svg
            .append("circle")
            .attr("cx", transformedX)
            .attr("cy", transformedY)
            .attr("r", 8)
            .attr(
              "fill",
              isSourceElectrode(electrode.electrode_number)
                ? "green"
                : isTargetElectrode(electrode.electrode_number)
                ? "purple"
                : roiColorMapping[selectedRoi] || "blue"
            )
            .attr("stroke", "black")
            .attr("stroke-width", 1)
            .attr("data-electrode-number", electrode.electrode_number);

          // set the electrode tooltip background
          const electrodeTextBackground = svg
            .append("rect")
            .attr("x", transformedX)
            .attr("y", transformedY - 20)
            .attr("width", 25)
            .attr("height", 20)
            .attr("fill", "#FAEBD7")
            .style("opacity", 0.8)
            .attr("visibility", "hidden");

          // set the electrode tooltip text
          electrodeTextElements[electrode.electrode_number] = {
            text: svg
              .append("text")
              .attr("x", transformedX + 5)
              .attr("y", transformedY - 5)
              .text(electrode.electrode_number)
              .attr("visibility", "hidden"),
            background: electrodeTextBackground,
          };

          if (isSourceElectrode(electrode.electrode_number)) {
            electrodeCircle
              .on("mouseover", function () {
                // Show and raise source electrode ID
                const sourceElement =
                  electrodeTextElements[electrode.electrode_number];
                sourceElement.background.attr("visibility", "visible").raise();
                sourceElement.text.attr("visibility", "visible").raise();

                // Highlight lines connected to this source
                electrodeLines.forEach((line) => {
                  if (line.attr("data-source") == electrode.electrode_number) {
                    line.style("opacity", 1).attr("stroke", "red");
                  }
                });

                // For showing tooltip
                selectedNetwork.forEach((connection) => {
                  if (connection.source === electrode.electrode_number) {
                    const targetElement =
                      electrodeTextElements[connection.target];
                    if (targetElement) {
                      targetElement.background
                        .attr("visibility", "visible")
                        .raise();
                      targetElement.text.attr("visibility", "visible").raise();
                    }
                  }
                });
              })
              .on("mouseout", function () {
                // Reset line opacity
                electrodeLines.forEach((line) => {
                  line.style("opacity", 0.5).attr("stroke", "#ddd");
                });

                // Hide all electrode IDs
                Object.values(electrodeTextElements).forEach((element) => {
                  element.text.attr("visibility", "hidden");
                  element.background.attr("visibility", "hidden");
                });
              });
          }
        }
      });
    }
  }, [brainSvgData, electrodeScreenPositions, selectedEvent, cardSize]);

  if (selectedNetwork) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: "48%",
        }}
      >
        <Card
          ref={cardRef}
          style={{ width: "100%", height: 500, position: "relative" }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              alignItems: "center",
              position: "absolute",
              top: "10px",
              right: 10,
              zIndex: 100,
            }}
          >
            <div style={{ display: "flex", alignItems: "center" }}>
              <div style={{ marginRight: 10, color: "#333" }}>Events:</div>
              <Select
                size={"middle"}
                defaultValue={selectedEvent}
                onChange={changeEvent}
                style={{
                  width: 200,
                }}
                options={similarEventsOptions}
              />
            </div>
          </div>
          {selectedNetwork.length ? (
            <svg ref={svgRef} />
          ) : (
            <Empty
              style={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
              }}
              description={"No similar event is showing"}
            />
          )}
        </Card>
      </div>
    );
  } else {
    return null;
  }
};
