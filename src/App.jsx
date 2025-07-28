import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { FiDownload, FiPlus } from "react-icons/fi";

const API_URL = import.meta.env.VITE_API_URL;
const API_USER = import.meta.env.VITE_API_USER;
const API_PASSWORD = import.meta.env.VITE_API_PASSWORD;
const API_EMPLEADOS = import.meta.env.VITE_API_EMPLEADOS;
const API_FOTOS = import.meta.env.VITE_API_FOTOS;

function App() {
  const [tab, setTab] = useState(0); // 0: subir, 1: ver activos
  const [numeroEmpleado, setNumeroEmpleado] = useState("");
  const [foto, setFoto] = useState(null);
  const [rutaFoto, setRutaFoto] = useState(null);
  const [mensaje, setMensaje] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [empleados, setEmpleados] = useState([]);
  const [fotosDisponibles, setFotosDisponibles] = useState([]);
  const [empleadoVerificado, setEmpleadoVerificado] = useState(null);

  const fileInputRefs = useRef({});

  useEffect(() => {
    if (numeroEmpleado.trim() === "") {
      setRutaFoto(null);
      setMensaje("");
    }
  }, [numeroEmpleado]);

  useEffect(() => {
    const fetchEmpleadosYFotos = async () => {
      try {
        const [resEmpleados, resFotos] = await Promise.all([
          axios.get(API_EMPLEADOS),
          axios.get(`${API_FOTOS}/api/uploads`)
        ]);
        setEmpleados(resEmpleados.data.filter(emp => emp.Estatus === "ALTA"));
        setFotosDisponibles(resFotos.data.archivos);
      } catch (error) {
        console.error("Error cargando datos:", error);
      }
    };
    fetchEmpleadosYFotos();
  }, []);

  const verificarFoto = async () => {
    if (!numeroEmpleado.trim()) return;

    try {
      const res = await axios.get(`${API_URL}/api/foto/${numeroEmpleado}`);
      setRutaFoto(API_URL + res.data.ruta);
      setMensaje("✅ Foto encontrada");

      const emp = empleados.find(e => e.Personal.toString() === numeroEmpleado.trim());
      setEmpleadoVerificado(emp || null);
    } catch {
      setRutaFoto(null);
      setMensaje("⚠️ No hay foto registrada");
      setEmpleadoVerificado(null);
    }
  };

  // const handleSubmit = async (e) => {
  //   e.preventDefault();
  //   if (!foto || !numeroEmpleado) {
  //     alert("Por favor completa todos los campos");
  //     return;
  //   }

  //   const formData = new FormData();
  //   formData.append("foto", foto);
  //   formData.append("numeroEmpleado", numeroEmpleado);

  //   try {
  //     const res = await axios.post(`${API_URL}/api/upload`, formData, {
  //       auth: { username: API_USER, password: API_PASSWORD },
  //       headers: { "Content-Type": "multipart/form-data" },
  //     });

  //     setRutaFoto(API_URL + res.data.ruta);
  //     setMensaje("✅ Foto subida correctamente");
  //     setFoto(null);
  //   } catch {
  //     setMensaje("❌ Error al subir la foto");
  //   }
  // };

  const obtenerRutaFoto = (personal) => {
    const match = fotosDisponibles.find((ruta) => ruta.includes(`/${personal}.jpg`));
    return match ? `${API_FOTOS}${match}` : null;
  };

  const handleCargarFoto = (empId) => {
    if (fileInputRefs.current[empId]) {
      fileInputRefs.current[empId].click();
    }
  };

  const handleArchivoSeleccionado = async (event, empId) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("foto", file);
    formData.append("numeroEmpleado", empId);

    try {
      const res = await axios.post(`${API_URL}/api/upload`, formData, {
        auth: { username: API_USER, password: API_PASSWORD },
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert("✅ Foto subida correctamente");

      // 🔄 Refrescar vista previa si corresponde al mismo empleado del formulario
      if (empId.toString() === numeroEmpleado.trim()) {
        const fotoURL = API_URL + res.data.ruta + `?t=${Date.now()}`; // Forzar actualización con timestamp
        setRutaFoto(fotoURL);
        setMensaje("✅ Foto subida correctamente");
      }

      // 🔄 Actualizar lista general de fotos disponibles (opcional si deseas reflejar en pestaña 2)
      const resFotos = await axios.get(`${API_FOTOS}/api/uploads`);
      setFotosDisponibles(resFotos.data.archivos);

    } catch (err) {
      console.error(err);
      alert("❌ Error al subir la foto");
    }
  };

  return (
  <div style={{
    fontFamily: "Arial, sans-serif",
    backgroundColor: "#0f0f0f",
    color: "#fff",
    minHeight: "100vh",
    width: "100vw",
    overflowX: "hidden",
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

    {/* Pestañas */}
    <div style={{ display: "flex", justifyContent: "center", gap: "1rem", marginBottom: "1rem" }}>
      <button
        onClick={() => setTab(0)}
        style={{
          backgroundColor: tab === 0 ? "#9A3324" : "#222",
          color: "#fff",
          padding: "0.5rem 1rem",
          border: "none",
          borderRadius: "0.3rem",
          cursor: "pointer"
        }}
      >
        Subir Foto
      </button>
      <button
        onClick={() => setTab(1)}
        style={{
          backgroundColor: tab === 1 ? "#9A3324" : "#222",
          color: "#fff",
          padding: "0.5rem 1rem",
          border: "none",
          borderRadius: "0.3rem",
          cursor: "pointer"
        }}
      >
        Empleados Activos
      </button>
    </div>

    {tab === 0 && (
      <>
        <h2 style={{ textAlign: "center", marginBottom: "1rem" }}>
          Fotos de Empleados
        </h2>

        <form style={{
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
          padding: "1rem",
          backgroundColor: "#1a1a1a",
          borderRadius: "0.6rem",
          maxWidth: "600px",
          margin: "0 auto",
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

          {/* <button
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
          </button> */}

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
          {empleadoVerificado && (
            <p style={{ margin: 0, color: "#aaa", fontSize: "0.9rem" }}>
              {empleadoVerificado.Nombre} {empleadoVerificado.ApellidoPaterno} {empleadoVerificado.ApellidoMaterno}
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
      </>
    )}

    {tab === 1 && (
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <h2 style={{ textAlign: "center", marginBottom: "1rem" }}>Empleados en Activo</h2>

        {/* Filtro de búsqueda */}
        <div style={{ maxWidth: "600px", margin: "0 auto", marginBottom: "1rem" }}>
          <input
            type="text"
            placeholder="Buscar por nombre o número de empleado..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            style={{
              width: "100%",
              padding: "0.6rem",
              borderRadius: "0.4rem",
              border: "1px solid #555",
              backgroundColor: "#1a1a1a",
              color: "#fff"
            }}
          />
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
          gap: "1rem"
        }}>
          {empleados
            .filter(emp => {
              const termino = busqueda.toLowerCase();
              return (
                emp.Personal.toString().includes(termino) ||
                emp.Nombre.toLowerCase().includes(termino) ||
                emp.ApellidoPaterno.toLowerCase().includes(termino) ||
                emp.ApellidoMaterno.toLowerCase().includes(termino)
              );
            })
            .map(emp => {
            const fotoURL = obtenerRutaFoto(emp.Personal);
            return (
              <div key={emp.Personal} style={{
                backgroundColor: "#1a1a1a",
                borderRadius: "0.5rem",
                padding: "1rem",
                border: "1px solid #333",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                minHeight: "380px",
                boxShadow: "0 0 5px rgba(0,0,0,0.4)"
              }}>
                {/* Parte superior */}
                <div style={{ flex: 1 }}>
                  {fotoURL ? (
                    <img src={fotoURL} alt={emp.Nombre} style={{
                      width: "100%",
                      height: "200px",
                      objectFit: "cover",
                      borderRadius: "0.5rem",
                      marginBottom: "0.5rem"
                    }} />
                  ) : (
                    <div style={{
                      height: "200px",
                      border: "2px dashed #555",
                      borderRadius: "0.5rem",
                      marginBottom: "0.5rem",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#777"
                    }}>
                      Sin foto
                    </div>
                  )}

                  <div style={{ fontWeight: "bold" }}>{emp.Nombre}</div>
                  <div style={{ fontSize: "0.9rem", marginBottom: "0.2rem" }}>
                    {emp.ApellidoPaterno} {emp.ApellidoMaterno}
                  </div>
                  <div style={{ fontSize: "0.8rem", color: "#aaa" }}>{emp.Puesto}</div>
                  <div style={{ fontSize: "0.8rem", color: "#888" }}>
                    #{emp.Personal.toString().padStart(4, "0")}
                  </div>
                </div>

                {/* Input oculto y botones */}
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  ref={(el) => (fileInputRefs.current[emp.Personal] = el)}
                  style={{ display: "none" }}
                  onChange={(e) => handleArchivoSeleccionado(e, emp.Personal)}
                />

                <div style={{
                  display: "flex",
                  justifyContent: "center",
                  gap: "0.5rem",
                  marginTop: "0.8rem"
                }}>
                  <button
                    title="Descargar foto"
                    style={{
                      backgroundColor: "#9A3324",
                      border: "none",
                      padding: "0.5rem",
                      borderRadius: "0.4rem",
                      cursor: "pointer"
                    }}
                    onClick={async () => {
                      if (fotoURL) {
                        try {
                          const response = await fetch(fotoURL);
                          const blob = await response.blob();
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement("a");
                          a.href = url;
                          a.download = `${emp.Personal}.jpg`;
                          document.body.appendChild(a);
                          a.click();
                          document.body.removeChild(a);
                          URL.revokeObjectURL(url);
                        } catch (error) {
                          alert("❌ No se pudo descargar la imagen");
                        }
                      }
                    }}
                  >
                    <FiDownload size={18} color="#fff" />
                  </button>

                  <button
                    title="Agregar foto"
                    onClick={() => handleCargarFoto(emp.Personal)}
                    style={{
                      backgroundColor: "#444",
                      border: "none",
                      padding: "0.5rem",
                      borderRadius: "0.4rem",
                      cursor: "pointer"
                    }}
                  >
                    <FiPlus size={18} color="#fff" />
                  </button>
                </div>
              </div>

            );
          })}
        </div>
      </div>
    )}
  </div>
);
}

export default App;
