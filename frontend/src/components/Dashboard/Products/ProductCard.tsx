import type { Product } from "../../../types";

interface Props {
  product: Product;
  onProduce: (product: Product) => void;
  onDelete: (id: number) => void;
  onViewRecipe: (product: Product) => void;
}

export const ProductCard = ({
  product,
  onProduce,
  onDelete,
  onViewRecipe,
}: Props) => {
  return (
    <div className="group border border-white/60 p-6 rounded-[2rem] flex flex-col gap-5 hover:border-blue-300 hover:shadow-2xl transition-all bg-white/40 backdrop-blur-sm relative overflow-hidden">
      <div className="absolute top-3 right-3 group-hover:opacity-100 transition-opacity z-10">
        <button
          onClick={() => product.id && onDelete(product.id)}
          className="p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl bg-white/80 border border-gray-100"
        >
          🗑
        </button>
      </div>
      <div className="space-y-1">
        <p className="font-black text-xl text-gray-800 group-hover:text-blue-700 transition-colors truncate pr-8">
          {product.name}
        </p>
        <div className="flex justify-between items-end">
          <p className="text-blue-600 font-black text-2xl tracking-tighter">
            R$ {product.price.toFixed(2)}
          </p>
          <div className="flex flex-col items-end">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
              In Stock
            </span>
            <span className="text-lg font-black text-gray-800 leading-none">
              {product.quantity}{" "}
              <span className="text-[10px] font-medium text-gray-400">
                units
              </span>
            </span>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 mt-auto pt-5 border-t border-gray-200/30">
        <button
          onClick={() => onProduce(product)}
          className="bg-blue-600 text-white px-4 py-3 rounded-2xl text-xs font-black hover:bg-blue-700 active:scale-95 uppercase tracking-widest"
        >
          Produce
        </button>
        <button
          onClick={() => onViewRecipe(product)}
          className="bg-white/90 border border-gray-200 px-4 py-3 rounded-2xl text-xs font-black text-gray-700 hover:bg-blue-600 hover:text-white active:scale-95 uppercase tracking-widest"
        >
          Recipe
        </button>
      </div>
    </div>
  );
};
