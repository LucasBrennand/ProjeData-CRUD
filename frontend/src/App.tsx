import { useEffect, useState, useCallback } from "react";
import api from "./services/api";
import type { RawMaterial, Product, ProductionSuggestion } from "./types";
import { Modal } from "./components/Common/Modal";
import { ProductDetailModal } from "./components/Modals/ProductDetailModal";
import Header from "./components/Common/Header";
import Footer from "./components/Common/Footer";
import RawMaterials from "./components/Dashboard/RawMaterials/RawMaterials";

function App() {
  const [materials, setMaterials] = useState<RawMaterial[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [suggestions, setSuggestions] = useState<ProductionSuggestion[]>([]);
  const [isMatModalOpen, setIsMatModalOpen] = useState(false);
  const [isProdDetailOpen, setIsProdDetailOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [newMaterial, setNewMaterial] = useState({ name: "", quantity: 0 });
  const [newProduct, setNewProduct] = useState({ name: "", price: 0 });

  const fetchData = useCallback(async () => {
    try {
      const [resMat, resProd, resSug] = await Promise.all([
        api.get<RawMaterial[]>("/raw-materials"),
        api.get<Product[]>("/products"),
        api.get<ProductionSuggestion[]>("/production/suggested"),
      ]);
      setMaterials(resMat.data);
      setProducts(resProd.data);
      setSuggestions(resSug.data);

      if (selectedProduct) {
        const updatedProd = resProd.data.find(
          (p) => p.id === selectedProduct.id,
        );
        if (updatedProd) setSelectedProduct(updatedProd);
      }
    } catch (error) {
      console.error("Erro na comunicação com a API:", error);
    }
  }, [selectedProduct]);

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateMaterial = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.post("/raw-materials", newMaterial);
    setIsMatModalOpen(false);
    setNewMaterial({ name: "", quantity: 0 });
    fetchData();
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.post("/products", newProduct);
    setNewProduct({ name: "", price: 0 });
    fetchData();
  };

  return (
    <>
      <Header />
      <main className="place-items-center p-1 outline-1 outline-black">
        <RawMaterials
          materials={materials}
          onOpenModal={() => setIsMatModalOpen(true)}
          onRefresh={fetchData}
        />
      </main>

      <Modal
        isOpen={isMatModalOpen}
        onClose={() => setIsMatModalOpen(false)}
        title="Add Raw Material"
      >
        <form onSubmit={handleCreateMaterial} className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Material Name"
            className="border p-2 rounded"
            value={newMaterial.name}
            onChange={(e) =>
              setNewMaterial({ ...newMaterial, name: e.target.value })
            }
          />
          <input
            type="number"
            placeholder="Quantity"
            className="border p-2 rounded"
            value={newMaterial.quantity}
            onChange={(e) =>
              setNewMaterial({
                ...newMaterial,
                quantity: Number(e.target.value),
              })
            }
          />
          <button type="submit" className="bg-blue-500 text-white p-2 rounded">
            Save
          </button>
        </form>
      </Modal>
      <Footer />
    </>
  );
}

export default App;
