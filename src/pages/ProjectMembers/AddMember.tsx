import { useMemo, useState } from "react";
import { useSearchUsers } from "react-query/userQueries";
import { CheckCircleFilled } from "@ant-design/icons";
import { useQueryClient } from "@tanstack/react-query";
import { Form, Select, Spin, Button, message } from "antd";
import { debounce } from "lodash";
import { IconViewer, Input, Text } from "components";
import { Colors } from "themes";
import { useAddMemberToProject } from "react-query/projectQueries"; 


interface AddMemberFormProps {
  projectId: number;
  roleOptions: any[];
  isLoadingUserRoles: boolean;
  onSuccess: () => void;
}

export const AddMemberForm: React.FC<AddMemberFormProps> = ({
  projectId,
  roleOptions = [],
  isLoadingUserRoles,
  onSuccess,
}) => {
  const [form] = Form.useForm();
  const [search, setSearch] = useState<string>("");
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  const { isLoading, data } = useSearchUsers(search);
  const queryClient = useQueryClient();
  const { mutateAsync: addMember } = useAddMemberToProject();

  const options = useMemo(() => {
    return data?.map((value) => ({
      label: `${value.first_name} ${value.last_name} (${value.email})`,
      value: value.id,
      email: value.email,
    }));
  }, [data]);

  const handleSearch = debounce((text: string) => {
    setSearch(text);
    queryClient.cancelQueries({ queryKey: ["GET_USERS"] });
  }, 300);

  const handleSave = async () => {
  try {
    const values = await form.validateFields();
    setSaving(true);
    await addMember({
      project_id: projectId,
      user_id: selectedUser.value,
      role_id: values.role_id,
    });
    message.success("Member added successfully");
    onSuccess();
    form.resetFields();
    setSelectedUser(null);
  } catch (err) {
    const apiDetail =
      err?.response?.data?.detail ||
      err?.data?.detail ||
      err?.detail ||
      err?.message;
    if (apiDetail === "Member already found") {
      message.warning("Member is already in the project");
    } else {
      message.error("Failed to add member");
    }
  } finally {
    setSaving(false);
  }
};

  return (
    <Form form={form} layout="vertical">
      <Form.Item
        label={<Text weight="semibold" text="User" />}
        name="user_id"
        rules={[{ required: true, message: "Please select a user" }]}
      >
        <Select
          labelInValue
          filterOption={false}
          onSearch={handleSearch}
          onSelect={(selectedOption) => {
            setSelectedUser(options?.find((option) => option.value === selectedOption.value));
            form.setFieldsValue({ user_id: selectedOption });
          }}
          showSearch
          notFoundContent={isLoading ? <Spin size="small" /> : null}
          options={options}
          optionRender={(option) => (
            <option value={option.value}>{option.label}</option>
          )}
        />
      </Form.Item>

      <Form.Item label={<Text weight="semibold" text="Email" />} name="email">
        <Input disabled type="text" placeholder={selectedUser?.email || ""} />
      </Form.Item>

      <Form.Item
        label={<Text weight="semibold" text="Role" />}
        name="role_id"
        rules={[{ required: true, message: "Please select a role" }]}
      >
        <Select
          options={roleOptions}
          loading={isLoadingUserRoles}
          menuItemSelectedIcon={
            <IconViewer
              Icon={CheckCircleFilled}
              size={20}
              color={Colors.PRIMARY_GREEN_600}
            />
          }
        />
      </Form.Item>

      <Form.Item>
        <Button type="primary" onClick={handleSave} loading={saving} block>
          Save
        </Button>
      </Form.Item>
    </Form>
  );
};
