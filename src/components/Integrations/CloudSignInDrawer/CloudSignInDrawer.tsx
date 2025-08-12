import { useEffect, useState } from "react";
import { useCreateAWSSecret, useUpdateIntegration } from "react-query";



import { LockOutlined } from "@ant-design/icons";
import { Flex, Form, Radio, Select, Space, message } from "antd";
import { CloudSignInFormConstants, regions } from "constant";
import { validateTagPair } from "helpers";
import { AWSSignInRequest, CloudSignInFormField, SecretResponse, Tag, UpdateIntegrationRequest } from "interfaces";



import { InternalFilledIcon } from "assets";



import { Drawer, IconViewer, Input, Text } from "components";



import { Colors, Metrics } from "themes";



import "./cloudSignInDrawer.style.scss";


interface CloudSignInDrawerProps {
  projectId: number;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (res: SecretResponse) => void;
  type?: "add" | "edit";
  initalValues?: CloudSignInFormField;
}

const CloudSignInDrawer: React.FC<CloudSignInDrawerProps> = ({
  projectId,
  isOpen,
  onClose,
  onSuccess,
  type = "add",
  initalValues = {},
}) => {
  const {
    SECRET_NAME,
    USER_ACCESS_KEY,
    USER_SECRET_KEY,
    REGION,
    ACCESS,
    TAGS,
  } = CloudSignInFormConstants;
  const [disabledSave, setDisabledSave] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [form] = Form.useForm<CloudSignInFormField>();

  const createAWSSecretQuery = useCreateAWSSecret();
  const updateIntegrationQuery = useUpdateIntegration();

  const access = Form.useWatch(ACCESS.NAME, { form, preserve: true });

  const [messageApi, contextHolder] = message.useMessage();

  const error = (message?: string) => {
    messageApi.open({
      type: "error",
      content: message ? message : "Error: Something went wrong",
    });
  };

  useEffect(() => {
    if (isOpen) {
      form.resetFields();
      setDisabledSave(false);
    }
  }, [isOpen, form]);

  /**
   * Handles form field changes and checks for form errors.
   * If the form has errors, sets the disabledSave state to true.
   * Otherwise, sets it to false.
   */
  const handleFormChange = () => {
    const hasErrors =
      form?.getFieldsError().filter(({ errors }) => errors.length).length > 0;

    setDisabledSave(hasErrors);
  };

  /**
   * Handles form submission
   * Validates the form fields, creates an AWS secret via API call, and
   * calls the onSuccess callback with the response.
   * Finally, sets isLoading back to false.
   */
  const handleSubmit = async () => {
    try {
      await form.validateFields();
      let res = null;

      setIsLoading(true);

      const tags: Tag[] = form
        .getFieldValue(TAGS.NAME)
        ?.split(" ")
        ?.map((tag) => {
          const ta = tag.split(":");
          return {
            key: ta[0],
            value: ta[1],
          };
        });

      if (type === "add") {
        const req: AWSSignInRequest = {
          name: form.getFieldValue(SECRET_NAME.NAME),
          project_id: projectId,
          secret: {
            AWS_ACCESS_KEY_ID: form.getFieldValue(USER_ACCESS_KEY.NAME),
            AWS_SECRET_ACCESS_KEY: form.getFieldValue(USER_SECRET_KEY.NAME),
            AWS_DEFAULT_REGION: form.getFieldValue(REGION.NAME),
          },
          access: form.getFieldValue(ACCESS.NAME),
          tags: tags && tags?.length ? tags : [],
        };

        res = await createAWSSecretQuery.mutateAsync(req);
      } else {
        const req: UpdateIntegrationRequest = {
          integration_id: form.getFieldValue("integration_id"),
          name: form.getFieldValue(SECRET_NAME.NAME),
          aws: {
            AWS_ACCESS_KEY_ID: form.getFieldValue(USER_ACCESS_KEY.NAME),
            AWS_SECRET_ACCESS_KEY: form.getFieldValue(USER_SECRET_KEY.NAME),
            AWS_DEFAULT_REGION: form.getFieldValue(REGION.NAME),
          },
        };

        res = await updateIntegrationQuery.mutateAsync(req);
      }

      onSuccess(res);
    } catch (err) {
      error(err?.response?.data?.detail);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {contextHolder}
      <Drawer
        open={isOpen}
        onClose={onClose}
        title={`${type === "edit" ? "Edit" : "Add New"} Connection`}
        onCancel={onClose}
        onSubmit={handleSubmit}
        disabled={disabledSave || isLoading}
        loading={isLoading}
      >
        <Flex
          vertical
          className="aws-sign-in-modal-content-container"
          gap={Metrics.SPACE_MD}
        >
          <Form
            form={form}
            onFieldsChange={handleFormChange}
            layout="vertical"
            initialValues={{
              [REGION.NAME]: "us-west-2",
              [ACCESS.NAME]: "Internal",
              ...initalValues,
            }}
          >
            <Form.Item<CloudSignInFormField>
              label={<Text weight="semibold" text={SECRET_NAME.LABEL} />}
              name={SECRET_NAME.NAME}
              rules={[{ required: true, message: SECRET_NAME.ERROR }]}
            >
              <Input
                placeholder={SECRET_NAME.PLACEHOLDER}
                type={SECRET_NAME.TYPE}
                autoComplete="new-password"
              />
            </Form.Item>
            <Form.Item
              label={<Text weight="semibold" text="Choose a Cloud Provider" />}
            >
              <Select options={[{ label: "AWS", value: "AWS" }]} value="AWS" />
            </Form.Item>
            <Form.Item<CloudSignInFormField>
              label={<Text weight="semibold" text={USER_ACCESS_KEY.LABEL} />}
              name={USER_ACCESS_KEY.NAME}
              rules={[{ required: true, message: USER_ACCESS_KEY.ERROR }]}
            >
              <Input
                placeholder={USER_ACCESS_KEY.PLACEHOLDER}
                type={USER_ACCESS_KEY.TYPE}
                autoComplete="new-password"
              />
            </Form.Item>
            <Form.Item<CloudSignInFormField>
              label={<Text weight="semibold" text={USER_SECRET_KEY.LABEL} />}
              name={USER_SECRET_KEY.NAME}
              rules={[{ required: true, message: USER_SECRET_KEY.ERROR }]}
            >
              <Input
                placeholder={USER_SECRET_KEY.PLACEHOLDER}
                type={USER_SECRET_KEY.TYPE}
              />
            </Form.Item>
            <Form.Item<CloudSignInFormField>
              label={<Text weight="semibold" text={REGION.LABEL} />}
              name={REGION.NAME}
              rules={[{ required: true, message: REGION.ERROR }]}
            >
              <Select
                options={regions.map((value) => {
                  return { label: value, value };
                })}
              />
            </Form.Item>
            <Form.Item<CloudSignInFormField>
              label={<Text weight="semibold" text={ACCESS.LABEL} />}
              name={ACCESS.NAME}
              rules={[{ required: true, message: REGION.ERROR }]}
            >
              <Radio.Group>
                <Space direction="vertical">
                  <Radio value="Internal">
                    <IconViewer
                      Icon={InternalFilledIcon}
                      color={Colors.COOL_GRAY_12}
                      width={14}
                      size={14}
                    />{" "}
                    &nbsp; Internal
                  </Radio>
                  <Radio value="Specific">
                    <IconViewer
                      Icon={LockOutlined}
                      color={Colors.COOL_GRAY_6}
                      width={14}
                      size={14}
                    />{" "}
                    &nbsp; Application Specific
                  </Radio>
                </Space>
              </Radio.Group>
            </Form.Item>
            {access === "Specific" && (
              <Form.Item<CloudSignInFormField>
                name={TAGS.NAME}
                rules={[{ message: TAGS.ERROR, validator: validateTagPair }]}
                className="tags-input-cloud"
              >
                <Input placeholder={TAGS.PLACEHOLDER} />
              </Form.Item>
            )}
          </Form>
        </Flex>
      </Drawer>
    </>
  );
};

export default CloudSignInDrawer;