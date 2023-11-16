import React, { useState, useEffect, useRef } from "react";
import { PieChartOutlined, UserOutlined } from "@ant-design/icons";
import { Breadcrumb, Layout, Menu, Card } from "antd";

import "./App.css";
import dataRegistry from "./data/dataRegistry.json";

import { BrainViewer } from "./components/brain-viewer/brainViewer.js";
import { EEGDataViewer } from "./components/eeg-data-viewer/eegDataViewer.js";
import { NetworkViewer } from "./components/network-viewer/networkViewer.js";
import { RoiMatrixViewer } from "./components/network-viewer/roiMatrixViewer.js";
import { NodeViewer } from "./components/network-viewer/nodeViewer.js";
import { SimilarViewer } from "./components/similar-viewer/similarViewer.js";

import { useFullNetwork } from "./library/useFullNetwork";
import { useFullNetworkPerEvent } from "./library/useFullNetworkPerEvent";
import { useFullEventData } from "./library/useFullEventData";
import { useElectrodeData } from "./library/useElectrodeData";
import { useSamples } from "./library/useSamples";
import { usePropagation } from "./library/usePropagation.js";
import { useSimilarityData } from "./library/useSimilarityData.js";

const { Content, Footer, Sider } = Layout;

const App = () => {
  const [collapsed, setCollapsed] = useState(false);
  // use for controlling the patient chosen on main page
  const [selectedPatient, setSelectedPatient] = useState("ep129");
  // use for controlling the menu on main page
  const [menuId, setMenuId] = useState(["1", "3"]);
  // use for showing breadcrumb on main page
  const [BreadcrumbName, SetBreadcrumbName] = useState(["ep129", "Session 1"]);
  // use for storing patient and sample information and send
  const [patientInfo, setPatientInfo] = useState({
    patientID: "ep129",
    sampleID: "sample1",
  });
  // use for showing lesion array and send it to 3D brain to display
  const [lesionArray, SetlesionArray] = useState([1, 2]);
  // use for showing EEG data
  const [eegData, setEEGData] = useState();
  // use for select roi and show 2D network
  const [selectedROINetwork, setSelectedROINetwork] = useState({});
  // use for set EEG container width and height set
  const [width, setWidth] = useState(0);
  // for showing the corresponding color based on the 3D brain ROI color
  const [selectedROIColor, setSelectedROIColor] = useState("");
  // for choosing different ROI to show 2D nodes
  const [ROI, setROI] = useState(2);
  const parentRef = useRef();

  const defaultElList = [
    26, 28, 36, 20, 32, 21, 22, 40, 41, 54, 19, 31, 39, 47, 48, 52, 56, 27, 29,
    34, 35, 43, 49, 50, 53, 18, 33, 44, 30, 38, 51, 37, 108, 109, 107, 102, 112,
    55, 45, 23, 103, 73, 74, 76, 75, 84, 89,
  ];
  const strElectrodes = defaultElList.join(",");

  // get each related data 
  const allEventData = useFullEventData({ patientID: patientInfo.patientID });

  const fullNetwork = useFullNetwork({
    patientID: patientInfo.patientID,
    sampleID: patientInfo.sampleID,
  });

  const fullEventNetwork = useFullNetworkPerEvent({
    patientID: patientInfo.patientID,
    sampleID: patientInfo.sampleID,
  });

  const electrodeData = useElectrodeData({ id: patientInfo.patientID });

  const sampleData = useSamples({
    patientID: patientInfo.patientID,
    sampleID: patientInfo.sampleID,
    range: 1000,
  });

  const propagationData = usePropagation({
    patientID: patientInfo.patientID,
    sampleID: patientInfo.sampleID,
    eventID: 1,
  });

  const similarityData  = useSimilarityData({
    patientID: patientInfo.patientID,
    sampleID: patientInfo.sampleID,
  })

  useEffect(() => {
    fetch(`/data/patient/ep129/eeg/sample1/0/500/${strElectrodes}`)
      .then((res) => res.json())
      .then((data) => {
        setEEGData(data);
      })
      .then(() => {
        if (parentRef.current) {
          const resizeObserver = new ResizeObserver((entries) => {
            for (let entry of entries) {
              setWidth(parentRef.current.offsetWidth);
            }
          });
          resizeObserver.observe(parentRef.current);
          return () => resizeObserver.disconnect();
        }
      });
  }, []);

  // Control the display of breadcrumb
  const handleIDsSelect = (patient, id, name) => {
    if (patient === "ep129") {
      SetlesionArray(dataRegistry[patient].lesionArray);
      setSelectedPatient(patient);
      setMenuId(["1", id]);
      SetBreadcrumbName([patient, name]);
    } else {
      SetlesionArray(dataRegistry[patient].lesionArray);
      setSelectedPatient(patient);
      setMenuId(["2", id]);
      SetBreadcrumbName([patient, name]);
    }
  };

  // Control sessions by different patient
  const renderSessions = () => {
    if (selectedPatient === "ep129") {
      return [
        {
          key: "3",
          label: "Session 1",
          onClick: () => {
            handleIDsSelect("ep129", "3", "Session 1");
            setPatientInfo({
              patientID: "ep129",
              sampleID: "sample1",
            });
          },
        },
        {
          key: "4",
          label: "Session 2",
          onClick: () => {
            handleIDsSelect("ep129", "4", "Session 2");
            setPatientInfo({
              patientID: "ep129",
              sampleID: "sample2",
            });
          },
        },
      ];
    } else if (selectedPatient === "ep187") {
      return [
        {
          key: "5",
          label: "Session 1",
          onClick: () => {
            handleIDsSelect("ep187", "5", "Session 1");
            setPatientInfo({
              patientID: "ep187",
              sampleID: "sample1",
            });
          },
        },
        {
          key: "6",
          label: "Session 2",
          onClick: () => {
            handleIDsSelect("ep187", "6", "Session 2");
            setPatientInfo({
              patientID: "ep187",
              sampleID: "sample2",
            });
          },
        },
        {
          key: "7",
          label: "Session 3",
          onClick: () => {
            handleIDsSelect("ep187", "7", "Session 3");
            setPatientInfo({
              patientID: "ep187",
              sampleID: "sample3",
            });
          },
        },
      ];
    }
  };

  // Control patient array
  const items = [
    {
      key: "sub1",
      icon: <UserOutlined />,
      label: "Patient",
      children: [
        {
          key: "1",
          label: "ep129",
          onClick: () => {
            handleIDsSelect("ep129", "3", "Session 1");
            setPatientInfo({
              patientID: "ep129",
              sampleID: "sample1",
            });
          },
        },
        {
          key: "2",
          label: "ep187",
          onClick: () => {
            handleIDsSelect("ep187", "5", "Session 1");
            setPatientInfo({
              patientID: "ep187",
              sampleID: "sample1",
            });
          },
        },
      ],
    },
    {
      key: "sub2",
      icon: <PieChartOutlined />,
      label: "Session",
      children: renderSessions(),
    },
  ];

  return (
    <Layout>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={(value) => setCollapsed(value)}
        style={{
          overflow: "auto",
          height: "100vh",
          position: "sticky",
          top: 0,
          left: 0,
        }}
      >
        {collapsed ? (
          <div className="projectTitle">
            <img src="/brain-svgrepo-com.svg" alt="Your SVG" />
          </div>
        ) : (
          <div className="projectTitle">
            <img src="/brain-svgrepo-com.svg" alt="Your SVG" />
            <div style={{ fontSize: 16, padding: 5 }}>EpliepsyBrain</div>
          </div>
        )}
        <Menu
          theme="dark"
          defaultSelectedKeys={menuId}
          selectedKeys={menuId}
          mode="inline"
          items={items}
        />
      </Sider>
      <Layout>
        <Content
          style={{
            margin: "0 16px",
          }}
        >
          <Breadcrumb
            style={{
              margin: "16px 0",
            }}
            items={BreadcrumbName.map((item) => ({ title: item }))}
          />
          <div
            style={{
              padding: 20,
              minHeight: 360,
              background: "white",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              {allEventData && fullNetwork && electrodeData ? (
                <Card ref={parentRef} className="brainViewer">
                  <BrainViewer
                    propagationData={propagationData}
                    patientInformation={patientInfo}
                    lesionArray={lesionArray}
                    electrodeData={electrodeData}
                    sampleData={sampleData}
                    timeRange={1000}
                    events={allEventData[patientInfo.sampleID]}
                    allnetwork={fullNetwork}
                    allnetworksWithEvent={fullEventNetwork}
                    selectedEventRange={[103, 113]}
                    setROI={setROI}
                  />
                </Card>
              ) : null}

              {eegData ? (
                <Card ref={parentRef} className="eegContainer">
                  <EEGDataViewer
                    containerWidth={width}
                    patientID={selectedPatient}
                    lesionArray={lesionArray}
                    data={eegData}
                  />
                </Card>
              ) : null}
            </div>

            {/* {allEventData && fullNetwork && electrodeData ? (
              <NetworkViewer
                events={allEventData[patientInfo.sampleID]}
                allnetwork={fullNetwork}
                electrodeData={electrodeData}
                selectedEventRange={[103, 113]}
              />
            ) : null} */}
            <div style={{ display: "flex", height: "40vh", justifyContent: "space-between" }}>
              {/* {fullEventNetwork ? (
                <RoiMatrixViewer
                  allnetworksWithEvent={fullEventNetwork[1]}
                  setSelectedROINetwork={setSelectedROINetwork}
                  setSelectedROIColor={setSelectedROIColor}
                />
              ) : null} */}

              {fullEventNetwork ? (
                <NodeViewer
                  allnetworksWithEvent={fullEventNetwork[1]}
                  ROI={ROI}
                />
              ) : null}

              {fullEventNetwork && similarityData ? (
                <SimilarViewer
                  allnetworksWithEvent={fullEventNetwork}
                  similarityData={similarityData}
                  ROI={ROI}
                  selectedROIColor={selectedROIColor}
                />
              ) : null}
            </div>
          </div>
        </Content>
        <Footer
          style={{
            textAlign: "center",
          }}
        >
          EpliepsyBrain ©2023 Created by Siyuan Zhao, Nasibeh Hashmati, Hamed
          Khaleghi
        </Footer>
      </Layout>
    </Layout>
  );
};
export default App;
