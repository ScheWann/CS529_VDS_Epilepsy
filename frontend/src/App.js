import "./App.css";
import { BrainViewer } from "./components/brain-viewer/brainViewer.js";
import { EEGDataViewer } from "./components/eeg-data-viewer/eegDataViewer.js";
import React, { useState, useEffect } from "react";
import { PieChartOutlined, UserOutlined } from "@ant-design/icons";
import { Breadcrumb, Layout, Menu, theme } from "antd";
const { Content, Footer, Sider } = Layout;

const App = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState("EP129");
  const [menuId, setMenuId] = useState(["1", "3"]);
  const [BreadcrumbName, SetBreadcrumbName] = useState(["EP129", "Session 1"]);

  const handleIDsSelect = (patient, id, name) => {
    if (patient === "EP129") {
      setSelectedPatient(patient);
      setMenuId(["1", id]);
      SetBreadcrumbName([patient, name]);
    } else {
      setSelectedPatient(patient);
      setMenuId(["2", id]);
      SetBreadcrumbName([patient, name]);
    }
  };

  const renderSessions = () => {
    if (selectedPatient === "EP129") {
      return [
        {
          key: "3",
          label: "Session1",
          onClick: () => handleIDsSelect("EP129", "3", "Session 1"),
        },
        {
          key: "4",
          label: "Session2",
          onClick: () => handleIDsSelect("EP129", "4", "Session 2"),
        },
      ];
    } else if (selectedPatient === "EP187") {
      return [
        {
          key: "5",
          label: "Session1",
          onClick: () => handleIDsSelect("EP187", "5", "Session 1"),
        },
        {
          key: "6",
          label: "Session2",
          onClick: () => handleIDsSelect("EP187", "6", "Session 2"),
        },
        {
          key: "7",
          label: "Session3",
          onClick: () => handleIDsSelect("EP187", "7", "Session 3"),
        },
      ];
    }
  };
  const items = [
    {
      key: "sub1",
      icon: <UserOutlined />,
      label: "Patient",
      children: [
        {
          key: "1",
          label: "EP129",
          onClick: () => handleIDsSelect("EP129", "3", "Session 1"),
        },
        {
          key: "2",
          label: "EP187",
          onClick: () => handleIDsSelect("EP187", "5", "Session 1"),
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
          openKeys={["sub1", "sub2"]}
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
            <BrainViewer />
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
