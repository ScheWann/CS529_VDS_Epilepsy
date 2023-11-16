import React, { useEffect, useState, useRef } from "react";
import { Select, Card, Empty } from "antd";
// import { BlockOutlined } from '@ant-design/icons';
import * as d3 from "d3";

export const SimilarViewer = ({
  allnetworksWithEvent,
  similarityData,
  ROI,
}) => {
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
  const selectedROIColor = colorslist[ROI];

  const [similarNodesArray, setSimilarNodesArray] = useState([]);
  const [selectedNetwork, setSelectedNetwork] = useState(null);
  const [similarEventsOptions, SetSimilarEventsOptions] = useState({});
  const [selectedEvent, setSelectedEvent] = useState(2);
  const [cardSize, setCardSize] = useState({});

  const ref = useRef();
  const cardRef = useRef();
  const linkRef = useRef();

  const changeEvent = (value) => {
    setSelectedEvent(value);
  };

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
    let tempSimilarNodesArray = [];
    let tempSimilarEventsOptions = [];
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

    setSimilarNodesArray(tempSimilarNodesArray);
    SetSimilarEventsOptions(tempSimilarEventsOptions);
    // Check and set the selected network after updating the similarNodesArray
    if (
      tempSimilarNodesArray.length > 0 &&
      tempSimilarNodesArray[selectedEvent].network
    ) {
      setSelectedNetwork(
        tempSimilarNodesArray[selectedEvent].network[ROI]["network"]
      );
    }
  }, [allnetworksWithEvent, similarityData, ROI, selectedEvent]);

  useEffect(() => {
    if (cardRef.current) {
      const { width, height } = cardRef.current.getBoundingClientRect();
      console.log(width, height, "opopopoop");
      setCardSize({ width, height });
    }
  }, [allnetworksWithEvent, selectedNetwork]);

  useEffect(() => {
    if (selectedNetwork && cardSize.width && cardSize.height) {
      d3.select(ref.current).selectAll("*").remove();

      const nodes = Array.from(
        new Set(selectedNetwork.flatMap((link) => [link.source, link.target])),
        (id) => ({ id })
      );

      const links = selectedNetwork.map((link) => ({
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
            .distance(100)
            .strength(0.1)
        )
        .force("charge", d3.forceManyBody())
        .force(
          "center",
          d3.forceCenter(cardSize.width / 2, cardSize.height / 2)
        );

      const svg = d3
        .select(ref.current)
        .attr("width", cardSize.width * 0.9)
        .attr("height", cardSize.height * 0.9);

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
        .attr("dy", ".10em")
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
  }, [allnetworksWithEvent, cardSize, ROI]);

  if (selectedNetwork) {
    // Render NodeViewer if selectedNetwork is set
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: "49%",
        }}
      >
        <Card
          ref={cardRef}
          style={{ marginTop: 10, height: "calc(100% - 10px)" }}
        >
          <div style={{display: "flex", justifyContent:"space-between", alignItems: "center"}}>
            <div style={{marginLeft: 10, color: "#333"}}>Similar graph</div>
            <div
              style={{ display: "flex", float: "right", alignItems: "center" }}
            >
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
            <svg ref={ref} />
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