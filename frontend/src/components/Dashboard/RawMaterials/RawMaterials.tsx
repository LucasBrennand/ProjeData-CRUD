import type { RawMaterial } from "../../../types";
import RawMaterialsHeader from "./RawMaterialsHeader";
import RawMaterialsList from "./RawMaterialsList";

interface Props {
  materials: RawMaterial[];
  onOpenModal: () => void;
  onEdit: (material: RawMaterial) => void;
  onSearch: (value: string) => void;
  onRefresh: () => void;
}

function RawMaterials({
  materials,
  onOpenModal,
  onEdit,
  onSearch,
  onRefresh,
}: Props) {
  return (
    <section className="w-full max-w-[95%] lg:max-w-6xl mx-auto mt-6 md:mt-10 p-4 md:p-8 bg-white/60 backdrop-blur-lg rounded-3xl shadow-2xl shadow-gray-200/50 border border-white/40 transition-all">
      <RawMaterialsHeader onOpenModal={onOpenModal} onSearch={onSearch} />
      <div className="mt-6">
        <RawMaterialsList
          materials={materials}
          onEdit={onEdit}
          onRefresh={onRefresh}
        />
      </div>
    </section>
  );
}

export default RawMaterials;
