import { Link } from "react-router-dom";
import styles from "./Cabeza.module.css";

export default function Cabeza() {
    return (
        <header className={styles.header}>
            <img src="/imagenes/logo.png" alt="Logo" />
            <h1>ASORBOL</h1>
            <nav>
                <ul>
                    <li><Link to="/inscritos">Inscritos</Link></li>
                    <li><Link to="/iglesias">Iglesias</Link></li>
                    <li><Link to="/reporte">Reporte</Link></li>
                </ul>
            </nav>
        </header>
    );
}
