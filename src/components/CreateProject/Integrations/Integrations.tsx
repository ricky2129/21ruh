import { useEffect, useState } from "react";
import {
  useGetAWSIntegrationsByProjectId,
  useGetGithubIntegrationsByProjectId,
  useGetGremlinIntegrationsByProjectId,
  useGetSecretValues,
} from "react-query";

import { LinkOutlined } from "@ant-design/icons";
import { Flex, message } from "antd";
import {
  CloudSignInFormField,
  GremlinSignInFormFields,
  RepositorySignInFormFields,
  SecretResponse,
} from "interfaces";

import { CloudConnection, CodeRepositories } from "assets";

import {
  CloudSignInDrawer,
  GremlinSignInDrawer,
  IntegrationManager,
  RepositorySignInDrawer,
} from "components";

import { useCreateProject } from "context";

import { Metrics } from "themes";

interface IntegrationProps {
  project_id: number;
  setShowSkipBtn: (value: boolean) => void;
  setDisabledNext: (boolean) => void;
}

const Integrations: React.FC<IntegrationProps> = ({
  setShowSkipBtn,
  setDisabledNext,
}) => {
  const [isOpenAwsDrawer, setIsOpenAwsDrawer] = useState<boolean>(false);
  const [isOpenGithubDrawer, setIsOpenGithubDrawer] = useState<boolean>(false);
  const [isOpenGremlinDrawer, setIsOpenGremlinDrawer] =
    useState<boolean>(false);

  const [cloudDrawerType, setCloudDrawerType] = useState<"add" | "edit">("add");
  useState<CloudSignInFormField>(null);

  const [repoDrawerType, setRepoDrawerType] = useState<"add" | "edit">("add");
  const [gremlinDrawerType, setGremlinDrawerType] = useState<"add" | "edit">(
    "add",
  );

  const [initialCloudValues, setInitialCloudValues] =
    useState<CloudSignInFormField>(null);

  const [initialRepoValues, setInitialRepoValues] =
    useState<RepositorySignInFormFields>(null);

  const [initialGremlinValues, setInitialGremlinValues] =
    useState<GremlinSignInFormFields>(null);

  const { projectId } = useCreateProject();

  const awsIntegrationQuery = useGetAWSIntegrationsByProjectId(projectId);
  const githubIntegrationQuery = useGetGithubIntegrationsByProjectId(projectId);
  const gremlinIntegrationQuery =
    useGetGremlinIntegrationsByProjectId(projectId);

  const getSecretValues = useGetSecretValues();

  const [messageApi, contextHolder] = message.useMessage();

  const error = () => {
    messageApi.open({
      type: "error",
      content: "Error: Something went wrong",
    });
  };

  useEffect(() => {
    setShowSkipBtn(
      !(
        awsIntegrationQuery?.data?.length > 0 ||
        githubIntegrationQuery?.data?.length > 0 ||
        gremlinIntegrationQuery?.data?.length > 0
      ),
    );
    setDisabledNext(
      !(
        awsIntegrationQuery?.data?.length > 0 ||
        githubIntegrationQuery?.data?.length > 0 ||
        gremlinIntegrationQuery?.data?.length > 0
      ),
    );
  }, [
    awsIntegrationQuery?.data,
    githubIntegrationQuery?.data,
    gremlinIntegrationQuery?.data,
    setShowSkipBtn,
    setDisabledNext,
  ]);

  /**
   * Handles cloud edit button click.
   * Fetches the secret values for the given integration id and
   * opens the cloud sign in drawer with the edit type and the
   * fetched values.
   * @param {number} id - The integration id to fetch the secret values for.
   * @param {SecretResponse} record - The cloud secret record to edit.
   */
  const handleCloudEdit = async (id: number, record: SecretResponse) => {
    try {
      const data = await getSecretValues.mutateAsync(id?.toString());

      if (
        "AWS_SECRET_ACCESS_KEY" in data &&
        "AWS_ACCESS_KEY_ID" in data &&
        "AWS_DEFAULT_REGION" in data
      ) {
        setInitialCloudValues({
          integration_id: id,
          secret_name: record?.name,
          access: record?.access,
          user_access_key: data.AWS_ACCESS_KEY_ID,
          region: data.AWS_DEFAULT_REGION,
          user_secret_key: data.AWS_SECRET_ACCESS_KEY,
          tags: [],
        });

        setCloudDrawerType("edit");
        setIsOpenAwsDrawer(true);
      } else {
        error();
        console.error("Invalid response type");
      }
    } catch (err) {
      error();
      console.error(err);
    }
  };

  const handleRepoEdit = async (id: number, record: SecretResponse) => {
    try {
      const data = await getSecretValues.mutateAsync(id?.toString());

      if ("username" in data && "token" in data && "repo_url" in data) {
        setInitialRepoValues({
          integration_id: id.toString(),
          user_name: data?.username?.toString(),
          repository_url: data?.repo_url?.toString(),
          token: data?.token?.toString(),
          access: record.access,
          tags: [],
          secret_name: record.name,
        });

        setRepoDrawerType("edit");
        setIsOpenGithubDrawer(true);
      } else {
        error();
        console.error("Invalid response type");
      }
    } catch (err) {
      console.error(err);
      error();
    }
  };

  const handleGremlinEdit = async (id: number, record: SecretResponse) => {
    try {
      const data = await getSecretValues.mutateAsync(id?.toString());

      if ("apikey" in data) {
        setInitialGremlinValues({
          integration_id: id,
          gremlin_access_key: data?.apikey?.toString(),
          access: record.access,
          tags: [],
          name: record.name,
        });

        setGremlinDrawerType("edit");
        setIsOpenGremlinDrawer(true);
      } else {
        error();
        console.error("Invalid response type");
      }
    } catch (err) {
      console.error(err);
      error();
    }
  };

  return (
    <Flex vertical gap={Metrics.SPACE_SM}>
      {contextHolder}
      <IntegrationManager
        name="Cloud Connections"
        icon={CloudConnection}
        integrations={awsIntegrationQuery?.data}
        onClickAddNew={() => {
          setCloudDrawerType("add");
          setIsOpenAwsDrawer(true);
          setInitialCloudValues(null);
        }}
        addNewText="Connection"
        onEdit={handleCloudEdit}
        onDelete={() => {}}
        disableAction={getSecretValues?.isLoading}
        multipleConnect
      />
      <IntegrationManager
        name="Code Repositories"
        icon={CodeRepositories}
        integrations={githubIntegrationQuery?.data}
        onClickAddNew={() => {
          setIsOpenGithubDrawer(true);
          setInitialRepoValues(null);
          setRepoDrawerType("add");
        }}
        multipleConnect
        disableAction={getSecretValues?.isLoading}
        onEdit={handleRepoEdit}
        onDelete={() => {}}
        addNewText="Repository"
      />

      <IntegrationManager
        name="Gremlin Connection"
        icon={LinkOutlined}
        integrations={gremlinIntegrationQuery?.data}
        onClickAddNew={() => setIsOpenGremlinDrawer(true)}
        multipleConnect
        onDelete={() => {}}
        onEdit={handleGremlinEdit}
        disableAction={getSecretValues?.isLoading}
        addNewText="Gremlin Account"
      />

      <IntegrationManager
        name="Nobl9 Connections"
        icon={LinkOutlined}
        integrations={[]}
        onClickAddNew={() => {}}
        multipleConnect
        onDelete={() => {}}
        onEdit={() => {}}
        disableAction={false}
        addNewText="Nobl9 Account"
      />
      <CloudSignInDrawer
        initalValues={initialCloudValues}
        projectId={parseInt(projectId)}
        onClose={() => setIsOpenAwsDrawer(false)}
        isOpen={isOpenAwsDrawer}
        onSuccess={async () => {
          await awsIntegrationQuery.refetch();
          setIsOpenAwsDrawer(false);
        }}
        type={cloudDrawerType}
      />

      <RepositorySignInDrawer
        projectId={parseInt(projectId)}
        onClose={() => setIsOpenGithubDrawer(false)}
        isOpen={isOpenGithubDrawer}
        onSuccess={async () => {
          await githubIntegrationQuery.refetch();
          setIsOpenGithubDrawer(false);
        }}
        initalValues={initialRepoValues}
        type={repoDrawerType}
      />

      <GremlinSignInDrawer
        projectId={parseInt(projectId)}
        onClose={() => setIsOpenGremlinDrawer(false)}
        isOpen={isOpenGremlinDrawer}
        onSuccess={async () => {
          await gremlinIntegrationQuery.refetch();
          setIsOpenGremlinDrawer(false);
        }}
        type={gremlinDrawerType}
        initalValues={initialGremlinValues}
      />
    </Flex>
  );
};

export default Integrations;
