import Style from "./AcoplarComprobante.module.css";
import { useState, useEffect } from "react";
import axios from "../../api";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const IMGBB_API_KEY = "a224f36313d7c8d81307b1d21747b9be";
const MAX_IMAGE_SIZE = 2 * 1024 * 1024;

export default function AcoplarComprobante() {
    const navigate = useNavigate();
    const [iglesias, setIglesias] = useState([]);

    // Estado para búsqueda
    const [busqueda, setBusqueda] = useState({
        nombre: "",
        paterno: "",
        edad: "",
        iglesia: ""
    });

    // Estado para el inscrito encontrado
    const [inscritoEncontrado, setInscritoEncontrado] = useState(null);

    // Estado para el formulario de acoplar
    const [telefono, setTelefono] = useState("");
    const [comprobanteFile, setComprobanteFile] = useState(null);
    const [comprobantePreview, setComprobantePreview] = useState(null);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSearching, setIsSearching] = useState(false);

    useEffect(() => {
        axios.get("api/iglesia/listar/")
            .then(res => setIglesias(res.data))
            .catch(() => toast.error("Error al cargar iglesias"));
    }, []);

    const handleChangeBusqueda = (e) => {
        const { name, value } = e.target;
        setBusqueda(prev => ({ ...prev, [name]: value }));
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        setIsSearching(true);
        setInscritoEncontrado(null);

        try {
            const response = await axios.get("api/Inscripcion/buscar/", {
                params: {
                    ...busqueda
                },
            });

            if (response.data) {
                setInscritoEncontrado(response.data);
                toast.success("Inscrito encontrado");
            } else {
                toast.info("No se encontró ninguna inscripción con esos datos.");
            }
        } catch (error) {
            toast.error("Error al buscar inscripción.");
            console.error(error);
        } finally {
            setIsSearching(false);
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

    const handleAcoplar = async (e) => {
        e.preventDefault();
        if (!inscritoEncontrado) return;
        if (!comprobanteFile) {
            toast.error("Debe subir un comprobante");
            return;
        }

        setIsSubmitting(true);

        try {
            const comprobanteUrl = await uploadToImgbb(comprobanteFile);

            await axios.post("api/Inscripcion/acoplar/", {
                id: inscritoEncontrado.id,
                pagoTelefono: telefono,
                pagoComprobante: comprobanteUrl
            });

            toast.success("Comprobante acoplado exitosamente ✅");

            // Limpiar todo
            setInscritoEncontrado(null);
            setBusqueda({ nombre: "", paterno: "", edad: "", iglesia: "" });
            setTelefono("");
            setComprobanteFile(null);
            setComprobantePreview(null);
            navigate("/");

        } catch (error) {
            toast.error("Error al acoplar el comprobante");
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className={Style.caja}>
            <div className={Style.caja2}>
                <div className={Style.container}>
                    <button className={Style.regresar} onClick={() => navigate("/")}>← Regresar</button>
                    <h1>Acoplar Comprobante</h1>

                    {!inscritoEncontrado ? (
                        <form onSubmit={handleSearch}>
                            <fieldset>
                                <legend>Buscar Inscripción</legend>
                                <input
                                    name="nombre"
                                    placeholder="Nombre"
                                    value={busqueda.nombre}
                                    onChange={handleChangeBusqueda}
                                    required
                                />
                                <input
                                    name="paterno"
                                    placeholder="Apellido Paterno"
                                    value={busqueda.paterno}
                                    onChange={handleChangeBusqueda}
                                    required
                                />
                                <input
                                    type="number"
                                    name="edad"
                                    placeholder="Edad"
                                    value={busqueda.edad}
                                    onChange={handleChangeBusqueda}
                                    required
                                />
                                <select
                                    name="iglesia"
                                    value={busqueda.iglesia}
                                    onChange={handleChangeBusqueda}
                                    required
                                >
                                    <option value="">Seleccione Iglesia</option>
                                    {iglesias.map(i => (
                                        <option key={i.id} value={i.id}>{i.nombre}</option>
                                    ))}
                                </select>
                                <button className={Style.submitBtn} disabled={isSearching}>
                                    {isSearching ? "Buscando..." : "Buscar"}
                                </button>
                            </fieldset>
                        </form>
                    ) : (
                        <form onSubmit={handleAcoplar}>
                            <fieldset>
                                <legend>Datos Encontrados</legend>
                                <div className={Style.info}>
                                    <p><strong>Nombre:</strong> <span>{inscritoEncontrado.nombre}</span></p>
                                    <p><strong>Apellido Paterno:</strong> <span>{inscritoEncontrado.paterno}</span></p>
                                    <p><strong>Apellido Materno:</strong> <span>{inscritoEncontrado.materno || "-"}</span></p>
                                    <p><strong>Edad:</strong> <span>{inscritoEncontrado.edad}</span></p>
                                    <p><strong>Iglesia:</strong> <span>{inscritoEncontrado.iglesia}</span></p>
                                    <p> <strong>Comprobante:</strong></p>
                                    {inscritoEncontrado.pagoComprobante ? (
                                        <img src={inscritoEncontrado.pagoComprobante} alt="Comprobante" className={Style.preview} />
                                    ) : (
                                        <span>No hay comprobante</span>
                                    )}
                                </div>
                            </fieldset>

                            <fieldset>
                                <legend>Acoplar Pago</legend>
                                <input
                                    type="tel"
                                    placeholder="Teléfono de contacto"
                                    value={telefono}
                                    onChange={(e) => setTelefono(e.target.value)}
                                    required
                                />

                                <div className={Style.fileWrapper}>
                                    <input
                                        id="fileInput"
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                        required
                                    />
                                    <label htmlFor="fileInput" className={Style.fileLabel}>
                                        {comprobanteFile ? "Cambiar comprobante" : "Seleccionar comprobante"}
                                    </label>
                                    {comprobantePreview && (
                                        <img src={comprobantePreview} alt="Preview" className={Style.preview} />
                                    )}
                                </div>


                            </fieldset>
                            <button className={Style.submitBtn} disabled={isSubmitting}>
                                {isSubmitting ? "Enviando..." : "Guardar Cambios"}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}