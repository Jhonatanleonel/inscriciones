import styles from "./Inscritos.module.css";
import { useEffect, useState } from "react";
import axios from "./../../../api";
import { toast } from "react-toastify";
import { useRef } from "react";
import * as XLSX from "xlsx";

export default function Inscritos() {
  const [inscritos, setInscritos] = useState([]);
  const [modalImg, setModalImg] = useState(null);
  const [modalInfo, setModalInfo] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    cargarInscritos();
  }, []);

  const cargarInscritos = () => {
    axios
      .get("api/Inscripcion/listar/")
      .then((res) => setInscritos(res.data))
      .catch(() => toast.error("Error al cargar inscritos"));
  };

  const handleDownloadExcel = () => {
    if (inscritos.length === 0) {
      toast.warning("No hay datos para exportar");
      return;
    }

    // 1. Ordenar por Apellido Paterno, Materno y luego Nombre
    const dataSorted = [...inscritos].sort((a, b) => {
      const pat = (a.paterno || "").localeCompare(b.paterno || "");
      if (pat !== 0) return pat;
      const mat = (a.materno || "").localeCompare(b.materno || "");
      if (mat !== 0) return mat;
      return (a.nombre || "").localeCompare(b.nombre || "");
    });

    // 2. Formatear datos para el Excel
    const dataToExport = dataSorted.map((item) => ({
      "Paterno": item.paterno,
      "Materno": item.materno,
      "Nombre": item.nombre,
      "Iglesia": item.iglesia__nombre,
      "Verificado": item.verificado ? "Sí" : "  ",
    }));

    // 3. Generar hoja y libro
    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Inscritos");

    // 4. Descargar
    XLSX.writeFile(wb, "Lista_Inscritos.xlsx");
  };

  const openImgModal = (url) => setModalImg(url);
  const closeImgModal = () => setModalImg(null);

  const openInfoModal = (inscrito) => setModalInfo(inscrito);
  const closeInfoModal = () => setModalInfo(null);

  /* ✅ CONFIRMAR PAGO */
  const confirmarPago = async () => {
    if (!modalInfo) return;

    setLoading(true);
    try {
      await axios.post("api/Inscripcion/confirmar/", {
        id: modalInfo.id,
      });

      toast.success("✅ Pago confirmado correctamente");

      // actualizar tabla sin recargar
      setInscritos((prev) =>
        prev.map((i) =>
          i.id === modalInfo.id ? { ...i, verificado: true } : i
        )
      );

      closeInfoModal();
    } catch (error) {
      toast.error("❌ Error al confirmar el pago");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Inscritos</h1>

      <div className={styles.buttons}>
        <button className={styles.button} onClick={handleDownloadExcel}>
          Imprimir Excel
        </button>
      </div>

      {/* ===== MODAL CONFIRMAR ===== */}
      {modalInfo && (
        <div className={styles.modal} onClick={closeInfoModal}>
          <div
            className={styles.infoModal}
            onClick={(e) => e.stopPropagation()}
          >
            <h1>Confirmar Pago</h1>
            <p>
              ¿Deseas confirmar el pago de{" "}
              <strong>
                {modalInfo.nombre} {modalInfo.paterno}
              </strong>
              ?
            </p>

            <div className={styles.infoModalButtons}>
              <button onClick={confirmarPago} disabled={loading}>
                {loading ? "Confirmando..." : "Confirmar"}
              </button>
              <button onClick={closeInfoModal}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {/* ===== TABLA ===== */}
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Paterno</th>
              <th>Materno</th>
              <th>Género</th>
              <th>Edad</th>
              <th>Iglesia</th>
              <th>Comprobante</th>
              <th>Fecha</th>
              <th>Hora</th>
              <th>Teléfono</th>
              <th>Verificado</th>
              <th>Acción</th>
            </tr>
          </thead>
          <tbody>
            {inscritos.map((inscrito) => (
              <tr key={inscrito.id}>
                <td>{inscrito.nombre}</td>
                <td>{inscrito.paterno}</td>
                <td>{inscrito.materno}</td>
                <td>{inscrito.genero}</td>
                <td>{inscrito.edad}</td>
                <td>{inscrito.iglesia__nombre}</td>
                <td>
                  {inscrito.pagoComprobante ? (
                    <img
                      src={inscrito.pagoComprobante}
                      className={styles.image}
                      alt="Comprobante"
                      onClick={() => openImgModal(inscrito.pagoComprobante)}
                    />
                  ) : (
                    "-"
                  )}
                </td>
                <td>{inscrito.pagoFecha}</td>
                <td>{inscrito.pagoHora}</td>
                <td>{inscrito.pagoTelefono}</td>
                <td>
                  {inscrito.verificado ? (
                    <span className={styles.badgeYes}>Sí</span>
                  ) : (
                    <span className={styles.badgeNo}>No</span>
                  )}
                </td>
                <td>
                  {!inscrito.verificado && (
                    <button
                      className={styles.actionButtonDelete}
                      onClick={() => openInfoModal(inscrito)}
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

      {/* ===== MODAL IMAGEN ===== */}
      {modalImg && (
        <div className={styles.modal} onClick={closeImgModal}>
          <img
            src={modalImg}
            alt="Comprobante grande"
            className={styles.modalImg}
          />
        </div>
      )}
    </div>
  );
}
