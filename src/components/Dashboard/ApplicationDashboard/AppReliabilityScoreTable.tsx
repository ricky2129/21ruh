import { Table } from "antd";

interface AppReliabilityScoreTableProps {
  data: { version: string; score: number }[];
}

const AppReliabilityScoreTable: React.FC<AppReliabilityScoreTableProps> = ({
  data,
}) => {
  const dataSource = data.map((item, index) => ({
    key: index + 1,
    version_name: item.version,
    score: item.score,
  }));

  const columns = [
    {
      title: "#",
      dataIndex: "key",
      key: "key",
    },
    {
      title: "Version Name",
      dataIndex: "version_name",
      key: "version_name",
    },
    {
      title: "Score",
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

export default AppReliabilityScoreTable;
