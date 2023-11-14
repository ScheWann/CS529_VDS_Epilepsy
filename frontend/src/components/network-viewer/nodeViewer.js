import { Card, Empty } from "antd";
import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";

export const NodeViewer = ({ selectedROINetwork, selectedROIColor }) => {
  const roiNetwork = selectedROINetwork["network"];
  const ref = useRef();
  const cardRef = useRef();
  const linkRef = useRef();
  const [cardSize, setCardSize] = useState({});

  function highlightLinks(node, highlight) {
    linkRef.current.style("stroke", (d) => {
      return d.source.id === node.id || d.target.id === node.id
        ? highlight
          ? "red"
          : "#999"
        : "#999";
    });
  }

  useEffect(() => {
    if (cardRef.current) {
      const { width, height } = cardRef.current.getBoundingClientRect();
      console.log(width, height, "is that because of you????");
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
          d3
            .forceLink(links)
            .id((d) => d.id)
            .distance(150)
            .strength(0.1)
        )
        .force("charge", d3.forceManyBody())
        .force(
          "center",
          d3.forceCenter(cardSize.width / 2, cardSize.height / 2)
        );

      const svg = d3
        .select(ref.current)
        .attr("width", cardSize.width)
        .attr("height", cardSize.height);

      const link = svg
        .append("g")
        .attr("stroke", "#999")
        .attr("stroke-opacity", 0.6)
        .selectAll("line")
        .data(links)
        .join("line")
        .attr("stroke-width", (d) => Math.sqrt(d.value));

      const node = svg
        .append("g")
        .attr("stroke", "#fff")
        .attr("stroke-width", 1.5)
        .selectAll("circle")
        .data(nodes)
        .enter()
        .append("circle")
        .attr("r", 15)
        .attr("fill", selectedROIColor)
        .call(drag(simulation));

      const labels = svg
        .append("g")
        .attr("class", "labels")
        .selectAll("text")
        .data(nodes)
        .enter()
        .append("text")
        .attr("text-anchor", "middle")
        .attr("dy", ".35em")
        .text((d) => d.id);

      linkRef.current = svg
        .append("g")
        .attr("stroke", "#999")
        .attr("stroke-opacity", 0.6)
        .selectAll("line")
        .data(links)
        .join("line")
        .attr("stroke-width", (d) => Math.sqrt(d.value));

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
        labels.attr("x", (d) => d.x).attr("y", (d) => d.y);
      }

      // Set up simulation
      simulation.on("tick", () => {
        link
          .attr("x1", (d) => d.source.x)
          .attr("y1", (d) => d.source.y)
          .attr("x2", (d) => d.target.x)
          .attr("y2", (d) => d.target.y);

        node.attr("cx", (d) => d.x).attr("cy", (d) => d.y);
        labels.attr("x", (d) => d.x).attr("y", (d) => d.y);
      });

      function drag(simulation) {
        function dragstarted(event, d) {
          if (!event.active) simulation.alphaTarget(0.3).restart();
          event.subject.fx = event.subject.x;
          event.subject.fy = event.subject.y;
          highlightLinks(d, true);
        }

        function dragged(event, d) {
          event.subject.fx = event.x;
          event.subject.fy = event.y;
        }

        function dragended(event, d) {
          if (!event.active) simulation.alphaTarget(0);
          event.subject.fx = null;
          event.subject.fy = null;
          highlightLinks(d, false);
        }

        return d3
          .drag()
          .on("start", dragstarted)
          .on("drag", dragged)
          .on("end", dragended);
      }
    }
  }, [selectedROINetwork, cardSize]);

  return (
    <Card ref={cardRef} style={{ marginTop: 10, width: "49%" }}>
      {roiNetwork ? (
        <svg ref={ref} />
      ) : (
        <Empty
          style={{
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
          description={"Click one ROI first"}
        />
      )}
    </Card>
  );
};
