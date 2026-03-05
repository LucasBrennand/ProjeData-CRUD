import { useEffect, useState, useCallback } from 'react';
import api from './services/api';
import type { RawMaterial, Product, ProductionSuggestion } from './types';
import { ProductDetailModal } from './components/Modals/ProductDetailModal';
import { MaterialModal } from './components/Modals/MaterialModal';
import { NewProductModal } from './components/Modals/NewProductModal';
import Header from './components/Common/Header';
import Footer from './components/Common/Footer';
import RawMaterials from './components/Dashboard/RawMaterials/RawMaterials';
import { ProductionInsights } from './components/Dashboard/Insights/ProductionInsights';
import { ProductList } from './components/Dashboard/Products/ProductList';

function App() {
  const [materials, setMaterials] = useState<RawMaterial[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [suggestions, setSuggestions] = useState<ProductionSuggestion[]>([]);
  
  const [isMatModalOpen, setIsMatModalOpen] = useState(false);
  const [isProdModalOpen, setIsProdModalOpen] = useState(false);
  const [isProdDetailOpen, setIsProdDetailOpen] = useState(false);
  
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [editingMaterial, setEditingMaterial] = useState<RawMaterial | null>(null);
  
  const [searchMaterial, setSearchMaterial] = useState('');
  const [searchProduct, setSearchProduct] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const [resMat, resProd, resSug] = await Promise.all([
        api.get<RawMaterial[]>('/raw-materials'),
        api.get<Product[]>('/products'),
        api.get<ProductionSuggestion[]>('/production/suggested')
      ]);
      setMaterials(resMat.data);
      setProducts(resProd.data);
      setSuggestions(resSug.data);
      
      if (selectedProduct) {
        const updatedProd = resProd.data.find(p => p.id === selectedProduct.id);
        if (updatedProd) setSelectedProduct(updatedProd || null);
      }
    } catch (error) {
      console.error(error);
    }
  }, [selectedProduct]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const triggerError = (msg: string) => {
    setErrorMsg(msg);
    setTimeout(() => setErrorMsg(null), 3000);
  };

  const handleSaveMaterial = async (materialData: { name: string; quantity: number }) => {
    try {
      if (editingMaterial?.id) {
        await api.put(`/raw-materials/${editingMaterial.id}`, materialData);
      } else {
        await api.post('/raw-materials', materialData);
      }
      setIsMatModalOpen(false);
      setEditingMaterial(null);
      fetchData();
    } catch (error) {
      console.error(error);
      triggerError("Failed to save material.");
    }
  };

  const handleEditMaterial = (material: RawMaterial) => {
    setEditingMaterial(material);
    setIsMatModalOpen(true);
  };

  const handleSaveProduct = async (productData: any, ingredients: any[]) => {
    try {
      const prodRes = await api.post<Product>('/products', productData);
      const createdProdId = prodRes.data.id;

      if (ingredients.length > 0) {
        await Promise.all(ingredients.map(ti => 
          api.post('/product-ingredients', {
            product: { id: createdProdId },
            rawMaterial: { id: ti.rawMaterialId },
            requiredQuantity: ti.requiredQuantity
          })
        ));
      }

      setIsProdModalOpen(false);
      fetchData();
    } catch (error) {
      console.error(error);
      triggerError("Failed to save product recipe.");
    }
  };

  const handleProduceProduct = async (product: Product) => {
    try {
      await api.post(`/production/produce/${product.id}`);
      fetchData();
    } catch (error: any) {
      console.error(error);
      const msg = error.response?.data?.message || "Production failed.";
      triggerError(msg);
    }
  };

  const handleDeleteProduct = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      await api.delete(`/products/${id}`);
      fetchData();
    } catch (error: any) {
      console.error("Erro ao deletar produto:", error);
      const msg = error.response?.data?.message || "Erro ao deletar produto.";
      triggerError(msg);
    }
  };

  const filteredMaterials = materials.filter(m => 
    m.name.toLowerCase().includes(searchMaterial.toLowerCase())
  );

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchProduct.toLowerCase())
  );

  return (
    <div className="min-h-screen flex flex-col bg-linear-to-br from-gray-50 to-blue-50/30 text-gray-900 font-sans overflow-x-hidden">
      <Header />

      {errorMsg && (
        <div className="fixed top-24 right-8 z-200 animate-in slide-in-from-right fade-in duration-300">
          <div className="bg-red-500 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 border border-red-400">
            <span className="text-xl">⚠️</span>
            <p className="font-bold text-sm tracking-tight">{errorMsg}</p>
          </div>
        </div>
      )}
      
      <main className="grow p-4 sm:p-6 lg:p-12 space-y-12 w-full max-w-7xl mx-auto">
        <ProductionInsights suggestions={suggestions} />

        <div className="w-full">
          <RawMaterials 
            materials={filteredMaterials} 
            onOpenModal={() => { setEditingMaterial(null); setIsMatModalOpen(true); }}
            onEdit={handleEditMaterial}
            onSearch={setSearchMaterial}
            onRefresh={fetchData}
          />
        </div>

        <ProductList 
          products={filteredProducts}
          searchProduct={searchProduct}
          onSearchChange={setSearchProduct}
          onNewProduct={() => setIsProdModalOpen(true)}
          onProduce={handleProduceProduct}
          onDelete={handleDeleteProduct}
          onViewRecipe={(p) => { setSelectedProduct(p); setIsProdDetailOpen(true); }}
        />
      </main>

      <NewProductModal 
        isOpen={isProdModalOpen}
        onClose={() => setIsProdModalOpen(false)}
        materials={materials}
        onSave={handleSaveProduct}
        triggerError={triggerError}
      />

      <MaterialModal 
        isOpen={isMatModalOpen}
        onClose={() => setIsMatModalOpen(false)}
        editingMaterial={editingMaterial}
        onSave={handleSaveMaterial}
      />

      <ProductDetailModal 
        isOpen={isProdDetailOpen} 
        onClose={() => setIsProdDetailOpen(false)} 
        product={selectedProduct} 
        allMaterials={materials} 
        onRefresh={fetchData} 
      />

      <Footer />
    </div>
  );
}

export default App;
