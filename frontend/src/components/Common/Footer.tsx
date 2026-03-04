
const date = new Date();
const currentYear = date.getFullYear();

function Footer() {
  return (
    <footer className="w-full bg-gray-700 py-4 text-center text-white shadow shadow-black">
      <p>Made by Lucas Brennand &copy; {currentYear}</p>
    </footer>
  );
}

export default Footer;
