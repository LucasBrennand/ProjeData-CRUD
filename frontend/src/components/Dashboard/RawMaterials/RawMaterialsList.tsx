import api from "../../../services/api";
import type { RawMaterial } from "../../../types";

interface Props {
  materials: RawMaterial[];
  onRefresh: () => void;
  onEdit: (material: RawMaterial) => void;
}

function RawMaterialsList({ materials, onRefresh, onEdit }: Props) {
  const handleDelete = async (id: number) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this material?",
    );

    if (confirmed) {
      try {
        await api.delete(`/raw-materials/${id}`);
        onRefresh();
      } catch (error) {
        console.error("Error deleting:", error);
        alert(
          "Error deleting. Check if the material is being used in any product recipe.",
        );
      }
    }
  };

  return (
    <div className="overflow-x-auto border border-white/20 rounded-2xl shadow-inner bg-white/20 backdrop-blur-sm">
      <table className="w-full text-sm text-left min-w-[500px]">
        <thead className="bg-gray-100/50 text-gray-600 uppercase font-semibold text-xs border-b border-white/20">
          <tr>
            <th className="px-6 py-4">ID</th>
            <th className="px-6 py-4">Name</th>
            <th className="px-6 py-4">Quantity</th>
            <th className="px-6 py-4 text-center">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/10">
          {materials.map((m) => (
            <tr key={m.id} className="hover:bg-blue-50/20 transition-colors group">
              <td className="px-6 py-4 text-gray-400 font-mono text-xs">#{m.id}</td>
              <td className="px-6 py-4">
                <div className="font-medium text-gray-900">{m.name}</div>
              </td>
              <td className="px-6 py-4">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                    m.quantity < 10
                      ? "bg-red-500/10 text-red-600 border border-red-200/50"
                      : "bg-green-500/10 text-green-600 border border-green-200/50"
                  }`}
                >
                  {m.quantity} units
                </span>
              </td>
              <td className="px-6 py-4">
                <div className="flex justify-center gap-3">
                  <button
                    onClick={() => onEdit(m)}
                    className="p-2 text-blue-600 hover:bg-blue-500/10 rounded-lg transition-colors"
                    title="Edit"
                  >
                    <span className="text-lg">✎</span>
                  </button>
                  <button
                    onClick={() => m.id && handleDelete(m.id)}
                    className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <span className="text-lg">🗑</span>
                  </button>
                </div>
              </td>
            </tr>
          ))}
          {materials.length === 0 && (
            <tr>
              <td colSpan={4} className="px-6 py-12 text-center text-gray-400 italic">
                No materials found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default RawMaterialsList;
