
function Header(){
    return(
        <header className="flex flex-col md:flex-row place-items-center font-tinos md:justify-around inline-screen shadow shadow-black bg-gray-700 w-dvw p-2">
            <img className="w-10" src="https://media.licdn.com/dms/image/v2/D560BAQH3v_9w5Xdc7Q/company-logo_200_200/company-logo_200_200/0/1681835764968/projedata_logo?e=2147483647&v=beta&t=aDNXjBKJrR0ILcVkXy2qoP4NfSR3d8amx_COKPTcPuM" alt="" />
            <h1 className="hidden font-bold text-white md:block">ProjeData CRUD</h1>
        </header>
    )
}

export default Header