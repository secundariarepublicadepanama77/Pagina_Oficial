import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabase = createClient(
  'https://mhnzjhelbupyifdlpngv.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1obnpqaGVsYnVweWlmZGxwbmd2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkyMTg1MjUsImV4cCI6MjA2NDc5NDUyNX0.tZAtvUL6kAFfEhwrXgopbQLcnq9qCCm5zpPBkm6z8wY'
);

window.cargarAlumnos = async () => {
  const grado = document.getElementById("grado").value;
  const grupo = document.getElementById("grupo").value;
  const materia = document.getElementById("materia").value.trim();

  if (!materia) return alert("Debes ingresar la materia.");

  const { data, error } = await supabase
    .from("usuarios")
    .select("usuario, nombre, apellido_paterno, apellido_materno, grado, grupo")
    .eq("grado", grado)
    .eq("grupo", grupo);

  if (error) {
    console.error("❌ Error al cargar alumnos:", error.message);
    return;
  }

  const contenedor = document.getElementById("contenedorAlumnos");
  contenedor.innerHTML = "";

  data.forEach(alumno => {
    const div = document.createElement("div");
    div.className = "tarjeta-alumno";
    div.innerHTML = `
      <span>${alumno.usuario} - ${alumno.nombre} ${alumno.apellido_paterno} ${alumno.apellido_materno}</span>
      <div class="alerta-opciones">
        <label><input type="radio" name="alerta-${alumno.usuario}" value="verde" checked> ✅ Verde</label>
        <label><input type="radio" name="alerta-${alumno.usuario}" value="rojo"> 🔴 Rojo</label>
      </div>
    `;
    contenedor.appendChild(div);
  });

  if (data.length) {
    document.getElementById("guardarBtn").style.display = "block";
  }
};

window.guardarAlertas = async () => {
  const grado = document.getElementById("grado").value;
  const grupo = document.getElementById("grupo").value;
  const materia = document.getElementById("materia").value.trim();
  const trimestre = document.getElementById("trimestre").value;

  const alumnosDivs = document.querySelectorAll(".tarjeta-alumno");
  let registros = [];

  alumnosDivs.forEach(div => {
    const span = div.querySelector("span").textContent;
    const matricula = span.split(" - ")[0];
    const nombre = span.split(" - ")[1];
    const alerta = div.querySelector("input[type='radio']:checked").value;

    registros.push({
      matricula,
      nombre,
      grado: parseInt(grado),
      grupo,
      materia,
      alerta,
      trimestre: parseInt(trimestre)
    });
  });

  const { error } = await supabase
    .from("alertas")
    .insert(registros);

  if (error) {
    console.error("❌ Error al guardar:", error.message);
    alert("Error al guardar las alertas.");
  } else {
    alert("✅ Alertas guardadas correctamente.");
    document.getElementById("guardarBtn").style.display = "none";
  }
};
