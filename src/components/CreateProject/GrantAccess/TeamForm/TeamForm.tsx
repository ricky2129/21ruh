import { useMemo } from "react";
import { useGetTeamDetails, useGetTeamList } from "react-query";

import { CheckCircleFilled } from "@ant-design/icons";
import { Flex, Form, FormInstance, List, Select, Spin } from "antd";
import { teamGrantAccessForm } from "constant";
import { GrantAccessTeamFormField, TEAM } from "interfaces";

import { IconViewer } from "components/IconViewer";
import { Text } from "components/Text";

import { Colors, Metrics } from "themes";

interface TeamFormType {
  type: "new" | "edit";
  initialValues?: TEAM;
  setDisabledSave: (boolean) => void;
  form: FormInstance<GrantAccessTeamFormField>;
  roleOptions;
  isLoadingTeamRoles: boolean;
}

const TeamForm: React.FC<TeamFormType> = ({
  type = "new",
  setDisabledSave,
  form,
  roleOptions = [],
  isLoadingTeamRoles = false,
}) => {
  const { TEAM_ID, TEAM_ROLE } = teamGrantAccessForm;

  const teamId = Form.useWatch(TEAM_ID.NAME, { form, preserve: true });

  const teamDetailsQuery = useGetTeamDetails(teamId?.toString());

  const { isLoading, data } = useGetTeamList();

  const options = useMemo(() => {
    return data?.map((value) => {
      return {
        label: value.name,
        value: value.id,
      };
    });
  }, [data]);

  const handleFormChange = () => {
    const hasErrors =
      form?.getFieldsError().filter(({ errors }) => errors.length).length > 0;

    setDisabledSave(hasErrors);
  };

  return (
    <Form form={form} onFieldsChange={handleFormChange} layout="vertical">
      <Form.Item<GrantAccessTeamFormField>
        label={<Text weight="semibold" text={TEAM_ID.LABEL} />}
        name={TEAM_ID.NAME}
        rules={[{ required: true, message: TEAM_ID.ERROR }]}
      >
        <Select
          filterOption={false}
          showSearch
          notFoundContent={isLoading ? <Spin size="small" /> : null}
          options={options}
          disabled={type === "edit"}
        />
      </Form.Item>

      <Form.Item<GrantAccessTeamFormField>
        label={<Text weight="semibold" text={TEAM_ROLE.LABEL} />}
        name={TEAM_ROLE.NAME}
        rules={[{ required: true, message: TEAM_ROLE.ERROR }]}
      >
        <Select
          options={roleOptions}
          loading={isLoadingTeamRoles}
          menuItemSelectedIcon={
            <IconViewer
              Icon={CheckCircleFilled}
              size={20}
              color={Colors.PRIMARY_GREEN_600}
            />
          }
        />
      </Form.Item>
      <Flex vertical gap={Metrics.SPACE_XS}>
        <Text weight="semibold" text="Members" />
        {
          <List
            itemLayout="vertical"
            dataSource={teamDetailsQuery?.data?.members || []}
            renderItem={(item) => (
              <List.Item
                key={item?.user_id}
                style={{ padding: 0, borderBlockEnd: 0 }}
                title="k"
              >
                <List.Item.Meta
                  title={`${item?.first_name} ${item?.last_name}`}
                  description={item?.email}
                />
              </List.Item>
            )}
            size="small"
          />
        }
      </Flex>
    </Form>
  );
};

export default TeamForm;
