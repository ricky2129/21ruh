import React, { useState } from 'react';
import { Button, Table, Select, Tooltip, Popconfirm, Flex, Modal } from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  CheckOutlined,
  CloseOutlined,
} from '@ant-design/icons';

import { useDeleteMemberInProject, useGetAccessList, useUpdateMemberInProject } from 'react-query/projectQueries';
import { AddMemberForm } from './AddMember';



import './projectMembers.styles.scss';


interface ProjectMembersProps {
  projectId: number;
}

const ROLE_OPTIONS = [
  { id: 1, label: 'Admin' },
  { id: 2, label: 'Developer' },
  { id: 3, label: 'Maintainer' },
  { id: 4, label: 'Viewer' },
];

const getRoleName = (role_id: number) => {
  const found = ROLE_OPTIONS.find(r => r.id === role_id);
  return found ? found.label : 'unknown';
};

export const ProjectMembers: React.FC<ProjectMembersProps> = ({ projectId }) => {
  const { data, isLoading, isError, refetch } = useGetAccessList(projectId);
  const { mutateAsync: updateMember } = useUpdateMemberInProject();
  const { mutateAsync: deleteMember } = useDeleteMemberInProject();

  const [editingUserId, setEditingUserId] = useState<number | null>(null);
  const [editedRole, setEditedRole] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [deletingUserId, setDeletingUserId] = useState<number | null>(null);

  // State for Add Members modal
  const [isAddModalOpen, setAddModalOpen] = useState(false);

  const handleEditClick = (user: any) => {
    setEditingUserId(user.user_id);
    setEditedRole(user.role_id);
  };

  const handleRoleChange = (roleId: number) => {
    setEditedRole(roleId);
  };

  const handleSave = async (user: any) => {
    setSaving(true);
    try {
      await updateMember({
        id: user.id,
        obj: {
          project_id: projectId,
          user_id: user.user_id,
          role_id: editedRole,
        },
      });
      await refetch();
      setEditingUserId(null);
      setEditedRole(null);
    } catch (err) {
      console.log(err);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditingUserId(null);
    setEditedRole(null);
  };

  const handleDelete = async (user: any) => {
    setDeletingUserId(user.user_id);
    try {
      await deleteMember(user.id);
      await refetch();
    } catch (err) {
      console.log(err);
    } finally {
      setDeletingUserId(null);
    }
  };

  const handleAddMemberSuccess = async () => {
    setAddModalOpen(false);
    await refetch();
  };

  const columns = [
    {
      title: 'User ID',
      dataIndex: 'user_id',
      key: 'user_id',
    },
    {
      title: 'Name',
      dataIndex: 'user_name',
      key: 'user_name',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Role',
      dataIndex: 'role_id',
      key: 'role_id',
      render: (_: any, user: any) =>
        editingUserId === user.user_id ? (
          <Select
            value={editedRole ?? user.role_id}
            onChange={handleRoleChange}
            style={{ minWidth: 120 }}
          >
            {ROLE_OPTIONS.map(role => (
              <Select.Option key={role.id} value={role.id}>
                {role.label}
              </Select.Option>
            ))}
          </Select>
        ) : (
          getRoleName(user.role_id)
        ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, user: any) =>
        editingUserId === user.user_id ? (
          <div style={{ display: 'flex', gap: 6 }}>
            <Tooltip title="Save">
              <Button
                icon={<CheckOutlined />}
                className="project-members__save-btn"
                onClick={() => handleSave(user)}
                loading={saving}
                size="small"
                type="primary"
              />
            </Tooltip>
            <Tooltip title="Cancel">
              <Button
                icon={<CloseOutlined />}
                className="project-members__cancel-btn"
                onClick={handleCancel}
                disabled={saving}
                size="small"
              />
            </Tooltip>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: 6 }}>
            <Tooltip title="Edit">
              <Button
                icon={<EditOutlined />}
                className="project-members__update-btn"
                onClick={() => handleEditClick(user)}
                disabled={editingUserId !== null}
                size="small"
              />
            </Tooltip>
            <Tooltip title="Delete">
              <Popconfirm
                title="Are you sure you want to remove this member?"
                onConfirm={() => handleDelete(user)}
                okText="Yes"
                cancelText="No"
                placement="topRight"
                disabled={editingUserId !== null}
              >
                <Button
                  icon={<DeleteOutlined />}
                  className="project-members__delete-btn"
                  disabled={deletingUserId === user.user_id || editingUserId !== null}
                  loading={deletingUserId === user.user_id}
                  danger
                  size="small"
                />
              </Popconfirm>
            </Tooltip>
          </div>
        ),
    },
  ];

  return (
    <div className="project-members">
      <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 className="project-members__title">Portfolio Members</h2>
        <Flex className="landing-add-members-controls" align="center">
          <Flex style={{ marginLeft: "auto" }} align="center" gap={16}>
            <Button
              size="middle"
              title="Add Members"
              type="primary"
              icon={<PlusOutlined />}
              className="add-members-btn"
              onClick={() => setAddModalOpen(true)}
            >
              Add Members
            </Button>
          </Flex>
        </Flex>
      </div>

      <Table
        className="project-members__table"
        columns={columns}
        dataSource={data?.users || []}
        rowKey="user_id"
        pagination={false}
        loading={isLoading}
        locale={{
          emptyText: <div className="project-members__empty">No members found.</div>,
        }}
        style={{ marginTop: 16 }}
      />

      {isError && (
        <div className="project-members__error">
          Error loading members.
          <Button danger size="small" onClick={() => refetch()} style={{ marginLeft: 10 }}>
            Retry
          </Button>
        </div>
      )}

      <Modal
        open={isAddModalOpen}
        onCancel={() => setAddModalOpen(false)}
        footer={null}
        title="Add Members"
        destroyOnClose
      >
        <AddMemberForm
          projectId={projectId}
          roleOptions={ROLE_OPTIONS.map(role => ({ label: role.label, value: role.id }))}
          isLoadingUserRoles={false} 
          onSuccess={handleAddMemberSuccess}
        />
      </Modal>
    </div>
  );
};
