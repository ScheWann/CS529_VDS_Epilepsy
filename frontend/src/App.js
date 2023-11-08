import "./App.css";
import dataRegistry from "./data/dataRegistry.json";
import { BrainViewer } from "./components/brain-viewer/brainViewer.js";
import { EEGDataViewer } from "./components/eeg-data-viewer/eegDataViewer.js";
import React, { useState, useEffect } from "react";
import { PieChartOutlined, UserOutlined } from "@ant-design/icons";
import { Breadcrumb, Layout, Menu, theme } from "antd";
const { Content, Footer, Sider } = Layout;

const App = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState("ep129");
  const [menuId, setMenuId] = useState(["1", "3"]);
  const [BreadcrumbName, SetBreadcrumbName] = useState(["ep129", "Session 1"]);
  const [lesionArray, SetlesionArray] = useState([1, 2]);
  const defaultElList = [
    26, 28, 36, 20, 32, 21, 22, 40, 41, 54, 19, 31, 39, 47, 48, 52, 56, 27, 29,
    34, 35, 43, 49, 50, 53, 18, 33, 44, 30, 38, 51, 37, 108, 109, 107, 102, 112,
    55, 45, 23, 103, 73, 74, 76, 75, 84, 89,
  ];
  const strElectrodes = defaultElList.join(",");

  useEffect(() => {
    fetch(
      `/data/patient/ep129/eeg/sample1/0/500/${strElectrodes}`
    ).then(res => res.json())
    .then((data) => {
      console.log(data, 'EEEEEGGGGGGG')
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
          label: "Session1",
          onClick: () => handleIDsSelect("ep129", "3", "Session 1"),
        },
        {
          key: "4",
          label: "Session2",
          onClick: () => handleIDsSelect("ep129", "4", "Session 2"),
        },
      ];
    } else if (selectedPatient === "ep187") {
      return [
        {
          key: "5",
          label: "Session1",
          onClick: () => handleIDsSelect("ep187", "5", "Session 1"),
        },
        {
          key: "6",
          label: "Session2",
          onClick: () => handleIDsSelect("ep187", "6", "Session 2"),
        },
        {
          key: "7",
          label: "Session3",
          onClick: () => handleIDsSelect("ep187", "7", "Session 3"),
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
          onClick: () => handleIDsSelect("ep129", "3", "Session 1"),
        },
        {
          key: "2",
          label: "ep187",
          onClick: () => handleIDsSelect("ep187", "5", "Session 1"),
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
    <Layout
      style={{
        minHeight: "100vh",
      }}
    >
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={(value) => setCollapsed(value)}
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
            <BrainViewer
              patientID={selectedPatient}
              lesionArray={lesionArray}
            />
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
