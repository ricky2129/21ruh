import { useEffect, useState } from "react";
import { useCreateGithubSecret, useUpdateIntegration } from "react-query";

import { LockOutlined } from "@ant-design/icons";
import { Form, Radio, Space, message } from "antd";
import { RepositorySignInFormConstants } from "constant";
import { validateGithubRepo, validateTagPair } from "helpers";
import {
  RepositorySignInFormFields,
  RepositorySignInRequest,
  UpdateIntegrationRequest,
} from "interfaces";

import { InternalFilledIcon } from "assets";

import { Drawer, IconViewer, Input, Text } from "components";

import { Colors } from "themes";

interface RepositorySignInDrawerProps {
  projectId: number;
  isOpen: boolean;
  initalValues?: RepositorySignInFormFields;
  type?: "add" | "edit";
  onClose: () => void;
  onSuccess: () => void;
}

/**
 * A drawer component for adding new repositories.
 *
 * It accepts a boolean prop for whether it should be open or not, a function
 * to call when the drawer is closed, and a function to call when the form is
 * successfully submitted.
 *
 * The drawer contains a form with fields for the secret name, repository URL, user
 * name, token, access level, and tags. The tags field is only shown if the access
 * level is set to "Specific". The form is validated when the user submits it, and
 * if there are any errors, the drawer is not closed and the errors are displayed
 * in the form. If the submission is successful, the drawer is closed and the
 * onSuccess callback is invoked.
 */

const RepositorySignInDrawer: React.FC<RepositorySignInDrawerProps> = ({
  projectId = null,
  isOpen = false,
  initalValues = {},
  type = "add",
  onClose,
  onSuccess,
}) => {
  const [disabledSave, setDisabledSave] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [form] = Form.useForm<RepositorySignInFormFields>();
  const { SECRET_NAME, USER_NAME, TOKEN, REPOSITORY_URL, ACCESS, TAGS } =
    RepositorySignInFormConstants;

  const createGithubSecretQuery = useCreateGithubSecret();
  const updateIntegrationQuery = useUpdateIntegration();

  const repositoryUrl = Form.useWatch(REPOSITORY_URL.NAME, {
    form,
    preserve: true,
  });

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
   * Handles the form submission.
   *
   * Validates the form fields and constructs an object containing the
   * form data for creating a GitHub secret. The object includes values
   * for secret name, user name, token, repository URL, access level,
   * and tags. The tags are parsed from a space-separated string of
   * key:value pairs. Afterward, it calls the API to create the GitHub
   * secret and invokes the onSuccess callback upon successful
   * completion. Logs any errors encountered during the process.
   *
   * @returns {Promise<void>}
   */
  const handleSubmit = async () => {
    try {
      await form.validateFields();

      setIsLoading(true);

      const tags = form
        ?.getFieldValue(TAGS.NAME)
        ?.split(" ")
        ?.map((tag) => {
          const ta = tag?.split(":");
          return {
            key: ta[0],
            value: ta[1],
          };
        });

      if (type === "add") {
        const obj: RepositorySignInRequest = {
          name: form.getFieldValue(SECRET_NAME.NAME),
          project_id: projectId,
          secret: {
            username: form.getFieldValue(USER_NAME.NAME),
            token: form.getFieldValue(TOKEN.NAME),
            repo_url: form.getFieldValue(REPOSITORY_URL.NAME),
          },
          access: form.getFieldValue(ACCESS.NAME),
          tags: tags && tags?.length ? tags : [],
        };

        await createGithubSecretQuery.mutateAsync(obj);
      } else {
        const req: UpdateIntegrationRequest = {
          integration_id: form.getFieldValue("integration_id"),
          name: form.getFieldValue(SECRET_NAME.NAME),
          github: {
            username: form.getFieldValue(USER_NAME.NAME),
            token: form.getFieldValue(TOKEN.NAME),
            repo_url: form.getFieldValue(REPOSITORY_URL.NAME),
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

  return (
    <Drawer
      open={isOpen}
      onClose={onClose}
      title="Add New Repository"
      onCancel={onClose}
      onSubmit={handleSubmit}
      disabled={disabledSave}
      loading={isLoading}
    >
      {contextHolder}
      <Form
        form={form}
        onFieldsChange={handleFormChange}
        layout="vertical"
        initialValues={{
          [TOKEN.NAME]: "",
          [USER_NAME.NAME]: "",
          [ACCESS.NAME]: "Internal",
          ...initalValues,
        }}
      >
        <Form.Item<RepositorySignInFormFields>
          label={<Text weight="semibold" text={SECRET_NAME.LABEL} />}
          name={SECRET_NAME.NAME}
          rules={[{ required: true, message: SECRET_NAME.ERROR }]}
        >
          <Input
            placeholder={SECRET_NAME.PLACEHOLDER}
            type={SECRET_NAME.TYPE}
          />
        </Form.Item>
        <Form.Item<RepositorySignInFormFields>
          label={<Text weight="semibold" text={REPOSITORY_URL.LABEL} />}
          name={REPOSITORY_URL.NAME}
          rules={[
            {
              required: true,
              validator: validateGithubRepo,
              message: REPOSITORY_URL.ERROR,
            },
          ]}
        >
          <Input
            placeholder={REPOSITORY_URL.PLACEHOLDER}
            type={REPOSITORY_URL.TYPE}
          />
        </Form.Item>

        <Form.Item label={<Text weight="semibold" text="Repository Name" />}>
          <Input
            disabled
            value={
              form.getFieldError(REPOSITORY_URL.NAME)?.length
                ? ""
                : repositoryUrl?.split("/")?.pop()
            }
          />
        </Form.Item>

        <Form.Item<RepositorySignInFormFields>
          label={<Text weight="semibold" text={USER_NAME.LABEL} />}
          name={USER_NAME.NAME}
          rules={[{ required: true, message: USER_NAME.ERROR }]}
        >
          <Input placeholder={USER_NAME.PLACEHOLDER} type={USER_NAME.TYPE} />
        </Form.Item>
        <Form.Item<RepositorySignInFormFields>
          label={<Text weight="semibold" text={TOKEN.LABEL} />}
          name={TOKEN.NAME}
          rules={[{ required: true, message: TOKEN.ERROR }]}
        >
          <Input
            placeholder={TOKEN.PLACEHOLDER}
            type={TOKEN.TYPE}
            autoComplete="new-password"
          />
        </Form.Item>
        <Form.Item<RepositorySignInFormFields>
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
          <Form.Item<RepositorySignInFormFields>
            name={TAGS.NAME}
            rules={[{ message: TAGS.ERROR, validator: validateTagPair }]}
            className="tags-input-cloud"
          >
            <Input placeholder={TAGS.PLACEHOLDER} />
          </Form.Item>
        )}
      </Form>
    </Drawer>
  );
};

export default RepositorySignInDrawer;
