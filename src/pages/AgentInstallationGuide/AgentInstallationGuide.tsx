import { CodeBlock, tomorrowNightEighties } from "react-code-blocks";
import { useGetConfigFile } from "react-query";
import { Link, useNavigate, useParams } from "react-router-dom";

import { DownloadOutlined } from "@ant-design/icons";
import { Flex, Layout, message } from "antd";
import { Content, Header } from "antd/es/layout/layout";
import { RouteUrl } from "constant";
import { resolveUrlParams } from "helpers";

import { ConfigFileIcon, CopyIcon, ResuiteLogo } from "assets";

import { Button, IconViewer, Text } from "components";

import { useAppNavigation } from "context";

import { Colors, Metrics } from "themes";

import "./agentInstallationGuide.style.scss";

const PrerequisitesPoints: string[] = [
  "A Linux host available to install the Gremlin Agent onto.",
  "At least one service running on the host (e.g., an application) that you can use during this guide.",
  "Access to the host using a terminal-based administration tool, such as SSH.",
  "A Gremlin account with access to Gremlin RM (log into an existing account or sign up for a free trial).",
];

const GremlinInstallationSteps: string[] = [
  "Orchestrating tests on your systems.",
  "Detecting metadata such as availability zone and region (for cloud systems), operating system, and Agent version.",
  "Detecting processes running on the host (for dependency testing).",
];

const code1: string = `# Add packages needed to install and verify Gremlin
sudo apt update && sudo apt install -y apt-transport-https dirmngr

# Add the Gremlin repo
echo "deb https://deb.gremlin.com/ release non-free" | sudo tee /etc/apt/sources.list.d/gremlin.list

# Import the Gremlin GPG key
sudo apt-key adv --keyserver keyserver.ubuntu.com --recv-keys 9CDB294B29A5B1E2E00C24C022E8EF3461A50EF6

# Install Gremlin
sudo apt update && sudo apt install -y gremlin gremlind`;

const code2: string = `# Copy the config file from your local host to the remote host
scp config.yaml user@remote-host:/etc/gremlin/config.yaml`;

const code3: string = `# Restart gremlind on the remote host
sudo systemctl restart gremlind`;

const code4: string = `gremlin check auth `;

const copyBlock = (text: string) => {
  return (
    <Flex vertical gap={0}>
      <Flex
        justify="end"
        className="codeblock-heading-container"
        gap={Metrics.SPACE_XS}
        align="center"
      >
        <Text text="BASH" color={Colors.WHITE} />
        <Button
          type="primary"
          icon={<IconViewer Icon={CopyIcon} color={Colors.WHITE} />}
          onClick={async () => {
            await navigator.clipboard.writeText(text);
            message.open({
              type: "success",
              content: "Copied to clipboard",
            });
          }}
          size="middle"
          customClass="copy-btn"
        />
      </Flex>
      <CodeBlock
        text={text}
        showLineNumbers
        language="bash"
        theme={tomorrowNightEighties}
      />
    </Flex>
  );
};

const AgentInstallationGuide: React.FC = () => {
  const navigate = useNavigate();
  const params = useParams();
  const [messageApi, contextHolder] = message.useMessage();

  const { getServiceId } = useAppNavigation();

  const getConfigFileQuery = useGetConfigFile();

  /**
   * Downloads the configuration file for a specific service.
   *
   * This function retrieves the service ID for "Experiments", then fetches the configuration
   * file associated with that service using the `getConfigFileQuery` mutation. The response
   * is converted into a Blob object of type 'application/yaml', which is then used to create
   * a downloadable link for the user. The link, when triggered, downloads the configuration
   * file named "config.yaml". Any errors during the process are logged to the console.
   */
  const handleDownload = async () => {
    try {
      const service_id = await getServiceId("Experiments");

      const data = await getConfigFileQuery.mutateAsync(service_id.toString());

      const blob = new Blob([data], {
        type: "application/yaml",
      });

      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.download = "config file.yaml";
      link.click();

      link.remove();
    } catch (err) {
      console.log(err);
      messageApi.open({
        type: "error",
        content: "Error: Something went wrong",
      });
    }
  };

  return (
    <Layout className="agent-installation-layout">
      {contextHolder}
      <Header className="agent-installation-header">
        <Flex align="center" justify="space-between">
          <IconViewer Icon={ResuiteLogo} height={24} width={112} />
          <Button
            type="default"
            title="Close"
            onClick={() =>
              navigate(
                resolveUrlParams(RouteUrl.APPLICATIONS.AGENTS, {
                  project: params?.project,
                  application: params?.application,
                }),
              )
            }
          />
        </Flex>
      </Header>
      <Content>
        <Flex
          gap={Metrics.SPACE_XXL}
          style={{
            paddingTop: Metrics.SPACE_MD,
            marginLeft: 290,
            maxWidth: 840,
          }}
          vertical
        >
          <Flex gap={Metrics.SPACE_LG} vertical>
            <Text text="Prerequisites" type="header2" weight="semibold" />
            <Text
              text="Before you begin, make sure you have:"
              type="bodycopy"
            />
            <ul className="prerequistics-points">
              {PrerequisitesPoints?.map((point, index) => (
                <li key={index} className="prequistic-points-point">
                  <div className="point-number"> {index + 1} </div> &nbsp;
                  &nbsp;
                  <Text type="bodycopy" text={point} />{" "}
                </li>
              ))}
            </ul>
          </Flex>

          <Flex gap={Metrics.SPACE_MD} vertical>
            <Text
              type="header3"
              weight="semibold"
              text="Step 01:  Get your Agent configuration file (Downloadable file)"
            />

            <Flex
              align="center"
              justify="space-between"
              className="download-configFile-container"
            >
              <Flex align="center" gap={Metrics.SPACE_SM}>
                <IconViewer
                  Icon={ConfigFileIcon}
                  color={Colors.PRIMARY_BLUE}
                  width={24}
                  height={24}
                />
                <Text
                  type="cardtitle"
                  weight="semibold"
                  text="Client Configuration File.yaml"
                  color={Colors.PRIMARY_BLUE}
                />
              </Flex>
              <Button
                type="primary"
                icon={
                  <IconViewer
                    Icon={DownloadOutlined}
                    color={Colors.WHITE}
                    size={20}
                  />
                }
                onClick={handleDownload}
                disabled={getConfigFileQuery.isLoading}
              />
            </Flex>
          </Flex>

          <Flex gap={Metrics.SPACE_MD} vertical>
            <Text
              type="header3"
              weight="semibold"
              text="Step 2: Install the Gremlin Agent"
            />

            <Text
              type="bodycopy"
              text="The Gremlin Agent is an executable 
              binary you install on a host, container runtime, or Kubernetes cluster. 
              It performs several key functions:"
              weight="regular"
              color={Colors.COOL_GRAY_12}
            />

            <Text
              type="bodycopy"
              text="The Gremlin Agent is an executable binary you install on a host, container 
              runtime, or Kubernetes cluster. It performs several key functions:"
              weight="regular"
              color={Colors.COOL_GRAY_12}
            />

            <ul className="installation-steps">
              {GremlinInstallationSteps?.map((step, index) => (
                <li key={index}>
                  <Text
                    type="bodycopy"
                    weight="regular"
                    color={Colors.COOL_GRAY_12}
                    text={step}
                  />
                </li>
              ))}
            </ul>

            <Text
              type="bodycopy"
              text={
                <>
                  For this guide, we'll assume a Debian-based environment, such
                  as Ubuntu. You can find installation instructions for other
                  Linux distributions and platforms using{" "}
                  <Link
                    to="https://www.gremlin.com/docs/getting-started-installing-gremlin#/environment-specific-instructions"
                    target="_blank"
                  >
                    <strong> this link</strong>
                  </Link>
                  .
                </>
              }
              color={Colors.COOL_GRAY_12}
            />

            <Text
              text="Run the following commands on the host where you want to install the Gremlin Agent (e.g. using SSH):"
              type="bodycopy"
              color={Colors.COOL_GRAY_12}
            />

            <Flex vertical gap={Metrics.SPACE_MD} className="tip-container">
              <Text text="Tip" type="title" weight="bold" />
              <Text
                text="You can copy a code block by clicking the copy button in the top-right corner of the block."
                weight="regular"
                type="cardtitle"
                color={Colors.COOL_GRAY_11}
              />
              {copyBlock(code1)}
            </Flex>

            <Text
              text={
                <>
                  Next, copy the{" "}
                  <span style={{ color: Colors.DUST_RED_5 }}>
                    {" "}
                    config.yaml{" "}
                  </span>
                  file downloaded in step 1 to the{" "}
                  <span style={{ color: Colors.DUST_RED_5 }}>
                    {" "}
                    /etc/gremlin/
                  </span>{" "}
                  directory on the host where you installed the agent. The
                  easiest way to do this using SSH is by using the{" "}
                  <span style={{ color: Colors.DUST_RED_5 }}> scp</span> command
                  (make sure to replace{" "}
                  <span style={{ color: Colors.DUST_RED_5 }}>
                    {" "}
                    user@remote-host
                  </span>{" "}
                  with your actual SSH credentials):
                </>
              }
            />
            <Flex vertical gap={Metrics.SPACE_MD} className="tip-container">
              <Text text="Note" type="title" weight="bold" />
              <Text
                text={
                  <>
                    By default, the{" "}
                    <span style={{ color: Colors.DUST_RED_5 }}>
                      {" "}
                      /etc/gremlin/{" "}
                    </span>{" "}
                    directory is owned by the{" "}
                    <span style={{ color: Colors.DUST_RED_5 }}>
                      {" "}
                      gremlin{" "}
                    </span>{" "}
                    user and group and cannot be read by other users. You may
                    need elevated (i.e., sudo) permissions to write to this
                    folder.
                  </>
                }
                weight="regular"
                type="cardtitle"
                color={Colors.COOL_GRAY_11}
              />

              {copyBlock(code2)}
            </Flex>

            <Text
              text={
                <>
                  Alternatively, you can use a text editor like nano, vim, or
                  emacs to create a blank{" "}
                  <span style={{ color: Colors.DUST_RED_5 }}>
                    {" "}
                    /etc/gremlin/config.yaml{" "}
                  </span>{" "}
                  file on the remote host, then copy and paste the original
                  config file's contents into the new file.
                </>
              }
            />

            <Text
              text={
                <>
                  Once you've updated the contents of{" "}
                  <span style={{ color: Colors.DUST_RED_5 }}>
                    {" "}
                    /etc/gremlin/config.yaml{" "}
                  </span>
                  , go back to your SSH session on the remote host and restart
                  the <span style={{ color: Colors.DUST_RED_5 }}>gremlin </span>
                  service:
                </>
              }
            />

            {copyBlock(code3)}

            <Text text="To confirm that the Agent is installed correctly, run the following command on the remote host:" />

            {copyBlock(code4)}
            <Text text="If the Agent authenticated successfully, the first four lines will look like this:" />

            <CodeBlock
              text="auth
====================================================
Auth Input Type                      : Certificate
API Response                         : OK"
              language="txt"
              theme={tomorrowNightEighties}
            />

            <Text text="If not, you'll see this:" />

            <CodeBlock
              text="auth
==================================================== 
Auth Input Type                      : No valid auth found"
              language="txt"
              theme={tomorrowNightEighties}
            />
          </Flex>
        </Flex>
      </Content>
    </Layout>
  );
};

export default AgentInstallationGuide;
