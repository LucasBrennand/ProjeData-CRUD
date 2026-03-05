function Header() {
  return (
    <header className="flex flex-col md:flex-row items-center font-tinos justify-between md:justify-around bg-gray-700 w-full p-4 shadow-md z-10">
      <div className="flex items-center gap-4">
        <img
          className="w-10 rounded-full bg-white p-1"
          src="https://media.licdn.com/dms/image/v2/D560BAQH3v_9w5Xdc7Q/company-logo_200_200/company-logo_200_200/0/1681835764968/projedata_logo?e=2147483647&v=beta&t=aDNXjBKJrR0ILcVkXy2qoP4NfSR3d8amx_COKPTcPuM"
          alt="Projedata Logo"
        />
        <h1 className="font-bold text-white text-xl md:text-2xl">
          ProjeData CRUD
        </h1>
      </div>
    </header>
  );
}

export default Header;
