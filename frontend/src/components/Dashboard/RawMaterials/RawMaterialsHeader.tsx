function RawMaterialsHeader() {
  return (
    <div className="flex flex-col md:flex-row gap-4">
      <h1 className="text-3xl text-center w-full">Raw Materials</h1>
      <form
        action=""
        className="flex flex-row w-full justify-center md:justify-end gap-5"
      >
        <input
          type="text"
          className="outline-1 bg-white p-0.5"
          placeholder="Search Materials"
        />
        <button className="outline-1 outline-blue-200 rounded w-15 p-1 text-white bg-blue-500">
          + Add
        </button>
      </form>
    </div>
  );
}

export default RawMaterialsHeader;
