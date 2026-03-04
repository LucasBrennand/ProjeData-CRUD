interface Props {
  onOpenModal: () => void;
}

function RawMaterialsHeader({ onOpenModal }: Props) {
  return (
    <div className="flex flex-col md:flex-row justify-between items-center gap-4 border-b pb-4">
      <h1 className="text-2xl font-bold text-gray-800">Raw Materials Inventory</h1>
      <div className="flex flex-row w-full md:w-auto gap-3">
        <input
          type="text"
          className="border border-gray-300 rounded-md px-3 py-1.5 focus:ring-2 focus:ring-blue-500 outline-none grow"
          placeholder="Search materials..."
        />
        <button 
          onClick={onOpenModal}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-1.5 rounded-md transition shadow-sm"
        >
          + Add
        </button>
      </div>
    </div>
  );
}
export default RawMaterialsHeader;