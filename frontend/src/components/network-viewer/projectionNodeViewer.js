import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { Card, Button, Modal } from "antd";
import { EyeOutlined } from "@ant-design/icons";
import { SimilarViewer } from "../similar-viewer/similarViewer";

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
  allnetworksWithEvent,
  patientID,
  similarityData,
  projectionFlag,
  setProjectionFlag
}) => {
  const svgRefs = useRef({});
  const modalSvgRef = useRef(null);
  const cardRef = useRef(null);

  const [cardDimensions, setCardDimensions] = useState({ width: 0, height: 0 });
  const [svgDimensions, setSvgDimensions] = useState({ width: 0, height: 0 });
  const [selectedRoi, setSelectedRoi] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Create a mapping from ROI to color
  const roiColorMapping = allnetwork.reduce((acc, data, index) => {
    acc[data.roi] = colorslist[index % colorslist.length];
    return acc;
  }, {});

  const selectRoi = (roi) => {
    setSelectedRoi(roi);
    setProjectionFlag(false)
  };

  const showModal = (roi) => {
    setIsModalOpen(true);
  };

  const handleOk = () => {
    setIsModalOpen(false);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  // Function to render the ROI graph in the modal
  const renderRoiGraphInModal = (roi) => {
    const svgContainer = modalSvgRef.current;
    let filteredNetwork = [];
    // Map to store references to all electrode text elements
    const electrodeTextElements = {};

    // Legend data
    const legendData = [
      { color: "green", label: "Source Electrode" },
      { color: "purple", label: "Target Electrode" },
      { color: roiColorMapping[roi] || "blue", label: "Other Electrode" },
    ];
    
    if (
      !svgContainer ||
      cardDimensions.width === 0 ||
      cardDimensions.height === 0
    )
      return;

    const { width, height } = cardDimensions;
    d3.select(svgContainer).selectAll("svg").remove();

    // Function to map electrode number to screen position
    const mapElectrodeToPosition = (electrodeNumber) => {
      return electrodeScreenPositions.find(
        (e) => e.electrode_number === electrodeNumber
      );
    };

    // Function to determine if an electrode is a source
    const isSourceElectrode = (electrodeNumber) => {
      return filteredNetwork.some(
        (connection) => connection.source === electrodeNumber
      );
    };

    // Function to determine if an electrode is a target
    const isTargetElectrode = (electrodeNumber) => {
      return filteredNetwork.some(
        (connection) => connection.target === electrodeNumber
      );
    };

    const svg = d3
      .select(svgContainer)
      .append("svg")
      .attr("width", width)
      .attr("height", height);

    const centerX = width / 2;
    const centerY = height / 2;

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

    // find the specific event
    allnetworksWithEvent[45].forEach((connection) => {
      if (connection.roi === selectedRoi) {
        filteredNetwork = connection.network;
      }
    });

    // draw connection between electrodes
    const electrodeLines = filteredNetwork
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

    // Draw electrodes for this ROI
    electrodeScreenPositions.forEach((electrode) => {
      const position = electrode.label === String(roi) ? true : false;
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
              : roiColorMapping[roi] || "blue"
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
                if (line.attr("data-source") === electrode.electrode_number) {
                  line.style("opacity", 1).attr("stroke", "red");
                }
              });

              // For showing tooltip
              filteredNetwork.forEach((connection) => {
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

    // Draw legend
    const legend = svg
      .append("g")
      .attr("class", "legend")
      .attr("transform", "translate(10,20)");

    legendData.forEach((item, index) => {
      const legendItem = legend
        .append("g")
        .attr("transform", `translate(0, ${index * 25})`);

      legendItem
        .append("rect")
        .attr("width", 20)
        .attr("height", 20)
        .attr("fill", item.color);

      legendItem
        .append("text")
        .attr("x", 25)
        .attr("y", 15)
        .style("font-size", "12px")
        .text(item.label);
    });
  };

  useEffect(() => {
    if (isModalOpen && cardRef.current) {
      const timeoutId = setTimeout(() => {
        setCardDimensions({
          width: cardRef.current.offsetWidth,
          height: cardRef.current.offsetHeight,
        });
      }, 1);

      return () => clearTimeout(timeoutId);
    }
  }, [isModalOpen]);

  // Effect to re-render SVG when card dimensions change
  useEffect(() => {
    if (selectedRoi && cardDimensions.width && cardDimensions.height) {
      renderRoiGraphInModal(selectedRoi);
    }
  }, [cardDimensions, selectedRoi]);

  // For showing detailed brain model
  useEffect(() => {
    if (isModalOpen && selectedRoi) {
      renderRoiGraphInModal(selectedRoi);
    }
  }, [isModalOpen, selectedRoi]);

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
    if (selectedRoi === null || !projectionFlag) return;
    
    const svgContainer = svgRefs.current[selectedRoi];
    d3.select(svgContainer).selectAll("svg").remove(); 
    if (svgContainer && svgDimensions[selectedRoi]) {
      const { width, height } = svgDimensions[selectedRoi];
      d3.select(svgContainer).selectAll("svg").remove();
      const svg = d3
        .select(svgContainer)
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .style('max-height', '130px'); 

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
            .attr("r", 3) 
            .attr("fill", roiColorMapping[selectedRoi] || "blue");
        }
      });
    }
  }, [selectedRoi, allnetwork, svgDimensions, projectionFlag]);

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
            .attr("height", height)
            .style('max-height', '130px'); 

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
                .attr("r", 3)
                .attr("fill", roiColorMapping[roi] || "blue"); // Use ROI color mapping
            }
          });
        }
      });
    }
  }, [svgDimensions]);

  return (
    <Card style={{ marginTop: 10, width: "100%", height: "95%" }}>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "space-around",
          alignItems: "center",
          height: "100%",
        }}
      >
        {allnetwork.map(({ roi }) => (
          <Card
            size="small"
            hoverable
            title={
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span>{"ROI" + " " + roi}</span>
                <Button
                  size="small"
                  type="primary"
                  onClick={showModal}
                  icon={<EyeOutlined />}
                  ghost
                />
              </div>
            }
            key={roi}
            className="roiBrainCard"
            style={{
              position: "relative",
              width: "20%",
              margin: 1,
              maxHeight: 200,
              border:
                roi === selectedRoi
                  ? "1px solid #6495ED"
                  : "1px solid rgba(0, 0, 0, 0.125)",
            }}
            onClick={() => selectRoi(roi)}
          >
            <div
              style={{
                height: "99%",
                width: "99%",
                minHeight: "130px",
              }}
              key={roi}
              ref={(el) => (svgRefs.current[roi] = el)}
            ></div>
          </Card>
        ))}
        <Modal
          title="Similar View"
          open={isModalOpen}
          onOk={handleOk}
          onCancel={handleCancel}
          width={1200}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-around",
              margin: "30px 0px 30px 0px",
            }}
          >
            <Card ref={cardRef} style={{ width: "48%", height: 500 }}>
              <div ref={modalSvgRef}></div>
            </Card>
            {allnetwork && similarityData && brainSvgData && electrodeScreenPositions? (
              <SimilarViewer
                allnetwork={allnetwork}
                patientID={patientID}
                allnetworksWithEvent={allnetworksWithEvent}
                similarityData={similarityData}
                selectedRoi={selectedRoi}
                brainSvgData={brainSvgData}
                electrodeScreenPositions={electrodeScreenPositions}
              />
            ) : null}
          </div>
        </Modal>
      </div>
    </Card>
  );
};
