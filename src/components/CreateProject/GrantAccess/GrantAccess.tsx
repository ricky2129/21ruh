import { useEffect, useMemo, useState } from "react";
import {
  useAddMemberToProject,
  useAddTeamToProject,
  useDeleteMemberInProject,
  useDeleteTeamInProject,
  useGetAccessList,
  useUpdateMemberInProject,
  useUpdateTeamInProject,
} from "react-query";
import { useGetUserProfile, useUserRoles } from "react-query/userQueries";

import { DeleteOutlined, EditFilled } from "@ant-design/icons";
import { Flex, Form, Table, TableColumnsType, message } from "antd";
import { teamGrantAccessForm, userGrantAccessForm } from "constant";
import {
  GrantAccessTeamFormField,
  GrantAccessUserFormField,
  MEMBER,
  TEAM,
  USER,
} from "interfaces";

import {
  Button,
  DeleteItemModal,
  Drawer,
  Empty,
  IconViewer,
  Text,
} from "components";

import { Colors, Metrics } from "themes";

import "./GrantAccess.styles.scss";
import { TeamForm } from "./TeamForm";
import { UserForm } from "./UserForm";

type tab = "Members" | "Teams";
const tabs: tab[] = ["Members", "Teams"];

interface GrantAccessPropType {
  project_id: number;
  setShowSkipBtn: (value: boolean) => void;
  setDisabledNext: (boolean) => void;
}

const GrantAccess: React.FC<GrantAccessPropType> = ({
  project_id = null,
  setShowSkipBtn,
  setDisabledNext,
}) => {
  const [selectedTab, setSelectedTab] = useState<tab>("Members");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedUser, setSelectedUser] = useState<USER>({} as USER);
  const [selectedTeam, setSelectedTeam] = useState<TEAM>({} as TEAM);

  const [open, setOpen] = useState<boolean>(false);
  const [isOpenDeleteModal, setIsOpenDeleteModal] = useState<boolean>(false);

  const [drawerType, setDrawerType] = useState<"new" | "edit">("new");
  const [disabledSave, setDisabledSave] = useState<boolean>(false);
  const { USER_ROLE, USER_NAME } = userGrantAccessForm;
  const { TEAM_ROLE, TEAM_ID } = teamGrantAccessForm;

  const [userForm] = Form.useForm<GrantAccessUserFormField>();
  const [teamForm] = Form.useForm<GrantAccessTeamFormField>();
  const { data: roleData, isLoading: isLoadingRoles } = useUserRoles();

  const userDetailQuery = useGetUserProfile();
  const addTeamToProjectQuery = useAddTeamToProject();
  const addMemberToProjectQuery = useAddMemberToProject();
  const updateTeamInProject = useUpdateTeamInProject();
  const deleteMemberInProjectQuery = useDeleteMemberInProject();
  const updateMemberInProject = useUpdateMemberInProject();
  const deleteTeamInProject = useDeleteTeamInProject();

  const getAccessListQuery = useGetAccessList(project_id);

  const [messageApi, contextHolder] = message.useMessage();

  const error = () => {
    messageApi.open({
      type: "error",
      content: "Error: Something went wrong",
    });
  };

  const hasAccess = (list) => list?.length > 0;

  useEffect(() => {
    const isMembershipTab = selectedTab === "Members";
    if (
      (isMembershipTab && hasAccess(getAccessListQuery?.data?.users)) ||
      (!isMembershipTab && hasAccess(getAccessListQuery?.data?.teams))
    ) {
      setShowSkipBtn(false);
      setDisabledNext(false);
    } else {
      setShowSkipBtn(true);
      setDisabledNext(true);
    }
  }, [selectedTab, getAccessListQuery.data, setShowSkipBtn, setDisabledNext]);

  const roleOptions = useMemo(() => {
    return (
      roleData?.map((role) => {
        return {
          label: role.name,
          value: role.id,
        };
      }) || []
    );
  }, [roleData]);

  /**
   * Handles the deletion of a selected user or team based on the current tab.
   *
   * If the "Members" tab is selected, it deletes the user with the ID of the selected user.
   * If the "Teams" tab is selected, it deletes the team with the ID of the selected team.
   */
  const handleDelete = () => {
    if (selectedTab === "Members") {
      handleDeleteUser(selectedUser.value);
    } else {
      handleDeleteTeam(selectedTeam.value);
    }
  };

  /**
   * Opens the drawer to add a new member/team to the project
   * It resets the form fields and sets the role to 1 (admin)
   * It also sets the drawer type to "new"
   */
  const openAddNewDrawer = () => {
    if (selectedTab === "Members") {
      userForm.resetFields();
      userForm.setFieldValue(USER_ROLE.NAME, 1);
      setSelectedUser({} as USER);
      setOpen(true);
    } else if (selectedTab === "Teams") {
      setSelectedTeam({} as TEAM);
      teamForm.resetFields();
      teamForm.setFieldValue(TEAM_ROLE.NAME, 1);
      setOpen(true);
    }

    setDrawerType("new");
  };

  /**
   * Opens the drawer to edit a user
   * @param record The user object to be edited
   */
  const openEditUser = (record: GrantAccessUserFormField) => {
    userForm.resetFields();
    setSelectedUser({
      email: record.email,
      label: record.user_name,
      value: Number(record.user_id),
    });
    userForm.setFieldsValue({ ...record, user_id: record.user_id });
    setOpen(true);
    setDrawerType("edit");
  };

  /**
   * Opens the drawer to edit a team
   * @param record The team object to be edited
   */
  const openEditTeam = async (record: GrantAccessTeamFormField) => {
    teamForm.resetFields();
    teamForm.setFieldsValue(record);
    setOpen(true);
    setDrawerType("edit");
  };

  /**
   * Deletes a user by their ID in the project.
   *
   * If the operation is successful, the access list is refetched.
   * Logs errors to the console if any occur during the deletion process.
   */
  const handleDeleteUser = async (id: number) => {
    if (isLoading) return;
    try {
      setIsLoading(true);

      await deleteMemberInProjectQuery.mutateAsync(id);

      await getAccessListQuery.refetch();

      setIsOpenDeleteModal(false);
      setSelectedUser({} as USER);
    } catch (err) {
      console.error(err);
      error();
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handles the deletion of a team by id.
   *
   * If the operation is successful, the access list is refetched.
   *
   * @param {number} id - The id of the team to delete
   */
  const handleDeleteTeam = async (id: number) => {
    if (isLoading) return;
    try {
      setIsLoading(true);

      await deleteTeamInProject.mutateAsync(id);

      await getAccessListQuery.refetch();

      setIsOpenDeleteModal(false);
      setSelectedTeam({} as TEAM);
    } catch (err) {
      console.error(err);
      error();
    } finally {
      setIsLoading(false);
    }
  };

  const memberColumns: TableColumnsType<GrantAccessUserFormField> = [
    {
      title: "Name",
      dataIndex: "user_name",
      key: "user_name",
      width: "30%",
      render: (name: string) => (
        <Text text={name} type="footnote" weight="semibold" />
      ),
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "user_email",
      width: "30%",
      ellipsis: true,
      render: (name: string) => (
        <Text text={name} type="footnote" weight="semibold" />
      ),
    },
    {
      title: "Role",
      dataIndex: "role_id",
      key: "role",
      width: "30%",
      render: (name: number) => (
        <Text
          text={roleOptions?.find((role) => role.value === name)?.label}
          type="footnote"
          weight="semibold"
        />
      ),
    },
    {
      title: "Action",
      dataIndex: "action",
      key: "action",
      width: "88px",
      render: (_, record) => (
        <Flex gap={Metrics.SPACE_XS} align="center">
          <Button
            type="icon"
            icon={
              <IconViewer
                Icon={EditFilled}
                color={Colors.PRIMARY_BLUE}
                size={20}
                customClass="cursor-pointer"
              />
            }
            onClick={() => openEditUser(record)}
            disabled={
              isLoading ||
              parseInt(record?.user_id) === userDetailQuery?.data?.id
            }
          />
          <Button
            type="icon"
            icon={
              <IconViewer
                Icon={DeleteOutlined}
                color={Colors.BRIGHT_RED}
                size={20}
                customClass="cursor-pointer"
              />
            }
            onClick={() => {
              setSelectedUser({
                email: record.email,
                label: record.user_name,
                value: Number(record.id),
              });
              setIsOpenDeleteModal(true);
            }}
            disabled={
              isLoading ||
              parseInt(record?.user_id) === userDetailQuery?.data?.id
            }
          />
        </Flex>
      ),
    },
  ];

  const teamColumns: TableColumnsType<GrantAccessTeamFormField> = [
    {
      title: "Name",
      dataIndex: "team_name",
      key: "name",
      width: "30%",
      render: (name: string) => (
        <Text text={name} type="footnote" weight="semibold" />
      ),
    },
    {
      title: "Team Members",
      dataIndex: "members",
      key: "team",
      ellipsis: true,
      width: "30%",
      /**
       * Renders a `Text` component with the given name.
       *
       * @param {string} name - The name to be displayed in the `Text` component.
       * @returns {JSX.Element} A `Text` component with the specified name, styled as a footnote with semibold weight.
       */
      render: (members: MEMBER[]) => (
        <Text
          text={members
            ?.map((member) => `${member.first_name} ${member.last_name}`)
            ?.join(", ")}
          type="footnote"
          weight="semibold"
        />
      ),
    },
    {
      title: "Role",
      dataIndex: "role_id",
      key: "role",
      width: "30%",
      render: (name: number) => (
        <Text
          text={roleOptions?.find((role) => role.value === name)?.label}
          type="footnote"
          weight="semibold"
        />
      ),
    },
    {
      title: "Action",
      dataIndex: "action",
      key: "action",
      width: "88px",
      render: (_, record) => (
        <Flex gap={Metrics.SPACE_XS} align="center">
          <Button
            type="icon"
            icon={
              <IconViewer
                Icon={EditFilled}
                color={Colors.PRIMARY_BLUE}
                size={20}
                customClass="cursor-pointer"
              />
            }
            onClick={() => openEditTeam(record)}
            disabled={isLoading}
          />
          <Button
            type="icon"
            icon={
              <IconViewer
                Icon={DeleteOutlined}
                color={Colors.BRIGHT_RED}
                size={20}
                customClass="cursor-pointer"
              />
            }
            onClick={() => {
              setSelectedTeam({
                ...selectedTeam,
                value: Number(record.id),
              });
              setIsOpenDeleteModal(true);
            }}
            disabled={isLoading}
          />
        </Flex>
      ),
    },
  ];

  /**
   * Handles the form submission
   *
   * If the selected tab is "Members", it will either add a new member to the project
   * or update an existing one. If the selected tab is "Teams", it will either add a
   * new team to the project or update an existing one.
   *
   * It will also refetch the access list after the submission is successful.
   *
   * @returns {Promise<void>}
   */
  const handleSubmit = async () => {
    try {
      setIsLoading(true);

      if (selectedTab === "Members") {
        await userForm.validateFields();

        if (drawerType === "new") {
          await addMemberToProjectQuery.mutateAsync({
            project_id,
            user_id: userForm.getFieldValue(USER_NAME.NAME)?.value,
            role_id: userForm.getFieldValue(USER_ROLE.NAME),
          });
        } else if (drawerType === "edit") {
          await updateMemberInProject.mutateAsync({
            id: userForm.getFieldValue("id"),
            obj: {
              project_id,
              user_id: userForm.getFieldValue("user_id"),
              role_id: userForm.getFieldValue(USER_ROLE.NAME),
            },
          });
        }
      } else if (selectedTab === "Teams") {
        await teamForm.validateFields();

        if (drawerType === "new") {
          await addTeamToProjectQuery.mutateAsync({
            project_id,
            team_id: teamForm.getFieldValue(TEAM_ID.NAME),
            role_id: teamForm.getFieldValue(TEAM_ROLE.NAME),
          });
        } else if (drawerType === "edit") {
          await updateTeamInProject.mutateAsync({
            id: teamForm.getFieldValue("id"),
            obj: {
              project_id,
              team_id: teamForm.getFieldValue(TEAM_ID.NAME).value,
              role_id: teamForm.getFieldValue(TEAM_ROLE.NAME),
            },
          });
        }
      }

      await getAccessListQuery.refetch();
      setOpen(false);
    } catch (err) {
      console.error(err);
      error();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Flex vertical gap={Metrics.SPACE_LG}>
      {contextHolder}
      <Flex
        align="center"
        justify="start"
        className="grantAccess-tabs-container"
        gap={Metrics.SPACE_SM}
      >
        {tabs.map((tab, index) => (
          <Button
            title={tab}
            onClick={() => setSelectedTab(tab)}
            type={selectedTab === tab ? "primary" : "text"}
            size="middle"
            customClass={`${selectedTab === tab && "selected-tab-btn"} semibold`}
            key={index}
          />
        ))}
      </Flex>
      {(selectedTab === "Members" &&
        getAccessListQuery?.data?.users?.length === 0) ||
      (selectedTab === "Teams" &&
        getAccessListQuery?.data?.teams?.length === 0) ? (
        <Empty
          title={`You have not add any ${selectedTab.slice(0, selectedTab.length - 1)} yet. `}
          subtitle='Please click "Add New" button to get started.'
        >
          <Button title="Add New" onClick={openAddNewDrawer} />
        </Empty>
      ) : (
        <>
          <Flex justify="end">
            <Button title="Add New" onClick={openAddNewDrawer} />
          </Flex>
          {selectedTab === "Members" ? (
            <Table<GrantAccessUserFormField>
              columns={memberColumns}
              dataSource={getAccessListQuery?.data?.users?.sort((a, b) => {
                const isCurrentUserA =
                  parseInt(a.user_id) === userDetailQuery?.data?.id;
                const isCurrentUserB =
                  parseInt(b.user_id) === userDetailQuery?.data?.id;

                if (isCurrentUserA && isCurrentUserB) {
                  return 0;
                }

                if (isCurrentUserA) {
                  return -1;
                }

                if (isCurrentUserB) {
                  return 1;
                }

                return 0;
              })}
              pagination={false}
              className="custom-table"
              loading={getAccessListQuery?.isLoading}
            />
          ) : (
            <Table<GrantAccessTeamFormField>
              columns={teamColumns}
              dataSource={getAccessListQuery?.data?.teams}
              pagination={false}
              className="custom-table"
              loading={getAccessListQuery?.isLoading}
            />
          )}
        </>
      )}

      <Drawer
        loading={isLoading}
        disabled={
          isLoading ||
          userForm?.getFieldsError().filter(({ errors }) => errors.length)
            .length > 0 ||
          disabledSave
        }
        title={
          drawerType === "new"
            ? `Create New ${selectedTab?.slice(0, selectedTab.length - 1)}`
            : `Edit ${selectedTab?.slice(0, selectedTab.length - 1)}`
        }
        open={open}
        onClose={() => setOpen(false)}
        onSubmit={handleSubmit}
        onCancel={() => setOpen(false)}
      >
        {selectedTab === "Members" ? (
          <UserForm
            setDisabledSave={setDisabledSave}
            form={userForm}
            selectedUser={selectedUser}
            setSelectedUser={setSelectedUser}
            type={drawerType}
            roleOptions={roleOptions}
            isLoadingUserRoels={isLoadingRoles}
          />
        ) : (
          <TeamForm
            form={teamForm}
            type={drawerType}
            roleOptions={roleOptions}
            isLoadingTeamRoles={isLoadingRoles}
            setDisabledSave={setDisabledSave}
          />
        )}
      </Drawer>
      <DeleteItemModal
        isOpen={isOpenDeleteModal}
        onCancel={() => setIsOpenDeleteModal(false)}
        onDelete={handleDelete}
        loading={isLoading}
      />
    </Flex>
  );
};

export default GrantAccess;
