import styles from "./Login.module.css";

export default function Login() {
  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>Iniciar Sesión</h1>

        <form className={styles.form}>
          <div className={styles.inputGroup}>
            <label htmlFor="email">Correo</label>
            <input
              type="email"
              id="email"
              placeholder="ejemplo@correo.com"
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="password">Contraseña</label>
            <input
              type="password"
              id="password"
              placeholder="••••••••"
            />
          </div>

          <button className={styles.button}>Entrar</button>
        </form>

      </div>
    </div>
  );
}
