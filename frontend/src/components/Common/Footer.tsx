import type { ReactNode } from "react";

const date = new Date();
const currentYear = date.getFullYear();

function Footer() {
  return (
    <footer className="w-dvw bg-gray-700 absolute bottom-0 place-items-center text-white shadow shadow-black">
      <p>Made by Lucas Brennand &copy; {currentYear}</p>
    </footer>
  );
}

export default Footer;
