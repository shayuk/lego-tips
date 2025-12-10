import { Link } from "react-router-dom";
import styles from "./Logo.module.css";

export function Logo() {
    return (
        <Link to="/" className={styles.logo}>
            <div className={styles.logoIcon}>L</div>
            <span className={styles.logoText}>Lego-Tips</span>
        </Link>
    );
}
