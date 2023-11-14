import { Card, Empty } from "antd";
import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";

export const NodeViewer = ({ selectedROINetwork, selectedROIColor }) => {
  const roiNetwork = selectedROINetwork["network"];
  const ref = useRef();
  const cardRef = useRef();
  const [cardSize, setCardSize] = useState({ width: 380, height: 380 }); 

  useEffect(() => {
    console.log(cardRef.current.getBoundingClientRect(), '890890890')
    if (cardRef.current) {
      const { width, height } = cardRef.current.getBoundingClientRect();
      setCardSize({ width, height });
    }
  }, [selectedROINetwork]); 

  useEffect(() => {
    if (roiNetwork && cardSize.width && cardSize.height) {
    d3.select(ref.current).selectAll("*").remove();
      const nodes = Array.from(
        new Set(roiNetwork.flatMap((link) => [link.source, link.target])),
        (id) => ({ id })
      );

      const links = roiNetwork.map((link) => ({
        source: nodes.find((n) => n.id === link.source),
        target: nodes.find((n) => n.id === link.target),
      }));

      // Set up the simulation
      const simulation = d3
        .forceSimulation(nodes)
        .force(
          "link",
          d3.forceLink(links).id((d) => d.id)
        )
        .force("charge", d3.forceManyBody())
        .force("center", d3.forceCenter(cardSize.width / 2, cardSize.height / 2));

      const svg = d3
        .select(ref.current)
        .attr("width", cardSize.width)
        .attr("height", cardSize.height);

      // Create links
      const link = svg
        .append("g")
        .attr("stroke", "#999")
        .attr("stroke-opacity", 0.6)
        .selectAll("line")
        .data(links)
        .join("line")
        .attr("stroke-width", (d) => Math.sqrt(d.value));

      // Create nodes
      const node = svg
        .append("g")
        .attr("stroke", "#fff")
        .attr("stroke-width", 1.5)
        .selectAll("circle")
        .data(nodes)
        .join("circle")
        .attr("r", 5)
        .attr("fill", selectedROIColor)
        .call(drag(simulation));

      // Set up simulation
      simulation.nodes(nodes).on("tick", ticked);
      simulation.force("link").links(links);

      // Event handlers
      function ticked() {
        link
          .attr("x1", (d) => d.source.x)
          .attr("y1", (d) => d.source.y)
          .attr("x2", (d) => d.target.x)
          .attr("y2", (d) => d.target.y);

        node.attr("cx", (d) => d.x).attr("cy", (d) => d.y);
      }

      // Set up simulation
      simulation.on("tick", () => {
        link
          .attr("x1", (d) => d.source.x)
          .attr("y1", (d) => d.source.y)
          .attr("x2", (d) => d.target.x)
          .attr("y2", (d) => d.target.y);

        node.attr("cx", (d) => d.x).attr("cy", (d) => d.y);
      });

      function drag(simulation) {
        function dragstarted(event) {
          if (!event.active) simulation.alphaTarget(0.3).restart();
          event.subject.fx = event.subject.x;
          event.subject.fy = event.subject.y;
        }

        function dragged(event) {
          event.subject.fx = event.x;
          event.subject.fy = event.y;
        }

        function dragended(event) {
          if (!event.active) simulation.alphaTarget(0);
          event.subject.fx = null;
          event.subject.fy = null;
        }

        return d3
          .drag()
          .on("start", dragstarted)
          .on("drag", dragged)
          .on("end", dragended);
      }
    }
  }, [selectedROINetwork]);

  return (
    <Card ref={cardRef} style={{ marginTop: 10, width:"49%" }}>
      {roiNetwork ? (
        <svg id="nodeViewer" ref={ref} />
      ) : (
        <Empty style={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "center"}} description={"Click one ROI first"} />
      )}
    </Card>
  );
};
