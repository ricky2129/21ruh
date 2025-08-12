import { useState } from "react";
import { useCreateResourceGroup, useGetListResourceGroup } from "react-query";

import { DeleteOutlined } from "@ant-design/icons";
import { Flex, Form } from "antd";
import TextArea from "antd/es/input/TextArea";
import { ConfigureResourceGroupConstants } from "constant";
import { validateCommaSeparatedTags } from "helpers";
import {
  ConfigureResourceFormFields,
  CreateResourceGroupRequest,
  ResourceTypeTag,
} from "interfaces";

import {
  Button,
  Drawer,
  Empty,
  IconViewer,
  Input,
  Loading,
  Text,
} from "components";

import { Colors, Metrics } from "themes";

import "./ConfigureResourceGroup.style.scss";

interface ConfigureResourceGroupProps {
  isOpen: boolean;
  integration_id: number;
  setOpen: (open: boolean) => void;
  onSubmit: () => Promise<void>;
}

/**
 * A Drawer component for creating a new resource group.
 *
 * It accepts a boolean prop for whether the drawer should be open or not, a
 * function to call when the drawer is closed, and a function to call when the
 * form is successfully submitted.
 *
 * The drawer contains a form with fields for the resource group name, description,
 * resource query, tags, criticality, owner, and display name. The form is
 * validated when the user submits it, and if there are any errors, the drawer is
 * not closed and the errors are displayed in the form. If the submission is
 * successful, the drawer is closed and the onSuccess callback is invoked.
 */
const ConfigureResourceGroup: React.FC<ConfigureResourceGroupProps> = ({
  isOpen,
  integration_id,
  setOpen,
  onSubmit,
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [configureResourceGroupForm] =
    Form.useForm<ConfigureResourceFormFields>();
  const [disabledSave, setDisabledSave] = useState<boolean>(false);

  const createResourceGroup = useCreateResourceGroup();
  const { NAME, DESCRIPTION, TAGS } = ConfigureResourceGroupConstants;

  const list = Form.useWatch(TAGS.NAME, {
    form: configureResourceGroupForm,
    preserve: true,
  });

  const groupingResource = useGetListResourceGroup({
    integration_id,
    tags: list
      ?.filter((tag) => Object.keys(tag)?.length > 0)
      ?.map((value) => {
        return {
          Key: value.Key,
          Values: value.Values?.split(", ") || [],
        };
      }),
  });

  /**
   * Closes the drawer and resets the form fields.
   */
  const handleClose = () => {
    configureResourceGroupForm?.resetFields();
    setOpen(false);
  };

  /**
   * Handles the form submission.
   *
   * Validates the form fields, constructs the CreateResourceGroupRequest
   * object, calls the createResourceGroup mutation, and invokes the onSuccess
   * callback upon successful completion. Logs any errors encountered during
   * the process.
   *
   * @returns {Promise<void>}
   */
  const handleSubmit = async () => {
    try {
      const tags: ResourceTypeTag[] = configureResourceGroupForm
        ?.getFieldValue(TAGS.NAME)
        ?.filter((tag) => {
          return Object.keys(tag)?.length > 0;
        })
        ?.map((tag: { Key: string; Values: string }) => {
          return {
            Key: tag.Key,
            Values: tag?.Values?.split(", "),
          };
        });

      const req: CreateResourceGroupRequest = {
        integration_id,
        name: configureResourceGroupForm.getFieldValue(NAME.NAME),
        description:
          configureResourceGroupForm.getFieldValue(DESCRIPTION.NAME) || "",
        tags,
      };

      await configureResourceGroupForm.validateFields();

      setIsLoading(true);

      await createResourceGroup.mutateAsync(req);

      await onSubmit();
      setOpen(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handles changes in the form fields and checks for form errors.
   * If the form has errors, sets the disabledSave state to true.
   * Otherwise, sets it to false.
   */
  const handleFormFieldChange = () => {
    const hasErrors =
      configureResourceGroupForm
        ?.getFieldsError()
        .filter(({ errors }) => errors.length).length > 0;

    setDisabledSave(hasErrors);
  };

  return (
    <Drawer
      title="Add New Resource Group"
      open={isOpen}
      onClose={handleClose}
      onCancel={handleClose}
      onSubmit={handleSubmit}
      disabled={
        isLoading ||
        disabledSave ||
        !groupingResource?.data?.length ||
        groupingResource?.isLoading
      }
      loading={isLoading}
      submitButtonText="Create"
    >
      <Form
        form={configureResourceGroupForm}
        onFieldsChange={handleFormFieldChange}
        layout="vertical"
        initialValues={{
          tags: [{}, {}],
        }}
        style={{ gap: Metrics.SPACE_SM }}
      >
        <Form.Item<ConfigureResourceFormFields>
          name={NAME.NAME}
          label={<Text weight="semibold" text={NAME.LABEL} />}
          rules={[
            {
              required: true,
              message: NAME.ERROR,
            },
          ]}
        >
          <Input type={NAME.TYPE} placeholder={NAME.PLACEHOLDER} />
        </Form.Item>
        <Form.Item<ConfigureResourceFormFields>
          name={DESCRIPTION.NAME}
          label={<Text weight="semibold" text={DESCRIPTION.LABEL} />}
          rules={[{ required: true, message: DESCRIPTION.ERROR }]}
        >
          <TextArea placeholder={NAME.PLACEHOLDER} rows={4} />
        </Form.Item>
        <Flex vertical gap={Metrics.SPACE_SM}>
          <Text
            weight="semibold"
            text={
              <>
                <span style={{ color: Colors.DUST_RED_5 }}>* </span>{" "}
                {TAGS.LABEL}
              </>
            }
          />
          <Form.List name={TAGS.NAME}>
            {(fields, { add, remove }) => (
              <Flex vertical gap={0}>
                {fields?.map(({ key, name, ...restField }, index) => (
                  <Flex gap={Metrics.SPACE_SM} align="start" key={key}>
                    <Form.Item
                      {...restField}
                      name={[name, "Key"]}
                      rules={[
                        () => ({
                          validator: () => {
                            for (let i = 0; i < list.length; i++) {
                              if (
                                i !== index &&
                                list[i]?.Key === list[index]?.Key &&
                                list[i]?.Key?.trim()?.length > 0
                              ) {
                                return Promise.reject("Key must be unique");
                              }

                              if (
                                list[index]?.Values?.trim().length > 0 &&
                                !list[index]?.Key
                              ) {
                                return Promise.reject(
                                  "key is required when value is filled",
                                );
                              }
                            }

                            return Promise.resolve();
                          },
                        }),
                      ]}
                    >
                      <Input placeholder="Tag Key" />
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      name={[name, "Values"]}
                      rules={[
                        {
                          validator: validateCommaSeparatedTags,
                          message: "Tags should be comma separated",
                        },
                      ]}
                    >
                      <Input placeholder="Type Value (eg: a, b)" />
                    </Form.Item>
                    <Button
                      type="icon"
                      icon={
                        <IconViewer
                          Icon={DeleteOutlined}
                          color={Colors.BRIGHT_RED}
                          size={25}
                        />
                      }
                      onClick={() => remove(index)}
                      style={{
                        visibility:
                          index !== fields?.length - 1 ? "visible" : "hidden",
                        height: "min-content",
                      }}
                    />
                  </Flex>
                ))}
                <Button
                  type="link"
                  title="+ Add Another"
                  onClick={add}
                  size="small"
                  customClass="semibold"
                  style={{ justifyContent: "left", boxShadow: "none" }}
                />
              </Flex>
            )}
          </Form.List>
          <Flex vertical gap={Metrics.SPACE_XS}>
            <Text weight="semibold" text="Group Resources" />
            {groupingResource?.isLoading ? (
              <Loading type="spinner" />
            ) : groupingResource?.data?.length === 0 ||
              groupingResource?.isError ? (
              <Empty
                title="No resources found"
                subtitle="Add/Edit tags to view resources"
              />
            ) : (
              groupingResource?.data?.map((data, index) => (
                <Flex
                  justify="space-between"
                  gap={Metrics.SPACE_SM}
                  className="group-resource-container"
                  key={index}
                >
                  <Text
                    type="bodycopy"
                    weight="semibold"
                    color={Colors.COOL_GRAY_11_DARK}
                    text={data?.ResourceArn}
                  />
                  <Text
                    type="footnote"
                    text={`project : ${data?.ResourceType}`}
                    color={Colors.COOL_GRAY_12}
                  />
                </Flex>
              ))
            )}
          </Flex>
        </Flex>
      </Form>
    </Drawer>
  );
};

export default ConfigureResourceGroup;
