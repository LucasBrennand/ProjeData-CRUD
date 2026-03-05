import { useState, useEffect } from "react";
import { Modal } from "../Common/Modal";
import type { RawMaterial } from "../../types";

interface TempIngredient {
  rawMaterialId: number;
  name: string;
  requiredQuantity: number;
}

interface NewProductData {
  name: string;
  price: number;
  quantity: number;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  materials: RawMaterial[];
  onSave: (
    product: NewProductData,
    ingredients: TempIngredient[],
  ) => Promise<void>;
  triggerError: (msg: string) => void;
}

export const NewProductModal = ({
  isOpen,
  onClose,
  materials,
  onSave,
  triggerError,
}: Props) => {
  const [newProduct, setNewProduct] = useState<NewProductData>({
    name: "",
    price: 0,
    quantity: 0,
  });
  const [tempIngredients, setTempIngredients] = useState<TempIngredient[]>([]);
  const [selectedMatId, setSelectedMatId] = useState<number>(0);
  const [ingredientQty, setIngredientQty] = useState<string>("");

  useEffect(() => {
    if (isOpen) {
      setNewProduct({ name: "", price: 0, quantity: 0 });
      setTempIngredients([]);
      setSelectedMatId(0);
      setIngredientQty("");
    }
  }, [isOpen]);

  const handleAddTempIngredient = () => {
    if (selectedMatId === 0 || !ingredientQty || Number(ingredientQty) <= 0)
      return;

    const mat = materials.find((m) => m.id === selectedMatId);
    if (!mat) return;

    if (tempIngredients.some((ti) => ti.rawMaterialId === selectedMatId)) {
      triggerError("Material already in recipe!");
      return;
    }

    setTempIngredients([
      ...tempIngredients,
      {
        rawMaterialId: selectedMatId,
        name: mat.name,
        requiredQuantity: Number(ingredientQty),
      },
    ]);
    setSelectedMatId(0);
    setIngredientQty("");
  };

  const handleRemoveTempIngredient = (id: number) => {
    setTempIngredients(tempIngredients.filter((ti) => ti.rawMaterialId !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProduct.name || newProduct.price < 0) return;
    await onSave(newProduct, tempIngredients);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Product">
      <form onSubmit={handleSubmit} className="space-y-8 p-1">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-black text-gray-400 uppercase ml-1 tracking-widest">
              Product Name
            </label>
            <input
              type="text"
              placeholder="e.g. Steel Plate"
              className="w-full border border-gray-200 px-5 py-4 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 bg-white/50 shadow-sm"
              required
              value={newProduct.name}
              onChange={(e) =>
                setNewProduct({ ...newProduct, name: e.target.value })
              }
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-black text-gray-400 uppercase ml-1 tracking-widest">
              Price (R$)
            </label>
            <input
              type="number"
              step="0.01"
              className="w-full border border-gray-200 px-5 py-4 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 bg-white/50 shadow-sm"
              required
              value={newProduct.price || ""}
              onChange={(e) =>
                setNewProduct({ ...newProduct, price: Number(e.target.value) })
              }
            />
          </div>
        </div>

        <div className="bg-blue-50/50 p-6 rounded-3xl border border-blue-100">
          <h4 className="text-xs font-black text-blue-600 uppercase mb-4 tracking-widest">
            Define Recipe
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-[1fr,auto,auto] gap-3 mb-4">
            <select
              className="border border-gray-200 px-4 py-3 rounded-xl text-sm bg-white outline-none focus:ring-2 focus:ring-blue-500"
              value={selectedMatId}
              onChange={(e) => setSelectedMatId(Number(e.target.value))}
            >
              <option value="0">Select material...</option>
              {materials.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} (In stock: {m.quantity})
                </option>
              ))}
            </select>
            <input
              type="number"
              placeholder="Qty"
              className="border border-gray-200 px-4 py-3 rounded-xl text-sm bg-white w-24 outline-none focus:ring-2 focus:ring-blue-500"
              value={ingredientQty}
              onChange={(e) => setIngredientQty(e.target.value)}
            />
            <button
              type="button"
              onClick={handleAddTempIngredient}
              className="bg-blue-600 text-white px-4 py-3 rounded-xl text-xs font-bold hover:bg-blue-700 active:scale-95"
            >
              Add
            </button>
          </div>

          <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar pr-2">
            {tempIngredients.map((ti) => (
              <div
                key={ti.rawMaterialId}
                className="flex justify-between items-center bg-white p-3 rounded-xl shadow-sm border border-blue-100"
              >
                <div className="flex flex-col">
                  <span className="font-bold text-gray-700 text-sm">
                    {ti.name}
                  </span>
                  <span className="text-xs text-blue-500 font-medium">
                    {ti.requiredQuantity} units
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveTempIngredient(ti.rawMaterialId)}
                  className="text-red-400 hover:text-red-600 p-1"
                >
                  🗑
                </button>
              </div>
            ))}
            {tempIngredients.length === 0 && (
              <p className="text-center text-xs text-gray-400 py-4 italic">
                No ingredients added yet.
              </p>
            )}
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white p-5 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-blue-700 shadow-xl shadow-blue-100 active:scale-[0.98]"
        >
          Create Product with Recipe
        </button>
      </form>
    </Modal>
  );
};
