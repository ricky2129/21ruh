import { useState } from "react";
import {
  useAddServiceToApplication,
  useGetGremlinIntegrationsByApplicationId,
} from "react-query";
import { useParams } from "react-router-dom";

import { PlusOutlined } from "@ant-design/icons";
import { Flex, Form, Radio, Select, message } from "antd";
import { ConfigureGremlinFormConstants } from "constant";
import { AppServiceMap, ConfigureGremlinFormFields } from "interfaces";

import {
  Button,
  Drawer,
  GremlinSignInDrawer,
  IconViewer,
  Text,
} from "components";

import { Colors, Metrics } from "themes";

import "./configureGremlin.style.scss";

interface ConfigureGremlinProps {
  applicationId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const ConfigureGremlin: React.FC<ConfigureGremlinProps> = ({
  applicationId,
  isOpen,
  onSuccess,
  onClose,
}) => {
  const [isOpenAddGremlin, setIsOpenAddGremlin] = useState<boolean>(false);
  const [disabledSave, setDisabledSave] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const params = useParams();

  const [messageApi, contextHolder] = message.useMessage();

  /**
   * Opens an error message with the content "Error: Something went wrong".
   * This function is used to report errors that occur during the application
   * creation process.
   */
  const error = () => {
    messageApi.open({
      type: "error",
      content: "Error: Something went wrong",
    });
  };

  const [configureGremlinForm] = Form.useForm<ConfigureGremlinFormFields>();

  const { ACCOUNT } = ConfigureGremlinFormConstants;

  const addServiceIdQuery = useAddServiceToApplication();
  const getGremlinConnectionsInApplication =
    useGetGremlinIntegrationsByApplicationId(applicationId);

  const handleSubmit = async () => {
    try {
      await configureGremlinForm.validateFields();

      setIsLoading(true);

      await addServiceIdQuery.mutateAsync({
        application_id: parseInt(applicationId),
        service_id: AppServiceMap["Experiments"],
        integration_id: configureGremlinForm.getFieldValue(ACCOUNT.NAME),
      });

      onSuccess();
    } catch (err) {
      error()
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormFieldChange = () => {
    const hasErrors =
      configureGremlinForm
        ?.getFieldsError()
        .filter(({ errors }) => errors.length).length > 0;

    setDisabledSave(hasErrors);
  };

  return (
    <>
      {contextHolder}
      <Drawer
        open={isOpen}
        onClose={() => {
          configureGremlinForm.resetFields();
          onClose();
        }}
        onCancel={() => {
          configureGremlinForm.resetFields();
          onClose();
        }}
        title="Configure Connection"
        onSubmit={handleSubmit}
        disabled={disabledSave}
        loading={isLoading}
      >
        <Radio.Group value={1}>
          <Flex align="center" gap={Metrics.SPACE_SM}>
            <Radio value={1} className="agent-selector-radiobtn">
              Gremlin
            </Radio>
            <Radio
              value={2}
              className="agent-selector-radiobtn radiobtn-disabled"
              disabled
            >
              {" "}
              FIS
            </Radio>
          </Flex>
        </Radio.Group>
        <Flex
          vertical
          gap={Metrics.SPACE_SM}
          className="gremlin-connection-info"
        >
          <Text
            text="To run a Chaos experiment, it is essential to first establish a connection with Gremlin. Please proceed with configuring your Gremlin connection now."
            weight="semibold"
            type="bodycopy"
            color={Colors.PRIMARY_BLUE}
          />
        </Flex>
        <Form
          layout="vertical"
          onFieldsChange={handleFormFieldChange}
          form={configureGremlinForm}
        >
          <Form.Item<ConfigureGremlinFormFields>
            name={ACCOUNT.NAME}
            label={<Text weight="semibold" text={ACCOUNT.LABEL} />}
            rules={[
              {
                required: true,
                message: ACCOUNT.ERROR,
              },
            ]}
          >
            <Select
              loading={getGremlinConnectionsInApplication?.isLoading}
              options={getGremlinConnectionsInApplication?.data?.map(
                (value) => {
                  return {
                    label: value.name,
                    value: value.id,
                  };
                },
              )}
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
                    onClick={() => setIsOpenAddGremlin(true)}
                  />
                </Flex>
              )}
            />
          </Form.Item>
        </Form>
      </Drawer>
      <GremlinSignInDrawer
        projectId={parseInt(params?.project)}
        isOpen={isOpenAddGremlin}
        onClose={() => setIsOpenAddGremlin(false)}
        onSuccess={async () => {
          await getGremlinConnectionsInApplication.refetch();
          setIsOpenAddGremlin(false);
        }}
      />
    </>
  );
};

export default ConfigureGremlin;
