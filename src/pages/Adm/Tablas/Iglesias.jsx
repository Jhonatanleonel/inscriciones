import { useEffect, useState } from "react";
import Axios from "./../../../api";
import { toast } from "react-toastify";
import Style from "./Iglesias.module.css";
import Cabeza from "../../../componentes/Cabeza";
export default function Iglesias() {
    const [iglesias, setIglesias] = useState([]);
    const [nombre, setNombre] = useState("");
    const [editandoId, setEditandoId] = useState(null);
    const [loading, setLoading] = useState(false);

    // 🔹 Cargar iglesias
    const cargarIglesias = async () => {
        try {
            const res = await Axios.get("api/iglesia/listar/");
            setIglesias(res.data);
        } catch (error) {
            toast.error("Error al cargar lista");
        }
    };

    useEffect(() => {
        cargarIglesias();
    }, []);

    // 🔹 Crear o actualizar
    const guardarIglesia = async () => {
        if (!nombre.trim()) return toast.warning("Escribe un nombre");

        setLoading(true);
        try {
            if (editandoId) {
                await Axios.put(`api/iglesia/actualizar/${editandoId}/`, { nombre });
                toast.success("Iglesia actualizada ✅");
                setEditandoId(null);
            } else {
                await Axios.post("api/iglesia/crear/", { nombre });
                toast.success("Iglesia creada ✅");
            }
            setNombre("");
            cargarIglesias();
        } catch (error) {
            toast.error("Error al guardar");
        } finally {
            setLoading(false);
        }
    };

    // 🔹 Eliminar
    const eliminarIglesia = async (id) => {
        if (!window.confirm("¿Seguro que deseas eliminar esta iglesia?")) return;

        try {
            await Axios.delete(`api/iglesia/eliminar/${id}/`);
            toast.success("Eliminado correctamente 🗑️");
            cargarIglesias();
        } catch (error) {
            toast.error("No se pudo eliminar");
        }
    };

    // 🔹 Preparar edición
    const editarIglesia = (iglesia) => {
        setNombre(iglesia.nombre);
        setEditandoId(iglesia.id);
        // Scroll suave hacia arriba para ver el form
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const cancelarEdicion = () => {
        setEditandoId(null);
        setNombre("");
    };

    return (
        <div className={Style.container}>
            <Cabeza />
            <h1 className={Style.title}>Gestión de Iglesias</h1>

            {/* CARD FORMULARIO */}
            <div className={Style.formCard}>
                <input
                    className={Style.input}
                    type="text"
                    placeholder="Nombre de la iglesia..."
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && guardarIglesia()}
                />
                <button
                    className={Style.buttonSave}
                    onClick={guardarIglesia}
                    disabled={loading}
                >
                    {loading ? "..." : (editandoId ? "Actualizar" : "Agregar")}
                </button>

                {editandoId && (
                    <button className={Style.buttonCancel} onClick={cancelarEdicion}>
                        Cancelar
                    </button>
                )}
            </div>

            {/* LISTA */}
            <div className={Style.tableWrapper}>
                <table className={Style.table}>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Nombre</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {iglesias.length === 0 ? (
                            <tr>
                                <td colSpan="3" style={{ padding: '2rem' }}>No hay iglesias registradas</td>
                            </tr>
                        ) : (
                            iglesias.map((iglesia) => (
                                <tr key={iglesia.id}>
                                    <td>{iglesia.id}</td>
                                    <td><strong>{iglesia.nombre}</strong></td>
                                    <td className={Style.actions}>
                                        <button
                                            className={Style.actionButton}
                                            title="Editar"
                                            onClick={() => editarIglesia(iglesia)}
                                        >
                                            Editar
                                        </button>
                                        <button
                                            className={Style.actionButtonDelete}
                                            title="Eliminar"
                                            onClick={() => eliminarIglesia(iglesia.id)}
                                        >
                                            Eliminar
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
