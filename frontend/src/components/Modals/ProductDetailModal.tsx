import { useState } from "react";
import api from "../../services/api";
import type { Product, RawMaterial } from "../../types";
import { Modal } from "../Common/Modal";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  allMaterials: RawMaterial[];
  onRefresh: () => void;
}

export const ProductDetailModal = ({
  isOpen,
  onClose,
  product,
  allMaterials,
  onRefresh,
}: Props) => {
  const [selectedMatId, setSelectedMatId] = useState<number>(0);
  const [reqQty, setReqQty] = useState<string>("");

  const handleAddIngredient = async () => {
    if (selectedMatId === 0 || !reqQty || Number(reqQty) <= 0) return;

    try {
      await api.post("/product-ingredients", {
        product: { id: product?.id },
        rawMaterial: { id: selectedMatId },
        requiredQuantity: Number(reqQty),
      });
      setSelectedMatId(0);
      setReqQty("");
      onRefresh();
    } catch (error) {
      console.error(error);
      alert("Error adding ingredient. Check if it's already in the recipe.");
    }
  };

  const handleRemoveIngredient = async (ingredientId: number) => {
    if (!window.confirm("Remove this ingredient?")) return;
    try {
      await api.delete(`/product-ingredients/${ingredientId}`);
      onRefresh();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={product ? `Recipe: ${product.name}` : "Product Details"}
    >
      {!product ? (
        <p className="text-gray-500 italic text-center">
          Select a product to see details.
        </p>
      ) : (
        <div className="space-y-8">
          <div className="bg-white/40 p-6 rounded-2xl border border-white/60 shadow-sm">
            <h4 className="font-black text-xs text-blue-500 mb-4 uppercase tracking-widest">
              Add Raw Material
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">
                  Material
                </label>
                <select
                  className="w-full border border-gray-200 rounded-xl p-3 text-sm bg-white/50 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  value={selectedMatId}
                  onChange={(e) => setSelectedMatId(Number(e.target.value))}
                >
                  <option value="0">Select material...</option>
                  {allMaterials.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} (Stock: {m.quantity})
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">
                  Quantity
                </label>
                <input
                  type="number"
                  placeholder="0.00"
                  className="w-full border border-gray-200 rounded-xl p-3 text-sm bg-white/50 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  value={reqQty}
                  onChange={(e) => setReqQty(e.target.value)}
                />
              </div>
            </div>
            <button
              onClick={handleAddIngredient}
              disabled={selectedMatId === 0 || !reqQty}
              className="w-full mt-6 bg-blue-500 text-white py-3 rounded-xl font-bold text-sm hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 disabled:opacity-50 disabled:shadow-none active:scale-95"
            >
              Add to Recipe
            </button>
          </div>

          {/* List Section */}
          <div>
            <div className="flex justify-between items-center mb-4 px-1">
              <h4 className="font-black text-xs text-gray-400 uppercase tracking-widest">
                Current Ingredients
              </h4>
              <span className="bg-gray-100 text-gray-500 px-2 py-0.5 rounded text-[10px] font-bold">
                {product.materials?.length || 0} ITEMS
              </span>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
              {product.materials && product.materials.length > 0 ? (
                product.materials.map((m) => (
                  <div
                    key={m.id}
                    className="flex justify-between items-center p-4 bg-white/30 rounded-xl border border-white/40 hover:bg-white/50 transition-colors group"
                  >
                    <div className="flex flex-col">
                      <span className="font-bold text-gray-700">
                        {m.rawMaterial.name}
                      </span>
                      <span className="text-xs text-blue-500 font-medium">
                        {m.requiredQuantity} units required
                      </span>
                    </div>
                    <button
                      onClick={() => m.id && handleRemoveIngredient(m.id)}
                      className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all group-hover:opacity-100"
                    >
                      🗑
                    </button>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 border-2 border-dashed border-gray-100 rounded-2xl">
                  <p className="text-sm text-gray-400">
                    No ingredients linked yet.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
};
