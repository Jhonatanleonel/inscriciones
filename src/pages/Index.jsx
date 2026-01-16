// Index.jsx
import { useState, useEffect } from "react";
import styles from "./Index.module.css";
import axios from "./../api";

export default function Index() {
  const [inscripciones, setInscripciones] = useState([]);
  const [cuposDisponibles, setCuposDisponibles] = useState(0);
  const [timeLeft, setTimeLeft] = useState({
    dias: 0,
    horas: 0,
    minutos: 0,
    segundos: 0,
  });

  useEffect(() => {
    // === Cargar inscripciones desde localStorage (Auto-refresh) ===
    const loadInscripciones = () => {
      const savedInscripciones = localStorage.getItem("inscripciones");
      if (savedInscripciones) {
        try {
          const parsedData = JSON.parse(savedInscripciones);
          // Auto-migrate legacy object data to array
          const dataArray = Array.isArray(parsedData)
            ? parsedData
            : Object.values(parsedData);

          // Comparar para evitar re-renders innecesarios
          setInscripciones(prev => {
            if (JSON.stringify(prev) !== JSON.stringify(dataArray)) {
              return dataArray;
            }
            return prev;
          });
        } catch (error) {
          console.error("Error al leer localStorage:", error);
        }
      }
    };

    loadInscripciones(); // Carga inicial
    const dataInterval = setInterval(loadInscripciones, 2000); // Revisar cada 2s

    // === Cronómetro ===
    const targetDate = new Date("2026-02-13T00:00:00").getTime();

    const getTimeLeft = () => {
      const now = new Date().getTime();
      const difference = targetDate - now;
      if (difference <= 0)
        return { dias: 0, horas: 0, minutos: 0, segundos: 0 };
      return {
        dias: Math.floor(difference / (1000 * 60 * 60 * 24)),
        horas: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutos: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
        segundos: Math.floor((difference % (1000 * 60)) / 1000),
      };
    };

    setTimeLeft(getTimeLeft());
    const interval = setInterval(() => setTimeLeft(getTimeLeft()), 1000);

    // === Traer cupos desde backend ===
    const getCuposDisponibles = async () => {
      try {
        const response = await axios.get("api/Inscripcion/cupo/");
        const cantidad = response.data.cupos_disponibles ?? response.data;
        setCuposDisponibles(cantidad);
      } catch (error) {
        console.error("Error al obtener los cupos disponibles:", error);
      }
    };
    getCuposDisponibles();

    return () => {
      clearInterval(interval);
      clearInterval(dataInterval);
    };
  }, []);

  return (
    <div className={styles.containerGlobal}>
      <div className={styles.fondo}>
        <div className={styles.wrapper}>

          {/* TITULO */}
          <div className={styles.titulo}>
            <img src="/imagenes/logo.png" alt="Logo Asorbol" />
            <h3>DPTO DE JOVENES ASORBOL</h3>
            <h2>- RETIRO ESPIRITUAL -</h2>
            <div className={styles.tituloPrincipal}>
              <h1 className={styles.guarda}>GUARDA</h1>
              <h1 className={styles.corazon}>TU CORAZÓN</h1>
            </div>
          </div>

          {/* CRONOMETRO */}
          <div className={styles.cronometro}>
            <div className={styles.celdaTiempo}>
              <h1>{timeLeft.dias}</h1>
              <p>Días</p>
            </div>
            <div className={styles.celdaTiempo}>
              <h1>{timeLeft.horas}</h1>
              <p>Horas</p>
            </div>
            <div className={styles.celdaTiempo}>
              <h1>{timeLeft.minutos}</h1>
              <p>Min</p>
            </div>
            <div className={styles.celdaTiempo}>
              <h1>{timeLeft.segundos}</h1>
              <p>Seg</p>
            </div>
          </div>

          {/* AFICHE */}
          <div className={styles.aficheContainer}>
            <img className={styles.aficheImg} src="/imagenes/afiche.jpeg" alt="Afiche Oficial" />
          </div>



          {/* CUPOS DISPONIBLES */}
          <div className={styles.cuposDisponibles}>
            <h2>cupos disponibles:</h2>
            <h1>{200 - cuposDisponibles}</h1>
          </div>

          {/* BOTÓN PRINCIPAL */}
          <a className={styles.botonCTA} href="./formularion">
            <ion-icon name="heart"></ion-icon>
            <span>¡INSCRIBETE AHORA!</span>
          </a>
          <button className={styles.administracion}>administracion</button>

          {/* LISTA DE INSCRITOS LOCALSTORAGE */}
          <div className={styles.localstorage}>
            <h2>INSCRIPCIONES GUARDADAS (LOCAL)</h2>
            {inscripciones.length === 0 ? (
              <p>No hay inscripciones aún</p>
            ) : (
              <table className={styles.tabla}>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Nombre</th>
                    <th>Apellido</th>
                    <th>Edad</th>
                    <th>Género</th>
                    <th>Iglesia</th>
                  </tr>
                </thead>
                <tbody>
                  {inscripciones.map((item, index) => (
                    <tr key={index}>
                      <td>{index + 1}</td>
                      <td>{item.nombre}</td>
                      <td>{item.paterno} {item.materno}</td>
                      <td>{item.edad}</td>
                      <td>{item.genero}</td>
                      <td>{item.iglesia}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* INFORMACIÓN */}
          <div className={styles.infoTexto}>
            <h2>INFORMACIÓN DEL EVENTO</h2>
            <p>Se vienen días especiales para compartir, crecer y fortalecer el corazón junto a Dios 💛🌿. Un campamento pensado para niños, jóvenes y adultos, con actividades especiales para cada edad 🙌</p>
          </div>

          {/* CAJAS DE DATOS */}
          <div className={styles.gridInfo}>
            <div className={styles.cardInfo}>
              <div className={styles.cardIcon}>
                <ion-icon name="calendar-outline"></ion-icon>
              </div>
              <h2>Fecha</h2>
              <h1>13-17</h1>
              <p>Enero de 2026</p>
            </div>

            <div className={styles.cardInfo}>
              <div className={styles.cardIcon}>
                <ion-icon name="location-outline"></ion-icon>
              </div>
              <h2>Lugar</h2>
              <p>Balneario Sofileti</p>
              <div className={styles.separador}></div>
              <p>Satélite Norte</p>
            </div>

            <div className={styles.cardInfo}>
              <div className={styles.cardIcon}>
                <ion-icon name="cash-outline"></ion-icon>
              </div>
              <h2>Costo</h2>
              <h1>Bs. 200</h1>
              <p>Adultos</p>
              <div className={styles.separador}></div>
              <h1>Bs. 150</h1>
              <p>Menores (5-10 años)</p>
            </div>

            <div className={styles.cardInfo}>
              <div className={styles.cardIcon}>
                <ion-icon name="checkmark-circle-outline"></ion-icon>
              </div>
              <h2>Incluye</h2>
              <p>✅ Transporte</p>
              <p>✅ Alimentación</p>
              <p>✅ Estadía</p>
            </div>
          </div>

          {/* GALERÍA */}
          <div className={styles.galeriaSection}>
            <h1>NUESTRO LUGAR</h1>
            <p>Balneario Sofileti - Satélite Norte</p>
            <div className={styles.galeriaGrid}>
              <div className={styles.polaroid}>
                <img src="/imagenes/camping.png" alt="Camping" />
                <p>Zona de Camping</p>
              </div>
              <div className={styles.polaroid}>
                <img src="/imagenes/areas verdes.jpg" alt="Piscina" />
                <p>Areas Verdes</p>
              </div>
              <div className={styles.polaroid}>
                <img src="/imagenes/fogata.jpg" alt="Amigos" />
                <p>Fogata</p>
              </div>
              <div className={styles.polaroid}>
                <img src="/imagenes/recreacion.jpg" alt="Naturaleza" />
                <p>Piscina y Recreación</p>
              </div>
            </div>
          </div>

          {/* INVITACIÓN FINAL */}
          <div className={styles.invitacionBox}>
            <h1>¡NO TE LO PIERDAS!</h1>
            <p>Inscríbete por este medio o con tu director de jóvenes y asegura tu lugar</p>
            <a href="./formularion"><button className={styles.botonOutline}>INSCRIBIRME AHORA</button></a>
            <p style={{ marginTop: '20px', fontSize: '0.8rem', fontStyle: 'italic' }}>
              "Para más información, contacta al director de jóvenes de tu iglesia"
            </p>
          </div>

        </div>
      </div>

      {/* FOOTER */}
      <footer className={styles.footer}>
        <img src="/imagenes/logo.png" alt="Logo Footer" />
        <p>Dpto de Jóvenes ASORBOL © 2026</p>
      </footer>
    </div>
  );
}
