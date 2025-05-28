import { useEffect, useState } from "react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;
const API_USER = import.meta.env.VITE_API_USER;
const API_PASSWORD = import.meta.env.VITE_API_PASSWORD;

function App() {
  const [numeroEmpleado, setNumeroEmpleado] = useState("");
  const [foto, setFoto] = useState(null);
  const [rutaFoto, setRutaFoto] = useState(null);
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    if (numeroEmpleado.trim() === "") {
      setRutaFoto(null);
      setMensaje("");
    }
  }, [numeroEmpleado]);

  const verificarFoto = async () => {
    if (!numeroEmpleado.trim()) return;

    try {
      const res = await axios.get(`${API_URL}/api/foto/${numeroEmpleado}`);
      setRutaFoto(API_URL + res.data.ruta);
      setMensaje("✅ Foto encontrada");
    } catch {
      setRutaFoto(null);
      setMensaje("⚠️ No hay foto registrada");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!foto || !numeroEmpleado) {
      alert("Por favor completa todos los campos");
      return;
    }

    const formData = new FormData();
    formData.append("foto", foto);
    formData.append("numeroEmpleado", numeroEmpleado);

    try {
      const res = await axios.post(`${API_URL}/api/upload`, formData, {
        auth: { username: API_USER, password: API_PASSWORD },
        headers: { "Content-Type": "multipart/form-data" },
      });

      setRutaFoto(API_URL + res.data.ruta);
      setMensaje("✅ Foto subida correctamente");
      setFoto(null);
    } catch {
      setMensaje("❌ Error al subir la foto");
    }
  };

  return (
    <div style={{
      fontFamily: "Arial, sans-serif",
      backgroundColor: "#0f0f0f",
      color: "#fff",
      minHeight: "100vh",
      width: "100vw", // asegura cubrir toda la pantalla horizontal
      overflowX: "hidden", // evita scroll horizontal
      boxSizing: "border-box",
      padding: "1rem"
    }}>
      {/* Logo */}
      <div style={{ textAlign: "center", marginBottom: "1rem" }}>
        <img
          src="/black-bg.png"
          alt="Grupo Tarahumara"
          style={{ height: "50px", width: "auto" }}
        />
      </div>

      <h2 style={{ textAlign: "center", marginBottom: "1rem" }}>
         Fotos de Empleados
      </h2>

      <form onSubmit={handleSubmit} style={{
        display: "flex",
        flexDirection: "column",
        gap: "1rem",
        padding: "1rem",
        backgroundColor: "#1a1a1a",
        borderRadius: "0.6rem",
        maxWidth: "600px",
        margin: "0 auto", // centra sin romper responsividad
        boxSizing: "border-box"
      }}>
        <label>Número de Empleado:</label>
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          <input
            type="text"
            value={numeroEmpleado}
            onChange={(e) => setNumeroEmpleado(e.target.value)}
            style={{
              flex: 1,
              padding: "0.6rem",
              background: "#222",
              border: "1px solid #444",
              borderRadius: "0.3rem",
              color: "#fff",
              minWidth: 0
            }}
            required
          />
          <button
            type="button"
            onClick={verificarFoto}
            style={{
              backgroundColor: "#9A3324",
              color: "#fff",
              border: "none",
              padding: "0.5rem 1rem",
              cursor: "pointer",
              borderRadius: "0.3rem"
            }}
          >
            Verificar
          </button>
        </div>

        <label>Selecciona o toma una foto:</label>
        <label style={{
          backgroundColor: "#222",
          border: "1px dashed #555",
          padding: "0.8rem",
          borderRadius: "0.4rem",
          textAlign: "center",
          cursor: "pointer",
          color: "#ddd"
        }}>
          📁 Elegir archivo
          <input
            type="file"
            accept="image/*"
            capture="environment"
            onChange={(e) => setFoto(e.target.files[0])}
            required
            style={{ display: "none" }}
          />
        </label>

        <button
          type="submit"
          style={{
            backgroundColor: "#9A3324",
            color: "#fff",
            padding: "0.8rem",
            fontSize: "1rem",
            border: "none",
            borderRadius: "0.4rem",
            cursor: "pointer"
          }}
        >
          Subir o Reemplazar Foto
        </button>

        {mensaje && (
          <p style={{
            margin: 0,
            fontWeight: "bold",
            color: mensaje.includes("✅") ? "#00e676" :
                   mensaje.includes("⚠️") ? "#ffeb3b" :
                   "#f44336"
          }}>
            {mensaje}
          </p>
        )}
      </form>

      {numeroEmpleado && (
        <div style={{
          paddingTop: "2rem",
          width: "100%",
          maxWidth: "600px",
          margin: "0 auto",
          boxSizing: "border-box"
        }}>
          <h3 style={{ textAlign: "center", marginBottom: "1rem" }}>📁 Vista Previa</h3>
          {rutaFoto ? (
            <img
              src={rutaFoto}
              alt="Foto del empleado"
              style={{
                width: "100%",
                height: "auto",
                display: "block",
                borderRadius: "0.5rem",
                border: "3px solid #9A3324",
                boxSizing: "border-box"
              }}
            />
          ) : (
            <div style={{
              width: "100%",
              height: "300px",
              border: "2px dashed #555",
              borderRadius: "0.5rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#888",
              boxSizing: "border-box"
            }}>
              Sin foto
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
