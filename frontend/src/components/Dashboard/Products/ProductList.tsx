import type { Product } from "../../../types";
import { ProductCard } from "./ProductCard";

interface Props {
  products: Product[];
  searchProduct: string;
  onSearchChange: (value: string) => void;
  onNewProduct: () => void;
  onProduce: (product: Product) => void;
  onDelete: (id: number) => void;
  onViewRecipe: (product: Product) => void;
}

export const ProductList = ({
  products,
  searchProduct,
  onSearchChange,
  onNewProduct,
  onProduce,
  onDelete,
  onViewRecipe,
}: Props) => {
  return (
    <section className="w-full p-5 sm:p-8 lg:p-10 bg-white/60 backdrop-blur-lg rounded-[2.5rem] shadow-2xl shadow-gray-200/50 border border-white/40">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-8">
        <div className="flex flex-col space-y-1">
          <h2 className="text-3xl sm:text-4xl font-black text-gray-800 tracking-tighter">
            Products
          </h2>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <input
            type="text"
            placeholder="Search products..."
            className="w-full border border-gray-200/60 rounded-2xl px-5 py-3 text-sm bg-white/50 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none"
            value={searchProduct}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          <button
            onClick={onNewProduct}
            className="bg-blue-600 text-white px-8 py-3 rounded-2xl text-sm font-black uppercase tracking-widest hover:bg-blue-700 active:scale-95 whitespace-nowrap"
          >
            + New Product
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
        {products.map((p) => (
          <ProductCard
            key={p.id}
            product={p}
            onProduce={onProduce}
            onDelete={onDelete}
            onViewRecipe={onViewRecipe}
          />
        ))}
      </div>
    </section>
  );
};
