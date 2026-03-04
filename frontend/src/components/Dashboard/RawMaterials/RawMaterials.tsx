import RawMaterialsHeader from "./RawMaterialsHeader";

function RawMaterials() {
  return (
    <section className="w-[95%] mt-8 p-2 bg-mauve-100 flex flex-col gap-10 outline-1 md:justify-center rounded shadow shadow-black">
      <RawMaterialsHeader/>

      <div className="grid grid-cols-4 text-center outline-1 rounded">
        <div>
          <h2 className="bg-gray-500">ID</h2>
          <p>1</p>
        </div>
        <div>
          <h2 className="bg-gray-500">Name</h2>
          <p>Wood</p>
        </div>
        <div>
          <h2 className="bg-gray-500">Quantity</h2>
          <p>100</p>
        </div>
        <div>
          <h2 className="bg-gray-500">Actions</h2>
          <i>Edit</i>
          <i>Delete</i>
        </div>
      </div>
    </section>
  );
}

export default RawMaterials;
