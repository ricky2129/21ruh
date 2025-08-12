import { useState } from "react";
import {
  useGetAWSIntegrationsByApplicationId,
  useGetGithubIntegrationsByApplicationId,
} from "react-query";
import { useParams } from "react-router-dom";

import { PlusOutlined } from "@ant-design/icons";
import { Flex, Form, FormInstance, Select } from "antd";
import { ConfigureRepositoriesConstants } from "constant";
import { ConfigureRepositoriesFormField } from "interfaces";

import {
  Button,
  CloudSignInDrawer,
  IconViewer,
  Input,
  RepositorySignInDrawer,
  Text,
} from "components";

import { Colors, Metrics } from "themes";

import "./configureRepository.style.scss";

interface ConfigureRepositoriesComponentProps {
  application_id: string;
  setDisabledSave: (boolean) => void;
  configureRepositoriesForm: FormInstance<ConfigureRepositoriesFormField>;
}

/**
 * ConfigureRepositories component is a part of the CreateApplication component.
 * It is responsible for displaying the form for adding a new cloud account and
 * a new code repository.
 * The form is a vertical layout with the following fields:
 * - Cloud Account: a select field that displays all the available cloud accounts
 *   and also allows the user to add a new account.
 * - Code Repository: a select field that displays all the available code repositories
 *   and also allows the user to add a new repository.
 * - Repository URL: a text field where the user can enter the URL of the repository.
 * - Branch Name: a text field where the user can enter the name of the branch.
 */
const ConfigureRepositories: React.FC<ConfigureRepositoriesComponentProps> = ({
  application_id,
  setDisabledSave,
  configureRepositoriesForm,
}) => {
  const [isOpenAwsDrawer, setIsOpenAwsDrawer] = useState<boolean>(false);
  const [isOpenGithubDrawer, setIsOpenGithubDrawer] = useState<boolean>(false);
  const params = useParams();

  const awsIntegrationsQuery =
    useGetAWSIntegrationsByApplicationId(application_id);
  const githubIntegrationQuery =
    useGetGithubIntegrationsByApplicationId(application_id);

  const { NAME, AWS_ACCOUNT, BRANCH_NAME, REPOSITORY_URL } =
    ConfigureRepositoriesConstants;

  /**
   * Function to handle form change and check for form errors.
   * If the form has errors, the disabledSave state is set to true.
   * Otherwise, it is set to false.
   */
  const handleFormChange = () => {
    const hasErrors =
      configureRepositoriesForm
        ?.getFieldsError()
        .filter(({ errors }) => errors.length).length > 0;

    setDisabledSave(hasErrors);
  };

  return (
    <Flex vertical gap={Metrics.SPACE_LG}>
      <Form
        form={configureRepositoriesForm}
        layout="vertical"
        onFieldsChange={handleFormChange}
      >
        <Form.Item<ConfigureRepositoriesFormField>
          label={<Text text={NAME.LABEL} weight="semibold" />}
          name={NAME.NAME}
          rules={[
            {
              required: true,
              message: NAME.ERROR,
            },
          ]}
        >
          <Input placeholder={NAME.PLACEHOLDER} type={NAME.TYPE} />
        </Form.Item>

        <Form.Item<ConfigureRepositoriesFormField>
          label={<Text text={AWS_ACCOUNT.LABEL} weight="semibold" />}
          name={AWS_ACCOUNT.NAME}
          rules={[
            {
              required: true,
              message: AWS_ACCOUNT.ERROR,
            },
          ]}
        >
          <Select
            options={awsIntegrationsQuery?.data?.map((data) => {
              return {
                label: data.name,
                value: data.id,
              };
            })}
            loading={awsIntegrationsQuery?.isLoading}
            dropdownRender={(menu) => (
              <Flex vertical gap={Metrics.SPACE_MD} justify="start">
                {menu}
                <Button
                  icon={
                    <IconViewer
                      Icon={PlusOutlined}
                      size={15}
                      color={Colors.PRIMARY_BLUE}
                    />
                  }
                  title="Add New Account"
                  type="link"
                  customClass="add-newAccount-btn"
                  onClick={() => setIsOpenAwsDrawer(true)}
                />
              </Flex>
            )}
          />
        </Form.Item>

        <Form.Item<ConfigureRepositoriesFormField>
          label={<Text text={REPOSITORY_URL.LABEL} weight="semibold" />}
          name={REPOSITORY_URL.NAME}
          rules={[
            {
              required: true,
              message: REPOSITORY_URL.ERROR,
            },
          ]}
        >
          <Select
            options={githubIntegrationQuery?.data?.map((value) => {
              return {
                label: value.name,
                value: value.id,
              };
            })}
            loading={githubIntegrationQuery.isLoading}
            dropdownRender={(menu) => (
              <Flex vertical gap={Metrics.SPACE_MD} justify="start">
                {menu}
                <Button
                  icon={
                    <IconViewer
                      Icon={PlusOutlined}
                      size={15}
                      color={Colors.PRIMARY_BLUE}
                    />
                  }
                  title="Add New Repository"
                  type="link"
                  customClass="add-newAccount-btn"
                  onClick={() => setIsOpenGithubDrawer(true)}
                />
              </Flex>
            )}
          />
        </Form.Item>

        <Form.Item<ConfigureRepositoriesFormField>
          label={<Text text={BRANCH_NAME.LABEL} weight="semibold" />}
          name={BRANCH_NAME.NAME}
          rules={[
            {
              required: true,
              message: BRANCH_NAME.ERROR,
            },
          ]}
        >
          <Input
            placeholder={BRANCH_NAME.PLACEHOLDER}
            type={BRANCH_NAME.TYPE}
          />
        </Form.Item>
      </Form>
      <CloudSignInDrawer
        onClose={() => setIsOpenAwsDrawer(false)}
        isOpen={isOpenAwsDrawer}
        onSuccess={async (res) => {
          await awsIntegrationsQuery.refetch();
          configureRepositoriesForm.setFieldValue(AWS_ACCOUNT.NAME, res.id);
          setIsOpenAwsDrawer(false);
        }}
        projectId={parseInt(params?.project)}
      />

      <RepositorySignInDrawer
        onClose={() => setIsOpenGithubDrawer(false)}
        isOpen={isOpenGithubDrawer}
        onSuccess={async () => {
          await githubIntegrationQuery.refetch();
          setIsOpenGithubDrawer(false);
        }}
        projectId={parseInt(params?.project)}
      />
    </Flex>
  );
};

export default ConfigureRepositories;
