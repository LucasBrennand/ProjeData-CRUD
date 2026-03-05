import { useState, useEffect } from "react";
import { Modal } from "../Common/Modal";
import type { RawMaterial } from "../../types";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (material: { name: string; quantity: number }) => Promise<void>;
  editingMaterial: RawMaterial | null;
}

export const MaterialModal = ({
  isOpen,
  onClose,
  onSave,
  editingMaterial,
}: Props) => {
  const [newMaterial, setNewMaterial] = useState({ name: "", quantity: 0 });

  useEffect(() => {
    if (editingMaterial) {
      setNewMaterial({
        name: editingMaterial.name,
        quantity: editingMaterial.quantity,
      });
    } else {
      setNewMaterial({ name: "", quantity: 0 });
    }
  }, [editingMaterial, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave(newMaterial);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingMaterial ? "Edit Material" : "Add Material"}
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-6 p-1">
        <input
          type="text"
          placeholder="Material Name"
          className="w-full border p-4 rounded-2xl bg-white/50"
          required
          value={newMaterial.name}
          onChange={(e) =>
            setNewMaterial({ ...newMaterial, name: e.target.value })
          }
        />
        <input
          type="number"
          placeholder="Stock"
          className="w-full border p-4 rounded-2xl bg-white/50"
          required
          value={newMaterial.quantity || ""}
          onChange={(e) =>
            setNewMaterial({ ...newMaterial, quantity: Number(e.target.value) })
          }
        />
        <button
          type="submit"
          className="bg-blue-600 text-white p-5 rounded-2xl font-black uppercase tracking-widest hover:bg-blue-700"
        >
          Save Material
        </button>
      </form>
    </Modal>
  );
};
