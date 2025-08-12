import React from "react";

import { Modal } from "antd";

import "./confirmationModal.styles.scss";

interface ConfirmationModalProps {
  message: string | React.ReactNode;
  open: boolean;
  title: string | React.ReactNode;
  loading?: boolean;
  disabled?: boolean;
  okText?: string | React.ReactNode;
  cancelText?: string | React.ReactNode;
  width?: string | number;
  customClass?: string;
  centered?: boolean;
  okDanger?: boolean;
  onConfirm?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  onCancel?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  actionRender?: () => React.ReactNode;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  title,
  open,
  message = "",
  loading = false,
  onCancel = () => {},
  onConfirm = () => {},
  actionRender,
  okText = "Ok",
  cancelText = "Cancel",
  width = 500,
  customClass = "",
  okDanger = false,
  centered = false,
}) => {
  return (
    <Modal
      title={title}
      open={open}
      onCancel={onCancel}
      onOk={onConfirm}
      okText={okText}
      cancelText={cancelText}
      centered={centered}
      footer={(originalNode) =>
        typeof actionRender === "function" ? actionRender() : originalNode
      }
      okButtonProps={{ loading: loading, disabled: loading, danger: okDanger }}
      className={`${customClass} confirmation-box-modal`}
      width={width}
    >
      {message}
    </Modal>
  );
};

export default ConfirmationModal;
