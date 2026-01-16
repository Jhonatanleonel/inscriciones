import { Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/Adm/Login";
import Inscritos from "./pages/Adm/Tablas/Inscritos";
import Formularion from "./pages/Inscripcion/Formularion";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} />

      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/login" element={<Login />} />
        <Route path="/inscritos" element={<Inscritos />} />
        <Route path="/formularion" element={<Formularion />} />
      </Routes>
    </>
  );
}

export default App;
