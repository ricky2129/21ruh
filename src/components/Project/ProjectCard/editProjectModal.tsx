import React, { useState, useEffect } from "react";
import { Modal, Form, Input, Radio, Button, message } from "antd";
import useProjectService from "services/project.service";

const EditProjectModal = ({ visible, onCancel, onSuccess, project }) => {
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  const { updateProject } = useProjectService();

  useEffect(() => {
    if (visible && project) {
      form.setFieldsValue({
        name: project.name,
        description: project.description,
        visibility:
          project.visibility?.toLowerCase() === "internal"
            ? "internal"
            : "private",
      });
    }
  }, [visible, project, form]);

  const handleFormSubmit = async (values) => {
    setSubmitting(true);
    try {
      await updateProject(
        project.id.toString(),
        {
          name: values.name,
          description: values.description,
          visibility: values.visibility,
          tags: []
        }
      );
      setSubmitting(false);
      message.success("Portfolio updated successfully");

      // Compose the updated project object for immediate UI update
      const updatedProject = {
        ...project,
        name: values.name,
        description: values.description,
        visibility: values.visibility,
      };

      if (onSuccess) onSuccess(updatedProject);
    } catch (error) {
      setSubmitting(false);
      message.error("Failed to update portfolio");
    }
  };

  return (
    <Modal
      title="Edit Project"
      open={visible}
      onCancel={onCancel}
      footer={null}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFormSubmit}
      >
        <Form.Item
          label="Name"
          name="name"
          rules={[{ required: true, message: "Please enter project name" }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="Description"
          name="description"
          rules={[{ required: true, message: "Please enter project description" }]}
        >
          <Input.TextArea rows={3} />
        </Form.Item>
        <Form.Item
          label="Visibility"
          name="visibility"
          rules={[{ required: true, message: "Please select visibility" }]}
        >
          <Radio.Group>
            <Radio value="internal">Internal</Radio>
            <Radio value="private">Private</Radio>
          </Radio.Group>
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" loading={submitting} block>
            Save
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default EditProjectModal;
