import React from "react";
import { Form, Input, Select } from "antd";
const { Option } = Select;

const cloudAccounts = [
  { value: "aws-1", label: "AWS Account 1" },
  { value: "azure-1", label: "Azure Account 1" },
];
const tagResources = [
  { value: "tag-1", label: "Tag/Resource 1" },
  { value: "tag-2", label: "Tag/Resource 2" },
];

const CommonEnvironmentForm = ({
  form,
  setDisabledSave,
  environmentLabel = "Environment Name",
  cloudAccountLabel = "Cloud Account",
  tagResourceLabel = "Tag/Resources",
}) => (
  <Form
    form={form}
    layout="vertical"
    onFieldsChange={() => setDisabledSave && setDisabledSave(false)}
  >
    <Form.Item
      label={environmentLabel}
      name="environmentName"
      rules={[{ required: true, message: "Please enter environment name" }]}
    >
      <Input placeholder="Enter environment name" />
    </Form.Item>
    <Form.Item
      label={cloudAccountLabel}
      name="cloudAccount"
      rules={[{ required: true, message: "Please select a cloud account" }]}
    >
      <Select placeholder="Select cloud account">
        {cloudAccounts.map((acc) => (
          <Option key={acc.value} value={acc.value}>
            {acc.label}
          </Option>
        ))}
      </Select>
    </Form.Item>
    <Form.Item
      label={tagResourceLabel}
      name="tagResources"
      rules={[{ required: true, message: "Please select at least one tag/resource" }]}
    >
      <Select mode="multiple" placeholder="Select tags/resources">
        {tagResources.map((tag) => (
          <Option key={tag.value} value={tag.value}>
            {tag.label}
          </Option>
        ))}
      </Select>
    </Form.Item>
  </Form>
);

export default CommonEnvironmentForm;
