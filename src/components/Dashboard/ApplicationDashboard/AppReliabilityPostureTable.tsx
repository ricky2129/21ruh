import { Table } from "antd";

interface AppReliabilityPostureTableProps {
  data: {
    env_name: string;
    env_id: number;
    actual_reliability_score: number;
    forecast_reliability_score: number;
  };
}

const AppReliabilityPostureTable: React.FC<AppReliabilityPostureTableProps> = ({
  data,
}) => {
  const actualScore = `${data.actual_reliability_score}%`;
  const forecastedScore = `${data.forecast_reliability_score}%`;

  const dataSource = [
    {
      key: data.env_id,
      actual: actualScore,
      forecasted: forecastedScore,
    },
  ];

  const columns = [
    {
      title: "Actual",
      dataIndex: "actual",
      key: "actual",
    },
    {
      title: "Forecasted",
      dataIndex: "forecasted",
      key: "forecasted",
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

export default AppReliabilityPostureTable;
