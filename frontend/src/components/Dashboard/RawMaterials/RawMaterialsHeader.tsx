interface Props {
  onOpenModal: () => void;
  onSearch: (value: string) => void;
}

function RawMaterialsHeader({ onOpenModal, onSearch }: Props) {
  return (
    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
      <div className="flex flex-col">
        <h2 className="text-2xl font-bold text-gray-800">Raw Materials</h2>
        <p className="text-sm text-gray-500">Inventory and availability</p>
      </div>
      <div className="flex items-center gap-3 w-full md:w-auto">
        <div className="relative grow">
          <input
            type="text"
            className="w-full border rounded-lg pl-4 pr-10 py-2 outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
            placeholder="Search materials..."
            onChange={(e) => onSearch(e.target.value)}
          />
        </div>
        <button 
          onClick={onOpenModal}
          className="bg-blue-600 text-white px-5 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-sm active:scale-95 whitespace-nowrap text-sm"
        >
          + Add Material
        </button>
      </div>
    </div>
  );
}

export default RawMaterialsHeader;
