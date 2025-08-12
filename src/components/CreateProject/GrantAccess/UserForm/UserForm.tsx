import { useMemo, useState } from "react";
import { useSearchUsers } from "react-query/userQueries";

import { CheckCircleFilled } from "@ant-design/icons";
import { useQueryClient } from "@tanstack/react-query";
import { Form, FormInstance, Select, Spin } from "antd";
import { QUERY_KEY, userGrantAccessForm } from "constant";
import { GrantAccessUserFormField, USER } from "interfaces";
import { debounce } from "lodash";

import { IconViewer, Input, Text } from "components";

import { Colors } from "themes";

interface UserFormType {
  type: "new" | "edit";
  initialValues?: USER;
  setDisabledSave: (boolean) => void;
  form: FormInstance<GrantAccessUserFormField>;
  selectedUser: USER;
  setSelectedUser: (USER) => void;
  roleOptions;
  isLoadingUserRoels: boolean;
}

const UserForm: React.FC<UserFormType> = ({
  type = "new",
  setDisabledSave,
  form,
  selectedUser,
  setSelectedUser,
  roleOptions = [],
  isLoadingUserRoels,
}) => {
  const { USER_NAME, USER_EMAIL, USER_ROLE } = userGrantAccessForm;
  const [search, setSearch] = useState<string>("");

  const { isLoading, data } = useSearchUsers(search);
  const queryClient = useQueryClient();

  const options = useMemo(() => {
    return data?.map((value) => {
      return {
        label: `${value.first_name} ${value.last_name} (${value.email})`,
        value: value.id,
        email: value.email,
      };
    });
  }, [data]);

  const handleFormChange = () => {
    const hasErrors =
      form?.getFieldsError().filter(({ errors }) => errors.length).length > 0;

    setDisabledSave(hasErrors);
  };

  const handleSearch = debounce((text: string) => {
    setSearch(text);
    queryClient.cancelQueries({ queryKey: [QUERY_KEY.GET_USERS] });
  }, 300);

  return (
    <Form form={form} onFieldsChange={handleFormChange} layout="vertical">
      <Form.Item<GrantAccessUserFormField>
        label={<Text weight="semibold" text={USER_NAME.LABEL} />}
        name={USER_NAME.NAME}
        rules={[{ required: true, message: USER_NAME.ERROR }]}
      >
        <Select
          labelInValue
          filterOption={false}
          onSearch={handleSearch}
          onSelect={(selectedOption) => {
            setSelectedUser(
              options?.find((option) => option.value === selectedOption.value),
            );
          }}
          showSearch
          notFoundContent={isLoading ? <Spin size="small" /> : null}
          options={options}
          disabled={type === "edit"}
          optionRender={(option) => (
            <option value={option.value}>{option.label}</option>
          )}
        />
      </Form.Item>

      <Form.Item<GrantAccessUserFormField>
        label={<Text weight="semibold" text={USER_EMAIL.LABEL} />}
        name={USER_EMAIL.NAME}
      >
        <Input disabled={true} type="text" placeholder={selectedUser?.email} />
      </Form.Item>

      <Form.Item<GrantAccessUserFormField>
        label={<Text weight="semibold" text={USER_ROLE.LABEL} />}
        name={USER_ROLE.NAME}
        rules={[{ required: true, message: USER_ROLE.ERROR }]}
      >
        <Select
          options={roleOptions}
          loading={isLoadingUserRoels}
          menuItemSelectedIcon={
            <IconViewer
              Icon={CheckCircleFilled}
              size={20}
              color={Colors.PRIMARY_GREEN_600}
            />
          }
        />
      </Form.Item>
    </Form>
  );
};

export default UserForm;
