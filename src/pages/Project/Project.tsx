import { useState } from "react";
import { useGetProjects } from "react-query";
import { Link, useNavigate } from "react-router-dom";

import { DownloadOutlined, QuestionCircleOutlined } from "@ant-design/icons";
import { Flex } from "antd";
import { RouteUrl, emptyProjectConstants } from "constant";

import { AWSIcon } from "assets";

import {
  Button,
  Drawer,
  Empty,
  IconViewer,
  Loading,
  ProjectList,
  Text,
} from "components";

import { Colors, Metrics } from "themes";

import "./project.styles.scss";

export const Project: React.FC = () => {
  const prerequisites = [
    {
      icon: AWSIcon,
      title: "AWS IAM user policy",
      description:
        "Create inline policy from the below policy json and attach to the IAM user. ",
      extra: (
        <>
          <Button
            type="default"
            title="Policy.json"
            iconPosition="end"
            icon={
              <IconViewer Icon={DownloadOutlined} color={Colors.PRIMARY_BLUE} />
            }
            customClass="download-button"
            size="middle"
            onClick={() => {
              const link = document.createElement("a");
              link.download = "Policy";
              link.href = "/Policy.json";
              link.click();
            }}
          />
          <Text
            text="Along with inline policy attach the below mentioned AWS managed policies."
            type="footnote"
            weight="semibold"
            color={Colors.COOL_GRAY_12}
          />
          <ul style={{ paddingLeft: Metrics.SPACE_SM, lineHeight: 1.5 }}>
            <li>
              {" "}
              <Text
                text="AmazonBedrockFullAccess"
                type="footnote"
                weight="semibold"
                color={Colors.COOL_GRAY_12}
              />
            </li>
            <li>
              <Text
                text="AWSResilienceHubAsssessmentExecutionPolicy"
                type="footnote"
                weight="semibold"
                color={Colors.COOL_GRAY_12}
              />
            </li>
            <li>
              {" "}
              <Text
                text="SecretsManagerReadWrite"
                type="footnote"
                weight="semibold"
                color={Colors.COOL_GRAY_12}
              />
            </li>
          </ul>
        </>
      ),
    },
    {
      iconPath: "bedrock.png",
      title: "Enable Bedrock Model",
      description:
        "Enable the below mentioned Amazon Bedrock Model in your AWS account.",
      extra: (
        <Text
          text={
            <>
              amazon.titan-embed-text-v2:0 <br /> anthropic.claude-3.5-sonnet
            </>
          }
          weight="semibold"
          type="bodycopy"
        />
      ),
    },
    {
      iconPath: "gremlin.png",
      title: "Create Gremlin Account",
      description: "Create a gremlin Account for running Chaos Experiments.",
      extra: (
        <Link to="https://www.gremlin.com/trial" target="_blank">
          https://www.gremlin.com/trial
        </Link>
      ),
    },
    {
      iconPath: "nobl9.png",
      title: "Create Nobl9 Account",
      description:
        "Create a Nobl9 Account to leverage software defined Service Level Objectives (SLOs)",
      extra: (
        <Link to="https://www.nobl9.com" target="_blank">
          https://www.nobl9.com
        </Link>
      ),
    },
  ];

  const { isLoading, data } = useGetProjects();
  const [isOpenPrequisticsDrawer, setIsOpenPrequisticsDrawer] =
    useState<boolean>(false);

  const navigate = useNavigate();

  return (
    <>
      {/* the main landing component */}
      {isLoading && <Loading />}
      <Flex gap="1rem" vertical className="landing-page-container">
        <Flex className="dlanding-project" gap="1rem" vertical>
          <Flex
            gap={Metrics.SPACE_MD}
            className="landing-project-controls"
            align="center"
          >
            <Flex style={{ marginLeft: "auto" }} align="center" gap={16}>
              <Button
                type="icon"
                icon={
                  <IconViewer
                    Icon={QuestionCircleOutlined}
                    color={Colors.PRIMARY_BLUE}
                    size={20}
                  />
                }
                onClick={() => setIsOpenPrequisticsDrawer(true)}
              />
              <Button
                size="middle"
                title="Create New Portfolio"
                type="primary"
                onClick={() => navigate(RouteUrl.HOME.CREATE_PORTPOLIO)}
              />
            </Flex>
          </Flex>
          {!isLoading && data?.length === 0 ? (
            <Empty
              title={emptyProjectConstants.TITLE}
              subtitle={emptyProjectConstants.SUBTITLE}
            />
          ) : (
            <ProjectList projects={data} loading={isLoading} />
          )}
        </Flex>
      </Flex>
      <Drawer
        open={isOpenPrequisticsDrawer}
        title="Prerequisite"
        onSubmit={() => setIsOpenPrequisticsDrawer(false)}
        onClose={() => setIsOpenPrequisticsDrawer(false)}
        footer={
          <Flex justify="end">
            <Button
              title="Close"
              type="primary"
              onClick={() => setIsOpenPrequisticsDrawer(false)}
            />
          </Flex>
        }
      >
        <Flex vertical gap={Metrics.SPACE_SM}>
          <Text
            type="bodycopy"
            text="To create a portfolio, please configure or 
            install the following items. These are the essential prerequisites that 
            must be met before initiating any portfolio creation. Ensuring these conditions are fulfilled will facilitate a smooth and efficient setup process, enabling you to effectively 
            manage and utilize the portfolio management tools and related applications."
          />
          {prerequisites?.map((point, index) => (
            <Flex
              key={index}
              vertical
              gap={Metrics.SPACE_LG}
              className="prequistic-card"
            >
              {point.icon ? (
                <IconViewer
                  Icon={point.icon}
                  size={40}
                  customClass="prequistic-icon"
                />
              ) : (
                <img
                  src={point.iconPath}
                  alt="icon"
                  width={40}
                  height={40}
                  className="prequistic-icon"
                />
              )}
              <Flex vertical gap={Metrics.SPACE_SM}>
                <Text text={point.title} weight="bold" type="cardtitle" />
                <Text
                  text={point.description}
                  type="footnote"
                  weight="semibold"
                  color={Colors.COOL_GRAY_12}
                />
                {point.extra}
              </Flex>
            </Flex>
          ))}
        </Flex>
      </Drawer>
    </>
  );
};
