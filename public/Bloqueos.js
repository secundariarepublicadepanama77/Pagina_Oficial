  document.addEventListener("contextmenu", e => e.preventDefault());// Bloqueo de clic derecho
  document.addEventListener("keydown", e => { // Bloqueo de teclas: F12, Ctrl+U, Ctrl+Shift+I, Ctrl+Shift+C
    const bloqueadas = [
      "F12",
      "u", // Ctrl+U
      "i", // Ctrl+Shift+I
      "c"  // Ctrl+Shift+C 
    ];
    if (
      bloqueadas.includes(e.key.toLowerCase()) && 
      (e.ctrlKey || e.metaKey || e.shiftKey)
    ) {
      e.preventDefault();
      console.log("🚫 Acción bloqueada");
    }
  });
