import React from "react";

import { Table } from "antd";
import { PortfolioGraphResponse } from "interfaces";

interface PortfolioReliabilityPostureTableProps {
  data: PortfolioGraphResponse[];
}

const ReliabilityPostureTable: React.FC<
  PortfolioReliabilityPostureTableProps
> = ({ data }) => {
  const dataSource = data.map((item, index) => ({
    key: index + 1,
    application_name: item.app_name,
    actual_score: `${item.actual_reliability_score}%`,
    forecasted_score: `${item.forecast_reliability_score}%`,
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
      title: "Actual",
      dataIndex: "actual_score",
      key: "actual_score",
    },
    {
      title: "Forecasted",
      dataIndex: "forecasted_score",
      key: "forecasted_score",
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

export default ReliabilityPostureTable;
