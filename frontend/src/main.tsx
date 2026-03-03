import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import App from "./App.tsx";
import Products from "./pages/Products.tsx";
import Materials from "./pages/Materials.tsx";
import Error404 from "./pages/Error404.tsx";

const router = createBrowserRouter([
  {
    children: [
      { path: "/", element: <App /> },
      { path: "/products", element: <Products /> },
      { path: "/materials", element: <Materials /> },
      { path: "*", element: <Error404 /> },
    ],
  },
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
