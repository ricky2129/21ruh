import { ConfirmationModal } from "components/ConfirmationModal";

interface DeleteItemModalProps {
  isOpen: boolean;
  loading: boolean;
  onCancel: () => void;
  onDelete: () => void;
}
const DeleteItemModal: React.FC<DeleteItemModalProps> = ({
  isOpen,
  loading,
  onCancel,
  onDelete,
}) => {
  return (
    <ConfirmationModal
      title="Delete"
      open={isOpen}
      loading={loading}
      onCancel={onCancel}
      onConfirm={onDelete}
      message={
        <>
          Are you sure you want to delete this item? <br />
          After deletion it cannot be retrieved
        </>
      }
      okDanger
      width={400}
    />
  );
};

export default DeleteItemModal;
