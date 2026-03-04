import type { RawMaterial } from "../../../types";
import RawMaterialsHeader from "./RawMaterialsHeader";
import RawMaterialsList from "./RawMaterialsList";

interface Props {
  materials: RawMaterial[];
  onOpenModal: () => void;
  onRefresh: () => void;
}

function RawMaterials({ materials, onOpenModal, onRefresh }: Props) {
  return (
    <section className="w-[95%] max-w-5xl mt-8 p-6 bg-white flex flex-col gap-6 rounded-lg shadow-lg border border-gray-200">
      <RawMaterialsHeader onOpenModal={onOpenModal} />
      <RawMaterialsList materials={materials} onRefresh={onRefresh} />
    </section>
  );
}
export default RawMaterials;
