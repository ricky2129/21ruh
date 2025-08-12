import { Fragment } from "react";
import { useGetChaosAgents } from "react-query";
import { useNavigate, useParams } from "react-router-dom";

import { PlusOutlined } from "@ant-design/icons";
import { Flex, Table, TableColumnsType, Tag } from "antd";
import { RouteUrl } from "constant";
import { resolveUrlParams } from "helpers";
import { AgentsResponse } from "interfaces";

import { Button, Empty, IconViewer, Loading, Text } from "components";

import { useAppNavigation } from "context";

import { Colors, Metrics } from "themes";

import "./agents.style.scss";

const columns: TableColumnsType<AgentsResponse> = [
  {
    title: "#",
    dataIndex: "index",
    key: "index",
    render: (__, _, index) => (
      <Text text={index + 1} type="footnote" weight="semibold" />
    ),
  },

  {
    title: "Name",
    dataIndex: "agent_name",
    key: "agent_name",
    render: (name: string) => (
      <Text text={name} type="footnote" weight="semibold" />
    ),
  },

  {
    title: "Gremlin Account",
    dataIndex: "gremlin_account_name",
    key: "gremlin_account",
    render: (name: string) => (
      <Text text={name} type="footnote" weight="semibold" />
    ),
  },

  {
    title: "Host Name",
    dataIndex: "agent_os_type",
    key: "gremlin_account",
    render: (name: string) => (
      <Text text={name} type="footnote" weight="semibold" />
    ),
  },

  {
    title: "Installed Date",
    dataIndex: "installed_date",
    key: "installed_date",
    render: (name: string) => (
      <Text text={name} type="footnote" weight="semibold" />
    ),
  },

  {
    title: "Status",
    dataIndex: "stage",
    key: "status",
    render: (name: string) => (
      <Tag
        bordered={false}
        color={name === "Active" ? Colors.PRIMARY_GREEN_700 : Colors.DUST_RED_2}
        style={{ borderRadius: Metrics.SPACE_MD }}
      >
        <Text
          text={name}
          type="footnote"
          weight="semibold"
          customClass="description-class"
          color={name === "Active" ? Colors.BRIGHT_GREEN_2 : Colors.DUST_RED_3}
        />
      </Tag>
    ),
  },
];

const Agents: React.FC = () => {
  const { application } = useAppNavigation();
  const navigate = useNavigate();
  const params = useParams();

  const serviceId: number = application?.services?.find(
    (s) => s.service == "Experiments",
  )?.id;

  const getChaosAgents = useGetChaosAgents(serviceId?.toString());

  const installationGuideBtn = (
    <Button
      title={`View Installation Guide`}
      icon={
        <IconViewer
          Icon={PlusOutlined}
          color={Colors.WHITE}
          size={Metrics.SPACE_MD}
        />
      }
      customClass="text-center"
      style={{ width: "fit-content" }}
      size="middle"
      type="default"
      onClick={() => {
        navigate(
          resolveUrlParams(RouteUrl.APPLICATIONS.AGENT_INSTALATION_GUIDE, {
            project: params?.project,
            application: params?.application,
          }),
        );
      }}
    />
  );

  return (
    <Fragment>
      {getChaosAgents?.isLoading && <Loading />}
      {getChaosAgents?.data?.length === 0 ? (
        <Empty
          title="You have not added any Agents yet."
          subtitle='Please click “Add New Agents " button to get stated with.'
        >
          {installationGuideBtn}
        </Empty>
      ) : (
        <Flex vertical gap={Metrics.SPACE_SM} className="agents-container">
          <Flex justify="end" gap={Metrics.SPACE_MD}>
            {installationGuideBtn}
          </Flex>
          <Table<AgentsResponse>
            columns={columns}
            dataSource={getChaosAgents?.data}
          />
        </Flex>
      )}
    </Fragment>
  );
};

export default Agents;
