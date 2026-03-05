import { useEffect, useState, useCallback } from 'react';
import api from './services/api';
import type { RawMaterial, Product, ProductionSuggestion } from './types';
import { Modal } from './components/Common/Modal';
import { ProductDetailModal } from './components/Modals/ProductDetailModal';
import Header from './components/Common/Header';
import Footer from './components/Common/Footer';
import RawMaterials from './components/Dashboard/RawMaterials/RawMaterials';

interface TempIngredient {
  rawMaterialId: number;
  name: string;
  requiredQuantity: number;
}

function App() {
  const [materials, setMaterials] = useState<RawMaterial[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [suggestions, setSuggestions] = useState<ProductionSuggestion[]>([]);
  
  const [isMatModalOpen, setIsMatModalOpen] = useState(false);
  const [isProdModalOpen, setIsProdModalOpen] = useState(false);
  const [isProdDetailOpen, setIsProdDetailOpen] = useState(false);
  
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [editingMaterial, setEditingMaterial] = useState<RawMaterial | null>(null);
  
  const [newMaterial, setNewMaterial] = useState({ name: '', quantity: 0 });
  const [newProduct, setNewProduct] = useState({ name: '', price: 0, quantity: 0 });
  
  const [tempIngredients, setTempIngredients] = useState<TempIngredient[]>([]);
  const [selectedMatId, setSelectedMatId] = useState<number>(0);
  const [ingredientQty, setIngredientQty] = useState<string>('');

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

  const handleSaveMaterial = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingMaterial?.id) {
        await api.put(`/raw-materials/${editingMaterial.id}`, newMaterial);
      } else {
        await api.post('/raw-materials', newMaterial);
      }
      setIsMatModalOpen(false);
      setEditingMaterial(null);
      setNewMaterial({ name: '', quantity: 0 });
      fetchData();
    } catch (error) {
      console.error(error);
    }
  };

  const handleEditMaterial = (material: RawMaterial) => {
    setEditingMaterial(material);
    setNewMaterial({ name: material.name, quantity: material.quantity });
    setIsMatModalOpen(true);
  };

  const handleAddTempIngredient = () => {
    if (selectedMatId === 0 || !ingredientQty || Number(ingredientQty) <= 0) return;
    
    const mat = materials.find(m => m.id === selectedMatId);
    if (!mat) return;

    if (tempIngredients.some(ti => ti.rawMaterialId === selectedMatId)) {
        triggerError("Material already in recipe!");
        return;
    }

    setTempIngredients([...tempIngredients, {
      rawMaterialId: selectedMatId,
      name: mat.name,
      requiredQuantity: Number(ingredientQty)
    }]);
    setSelectedMatId(0);
    setIngredientQty('');
  };

  const handleRemoveTempIngredient = (id: number) => {
    setTempIngredients(tempIngredients.filter(ti => ti.rawMaterialId !== id));
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProduct.name || newProduct.price < 0) return;
    
    try {
      const prodRes = await api.post<Product>('/products', newProduct);
      const createdProdId = prodRes.data.id;

      if (tempIngredients.length > 0) {
        await Promise.all(tempIngredients.map(ti => 
          api.post('/product-ingredients', {
            product: { id: createdProdId },
            rawMaterial: { id: ti.rawMaterialId },
            requiredQuantity: ti.requiredQuantity
          })
        ));
      }

      setNewProduct({ name: '', price: 0, quantity: 0 });
      setTempIngredients([]);
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
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-blue-50/30 text-gray-900 font-sans overflow-x-hidden">
      <Header />

      {errorMsg && (
        <div className="fixed top-24 right-8 z-[200] animate-in slide-in-from-right fade-in duration-300">
          <div className="bg-red-500 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 border border-red-400">
            <span className="text-xl">⚠️</span>
            <p className="font-bold text-sm tracking-tight">{errorMsg}</p>
          </div>
        </div>
      )}
      
      <main className="flex-grow p-4 sm:p-6 lg:p-12 space-y-12 w-full max-w-7xl mx-auto">
        <section className="w-full">
          <h3 className="text-lg font-black text-gray-700 mb-6 px-2 uppercase tracking-tighter">Production Insights</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {suggestions.map((s, i) => (
              <div key={i} className="bg-white/60 backdrop-blur-md p-6 rounded-3xl shadow-lg border border-white/40 border-l-4 border-l-green-500">
                <h4 className="text-gray-400 text-xs font-bold uppercase tracking-wider">{s.productName}</h4>
                <p className="text-3xl font-black text-blue-600 my-1">{s.quantityToProduce} <span className="text-sm font-normal text-gray-500">units</span></p>
                <p className="text-sm text-gray-500 font-medium">Potential: R$ {s.totalValue.toFixed(2)}</p>
              </div>
            ))}
          </div>
        </section>

        <div className="w-full">
          <RawMaterials 
            materials={filteredMaterials} 
            onOpenModal={() => { setEditingMaterial(null); setNewMaterial({name: '', quantity: 0}); setIsMatModalOpen(true); }}
            onEdit={handleEditMaterial}
            onSearch={setSearchMaterial}
            onRefresh={fetchData}
          />
        </div>

        <section className="w-full p-5 sm:p-8 lg:p-10 bg-white/60 backdrop-blur-lg rounded-[2.5rem] shadow-2xl shadow-gray-200/50 border border-white/40">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-8">
            <div className="flex flex-col space-y-1">
              <h2 className="text-3xl sm:text-4xl font-black text-gray-800 tracking-tighter">Products Catalogue</h2>
              <p className="text-sm sm:text-base text-gray-500 font-medium">Manage your finished goods and recipes</p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
              <input 
                type="text" placeholder="Search products..." 
                className="w-full border border-gray-200/60 rounded-2xl px-5 py-3 text-sm bg-white/50 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none"
                value={searchProduct} onChange={e => setSearchProduct(e.target.value)}
              />
              <button 
                onClick={() => { setNewProduct({name: '', price: 0, quantity: 0}); setTempIngredients([]); setIsProdModalOpen(true); }}
                className="bg-blue-600 text-white px-8 py-3 rounded-2xl text-sm font-black uppercase tracking-widest hover:bg-blue-700 active:scale-95 whitespace-nowrap"
              >
                + New Product
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
            {filteredProducts.map(p => (
              <div key={p.id} className="group border border-white/60 p-6 rounded-[2rem] flex flex-col gap-5 hover:border-blue-300 hover:shadow-2xl transition-all bg-white/40 backdrop-blur-sm relative overflow-hidden">
                <div className="absolute top-3 right-3 group-hover:opacity-100 transition-opacity z-10">
                   <button onClick={() => p.id && handleDeleteProduct(p.id)} className="p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl bg-white/80 border border-gray-100">🗑</button>
                </div>
                <div className="space-y-1">
                  <p className="font-black text-xl text-gray-800 group-hover:text-blue-700 transition-colors truncate pr-8">{p.name}</p>
                  <div className="flex justify-between items-end">
                    <p className="text-blue-600 font-black text-2xl tracking-tighter">R$ {p.price.toFixed(2)}</p>
                    <div className="flex flex-col items-end">
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">In Stock</span>
                      <span className="text-lg font-black text-gray-800 leading-none">{p.quantity} <span className="text-[10px] font-medium text-gray-400">units</span></span>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 mt-auto pt-5 border-t border-gray-200/30">
                   <button onClick={() => handleProduceProduct(p)} className="bg-blue-600 text-white px-4 py-3 rounded-2xl text-xs font-black hover:bg-blue-700 active:scale-95 uppercase tracking-widest">Produce</button>
                   <button onClick={() => { setSelectedProduct(p); setIsProdDetailOpen(true); }} className="bg-white/90 border border-gray-200 px-4 py-3 rounded-2xl text-xs font-black text-gray-700 hover:bg-blue-600 hover:text-white active:scale-95 uppercase tracking-widest">Recipe</button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* New Product Modal with Recipe */}
      <Modal isOpen={isProdModalOpen} onClose={() => setIsProdModalOpen(false)} title="Create New Product">
        <form onSubmit={handleSaveProduct} className="space-y-8 p-1">
          {/* Basic Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-black text-gray-400 uppercase ml-1 tracking-widest">Product Name</label>
              <input 
                type="text" placeholder="e.g. Steel Plate" className="w-full border border-gray-200 px-5 py-4 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 bg-white/50 shadow-sm" required
                value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-black text-gray-400 uppercase ml-1 tracking-widest">Price (R$)</label>
              <input 
                type="number" step="0.01" className="w-full border border-gray-200 px-5 py-4 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 bg-white/50 shadow-sm" required
                value={newProduct.price || ''} onChange={e => setNewProduct({...newProduct, price: Number(e.target.value)})}
              />
            </div>
          </div>

          {/* Recipe Section */}
          <div className="bg-blue-50/50 p-6 rounded-3xl border border-blue-100">
            <h4 className="text-xs font-black text-blue-600 uppercase mb-4 tracking-widest">Define Recipe</h4>
            <div className="grid grid-cols-1 sm:grid-cols-[1fr,auto,auto] gap-3 mb-4">
              <select 
                className="border border-gray-200 px-4 py-3 rounded-xl text-sm bg-white outline-none focus:ring-2 focus:ring-blue-500"
                value={selectedMatId} onChange={(e) => setSelectedMatId(Number(e.target.value))}
              >
                <option value="0">Select material...</option>
                {materials.map(m => <option key={m.id} value={m.id}>{m.name} (In stock: {m.quantity})</option>)}
              </select>
              <input 
                type="number" placeholder="Qty" className="border border-gray-200 px-4 py-3 rounded-xl text-sm bg-white w-24 outline-none focus:ring-2 focus:ring-blue-500"
                value={ingredientQty} onChange={(e) => setIngredientQty(e.target.value)}
              />
              <button 
                type="button" onClick={handleAddTempIngredient}
                className="bg-blue-600 text-white px-4 py-3 rounded-xl text-xs font-bold hover:bg-blue-700 active:scale-95"
              >Add</button>
            </div>

            {/* Temp Ingredients List */}
            <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar pr-2">
              {tempIngredients.map(ti => (
                <div key={ti.rawMaterialId} className="flex justify-between items-center bg-white p-3 rounded-xl shadow-sm border border-blue-100">
                  <div className="flex flex-col">
                    <span className="font-bold text-gray-700 text-sm">{ti.name}</span>
                    <span className="text-xs text-blue-500 font-medium">{ti.requiredQuantity} units</span>
                  </div>
                  <button type="button" onClick={() => handleRemoveTempIngredient(ti.rawMaterialId)} className="text-red-400 hover:text-red-600 p-1">🗑</button>
                </div>
              ))}
              {tempIngredients.length === 0 && <p className="text-center text-xs text-gray-400 py-4 italic">No ingredients added yet.</p>}
            </div>
          </div>

          <button type="submit" className="w-full bg-blue-600 text-white p-5 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-blue-700 shadow-xl shadow-blue-100 active:scale-[0.98]">
            Create Product with Recipe
          </button>
        </form>
      </Modal>

      <Modal isOpen={isMatModalOpen} onClose={() => setIsMatModalOpen(false)} title={editingMaterial ? "Edit Material" : "Add Material"}>
        <form onSubmit={handleSaveMaterial} className="flex flex-col gap-6 p-1">
          <input type="text" placeholder="Material Name" className="w-full border p-4 rounded-2xl bg-white/50" required value={newMaterial.name} onChange={e => setNewMaterial({...newMaterial, name: e.target.value})} />
          <input type="number" placeholder="Stock" className="w-full border p-4 rounded-2xl bg-white/50" required value={newMaterial.quantity || ''} onChange={e => setNewMaterial({...newMaterial, quantity: Number(e.target.value)})} />
          <button type="submit" className="bg-blue-600 text-white p-5 rounded-2xl font-black uppercase tracking-widest hover:bg-blue-700">Save Material</button>
        </form>
      </Modal>

      <ProductDetailModal isOpen={isProdDetailOpen} onClose={() => setIsProdDetailOpen(false)} product={selectedProduct} allMaterials={materials} onRefresh={fetchData} />
      <Footer />
    </div>
  );
}

export default App;
