import { useEffect, useState } from "react";
import axios from "../../api";
import Style from "./Reporte.module.css";
import Cabeza from "../../componentes/Cabeza";
export default function Reporte() {
    const [reporte, setReporte] = useState(null);

    useEffect(() => {
        axios.get("api/reporte/general/").then((res) => {
            setReporte(res.data);
        });
    }, []);

    if (!reporte) return <h2 className={Style.loading}>Cargando reporte...</h2>;

    const totalGenero = reporte.totales.mujeres + reporte.totales.hombres;
    const porcentajeMujeres = ((reporte.totales.mujeres / totalGenero) * 100).toFixed(1);
    const porcentajeHombres = ((reporte.totales.hombres / totalGenero) * 100).toFixed(1);

    const maxIglesia = Math.max(...reporte.iglesias.map(i => i.total));
    const maxEdad = Math.max(...reporte.edades.map(e => e.total));

    return (
        <div className={Style.container}>
            <Cabeza /><br />
            <h1 className={Style.title}>📊 Reporte General</h1>

            {/* ===== RESUMEN ===== */}
            <div className={Style.cards}>
                <div className={Style.card}>👥 {reporte.totales.inscritos}<span>Total</span></div>
                <div className={Style.card}>👩 {reporte.totales.mujeres}<span>Mujeres</span></div>
                <div className={Style.card}>👨 {reporte.totales.hombres}<span>Hombres</span></div>
            </div>

            {/* ===== GÉNERO ===== */}
            <div className={Style.section}>
                <h2>Distribución por Género</h2>

                <div className={Style.barRow}>
                    <span>Mujeres</span>
                    <div className={Style.barTrack}>
                        <div
                            className={`${Style.bar} ${Style.barMujeres}`}
                            style={{ "--w": `${porcentajeMujeres}%` }}
                        >
                            {porcentajeMujeres}%
                        </div>
                    </div>
                </div>

                <div className={Style.barRow}>
                    <span>Hombres</span>
                    <div className={Style.barTrack}>
                        <div
                            className={`${Style.bar} ${Style.barHombres}`}
                            style={{ "--w": `${porcentajeHombres}%` }}
                        >
                            {porcentajeHombres}%
                        </div>
                    </div>
                </div>
            </div>

            {/* ===== EDADES ===== */}
            <div className={Style.section}>
                <h2>Estadísticas de Edad</h2>
                <div className={Style.statsGrid}>
                    <div className={Style.statBox}>
                        <strong>{reporte.edades_stats.edad_min}</strong>
                        <span>Mínima</span>
                    </div>
                    <div className={Style.statBox}>
                        <strong>{reporte.edades_stats.edad_max}</strong>
                        <span>Máxima</span>
                    </div>
                    <div className={Style.statBox}>
                        <strong>{Number(reporte.edades_stats.edad_promedio).toFixed(1)}</strong>
                        <span>Promedio</span>
                    </div>
                </div>
            </div>

            {/* ===== EDADES BARRAS ===== */}
            <div className={Style.section}>
                <h2>Distribución por Edad</h2>
                <div className={Style.scrollBox}>
                    {reporte.edades.map(e => (
                        <div key={e.edad} className={Style.barRow}>
                            <span>{e.edad} años</span>
                            <div className={Style.barTrack}>
                                <div
                                    className={`${Style.bar} ${Style.barEdad}`}
                                    style={{ "--w": `${(e.total / maxEdad) * 100}%` }}
                                >
                                    {e.total}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* ===== IGLESIAS ===== */}
            <div className={Style.section}>
                <h2>Inscritos por Iglesia</h2>
                <div className={Style.scrollBox}>
                    {reporte.iglesias.map((i, idx) => (
                        <div key={idx} className={Style.barRow}>
                            <span>{i.nombre}</span>
                            <div className={Style.barTrack}>
                                <div
                                    className={`${Style.bar} ${Style.barIglesia}`}
                                    style={{ "--w": `${(i.total / maxIglesia) * 100}%` }}
                                >
                                    {i.total}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
