import { useReducer, useState } from "react";
import {
  useCreateResiliencyPolicy,
  useGetAWSIntegrationsByApplicationId,
  useGetInfraResourceList,
  useGetInfraResources,
  useGetResilienyPolicyList,
} from "react-query";

import {
  CloseOutlined,
  InfoCircleOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { useQueryClient } from "@tanstack/react-query";
import {
  Checkbox,
  Collapse,
  DatePicker,
  Divider,
  Flex,
  Form,
  FormInstance,
  Input,
  Radio,
  Select,
  TimePicker,
} from "antd";
import {
  QUERY_KEY,
  configureInfraFormContants,
  createResiliencyPolicyFormConstants,
} from "constant";
import dayjs, { Dayjs } from "dayjs";
import { convertToSeconds } from "helpers";
import {
  ConfigureInfraFormFields,
  CreateResilienctPolicyFormFields,
  CreateResiliencyPolicyRequest,
  CreateResiliencyPolicyResponse,
} from "interfaces";

import { DeleteIcon, EditIcon } from "assets";

import {
  Button,
  CloudSignInDrawer,
  ConfigureResourceGroup,
  Drawer,
  IconViewer,
  Text,
} from "components";
import { ResiliencyPolicy } from "components/CreateApplication";

import { useAppNavigation } from "context";

import { Colors, Metrics } from "themes";

import "./configureInfra.styles.scss";

const scheduleAssesmentOptions = [
  { label: "Once", value: "Once" },
  { label: "Daily", value: "Daily" },
  { label: "Weekly", value: "Weekly" },
  { label: "Monthly", value: "Monthly" },
];

type DrawerState = {
  open: boolean;
  operation: "edit" | "create";
  title: string;
  disabledSave: boolean;
  openAwsSignInDrawer: boolean;
};

interface CloudFormationStackType {
  label: string;
  value: string;
  description?: string;
}

interface ConfigureInfraProps {
  configureInfraForm: FormInstance<ConfigureInfraFormFields>;
  application_id: string;
  setDisabledSave: (disabledSave: boolean) => void;
}

const ConfigureInfra: React.FC<ConfigureInfraProps> = ({
  configureInfraForm,
  application_id,
  setDisabledSave,
}) => {
  const { project: projectDetails } = useAppNavigation();
  const [selectedCloudFormation, setSelectedCloudFormation] = useState<
    CloudFormationStackType[]
  >([]);
  const [resiliencyRadioOption, setResiliencyRadioOption] = useState<number>(1);
  const [drawerDisabledSave, setDrawerDisabledSave] = useState<boolean>(false);
  const [resiliencyPolicy, setResiliencyPolicy] = useState(
    {} as CreateResilienctPolicyFormFields,
  );
  const [scheduledAssesment, setScheduledAssesment] = useState({
    frequency: "",
    date: "",
    time: "",
  });

  const [
    isConfigureResourceGroupDrawerOpen,
    setIsConfigureResourceGroupDrawerOpen,
  ] = useState<boolean>(false);

  const {
    ENVIRONMENT_NAME,
    AWS_ACCOUNT,
    CLOUDFORMATION_STACK,
    RESILIENCY_POLICY,
    RESOURCE,
    SCHEDULE_ASSESMENT,
  } = configureInfraFormContants;

  const advanced = Form.useWatch("advanced", {
    form: configureInfraForm,
    preserve: true,
  });

  const { RESILIENCY_POLICY: RESILIENCY_POLICY_CONST } =
    createResiliencyPolicyFormConstants;

  const [drawerState, updateDrawerState] = useReducer<
    React.Reducer<DrawerState, Partial<DrawerState>>
  >((prev, next) => {
    const newState: DrawerState = { ...prev, ...next };
    if (newState.operation === "create")
      newState.title = RESILIENCY_POLICY_CONST.LABEL;
    else if (newState.operation === "edit")
      newState.title = RESILIENCY_POLICY_CONST.LABEL_EDIT;

    return newState;
  }, {} as DrawerState);

  const reactQueries = useQueryClient();
  const [resiliencyPolicyForm] =
    Form.useForm<CreateResilienctPolicyFormFields>();
  const infraResourcesQuery = useGetInfraResources();
  const infraResourceListQuery = useGetInfraResourceList();
  const getResiliencyPolicyListQuery = useGetResilienyPolicyList(
    configureInfraForm?.getFieldValue(AWS_ACCOUNT.NAME) as number,
  );
  const createResiliencyPolicyQuery = useCreateResiliencyPolicy();
  const awsIntegrationsListQuery =
    useGetAWSIntegrationsByApplicationId(application_id);

  const handleFormChange = () => {
    const hasErrors =
      configureInfraForm?.getFieldsError().filter(({ errors }) => errors.length)
        .length > 0;

    if (advanced) {
      const { frequency, date, time } = configureInfraForm.getFieldsValue([
        [SCHEDULE_ASSESMENT.FREQUENCY.NAME],
        [SCHEDULE_ASSESMENT.DATE.NAME],
        [SCHEDULE_ASSESMENT.TIME.NAME],
      ]) as { frequency: string; date: Dayjs; time: Dayjs };

      if (frequency && date && time) {
        setScheduledAssesment({
          frequency,
          date:
            frequency === "Weekly"
              ? date.format("dddd")
              : date.format("DD MMM YYYY"),
          time: time.format("hh:mm A"),
        });
      } else {
        setScheduledAssesment({
          frequency: "",
          date: "",
          time: "",
        });
      }
    }

    setDisabledSave(hasErrors);
  };

  const onAwsAccountChange = async () => {
    reactQueries.resetQueries({
      queryKey: [QUERY_KEY.GET_INFRA_RESOURCES],
      exact: true,
    });
    infraResourceListQuery.reset();
    configureInfraForm.resetFields([RESOURCE.NAME, CLOUDFORMATION_STACK.NAME]);
    setSelectedCloudFormation([]);
    await infraResourcesQuery.refetch();
    await getResiliencyPolicyListQuery.refetch();
  };

  const onCloudFormationChange = (
    checked: boolean,
    option: CloudFormationStackType,
  ) => {
    const newList = checked
      ? [...selectedCloudFormation, option]
      : selectedCloudFormation.filter(
          (selectedOption) => selectedOption.value !== option.value,
        );
    setSelectedCloudFormation(newList);

    configureInfraForm.setFieldValue(CLOUDFORMATION_STACK.NAME, newList);

    configureInfraForm.validateFields([CLOUDFORMATION_STACK.NAME]);

    handleFormChange();
  };

  const checkDisabledCloudFormation = (value: string) =>
    !isCheckedCloudFormation(value) && selectedCloudFormation?.length >= 5;

  const isCheckedCloudFormation = (value: string) =>
    selectedCloudFormation?.findIndex((option) => option.value === value) !==
    -1;

  const onCreateResiliencyPolicyClicked = () => {
    resiliencyPolicyForm.resetFields();
    updateDrawerState({ open: true, operation: "create" });
  };

  const onEditResiliencyPolicyClicked = () => {
    updateDrawerState({ open: true, operation: "edit" });
    resiliencyPolicyForm.setFieldsValue(resiliencyPolicy);
  };

  const onDeleteResiliencyPolicyClicked = () => {
    resiliencyPolicyForm.resetFields();
    setResiliencyPolicy({} as CreateResilienctPolicyFormFields);
  };

  const handleResilienctPolicySubmit = async () => {
    try {
      updateDrawerState({ disabledSave: true });
      await resiliencyPolicyForm.validateFields();

      // TODO: update resiliency policy condition goes here
      // Check for drawer operation create or edit
      const data = resiliencyPolicyForm.getFieldsValue();

      const rpo_in = convertToSeconds(data.rpo, data.rpo_unit);
      const rto_in = convertToSeconds(data.rto, data.rto_unit);

      const createResiliencyPolicyReqest: CreateResiliencyPolicyRequest = {
        integration_id: configureInfraForm.getFieldValue(AWS_ACCOUNT.NAME),
        policy_name: data.name,
        application_rpo_in: data.advanced
          ? convertToSeconds(data.application_rpo, data.application_rpo_unit)
          : rpo_in,
        application_rto_in: data.advanced
          ? convertToSeconds(data.application_rto, data.application_rto_unit)
          : rto_in,
        infrastructure_rpo_in: data.advanced
          ? convertToSeconds(
              data.infrastructure_rpo,
              data.infrastructure_rpo_unit,
            )
          : rpo_in,
        infrastructure_rto_in: data.advanced
          ? convertToSeconds(
              data.infrastructure_rto,
              data.infrastructure_rto_unit,
            )
          : rto_in,
        availability_zone_rpo_in: data.advanced
          ? convertToSeconds(data.az_rpo, data.az_rpo_unit)
          : rpo_in,
        availability_zone_rto_in: data.advanced
          ? convertToSeconds(data.az_rto, data.az_rto_unit)
          : rto_in,
      };

      const resiliencyPolicy: CreateResiliencyPolicyResponse =
        await createResiliencyPolicyQuery.mutateAsync(
          createResiliencyPolicyReqest,
        );

      configureInfraForm.setFieldValue(
        RESILIENCY_POLICY.NAME,
        resiliencyPolicy.policyArn,
      );

      setResiliencyPolicy(
        resiliencyPolicyForm.getFieldsValue([
          [RESILIENCY_POLICY_CONST.NAME.NAME],
        ]),
      );

      updateDrawerState({ open: false });
    } catch (err) {
      setDisabledSave(true);
      console.error(err);
    }
  };

  return (
    <Flex gap={Metrics.SPACE_MD} vertical className="configure-infra-container">
      <Form
        layout="vertical"
        form={configureInfraForm}
        initialValues={{
          project_name: "",
          advanced: true,
        }}
        onFieldsChange={handleFormChange}
      >
        <Form.Item<ConfigureInfraFormFields>
          label={<Text text={ENVIRONMENT_NAME.LABEL} weight="semibold" />}
          name={ENVIRONMENT_NAME.NAME}
          rules={[
            {
              required: true,
              message: ENVIRONMENT_NAME.ERROR,
            },
          ]}
        >
          <Input
            placeholder={ENVIRONMENT_NAME.PLACEHOLDER}
            type={ENVIRONMENT_NAME.TYPE}
          />
        </Form.Item>

        <Form.Item<ConfigureInfraFormFields>
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
            placeholder={AWS_ACCOUNT.PLACEHOLDER}
            options={awsIntegrationsListQuery?.data?.map((value) => ({
              label: value.name,
              value: value.id,
            }))}
            disabled={awsIntegrationsListQuery?.isLoading}
            loading={awsIntegrationsListQuery?.isLoading}
            dropdownRender={(menu) => (
              <Flex vertical gap={Metrics.SPACE_XXS} justify="start">
                {menu}
                <Button
                  icon={
                    <IconViewer
                      Icon={PlusOutlined}
                      size={Metrics.SPACE_MD}
                      color={Colors.PRIMARY_BLUE}
                    />
                  }
                  title="Add New Account"
                  type="link"
                  size="middle"
                  customClass="add-newAccount-btn"
                  onClick={() =>
                    updateDrawerState({ openAwsSignInDrawer: true })
                  }
                />
              </Flex>
            )}
            onChange={onAwsAccountChange}
          />
        </Form.Item>

        <Form.Item
          label={<Text text={RESOURCE.LABEL} weight="semibold" />}
          name={RESOURCE.NAME}
          rules={[
            {
              required: true,
              message: RESOURCE.ERROR,
            },
          ]}
        >
          <Select
            placeholder={RESOURCE.PLACEHOLDER}
            options={
              infraResourcesQuery.data
                ? Object.keys(infraResourcesQuery.data).map((key) => ({
                    label: infraResourcesQuery.data[key],
                    value: key,
                  }))
                : []
            }
            disabled={
              infraResourcesQuery.isLoading ||
              !configureInfraForm?.getFieldValue(AWS_ACCOUNT.NAME)
            }
            loading={infraResourcesQuery.isLoading}
            onChange={(resourceName) => {
              infraResourceListQuery.reset();
              configureInfraForm.resetFields([CLOUDFORMATION_STACK.NAME]);
              setSelectedCloudFormation([]);
              infraResourceListQuery
                .mutateAsync({
                  integration_id: configureInfraForm.getFieldValue(
                    AWS_ACCOUNT.NAME,
                  ),
                  resource: resourceName || "",
                })
                .catch((error) => console.error(error));
            }}
          />
        </Form.Item>

        {configureInfraForm.getFieldValue(RESOURCE.NAME) && (
          <Form.Item
            className="resource-selection-select"
            label={
              <Flex vertical gap={0}>
                <Text
                  text={
                    infraResourcesQuery?.data[
                      configureInfraForm.getFieldValue(RESOURCE.NAME)
                    ]
                  }
                  weight="semibold"
                />
                <Text
                  text={`Add a maximum of 5 ${
                    infraResourcesQuery?.data[
                      configureInfraForm.getFieldValue(RESOURCE.NAME)
                    ]
                  }.`}
                  type="footnote"
                  weight="regular"
                  color={Colors.COOL_GRAY_9}
                />
              </Flex>
            }
            name={CLOUDFORMATION_STACK.NAME}
            rules={[
              {
                required: true,
                message: CLOUDFORMATION_STACK.ERROR,
              },
            ]}
          >
            <Flex
              vertical
              gap={Metrics.SPACE_XS}
              className="custom-multi-select"
            >
              <Select
                showSearch={false}
                mode="multiple"
                maxCount={5}
                maxTagCount={0}
                maxTagPlaceholder={() => CLOUDFORMATION_STACK.PLACEHOLDER}
                placeholder={CLOUDFORMATION_STACK.PLACEHOLDER}
                options={
                  infraResourceListQuery.data &&
                  Array.isArray(infraResourceListQuery.data)
                    ? infraResourceListQuery.data?.map((key) => ({
                        label: key.name,
                        value: key.id,
                        description: key.description,
                        style: { padding: "0" },
                      }))
                    : []
                }
                loading={infraResourceListQuery.isLoading}
                disabled={
                  infraResourceListQuery.isLoading ||
                  !configureInfraForm?.getFieldValue(AWS_ACCOUNT.NAME)
                }
                optionRender={(option) => (
                  <Flex
                    gap={Metrics.SPACE_XS}
                    align="center"
                    onClick={(e) => e.stopPropagation()}
                    style={{ padding: "5px 12px" }}
                  >
                    <Checkbox
                      onChange={(e) => {
                        e.stopPropagation();
                        onCloudFormationChange(
                          e.target.checked,
                          option.data as CloudFormationStackType,
                        );
                      }}
                      checked={isCheckedCloudFormation(option.value as string)}
                      disabled={checkDisabledCloudFormation(
                        option.value as string,
                      )}
                    />
                    <Flex gap={-2} vertical>
                      <Text text={option.data.label} />
                      <Text
                        text={option.data.description}
                        type="footnote"
                        color={Colors.COOL_GRAY_7}
                      />
                    </Flex>
                  </Flex>
                )}
                dropdownRender={(menu) => (
                  <Flex vertical gap={Metrics.SPACE_SM} justify="start">
                    {menu}
                    {infraResourcesQuery?.data[
                      configureInfraForm.getFieldValue(RESOURCE.NAME)
                    ] === "Resource Group" && (
                      <Button
                        icon={
                          <IconViewer
                            Icon={PlusOutlined}
                            size={15}
                            color={Colors.PRIMARY_BLUE}
                          />
                        }
                        title="Add New Resource group"
                        type="link"
                        customClass="add-newAccount-btn"
                        onClick={() =>
                          setIsConfigureResourceGroupDrawerOpen(true)
                        }
                      />
                    )}
                  </Flex>
                )}
                className="cloud-formation-select"
              />

              <Flex vertical gap={Metrics.SPACE_XS}>
                {selectedCloudFormation.map((value, index) => (
                  <Flex
                    justify="space-between"
                    key={index}
                    className="cloud-formation-selection"
                  >
                    <Text
                      text={value.label}
                      type="footnote"
                      weight="semibold"
                    />
                    <IconViewer
                      Icon={CloseOutlined}
                      size={Metrics.SPACE_SM}
                      color={Colors.SECONDARY_85}
                      onClick={() => onCloudFormationChange(false, value)}
                    />
                  </Flex>
                ))}
              </Flex>
            </Flex>
          </Form.Item>
        )}

        <Form.Item label={<Text text="Add SLO" weight="semibold" />} required>
          <Select options={[]} placeholder="Select" disabled />
        </Form.Item>

        <Divider />

        <Flex vertical className="resiliency-policy" gap={Metrics.SPACE_SM}>
          <Flex vertical>
            <Text
              text={RESILIENCY_POLICY.LABEL}
              type="subtitle"
              weight="semibold"
            />
            <Text text={RESILIENCY_POLICY.SUBLABEL} />
          </Flex>
          <Radio.Group
            onChange={(e) => {
              if (e?.target?.value !== undefined) {
                configureInfraForm?.resetFields([RESILIENCY_POLICY.NAME]);
                setResiliencyRadioOption(e.target.value);
              }
            }}
            value={resiliencyRadioOption}
          >
            <Flex vertical gap={Metrics.SPACE_MD}>
              <Radio value={1}>
                <Flex vertical gap={Metrics.SPACE_MD}>
                  <Text
                    text={RESILIENCY_POLICY.CHOOSE.LABEL}
                    color={Colors.COOL_GRAY_7}
                  />

                  {resiliencyRadioOption === 1 && (
                    <Form.Item<ConfigureInfraFormFields>
                      name={RESILIENCY_POLICY.NAME}
                      rules={[
                        {
                          required: true,
                          message: RESILIENCY_POLICY.ERROR,
                        },
                      ]}
                    >
                      <Select
                        onClick={(e) => e.preventDefault()}
                        onFocus={(e) => e.preventDefault()}
                        placeholder={RESILIENCY_POLICY.CHOOSE.PLACEHOLDER}
                        disabled={
                          getResiliencyPolicyListQuery.isLoading ||
                          !getResiliencyPolicyListQuery.data
                        }
                        loading={getResiliencyPolicyListQuery.isLoading}
                        options={
                          getResiliencyPolicyListQuery.data
                            ? getResiliencyPolicyListQuery.data.map(
                                (option) => ({
                                  label: option.policyName,
                                  value: option.policyArn,
                                }),
                              )
                            : []
                        }
                      />
                    </Form.Item>
                  )}
                </Flex>
              </Radio>

              <Radio value={2}>
                <Flex vertical gap={Metrics.SPACE_MD}>
                  <Text
                    text={RESILIENCY_POLICY.CREATE.LABEL}
                    color={Colors.COOL_GRAY_7}
                  />

                  {resiliencyRadioOption === 2 && (
                    <Form.Item<ConfigureInfraFormFields>
                      name={RESILIENCY_POLICY.NAME}
                      rules={[
                        {
                          required: true,
                          message: RESILIENCY_POLICY.ERROR,
                        },
                      ]}
                    >
                      <Flex
                        vertical
                        gap={Metrics.SPACE_MD}
                        className="create-resiliency"
                      >
                        <Button
                          title={RESILIENCY_POLICY.CREATE.BUTTON_NAME}
                          type="primary"
                          size="middle"
                          disabled={
                            !configureInfraForm?.getFieldValue(AWS_ACCOUNT.NAME)
                          }
                          customClass="create-new-button"
                          onClick={() => onCreateResiliencyPolicyClicked()}
                        />
                        <Input className="new-resiliency-input" />
                      </Flex>
                    </Form.Item>
                  )}
                </Flex>
              </Radio>
            </Flex>
          </Radio.Group>
        </Flex>

        <Flex
          justify="space-between"
          align="center"
          gap={Metrics.SPACE_MD}
          className="new-resiliency-policy"
          style={{
            display:
              resiliencyRadioOption === 2 && resiliencyPolicy.name !== undefined
                ? "flex"
                : "none",
          }}
        >
          <Flex vertical gap={-1}>
            <Text
              text={resiliencyPolicy.name}
              type="footnote"
              weight="semibold"
            />
            <Text
              text={resiliencyPolicy.description}
              type="footnote"
              color={Colors.COOL_GRAY_7}
            />
          </Flex>
          <Flex gap={Metrics.SPACE_SM}>
            <IconViewer
              Icon={EditIcon}
              size={Metrics.SPACE_LG}
              color={Colors.PRIMARY_BLUE}
              customClass="cursor-pointer"
              onClick={() => onEditResiliencyPolicyClicked()}
            />

            <IconViewer
              Icon={DeleteIcon}
              size={Metrics.SPACE_LG}
              color={Colors.BRIGHT_RED}
              customClass="cursor-pointer"
              onClick={() => onDeleteResiliencyPolicyClicked()}
            />
          </Flex>
        </Flex>

        <Divider />

        <Collapse
          items={[
            {
              key: "1",
              label: (
                <Text
                  text="Advanced"
                  weight="semibold"
                  color={Colors.PRIMARY_BLUE}
                />
              ),
              children: (
                <Flex
                  vertical
                  gap={Metrics.SPACE_SM}
                  className="target-input-wrapper"
                >
                  <Flex vertical>
                    <Text
                      text={SCHEDULE_ASSESMENT.LABEL}
                      type="subtitle"
                      weight="semibold"
                    />
                    <Text
                      text={SCHEDULE_ASSESMENT.SUBLABEL}
                      type="footnote"
                      color={Colors.COOL_GRAY_7}
                    />
                  </Flex>

                  <Form.Item<ConfigureInfraFormFields>
                    name={SCHEDULE_ASSESMENT.FREQUENCY.NAME}
                    label={
                      <Text
                        text={SCHEDULE_ASSESMENT.FREQUENCY.LABEL}
                        weight="semibold"
                      />
                    }
                    rules={
                      advanced
                        ? [
                            {
                              required: true,
                              message: SCHEDULE_ASSESMENT.FREQUENCY.ERROR,
                            },
                          ]
                        : []
                    }
                  >
                    <Select
                      options={scheduleAssesmentOptions}
                      placeholder={SCHEDULE_ASSESMENT.FREQUENCY.PLACEHOLDER}
                    />
                  </Form.Item>

                  <Form.Item<ConfigureInfraFormFields>
                    label={
                      <Text
                        text={SCHEDULE_ASSESMENT.DATE.LABEL}
                        weight="semibold"
                      />
                    }
                    name={SCHEDULE_ASSESMENT.DATE.NAME}
                    rules={
                      advanced
                        ? [
                            {
                              required: true,
                              message: SCHEDULE_ASSESMENT.DATE.ERROR,
                            },
                          ]
                        : []
                    }
                  >
                    <DatePicker
                      placeholder={SCHEDULE_ASSESMENT.DATE.PLACEHOLDER}
                      minDate={dayjs(new Date())}
                      format={"DD/MM/YYYY"}
                      style={{ width: "100%" }}
                    />
                  </Form.Item>

                  <Form.Item<ConfigureInfraFormFields>
                    label={
                      <Text
                        text={SCHEDULE_ASSESMENT.TIME.LABEL}
                        weight="semibold"
                      />
                    }
                    name={SCHEDULE_ASSESMENT.TIME.NAME}
                    rules={
                      advanced
                        ? [
                            {
                              required: true,
                              message: SCHEDULE_ASSESMENT.TIME.ERROR,
                            },
                          ]
                        : []
                    }
                  >
                    <TimePicker
                      use12Hours
                      format="h:mm A"
                      style={{ width: "100%" }}
                    />
                  </Form.Item>

                  <Form.Item<ConfigureInfraFormFields>
                    name={SCHEDULE_ASSESMENT.DRIFT_NOTIFICATION.NAME}
                  >
                    <Flex gap={Metrics.SPACE_XS}>
                      <Checkbox />
                      <Text
                        text={SCHEDULE_ASSESMENT.DRIFT_NOTIFICATION.LABEL}
                        weight="semibold"
                      />
                      <IconViewer
                        Icon={InfoCircleOutlined}
                        color={Colors.COOL_GRAY_11}
                      />
                    </Flex>
                  </Form.Item>

                  {!Object.values(scheduledAssesment).includes("") && (
                    <Flex vertical gap={Metrics.SPACE_XS}>
                      <Flex
                        justify="space-between"
                        align="center"
                        gap={Metrics.SPACE_MD}
                        className="scheduled-assesment-selection"
                      >
                        <Flex vertical gap={-1}>
                          <Text
                            text={scheduledAssesment.frequency}
                            type="footnote"
                            weight="semibold"
                          />
                          <Text
                            text={`${scheduledAssesment.date}, ${scheduledAssesment.time}`}
                            type="footnote"
                            color={Colors.COOL_GRAY_7}
                          />
                        </Flex>
                        <IconViewer
                          Icon={CloseOutlined}
                          size={Metrics.SPACE_SM}
                          color={Colors.SECONDARY_85}
                          onClick={() => {
                            configureInfraForm.resetFields([
                              SCHEDULE_ASSESMENT.FREQUENCY.NAME,
                              SCHEDULE_ASSESMENT.DATE.NAME,
                              SCHEDULE_ASSESMENT.TIME.NAME,
                            ]);
                            handleFormChange();
                          }}
                        />
                      </Flex>
                    </Flex>
                  )}
                </Flex>
              ),
            },
          ]}
          ghost
          expandIconPosition="end"
          onChange={async (key) => {
            configureInfraForm.setFieldValue("advanced", !!key.length);
            await configureInfraForm
              .validateFields([
                "advanced",
                SCHEDULE_ASSESMENT.FREQUENCY.NAME,
                SCHEDULE_ASSESMENT.DATE.NAME,
                SCHEDULE_ASSESMENT.TIME.NAME,
              ])
              .catch((error) => {
                console.error(error);
              });
            handleFormChange();
          }}
        />
      </Form>

      <Drawer
        title={drawerState.title}
        open={drawerState.open}
        disabled={drawerDisabledSave}
        loading={createResiliencyPolicyQuery.isLoading}
        onClose={() => updateDrawerState({ open: false })}
        onCancel={() => updateDrawerState({ open: false })}
        onSubmit={handleResilienctPolicySubmit}
      >
        <ResiliencyPolicy
          setDisabledSave={setDrawerDisabledSave}
          resiliencyPolicyForm={resiliencyPolicyForm}
        />
      </Drawer>

      <ConfigureResourceGroup
        isOpen={isConfigureResourceGroupDrawerOpen}
        setOpen={setIsConfigureResourceGroupDrawerOpen}
        onSubmit={async () => {
          configureInfraForm.resetFields([CLOUDFORMATION_STACK.NAME]);

          await infraResourceListQuery.mutateAsync({
            integration_id: configureInfraForm.getFieldValue(AWS_ACCOUNT.NAME),
            resource: configureInfraForm.getFieldValue(RESOURCE.NAME) || "",
          });
        }}
        integration_id={configureInfraForm.getFieldValue(AWS_ACCOUNT.NAME)}
      />
      <CloudSignInDrawer
        isOpen={drawerState.openAwsSignInDrawer}
        projectId={projectDetails.id}
        onClose={() => updateDrawerState({ openAwsSignInDrawer: false })}
        onSuccess={async (res) => {
          await awsIntegrationsListQuery.refetch();
          configureInfraForm?.setFieldValue(AWS_ACCOUNT.NAME, res.id);
          onAwsAccountChange();
          updateDrawerState({ openAwsSignInDrawer: false });
        }}
      />
    </Flex>
  );
};

export default ConfigureInfra;
