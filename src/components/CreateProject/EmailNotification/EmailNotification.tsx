import { useState } from "react";
import {
  useAddEmailNotification,
  useDeleteEmailNotification,
  useGetEmailNotification,
  useUpdateEmailNotification,
} from "react-query";

import { DeleteOutlined, EditFilled } from "@ant-design/icons";
import { Flex, Form, Space, Table, TableColumnsType } from "antd";
import { notificationForm } from "constant";
import { EmailNotificationFormField } from "interfaces";

import {
  Button,
  DeleteItemModal,
  Drawer,
  Empty,
  IconViewer,
  Text,
} from "components";

import { useCreateProject } from "context";

import { Colors, Metrics } from "themes";

import { NotificationForm } from "./NotificationForm";

/**
 * A component to manage email notifications for a project. It provides a
 * table to list all the email notifications for the project, and a drawer
 * to add or edit an email notification. It also provides a form to set
 * the name, trigger, and recipients of the email notification, and a
 * button to submit the form data. It uses the useGetEmailNotification,
 * useAddEmailNotification, useUpdateEmailNotification, and
 * useDeleteEmailNotification hooks to fetch and mutate the email
 * notification data.
 */

const EmailNotification: React.FC = () => {
  const [open, setOpen] = useState<boolean>(false);
  const [drawerType, setDrawerType] = useState<"new" | "edit">("new");
  const [isOpenDeleteModal, setIsOpenDeleteModal] = useState<boolean>(false);

  const [form] = Form.useForm<EmailNotificationFormField>();

  const [disabledSave, setDisabledSave] = useState<boolean>(false);

  const { NOTIFICATION_NAME, EMAIL_ADDRESS, TRIGGERS } = notificationForm;

  const emailAddresses: string[] = Form.useWatch(EMAIL_ADDRESS.NAME, {
    form,
    preserve: true,
  });

  const isPublish: boolean = Form.useWatch("isPublish", {
    form,
    preserve: true,
  });

  const { projectId } = useCreateProject();

  const [id, setId] = useState<string>("");

  const addEmailNotificationQuery = useAddEmailNotification();
  const updateEmailNotificationQuery = useUpdateEmailNotification();
  const deleteEmailNotificationQuery = useDeleteEmailNotification();
  const getEmailNotificationQuery = useGetEmailNotification(projectId);

  /**
   * Resets the form fields and opens the drawer to add a new email notification
   */
  const openAddNewEmailNotificationDrawer = () => {
    form.resetFields();
    form.setFieldValue("isPublish", false);
    form.setFieldValue(EMAIL_ADDRESS.NAME, []);
    setOpen(true);
    setDrawerType("new");
  };

  /**
   * Opens the drawer to edit an existing email notification
   * @param record The email notification object to be edited
   */
  const openEditEmailNotification = (record) => {
    form.setFieldsValue(record);
    form.setFieldValue("isPublish", record.published);
    setOpen(true);
    setDrawerType("edit");
    setId(record.id);
  };

  /**
   * Submits the email notification form data. Validates the form fields
   * before determining whether to add a new email notification or update
   * an existing one based on the drawer type. If the drawer type is "new",
   * it creates a new email notification with the form data. If the drawer
   * type is "edit", it updates the existing email notification identified
   * by the `id` with the form data. After the mutation, it refetches the
   * email notifications to update the list and closes the drawer.
   * Logs errors to the console if any occur during the process.
   */
  const handleSubmit = async () => {
    try {
      await form.validateFields();
      if (drawerType === "new") {
        await addEmailNotificationQuery.mutateAsync({
          project_id: parseInt(projectId),
          name: form.getFieldValue(NOTIFICATION_NAME.NAME),
          recipients: emailAddresses,
          trigger: form.getFieldValue(TRIGGERS.NAME),
          published: isPublish,
        });
      } else if (drawerType === "edit") {
        await updateEmailNotificationQuery.mutateAsync({
          obj: {
            project_id: parseInt(projectId),
            name: form.getFieldValue(NOTIFICATION_NAME.NAME),
            recipients: emailAddresses,
            trigger: form.getFieldValue(TRIGGERS.NAME),
            published: form.getFieldValue("isPublish"),
          },
          id: id,
        });
      }

      await getEmailNotificationQuery.refetch();

      setOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  /**
   * Toggles the publish status of an email notification. If the current
   * status is 'published', it sets it to 'unpublished' and vice versa.
   * Prevents execution if the update or get email notification queries
   * are loading. Once the status is updated, it refetches the email
   * notifications to refresh the data.
   *
   * @param obj - The email notification object containing the current
   *              details and status of the notification.
   */
  const handleUpdatePublish = async (obj: EmailNotificationFormField) => {
    try {
      if (
        updateEmailNotificationQuery.isLoading ||
        getEmailNotificationQuery.isLoading
      )
        return;

      await updateEmailNotificationQuery.mutateAsync({
        obj: {
          project_id: parseInt(projectId),
          name: obj.name,
          recipients: obj.recipients,
          trigger: obj.trigger,
          published: !obj.isPublish,
        },
        id: obj.id,
      });

      await getEmailNotificationQuery.refetch();
    } catch (err) {
      console.error(err);
    }
  };

  /**
   * Deletes an email notification with the given id and refetches the
   * email notification list after deletion
   * @param {string} id - the id of the email notification to delete
   */
  const handleDeleteEmailNotificationId = async (id: string) => {
    try {
      await deleteEmailNotificationQuery.mutateAsync(id);

      await getEmailNotificationQuery.refetch();
      setIsOpenDeleteModal(false)
    } catch (err) {
      console.error(err);
    }
  };

  const columns: TableColumnsType<EmailNotificationFormField> = [
    {
      title: "Name and Description",
      dataIndex: NOTIFICATION_NAME.NAME,
      key: NOTIFICATION_NAME.NAME,
      width: "40%",
      render: (name: string) => (
        <Text text={name} type="footnote" weight="semibold" />
      ),
    },
    {
      title: "Emails",
      dataIndex: EMAIL_ADDRESS.NAME,
      key: EMAIL_ADDRESS.NAME,
      width: "10%",

      render: (name: Array<string>) => (
        <Text text={name.length} type="footnote" weight="semibold" />
      ),
    },
    {
      title: "Status",
      dataIndex: "published",
      key: "isPublish",
      width: "30%",
      render: (published: boolean, record) =>
        published ? (
          <Space
            className="publish-text-table-container semibold "
            onClick={() => handleUpdatePublish(record)}
          >
            <Text
              type="footnote"
              text="Published"
              customClass="publish-text"
              weight="bold"
            />
          </Space>
        ) : (
          <Button
            type="primary"
            title="Publish"
            customClass="publish-btn"
            onClick={() => handleUpdatePublish(record)}
          />
        ),
    },
    {
      title: "Action",
      dataIndex: "action",
      key: "action",
      width: "15%",
      render: (_, record) => (
        <Flex gap={Metrics.SPACE_XS} align="center">
          <Button
            type="icon"
            icon={
              <IconViewer
                Icon={EditFilled}
                color={Colors.PRIMARY_BLUE}
                size={20}
              />
            }
            disabled={
              addEmailNotificationQuery.isLoading ||
              updateEmailNotificationQuery.isLoading ||
              deleteEmailNotificationQuery.isLoading
            }
            onClick={() => openEditEmailNotification(record)}
          />

          <Button
            type="icon"
            icon={
              <IconViewer
                Icon={DeleteOutlined}
                color={Colors.BRIGHT_RED}
                size={20}
              />
            }
            onClick={() => {
              setIsOpenDeleteModal(true)
              setId(record.id)
            }}
            disabled={
              addEmailNotificationQuery.isLoading ||
              updateEmailNotificationQuery.isLoading ||
              deleteEmailNotificationQuery.isLoading
            }
          />
        </Flex>
      ),
    },
  ];

  return (
    <Flex vertical gap={Metrics.SPACE_LG}>
      {!getEmailNotificationQuery?.isLoading &&
      getEmailNotificationQuery?.data?.length === 0 ? (
        <Empty
          title="You have not add any Notification yet."
          subtitle='Please click "Add New" button to get started.'
        >
          <Button
            title="Add New"
            onClick={openAddNewEmailNotificationDrawer}
            size="middle"
          />
        </Empty>
      ) : (
        <>
          <Flex justify="end">
            <Button
              title="Add New"
              onClick={openAddNewEmailNotificationDrawer}
            />
          </Flex>
          <Table<EmailNotificationFormField>
            columns={columns}
            dataSource={
              getEmailNotificationQuery?.data
                ? getEmailNotificationQuery?.data
                : []
            }
            pagination={false}
            className="custom-table"
            loading={getEmailNotificationQuery?.isLoading}
          />
        </>
      )}

      <Drawer
        disabled={
          disabledSave ||
          getEmailNotificationQuery.isLoading ||
          updateEmailNotificationQuery.isLoading ||
          addEmailNotificationQuery.isLoading
        }
        loading={
          getEmailNotificationQuery.isLoading ||
          updateEmailNotificationQuery.isLoading ||
          addEmailNotificationQuery.isLoading
        }
        title={
          drawerType === "new" ? "Create New Notification" : "Edit Notification"
        }
        open={open}
        onClose={() => setOpen(false)}
        onSubmit={handleSubmit}
      >
        <NotificationForm
          form={form}
          emailAddresses={emailAddresses}
          setDisabledSave={setDisabledSave}
        />
      </Drawer>
      <DeleteItemModal
        isOpen={isOpenDeleteModal}
        onCancel={() => setIsOpenDeleteModal(false)}
        onDelete={() => handleDeleteEmailNotificationId(id)}
        loading={
          deleteEmailNotificationQuery.isLoading ||
          getEmailNotificationQuery.isLoading
        }
      />
    </Flex>
  );
};

export default EmailNotification;
