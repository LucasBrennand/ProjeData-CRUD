import type { ProductionSuggestion } from "../../../types";

interface Props {
  suggestions: ProductionSuggestion[];
}

export const ProductionInsights = ({ suggestions }: Props) => {
  return (
    <section className="w-full">
      <h3 className="text-lg font-black text-gray-700 mb-6 px-2 uppercase tracking-tighter">
        Suggested Products
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {suggestions.map((s, i) => (
          <div
            key={i}
            className="bg-white/60 backdrop-blur-md p-6 rounded-3xl shadow-lg border border-white/40 border-l-4 border-l-green-500"
          >
            <h4 className="text-gray-400 text-xs font-bold uppercase tracking-wider">
              {s.productName}
            </h4>
            <p className="text-3xl font-black text-blue-600 my-1">
              {s.quantityToProduce}{" "}
              <span className="text-sm font-normal text-gray-500">units</span>
            </p>
            <p className="text-sm text-gray-500 font-medium">
              Potential: R$ {s.totalValue.toFixed(2)}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};
