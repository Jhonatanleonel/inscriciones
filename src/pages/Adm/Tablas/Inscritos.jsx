import styles from "./Inscritos.module.css";
import { useEffect, useState } from "react";
import axios from "./../../../api";
import { toast } from "react-toastify";
import * as XLSX from "xlsx";
import Cabeza from "../../../componentes/Cabeza";

export default function Inscritos() {
  const [inscritos, setInscritos] = useState([]);
  const [modalImg, setModalImg] = useState(null);
  const [modalInfo, setModalInfo] = useState(null);
  const [loading, setLoading] = useState(false);

  // 🔹 estado de ordenamiento
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: "asc",
  });

  useEffect(() => {
    cargarInscritos();
  }, []);

  const cargarInscritos = () => {
    axios
      .get("api/Inscripcion/listar/")
      .then((res) => setInscritos(res.data))
      .catch(() => toast.error("Error al cargar inscritos"));
  };

  // 🔹 ordenar por columna
  const ordenarPor = (key) => {
    let direction = "asc";

    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }

    setSortConfig({ key, direction });
  };

  // 🔹 inscritos ordenados
  const inscritosOrdenados = [...inscritos].sort((a, b) => {
    if (!sortConfig.key) return 0;

    const aVal = a[sortConfig.key] ?? "";
    const bVal = b[sortConfig.key] ?? "";

    if (typeof aVal === "number") {
      return sortConfig.direction === "asc" ? aVal - bVal : bVal - aVal;
    }

    return sortConfig.direction === "asc"
      ? aVal.toString().localeCompare(bVal.toString())
      : bVal.toString().localeCompare(aVal.toString());
  });

  // 🔹 icono
  const iconoOrden = (key) => {
    if (sortConfig.key !== key) return "";
    return sortConfig.direction === "asc" ? " 🔼" : " 🔽";
  };

  /* ===== EXCEL ===== */
  const handleDownloadExcel = () => {
    if (inscritos.length === 0) {
      toast.warning("No hay datos para exportar");
      return;
    }

    const dataToExport = inscritosOrdenados.map((item) => ({
      Paterno: item.paterno,
      Materno: item.materno,
      Nombre: item.nombre,
      Iglesia: item.iglesia__nombre,
      Verificado: item.verificado ? "Sí" : "No",
    }));

    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Inscritos");
    XLSX.writeFile(wb, "Lista_Inscritos.xlsx");
  };

  /* ===== CONFIRMAR PAGO ===== */
  const confirmarPago = async () => {
    if (!modalInfo) return;

    setLoading(true);
    try {
      await axios.post("api/Inscripcion/confirmar/", { id: modalInfo.id });

      toast.success("Pago confirmado");

      setInscritos((prev) =>
        prev.map((i) =>
          i.id === modalInfo.id ? { ...i, verificado: true } : i
        )
      );

      setModalInfo(null);
    } catch {
      toast.error("Error al confirmar pago");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <Cabeza />
      <h1 className={styles.title}>Inscritos</h1>

      <div className={styles.buttons}>
        <button className={styles.button} onClick={handleDownloadExcel}>
          Imprimir Excel
        </button>
      </div>

      {/* ===== TABLA ===== */}
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th onClick={() => ordenarPor("paterno")}>
                Paterno{iconoOrden("paterno")}
              </th>
              <th onClick={() => ordenarPor("materno")}>
                Materno{iconoOrden("materno")}
              </th>
              <th onClick={() => ordenarPor("nombre")}>
                Nombre{iconoOrden("nombre")}
              </th>
              <th onClick={() => ordenarPor("genero")}>
                Género{iconoOrden("genero")}
              </th>
              <th onClick={() => ordenarPor("edad")}>
                Edad{iconoOrden("edad")}
              </th>
              <th onClick={() => ordenarPor("iglesia__nombre")}>
                Iglesia{iconoOrden("iglesia__nombre")}
              </th>
              <th>Comprobante</th>
              <th onClick={() => ordenarPor("pagoFecha")}>
                Fecha{iconoOrden("pagoFecha")}
              </th>
              <th onClick={() => ordenarPor("pagoHora")}>
                Hora{iconoOrden("pagoHora")}
              </th>
              <th onClick={() => ordenarPor("pagoTelefono")}>
                Teléfono{iconoOrden("pagoTelefono")}
              </th>
              <th onClick={() => ordenarPor("verificado")}>
                Verificado{iconoOrden("verificado")}
              </th>
              <th>Acción</th>
            </tr>
          </thead>

          <tbody>
            {inscritosOrdenados.map((i) => (
              <tr key={i.id}>
                <td>{i.paterno}</td>
                <td>{i.materno}</td>
                <td>{i.nombre}</td>
                <td>{i.genero}</td>
                <td>{i.edad}</td>
                <td>{i.iglesia__nombre}</td>
                <td>
                  {i.pagoComprobante ? (
                    <img
                      src={i.pagoComprobante}
                      className={styles.image}
                      alt="Comprobante"
                      onClick={() => setModalImg(i.pagoComprobante)}
                    />
                  ) : (
                    "-"
                  )}
                </td>
                <td>{i.pagoFecha}</td>
                <td>{i.pagoHora}</td>
                <td>{i.pagoTelefono}</td>
                <td>
                  {i.verificado ? (
                    <span className={styles.badgeYes}>Sí</span>
                  ) : (
                    <span className={styles.badgeNo}>No</span>
                  )}
                </td>
                <td>
                  {!i.verificado && (
                    <button
                      className={styles.actionButtonDelete}
                      onClick={() => setModalInfo(i)}
                    >
                      Confirmar pago
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ===== MODALES ===== */}
      {modalImg && (
        <div className={styles.modal} onClick={() => setModalImg(null)}>
          <img src={modalImg} className={styles.modalImg} />
        </div>
      )}

      {modalInfo && (
        <div className={styles.modal} onClick={() => setModalInfo(null)}>
          <div className={styles.infoModal} onClick={(e) => e.stopPropagation()}>
            <h1>Confirmar pago</h1>
            <p>
              ¿Confirmar pago de{" "}
              <strong>{modalInfo.nombre} {modalInfo.paterno}</strong>?
            </p>
            <div className={styles.infoModalButtons}>
              <button onClick={confirmarPago} disabled={loading}>
                {loading ? "Confirmando..." : "Confirmar"}
              </button>
              <button onClick={() => setModalInfo(null)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
