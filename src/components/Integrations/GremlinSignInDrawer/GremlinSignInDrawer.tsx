import { useState } from "react";
import { useCreateGremlinSecret, useUpdateIntegration } from "react-query";

import { InfoCircleOutlined, LockOutlined } from "@ant-design/icons";
import { Flex, Form, Radio, Space, Tooltip, message } from "antd";
import { GremlinSignInFormConstants } from "constant";
import { validateTagPair } from "helpers";
import {
  GremlinSignInFormFields,
  GremlinSignInRequest,
  Tag,
  UpdateIntegrationRequest,
} from "interfaces";

import { InternalFilledIcon } from "assets";

import { Drawer, IconViewer, Input, Text } from "components";

import { Colors, Metrics } from "themes";

interface GremlinSignInDrawerProps {
  projectId: number;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  type?: "add" | "edit";
  initalValues?: GremlinSignInFormFields;
}

/**
 * A Drawer component for configure Gremlin into a application.
 * @param {{ isOpen: boolean, type?: "add" | "edit", onClose: () => void, onSuccess: () => void }} props
 * @returns {JSX.Element}
 */
/**
 * @typedef {Object} GremlinSignInDrawerProps
 * @prop {boolean} isOpen - Whether the drawer is open or not.
 * @prop {"add" | "edit"} [type="add"] - The type of the drawer.
 * @prop {() => void} onClose - The function to call when the user closes the drawer.
 * @prop {() => void} onSuccess - The function to call when the user successfully signs in.
 */
const GremlinSignInDrawer: React.FC<GremlinSignInDrawerProps> = ({
  projectId,
  isOpen,
  type = "add",
  initalValues = {},
  onClose,
  onSuccess,
}) => {
  const [disabledSave, setDisabledSave] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [gremlinForm] = Form.useForm<GremlinSignInFormFields>();

  const createGremlinSecretQuery = useCreateGremlinSecret();
  const updateIntegrationQuery = useUpdateIntegration();

  const { NAME, GREMLIN_ACCESS_KEY, ACCESS, TAGS } = GremlinSignInFormConstants;

  const access = Form.useWatch(ACCESS.NAME, {
    form: gremlinForm,
    preserve: true,
  });

  const [messageApi, contextHolder] = message.useMessage();

  const error = (message?: string) => {
    messageApi.open({
      type: "error",
      content: message ? message : "Error: Something went wrong",
    });
  };

  const handleSubmit = async () => {
    try {
      setIsLoading(true);
      await gremlinForm.validateFields();

      const tags: Tag[] = gremlinForm
        ?.getFieldValue(TAGS.NAME)
        ?.trim()
        ?.split(" ")
        ?.map((tag) => {
          const ta = tag?.split(":");
          return {
            key: ta[0],
            value: ta[1],
          };
        });

      if (type === "add") {
        const req: GremlinSignInRequest = {
          name: gremlinForm.getFieldValue(NAME.NAME),
          project_id: projectId,
          secret: {
            apikey: gremlinForm.getFieldValue(GREMLIN_ACCESS_KEY.NAME),
          },
          access: gremlinForm.getFieldValue(ACCESS.NAME),
          tags: tags && tags?.length && access === "Specific" ? tags : [],
        };

        await createGremlinSecretQuery.mutateAsync(req);
      } else {
        const req: UpdateIntegrationRequest = {
          integration_id: gremlinForm.getFieldValue("integration_id"),
          name: gremlinForm.getFieldValue(NAME.NAME),
          gremlin: {
            apikey: gremlinForm.getFieldValue(GREMLIN_ACCESS_KEY.NAME),
          },
        };

        await updateIntegrationQuery.mutateAsync(req);
      }

      onSuccess();
    } catch (err) {
      error(err?.response?.data?.detail);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormChange = () => {
    const hasErrors =
      gremlinForm?.getFieldsError().filter(({ errors }) => errors.length)
        .length > 0;

    setDisabledSave(hasErrors);
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
        <Form
          layout="vertical"
          onFieldsChange={handleFormChange}
          form={gremlinForm}
          initialValues={{
            [ACCESS.NAME]: "Internal",
            [TAGS.NAME]: "",
            ...initalValues,
          }}
        >
          <Form.Item<GremlinSignInFormFields>
            name={NAME.NAME}
            label={<Text weight="semibold" text={NAME.LABEL} />}
            rules={[{ required: true, message: NAME.ERROR }]}
          >
            <Input placeholder={NAME.PLACEHOLDER} type={NAME.TYPE} />
          </Form.Item>

          <Form.Item<GremlinSignInFormFields>
            name={GREMLIN_ACCESS_KEY.NAME}
            label={
              <Flex align="center" gap={Metrics.SPACE_XS}>
                <Text weight="semibold" text={GREMLIN_ACCESS_KEY.LABEL} />
                <Tooltip
                  overlayStyle={{ maxWidth: "400px" }}
                  showArrow
                  title={
                    <>
                      If you find difficulty to find key please refer to this
                      link: <br />
                      <a
                        href="https://www.gremlin.com/docs/api-reference-api-keys"
                        target="_blank"
                      >
                        https://www.gremlin.com/docs/api-reference-api-keys
                      </a>
                    </>
                  }
                  trigger="hover"
                  placement="bottom"
                >
                  <InfoCircleOutlined
                    className="cursor-pointer"
                    style={{ color: Colors.COOL_GRAY_7 }}
                  />
                </Tooltip>
              </Flex>
            }
            rules={[{ required: true, message: GREMLIN_ACCESS_KEY.ERROR }]}
          >
            <Input
              placeholder={GREMLIN_ACCESS_KEY.PLACEHOLDER}
              type={GREMLIN_ACCESS_KEY.TYPE}
              autoComplete="new-password"
            />
          </Form.Item>
          <Form.Item<GremlinSignInFormFields>
            label={<Text weight="semibold" text={ACCESS.LABEL} />}
            name={ACCESS.NAME}
            rules={[{ required: true, message: ACCESS.ERROR }]}
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
            <Form.Item<GremlinSignInFormFields>
              name={TAGS.NAME}
              rules={[{ message: TAGS.ERROR, validator: validateTagPair }]}
              className="tags-input-cloud"
            >
              <Input placeholder={TAGS.PLACEHOLDER} />
            </Form.Item>
          )}
        </Form>
      </Drawer>
    </>
  );
};

export default GremlinSignInDrawer;
