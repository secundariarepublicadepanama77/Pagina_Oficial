  const express = require("express");
  const cors = require("cors");
  const { createClient } = require('@supabase/supabase-js');


  // 🔑 Usa tus datos reales de Supabase
  const supabaseUrl = process.env.SUPABASE_URL || "https://mhnzjhelbupyifdlpngv.supabase.co";
  const supabaseKey = process.env.SUPABASE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1obnpqaGVsYnVweWlmZGxwbmd2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkyMTg1MjUsImV4cCI6MjA2NDc5NDUyNX0.tZAtvUL6kAFfEhwrXgopbQLcnq9qCCm5zpPBkm6z8wY";

  const supabase = createClient(supabaseUrl, supabaseKey);

  const app = express();
  const PORT = process.env.PORT || 3000;

  // ✅ Solo esta línea es necesaria
  app.use(cors({
    origin: "https://pagina-oficial-amhj.onrender.com"
  }));

  app.use(express.json());
  app.use(express.static("public"));// Servir frontend desde /public

  // ✅ agregar usuario
  app.post("/api/usuarios", async (req, res) => {
    const {
      nombre,
      apellido_paterno,
      apellido_materno,
      usuario,
      contrasena,
      tipo,
      grado,
      grupo,
      ciclo_escolar,
      telegram,
      foto,
      academia,
      disciplina,
      asesor
    } = req.body;
  
    if (!nombre || !apellido_paterno || !usuario || !contrasena || !tipo) {
      return res.status(400).json({ error: "Faltan campos obligatorios" });
    }
  
    const { data, error } = await supabase
      .from("usuarios")
      .insert([
        {
          nombre,
          apellido_paterno,
          apellido_materno,
          usuario,
          contrasena,
          tipo,
          grado,
          grupo,
          ciclo_escolar,
          telegram,
          foto,
          academia,
          disciplina,
          asesor
        }
      ]);
  
    if (error) {
      console.error("❌ Error Supabase:", error.message);
      return res.status(500).json({ error: "Error en el servidor" });
    }
  
    res.status(201).json({ mensaje: "✅ Usuario agregado correctamente" });
  });
  

  // 🔐 LOGIN DE USUARIOS
  app.post("/api/login", async (req, res) => {
    const { usuario, contrasena } = req.body;

    console.log("📨 Login recibido:", { usuario, contrasena });

    const { data, error } = await supabase
      .from("usuarios")
      .select("id, nombre, tipo, usuario, contrasena") // limitar campos por seguridad
      .eq("usuario", usuario)
      .eq("contrasena", contrasena)
      .limit(1);

    if (error) {
      console.error("❌ Error Supabase:", error.message);
      return res.status(500).json({ error: "Error del servidor" });
    }

    if (!data || data.length === 0) {
      return res.status(401).json({ error: "Credenciales inválidas" });
    }

    const usuarioEncontrado = data[0];

    console.log("✅ Login exitoso:", usuarioEncontrado);

    res.status(200).json({
      mensaje: "Login exitoso",
      id: usuarioEncontrado.id,
      tipo: usuarioEncontrado.tipo,
      nombre: usuarioEncontrado.nombre
    });
  });
  // Obtener todos los usuarios
  app.get("/api/usuarios", async (req, res) => {
    try {
      const { data, error } = await supabase
        .from("usuarios")
        .select("*")
        .order("id", { ascending: false });

      if (error) throw error;

      res.json(data);
    } catch (err) {
      console.error("❌ Error al obtener usuarios:", err.message);
      res.status(500).json({ error: "Error al obtener usuarios" });
    }
  });

  // Eliminar usuario por ID
  app.delete("/api/usuarios/:id", async (req, res) => {
    const id = req.params.id;
  
    const { error } = await supabase
      .from("usuarios")
      .delete()
      .eq("id", id);
  
    if (error) {
      console.error("❌ Error al eliminar usuario:", error.message);
      return res.status(500).json({ error: "Error al eliminar usuario" });
    }
  
    res.json({ mensaje: "✅ Usuario eliminado correctamente" });
  });  

    // 🔐 LOGIN SOLO ADMINISTRATIVOS
    app.post("/api/login-admin", (req, res) => {
      const { usuario, contrasena } = req.body;
    
      if (!usuario || !contrasena) {
        return res.status(400).json({ success: false, mensaje: "Faltan campos" });
      }
    
      const query = `
        SELECT * FROM usuarios WHERE usuario = ? AND contrasena = ?
      `;
    
      db.get(query, [usuario, contrasena], (err, row) => {
        if (err) {
          return res.status(500).json({ success: false, mensaje: "Error del servidor" });
        }
    
        if (!row) {
          return res.status(401).json({ success: false, mensaje: "Credenciales inválidas" });
        }
    
        if (row.tipo !== "admin") {
          return res.status(403).json({ success: false, mensaje: "Acceso solo para administrativos" });
        }
    
        res.json({
          success: true,
          mensaje: "Inicio de sesión exitoso",
          tipo: row.tipo,
          nombre: row.nombre
        });
      });
    }); 
  // 📝 Registrar nuevo usuario en la tabla matriculas
  app.post("/api/matriculas", async (req, res) => {
    const {
      matricula, nombres, apellido_paterno, apellido_materno,
      grado, grupo, ciclo_escolar, tipo, foto
    } = req.body;

    console.log("📩 Datos recibidos:", req.body); // 👈 NUEVO

    const { data, error } = await supabase
      .from("matriculas")
      .insert([
        {
          matricula,
          nombres,
          apellido_paterno,
          apellido_materno,
          grado,
          grupo,
          ciclo_escolar,
          tipo,
          foto
        }
      ]);

    if (error) {
      console.error("❌ Error al insertar en Supabase:", error.message); // 👈
      return res.status(500).json({ success: false, mensaje: "Error al registrar usuario" });
    }

    res.status(201).json({ success: true, mensaje: "Usuario registrado correctamente" });
  });

  // 🔵 Obtener todos los usuarios registrados desde la tabla "matriculas"
  app.get("/api/matriculas", async (req, res) => {
    try {
      const { data, error } = await supabase
        .from("matriculas")
        .select("*")
        .order("id", { ascending: false });

      if (error) {
        console.error("❌ Error al obtener matriculas:", error.message);
        return res.status(500).json({ error: "Error al obtener usuarios registrados." });
      }

      res.json(data); // ✅ Devuelve todos los registros
    } catch (err) {
      console.error("❌ Error del servidor:", err.message);
      res.status(500).json({ error: "Error inesperado del servidor." });
    }
  });

  app.post("/api/matriculas/editar", (req, res) => {
    const {
      id, matricula, nombres, apellido_paterno,
      apellido_materno, grado, grupo, ciclo_escolar, tipo, foto
    } = req.body;

    const query = `
      UPDATE matriculas SET
        matricula = ?, nombres = ?, apellido_paterno = ?, apellido_materno = ?,
        grado = ?, grupo = ?, ciclo_escolar = ?, tipo = ?, foto = ?
      WHERE id = ?
    `;

    db.run(query, [matricula, nombres, apellido_paterno, apellido_materno, grado, grupo, ciclo_escolar, tipo, foto, id], function(err) {
      if (err) {
        return res.status(500).json({ success: false, mensaje: "Error al actualizar" });
      }
      res.json({ success: true, mensaje: "Usuario actualizado correctamente" });
    });
  });
  // 🔧 ACTUALIZAR USUARIO DE TABLA matriculas CON SUPABASE
  app.put("/api/matriculas", async (req, res) => {
    const {
      matricula,
      nombres,
      apellido_paterno,
      apellido_materno,
      grado,
      grupo,
      ciclo_escolar,
      tipo
    } = req.body;

    const { error } = await supabase
      .from("matriculas")
      .update({
        nombres,
        apellido_paterno,
        apellido_materno,
        grado,
        grupo,
        ciclo_escolar,
        tipo
      })
      .eq("matricula", matricula);

    if (error) {
      console.error("❌ Error al actualizar:", error.message);
      return res.status(500).json({ success: false, mensaje: "Error al actualizar usuario" });
    }

    res.json({ success: true, mensaje: "Usuario actualizado correctamente" });
  });

  // 🗑️ ELIMINAR USUARIO DE MATRICULAS POR MATRÍCULA CON SUPABASE
  app.delete("/api/matriculas/:matricula", async (req, res) => {
    const matricula = req.params.matricula;

    const { error } = await supabase
      .from("matriculas")
      .delete()
      .eq("matricula", matricula);

    if (error) {
      console.error("❌ Error al eliminar:", error.message);
      return res.status(500).json({ success: false, mensaje: "Error al eliminar" });
    }

    res.json({ success: true, mensaje: "Usuario eliminado correctamente" });
  });

  app.post("/api/registrar", async (req, res) => {
    const { matricula } = req.body;
    const zonaHoraria = "America/Mexico_City";
    // Fecha y hora actual
    const ahora = new Date();
    const fechaHoy = new Date().toLocaleDateString('es-MX', {
      timeZone: 'America/Mexico_City',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).split('/').reverse().join('-'); // Convierte a yyyy-mm-dd
    let horaActual = ahora.toLocaleTimeString("es-MX", { timeZone: zonaHoraria });

    console.log("📌 Matricula buscada:", matricula);

    // Buscar usuario por matrícula
    const { data: usuario, error: errorUsuario } = await supabase
      .from("matriculas")
      .select("*")
      .eq("matricula", matricula)
      .maybeSingle();

    console.log("👀 Resultado de Supabase:", usuario);
    console.log("❌ Error Supabase:", errorUsuario?.message);

    if (errorUsuario || !usuario) {
      return res.json({ tipo: "fallido" });
    }

    // Verificar si ya tiene registro hoy
    const { data: registroHoy, error: errorRegistro } = await supabase
      .from("tabla_registro")
      .select("*")
      .eq("matricula", matricula)
      .eq("fecha", fechaHoy)
      .maybeSingle();

    if (errorRegistro) {
      console.error("❌ Error al verificar registro existente:", errorRegistro.message);
      return res.status(500).json({ tipo: "fallido" });
    }

    if (!registroHoy) {
      // Registrar entrada
      const { error: errorInsertar } = await supabase
        .from("tabla_registro")
        .insert([{
          matricula: usuario.matricula,
          nombres: usuario.nombres,
          apellido_paterno: usuario.apellido_paterno,
          apellido_materno: usuario.apellido_materno,
          grado: usuario.grado,
          grupo: usuario.grupo,
          ciclo_escolar: usuario.ciclo_escolar,
          tipo: usuario.tipo,
          foto: usuario.foto,
          fecha: fechaHoy,
          hora_entrada: horaActual
        }]);

      if (errorInsertar) {
        console.error("❌ Error al registrar entrada:", errorInsertar.message);
        return res.status(500).json({ tipo: "fallido" });
      }

      return res.json({
        nombre: `${usuario.nombres} ${usuario.apellido_paterno} ${usuario.apellido_materno}`,
        tipo: usuario.tipo,
        foto: usuario.foto,
        registro: "entrada",
        hora: horaActual
      });

    } else if (!registroHoy.hora_salida || registroHoy.hora_salida === "") {
      // Forzar nueva hora para salida
      const salidaAhora = new Date();
      salidaAhora.setSeconds(salidaAhora.getSeconds() + 1);
      const horaSalida = salidaAhora.toLocaleTimeString("es-MX", { timeZone: zonaHoraria });

      const { error: errorSalida } = await supabase
        .from("tabla_registro")
        .update({ hora_salida: horaSalida })
        .eq("id", registroHoy.id);

      if (errorSalida) {
        console.error("❌ Error al registrar salida:", errorSalida.message);
        return res.status(500).json({ tipo: "fallido" });
      }

      return res.json({
        nombre: `${usuario.nombres} ${usuario.apellido_paterno} ${usuario.apellido_materno}`,
        tipo: usuario.tipo,
        foto: usuario.foto,
        registro: "salida",
        hora: horaSalida
      });

    } else {
      // Ya tiene entrada y salida
      return res.json({
        nombre: `${usuario.nombres} ${usuario.apellido_paterno} ${usuario.apellido_materno}`,
        tipo: usuario.tipo,
        foto: usuario.foto,
        registro: "ya_registrado",
        hora: horaActual
      });
    }
  });

  app.get("/registros", async (req, res) => {
    const { data, error } = await supabase
      .from("tabla_registro")
      .select("*")
      .order("id", { ascending: false });

    if (error) {
      console.error("❌ Error al obtener registros:", error.message);
      return res.status(500).json({ error: "Error al obtener registros" });
    }

    res.json(data);
  });
  // ✅ Actualizar horarios en tabla_registro usando Supabase
  app.post("/actualizar-horarios", async (req, res) => {
    const { id, entrada, salida } = req.body;

    try {
      const { error } = await supabase
        .from("tabla_registro")
        .update({ hora_entrada: entrada, hora_salida: salida })
        .eq("id", id);

      if (error) {
        console.error("❌ Error al actualizar horarios:", error.message);
        return res.status(500).json({ success: false, mensaje: "Error al actualizar horarios" });
      }

      res.json({ success: true, mensaje: "Horarios actualizados correctamente" });
    } catch (err) {
      console.error("❌ Error inesperado:", err.message);
      res.status(500).json({ success: false, mensaje: "Error inesperado en el servidor" });
    }
  });

  // Historial.html- Elimina registro de tabla_registro
  app.delete("/eliminar-registro/:id", async (req, res) => {
    const { id } = req.params;

    try {
      const { error } = await supabase
        .from("tabla_registro")
        .delete()
        .eq("id", id);

      if (error) {
        console.error("❌ Error al eliminar registro:", error.message);
        return res.status(500).json({ success: false, mensaje: "Error al eliminar el registro." });
      }

      res.json({ success: true, mensaje: "Registro eliminado correctamente." });
    } catch (err) {
      console.error("❌ Error inesperado:", err.message);
      res.status(500).json({ success: false, mensaje: "Error inesperado en el servidor" });
    }
  });

  // reporte.html-Guardar nuevo reporte
  app.post("/api/reportes", async (req, res) => {
    console.log("📨 Reporte recibido:", req.body);

    const { matricula_alumno, matricula_docente, fecha, clase, hora, contenido } = req.body;

    const { data, error } = await supabase
      .from("reportes_conducta")
      .insert([{ 
        matricula_alumno, 
        matricula_docente, 
        fecha, 
        clase, 
        hora, 
        contenido 
      }]);

    if (error) {
      console.error("❌ Supabase error:", error.message);
      return res.status(500).json({ mensaje: "Error al guardar el reporte", error });
    }

    res.json({ mensaje: "✅ Reporte guardado correctamente", data });
  });
  //reportes.html-En reporte te dara el nombre al poner tu matricula
  app.get("/api/usuarios/:matricula", async (req, res) => {
    const matricula = req.params.matricula;

    const { data, error } = await supabase
      .from("usuarios")
      .select("nombre, apellido_paterno, apellido_materno, grado, grupo")
      .eq("usuario", matricula)
      .single();

    if (error || !data) {
      return res.status(404).json({ error: "Alumno no encontrado" });
    }

    res.json(data);
  });
  // mis_reportes.html-Ob. reportes de un alumno, con filtros. 
  app.get("/api/reportes/alumno/:matricula", async (req, res) => {
    const { matricula } = req.params;
    const { clase, fecha } = req.query;

    try {
      let { data: reportes, error } = await supabase
        .from("reportes_conducta") 
        .select("*")
        .eq("matricula_alumno", matricula);

      if (error) throw error;

      if (clase) {
        reportes = reportes.filter(r =>
          r.clase.toLowerCase() === clase.toLowerCase()
        );
      }
      if (fecha) {
        reportes = reportes.filter(r => r.fecha === fecha);
      }

      const matriculasDocentes = [...new Set(reportes.map(r => r.matricula_docente))];
      const { data: docentes, error: errorDocentes } = await supabase
        .from("usuarios")
        .select("usuario, nombre")
        .in("usuario", matriculasDocentes);

      if (errorDocentes) throw errorDocentes;

      const nombreDocenteMap = {};
      docentes.forEach(d => nombreDocenteMap[d.usuario] = d.nombre);

      const reportesConNombre = reportes.map(r => ({
        ...r,
        nombre_docente: nombreDocenteMap[r.matricula_docente] || "Desconocido"
      }));

      res.json(reportesConNombre);
    } catch (err) {
      console.error("❌ Error en GET /api/reportes/alumno/:matricula", err);
      res.status(500).json({ error: "Error al obtener reportes del alumno" });
    }
  });
  // Inicia el servidor
  app.listen(PORT, () => {
    console.log(`✅ Servidor corriendo en: http://localhost:${PORT}`);
  });
