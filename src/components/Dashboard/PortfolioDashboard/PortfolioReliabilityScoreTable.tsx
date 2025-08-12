import React from "react";

import { Table } from "antd";

interface PortfolioReliabilityScoreTableProps {
  data: { app: string; score: number }[];
}

const ApplicationReliabilityTable: React.FC<
  PortfolioReliabilityScoreTableProps
> = ({ data }) => {
  const dataSource = data.map((item, index) => ({
    key: index + 1,
    application_name: item.app,
    score: `${item.score}%`,
  }));

  const columns = [
    {
      title: "#",
      dataIndex: "key",
      key: "key",
    },
    {
      title: "ApplicationName",
      dataIndex: "application_name",
      key: "application_name",
    },
    {
      title: "Current Score",
      dataIndex: "score",
      key: "score",
    },
  ];

  return (
    <Table
      dataSource={dataSource}
      columns={columns}
      pagination={false}
      style={{ flexGrow: 1 }}
    />
  );
};

export default ApplicationReliabilityTable;
