import { useEffect, useState } from "react";
import api from "./services/api";
import type { RawMaterial, Product, ProductionSuggestion } from "./types";
import { Modal } from "./components/Common/Modal";

function App() {
  const [materials, setMaterials] = useState<RawMaterial[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [suggestions, setSuggestions] = useState<ProductionSuggestion[]>([]);

  const [isMatModalOpen, setIsMatModalOpen] = useState(false);
  const [newMaterial, setNewMaterial] = useState({ name: "", quantity: 0 });

  const fetchData = async () => {
    try {
      const [resMat, resProd, resSug] = await Promise.all([
        api.get("/raw-materials"),
        api.get("/products"),
        api.get("/production/suggested"),
      ]);
      setMaterials(resMat.data);
      setProducts(resProd.data);
      setSuggestions(resSug.data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateMaterial = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.post("/raw-materials", newMaterial);
    setIsMatModalOpen(false);
    setNewMaterial({ name: "", quantity: 0 });
    fetchData();
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-8 font-sans">
      <header className="mb-10 text-center">
        <h1 className="text-4xl font-bold text-blue-900">Factory Dashboard</h1>
        <p className="text-gray-600">
          Gestão de Produção e Estoque de Cosméticos
        </p>
      </header>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4 text-gray-800">
          Sugestão de Produção
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {suggestions.map((s, i) => (
            <div
              key={i}
              className="bg-white p-6 rounded-xl shadow-md border-l-4 border-green-500"
            >
              <h4 className="text-lg font-bold text-gray-700">
                {s.productName}
              </h4>
              <p className="text-3xl font-bold text-green-600">
                {s.quantityToProduce}{" "}
                <span className="text-sm font-normal text-gray-500">unids</span>
              </p>
              <p className="mt-2 text-sm text-gray-500">
                Valor total: R$ {s.totalValue.toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-800 underline decoration-blue-500">
              Matérias-Primas
            </h2>
            <button
              onClick={() => setIsMatModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
            >
              + Novo Insumo
            </button>
          </div>
          <table className="w-full text-left">
            <thead>
              <tr className="border-b text-gray-400">
                <th className="py-2">Nome</th>
                <th className="py-2">Qtd em Estoque</th>
              </tr>
            </thead>
            <tbody>
              {materials.map((m) => (
                <tr key={m.id} className="border-b hover:bg-gray-50">
                  <td className="py-3 font-medium">{m.name}</td>
                  <td className="py-3 text-blue-600 font-bold">{m.quantity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h2 className="text-xl font-bold mb-6 text-gray-800 underline decoration-purple-500">
            Produtos
          </h2>
          <p className="text-gray-400 italic">
            Lista de produtos em desenvolvimento...
          </p>
        </div>
      </div>

      <Modal
        isOpen={isMatModalOpen}
        onClose={() => setIsMatModalOpen(false)}
        title="Novo Insumo"
      >
        <form onSubmit={handleCreateMaterial} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Nome do Material
            </label>
            <input
              type="text"
              required
              className="mt-1 block w-full border rounded-md p-2 shadow-sm"
              value={newMaterial.name}
              onChange={(e) =>
                setNewMaterial({ ...newMaterial, name: e.target.value })
              }
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Quantidade Inicial
            </label>
            <input
              type="number"
              required
              className="mt-1 block w-full border rounded-md p-2 shadow-sm"
              value={newMaterial.quantity}
              onChange={(e) =>
                setNewMaterial({
                  ...newMaterial,
                  quantity: Number(e.target.value),
                })
              }
            />
          </div>
          <button
            type="submit"
            className="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700 transition"
          >
            Salvar Insumo
          </button>
        </form>
      </Modal>
    </div>
  );
}

export default App;
