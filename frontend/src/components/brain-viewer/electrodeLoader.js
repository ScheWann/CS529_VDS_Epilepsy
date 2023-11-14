import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Color, Object3D, Vector3, Raycaster } from "three";
import { extent, scaleLinear, max } from "d3";
import { useThree } from "@react-three/fiber";

const object = new Object3D();

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
const projectRelativeToCenter = (position, center, scaleFactor) => {
  return {
    x: (position.x - center.x) * scaleFactor,
    y: (position.y - center.y) * scaleFactor,
  };
};

export const ElectrodeLoader = ({
  electrodeData,
  sampleData,
  bbox,
  // eegInBrain,
  selectedEventRange,
  // timeRange,
  events,
  allnetwork,
  // allnetworkWithEvent,
  // patientID,
  // eventid,
  segement,
  objCenter,
  setSelectedElectrode,
  propagationData,
  allnetworkWithEvent,
  setElectrodeScreenPositions,
}) => {
  const isMountedRef = useRef(false);
  const meshRef = useRef();
  const { camera, gl } = useThree();
  useLayoutEffect(() => {
    isMountedRef.current = true;
    meshRef.current.setColorAt(0, new Color());
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // clicking electrode method
  const handleCanvasClick = (event) => {
    const rect = gl.domElement.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    const raycaster = new Raycaster();
    raycaster.setFromCamera({ x, y }, camera);
    const intersects = raycaster.intersectObject(meshRef.current, true);
    if (intersects.length > 0) {
      const instanceId = intersects[0].instanceId;
      const selectedElectrode = electrodeData[instanceId];
      setSelectedElectrode(selectedElectrode.electrode_number); // Assuming electrode_number is the ID
    }
  };

  // instancing
  useLayoutEffect(() => {
    if (!isMountedRef.current) return;
    if (segement === "Propogation") return;
    let filteredData, freqData, freqDomain, circleRadius;
    // based on the time range to filter to events happened on this time
    if (selectedEventRange) {
      filteredData = events.filter((el) =>
        el.time.some(
          (t) =>
            t >= selectedEventRange[0] &&
            t <= selectedEventRange[selectedEventRange.length - 1]
        )
      );
      freqData = [];
      freqDomain = [];

      // use for calculate the frequency of active electrodes and array
      for (let i = 0; i < allnetwork.length - 1; i++) {
        const arr = allnetwork[i].electrodes;
        const result = arr.reduce(
          (acc, curr) => {
            const frequency = filteredData.reduce((freq, obj) => {
              if (obj.electrode.includes(curr)) {
                freq++;
              }
              return freq;
            }, 0);

            acc.activeElectrode.push(curr);
            acc.frequency.push(frequency);
            return acc;
          },
          { activeElectrode: [], frequency: [] }
        );

        freqData.push(result);
        // Get the minimum and maximum electrode frequency
        freqDomain.push(...extent(result.frequency));
      }
      circleRadius = scaleLinear()
        .domain([0, max(freqDomain) === 0 ? 1 : max(freqDomain)])
        .range([1, 2]);
    }
    console.log(freqData, 'waht athtah')
    // Color electrodes in the same ROI
    electrodeData.forEach((electrode, index) => {
      if (segement == "ROI") {
        allnetwork.forEach((network, netIndex) => {
          if (
            network.roi !== "roi" &&
            network.electrodes.includes(electrode["electrode_number"])
          ) {
            meshRef.current.setColorAt(index, new Color(colorslist[netIndex]));
            object.scale.set(1, 1, 1);
          }
        });
      } else {
        // Color active electrodes in the same ROI
        if (selectedEventRange) {
          let inside = false;
          for (let r = 0; r < freqData.length; r++) {
            if (
              freqData[r].frequency[
                freqData[r].activeElectrode.indexOf(electrode.electrode_number)
              ] > 0
            ) {
              meshRef.current.setColorAt(index, new Color(colorslist[r]));
              const size = circleRadius(
                freqData[r].frequency[
                  freqData[r].activeElectrode.indexOf(
                    electrode.electrode_number
                  )
                ]
              );
              object.scale.set(size, size, size);
              inside = true;
              break;
            }
          }
          if (!inside) {
            meshRef.current.setColorAt(index, new Color(0x000000));
            object.scale.set(1, 1, 1);
          }
        }
      }

      object.position.set(
        electrode.position[0],
        electrode.position[1],
        electrode.position[2]
      );
      object.updateMatrix();
      meshRef.current.setMatrixAt(index, object.matrix);
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
    meshRef.current.instanceColor.needsUpdate = true;
  }, [allnetwork, electrodeData, events, selectedEventRange, segement]);

  // use for clicking on electrode to get the curve propagation
  useEffect(() => {
    const canvas = gl.domElement;
    canvas.addEventListener("click", handleCanvasClick);
    return () => canvas.removeEventListener("click", handleCanvasClick);
  }, [gl, camera, electrodeData, setSelectedElectrode]);

  // get the center 3D position based on the 3D brain
  useEffect(() => {
    const projectedPositions = electrodeData.map((electrode) =>
      projectRelativeToCenter(
        new Vector3(
          electrode.position[0],
          electrode.position[1],
          electrode.position[2]
        ),
        objCenter,
        2
      )
    );

    setElectrodeScreenPositions(projectedPositions);
  }, [electrodeData, objCenter]);

  useEffect(() => {
    if (!isMountedRef.current) return;
    let interval;
    if (segement === "Propogation") {
      let currentIndex = 0;
      interval = setInterval(() => {
        if (currentIndex >= sampleData.length) {
          clearInterval(interval);
        } else {
          const currentSample = sampleData[currentIndex];
          let startElec = [
            ...new Set(
              currentSample
                .slice(0, Math.round(currentSample.length))
                .map((item) => item.start)
            ),
          ];

          electrodeData.forEach((electrode, index) => {
            if (startElec.includes(electrode["electrode_number"])) {
              meshRef.current.setColorAt(index, new Color(0x0af521));
              object.scale.set(1.25, 1.25, 1.25);
            } else {
              meshRef.current.setColorAt(index, new Color(0x000000));
              object.scale.set(1, 1, 1);
            }

            object.position.set(
              electrode.position[0],
              electrode.position[1],
              electrode.position[2]
            );
            object.updateMatrix();
            meshRef.current.setMatrixAt(index, object.matrix);
          });

          meshRef.current.instanceMatrix.needsUpdate = true;
          currentIndex = (currentIndex + 1) % sampleData.length;
          meshRef.current.instanceColor.needsUpdate = true;

        }
      }, 1000);
    }
    if (segement == "Curve") {
      // Create a set of source electrode numbers
      const sourceElectrodes = new Set(
        propagationData.map((link) => link.source.electrode_number)
      );

      electrodeData.forEach((electrode, index) => {
        const isSourceElectrode = sourceElectrodes.has(
          electrode.electrode_number
        );
        // based on the different ROI set different color
        if(isSourceElectrode) {
          allnetwork.forEach((network, netIndex) => {
            if (
              network.roi !== "roi" &&
              network.electrodes.includes(electrode.electrode_number)
            ) {
              meshRef.current.setColorAt(index, new Color(colorslist[netIndex]));
              object.scale.set(2, 2, 2);
            } 
          });
        } else {
          meshRef.current.setColorAt(index, new Color(0x000000));
          object.scale.set(1, 1, 1);
        }

        object.position.set(
          electrode.position[0],
          electrode.position[1],
          electrode.position[2]
        );

        object.updateMatrix();
        meshRef.current.setMatrixAt(index, object.matrix);

      });

      meshRef.current.instanceMatrix.needsUpdate = true;
      meshRef.current.instanceColor.needsUpdate = true;
    }
    return () => clearInterval(interval);
  }, [electrodeData, sampleData, segement]);
  return (
    <instancedMesh
      ref={meshRef}
      args={[null, null, electrodeData.length]}
      position={[bbox.x, bbox.y, bbox.z]}
    >
      <sphereGeometry args={[1.5, 32, 32]} />
      <meshStandardMaterial attach="material" color="#fff" emissive={"#000"} />
    </instancedMesh>
  );
};
