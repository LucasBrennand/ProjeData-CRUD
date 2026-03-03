import { useState } from 'react';
import api from '../../services/api';
import type { Product, RawMaterial } from '../../types';
import { Modal } from '../Common/Modal';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  allMaterials: RawMaterial[];
  onRefresh: () => void;
}

export const ProductDetailModal = ({ isOpen, onClose, product, allMaterials, onRefresh }: Props) => {
  const [selectedMatId, setSelectedMatId] = useState<number>(0);
  const [reqQty, setReqQty] = useState<number>(0);

  const handleAddIngredient = async () => {
    if (selectedMatId === 0 || reqQty <= 0) return;
    
    await api.post('/product-ingredients', {
      product: { id: product?.id },
      rawMaterial: { id: selectedMatId },
      requiredQuantity: reqQty
    });
    
    onRefresh();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={product ? `Receita: ${product.name}` : "Novo Produto"}>
      {!product ? (
        <p>Use o formulário simplificado no Dashboard para criar.</p> 
      ) : (
        <div className="space-y-6">
          <div className="bg-gray-50 p-3 rounded-md">
            <h4 className="font-bold text-sm text-gray-600 mb-3 uppercase">Vincular Matéria-Prima</h4>
            <div className="grid grid-cols-2 gap-2">
              <select 
                className="border p-2 rounded text-sm"
                onChange={(e) => setSelectedMatId(Number(e.target.value))}
              >
                <option value="0">Selecionar...</option>
                {allMaterials.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
              <input 
                type="number" placeholder="Qtd" 
                className="border p-2 rounded text-sm"
                onChange={(e) => setReqQty(Number(e.target.value))}
              />
            </div>
            <button 
              onClick={handleAddIngredient}
              className="w-full mt-2 bg-purple-600 text-white py-2 rounded text-sm hover:bg-purple-700"
            >Adicionar à Receita</button>
          </div>

          <div>
            <h4 className="font-bold text-sm text-gray-600 mb-2 uppercase">Ingredientes Atuais</h4>
            <ul className="space-y-2">
              {product.materials?.map((m, i) => (
                <li key={i} className="flex justify-between text-sm border-b pb-1">
                  <span>{m.rawMaterial.name}</span>
                  <span className="font-bold">{m.requiredQuantity} unids</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </Modal>
  );
};