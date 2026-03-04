import api from "../../../services/api";
import type { RawMaterial } from "../../../types";

interface Props {
  materials: RawMaterial[];
  onRefresh: () => void;
}

function RawMaterialsList({ materials, onRefresh }: Props) {
  const handleDelete = async (id: number) => {
    if (window.confirm("Delete this material?")) {
      await api.delete(`/raw-materials/${id}`);
      onRefresh();
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-100 text-gray-700 uppercase text-xs">
            <th className="p-3 text-left rounded-l-md">ID</th>
            <th className="p-3 text-left">Name</th>
            <th className="p-3 text-center">Quantity</th>
            <th className="p-3 text-right rounded-r-md">Actions</th>
          </tr>
        </thead>
        <tbody className="text-sm">
          {materials.map((m) => (
            <tr key={m.id} className="border-b hover:bg-gray-50 transition">
              <td className="p-3 text-gray-500">#{m.id}</td>
              <td className="p-3 font-semibold text-gray-800">{m.name}</td>
              <td className="p-3 text-center">
                <span
                  className={`px-2 py-1 rounded-full font-bold ${m.quantity < 10 ? "bg-red-100 text-red-600" : "bg-blue-100 text-blue-600"}`}
                >
                  {m.quantity}
                </span>
              </td>
              <td className="p-3 text-right flex justify-end gap-3">
                <button className="text-amber-600 hover:text-amber-700 font-medium">
                  Edit
                </button>
                <button
                  onClick={() => m.id && handleDelete(m.id)}
                  className="text-red-600 hover:text-red-700 font-medium"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
          {materials.length === 0 && (
            <tr>
              <td colSpan={4} className="p-10 text-center text-gray-400 italic">
                No materials found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
export default RawMaterialsList;
