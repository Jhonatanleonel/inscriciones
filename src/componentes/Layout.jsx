import Cabeza from "./Cabeza";

export default function Layout({ children }) {
    return (
        <>
            <Cabeza />
            <main>
                {children}
            </main>
        </>
    );
}
