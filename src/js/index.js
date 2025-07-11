if (window.location.hash === "#gracias") {
    alert("✅ ¡Gracias! Tu mensaje fue enviado. Te responderemos pronto.");
  }
  
  const toggleBtn = document.querySelector(".menu-toggle");
  const navBar = document.querySelector(".nav-bar");
  
  toggleBtn.addEventListener("click", () => {
    navBar.classList.toggle("open");
  });
  