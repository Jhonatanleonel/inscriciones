import { useState, useEffect, useCallback } from "react";
import axios from "../../api";
import { toast } from "react-toastify";
import Style from "./Formularion.module.css";

const IMGBB_API_KEY = "a224f36313d7c8d81307b1d21747b9be";
const MAX_IMAGE_SIZE = 2 * 1024 * 1024;

export default function Formulario() {
  const [iglesias, setIglesias] = useState([]);
  const [iglesiaSeleccionada, setIglesiaSeleccionada] = useState("");
  const [realizoPago, setRealizoPago] = useState(false);
  const [comprobanteFile, setComprobanteFile] = useState(null);
  const [comprobantePreview, setComprobantePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formValues, setFormValues] = useState({
    nombre: "",
    paterno: "",
    materno: "",
    genero: "",
    edad: "",
    telefono: "",
  });

  useEffect(() => {
    axios
      .get("api/iglesia/listar/")
      .then(res => setIglesias(res.data))
      .catch(() => toast.error("Error al cargar iglesias"));
  }, []);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormValues(prev => ({ ...prev, [name]: value }));
  }, []);

  const handlePagoChange = (e) => {
    const checked = e.target.checked;
    setRealizoPago(checked);

    if (!checked) {
      setFormValues(prev => ({ ...prev, telefono: "" }));
      setComprobanteFile(null);
      setComprobantePreview(null);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Solo se permiten imágenes");
      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      toast.error("Máximo 2MB");
      return;
    }

    setComprobanteFile(file);
    const reader = new FileReader();
    reader.onload = () => setComprobantePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const uploadToImgbb = async (file) => {
    const base64 = await new Promise(resolve => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result.split(",")[1]);
      reader.readAsDataURL(file);
    });

    const formData = new FormData();
    formData.append("image", base64);

    const res = await fetch(
      `https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`,
      { method: "POST", body: formData }
    );

    const data = await res.json();
    if (!data?.data?.url) throw new Error();
    return data.data.url;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (Number(formValues.edad) < 10) {
      toast.error("Edad inválida");
      return;
    }

    if (realizoPago && !formValues.telefono) {
      toast.error("Ingrese teléfono");
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        ...formValues,
        iglesia: iglesiaSeleccionada,
        pagoComprobante: null,
        pagoFecha: null,
        pagoHora: null,
      };

      if (realizoPago && comprobanteFile) {
        payload.pagoComprobante = await uploadToImgbb(comprobanteFile);
        const now = new Date();
        payload.pagoFecha = now.toISOString().split("T")[0];
        payload.pagoHora = now.toTimeString().split(" ")[0];
      }

      const response = await axios.post("api/Inscripcion/crear/", payload);

      const historial = JSON.parse(localStorage.getItem("inscripciones") || "[]");
      historial.push(response.data);
      localStorage.setItem("inscripciones", JSON.stringify(historial));

      toast.success("Inscripción registrada ✅");

      setFormValues({
        nombre: "",
        paterno: "",
        materno: "",
        genero: "",
        edad: "",
        telefono: "",
      });
      setIglesiaSeleccionada("");
      setRealizoPago(false);
      setComprobanteFile(null);
      setComprobantePreview(null);

    } catch (error) {
      toast.error(error?.response?.data?.error || "Error al enviar");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={Style.caja}>
      <div className={Style.caja2}>
        <div className={Style.container}>
          <a href="/"><button className={Style.regresar}>← Regresar</button></a>
          <h1>Inscripción</h1>
          <div className={Style.qr}>
            <p>El pago es por solo una persona, no grupales<br /><br />
              Bs. 200 Adultos <br />
              Bs. 150 Menores (5-10 años) <br />
            </p>
            <img src="imagenes/qroficial.png" alt="QR Pago" />
            <p>El pago no es obligatorio, pero ayuda a evitar filas largas el sábado por la noche.</p>
          </div>
          <form onSubmit={handleSubmit}>
            <fieldset>
              <legend>Datos personales</legend>

              <input name="nombre" placeholder="Nombre" value={formValues.nombre} onChange={handleChange} required />
              <input name="paterno" placeholder="Apellido paterno" value={formValues.paterno} onChange={handleChange} required />
              <input name="materno" placeholder="Apellido materno" value={formValues.materno} onChange={handleChange} required />

              <select name="genero" value={formValues.genero} onChange={handleChange} required>
                <option value="">Género</option>
                <option value="M">Masculino</option>
                <option value="F">Femenino</option>
              </select>

              <input type="number" name="edad" placeholder="Edad" value={formValues.edad} onChange={handleChange} required />

              <select value={iglesiaSeleccionada} onChange={(e) => setIglesiaSeleccionada(e.target.value)} required>
                <option value="">Iglesia</option>
                {iglesias.map(i => (
                  <option key={i.id} value={i.id}>{i.nombre}</option>
                ))}
              </select>
            </fieldset>

            <fieldset>
              <legend>Pago</legend>

              <div className={Style.checkbox}>
                <input type="checkbox" id="pago" checked={realizoPago} onChange={handlePagoChange} />
                <label htmlFor="pago">¿Realizó el pago?</label>
              </div>

              {realizoPago && (
                <>
                  <input type="tel" name="telefono" placeholder="Teléfono" value={formValues.telefono} onChange={handleChange} />
                  <br />
                  <div className={Style.fileWrapper}><br />
                    <input id="fileInput" type="file" accept="image/*" onChange={handleFileChange} />
                    <label htmlFor="fileInput" className={Style.fileLabel}>
                      {comprobanteFile ? "Cambiar comprobante" : "Seleccionar comprobante"}
                    </label>
                    {comprobantePreview && (
                      <img src={comprobantePreview} alt="Preview" className={Style.preview} />
                    )}
                  </div>
                </>
              )}
            </fieldset>

            <button className={Style.submitBtn} disabled={isSubmitting}>
              {isSubmitting ? "Enviando..." : "Confirmar"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
