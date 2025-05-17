/* ───────────────────  Base URL  ─────────────────── */
const BASE_URL = "https://localhost:7045";

/* ───────────────────  Generic helpers  ─────────────────── */
function displayError(msg) {
  const box = document.querySelector(".error-container");
  if (box) { box.textContent = msg; box.style.display = "block"; }
  else alert(msg);
}
function displaySuccess(msg) {
  const box = document.querySelector(".success-container");
  if (box) { box.textContent = msg; box.style.display = "block"; }
  else alert(msg);
}

/* ───────────────────  DOM ready  ─────────────────── */
/* ───────────────────  DOM ready  ─────────────────── */
document.addEventListener("DOMContentLoaded", () => {
  const userEmail = localStorage.getItem("userEmail");
  const userRole = localStorage.getItem("role");
  const path = location.pathname;

  console.log("DEBUG - userEmail:", userEmail);
  console.log("DEBUG - pathname:", path);
  console.log("DEBUG - role:", userRole);

  if (!userEmail) return;

  const isHome =
    path.endsWith("home.html") ||
    path.endsWith("/") ||
    path.endsWith("index.html");

  console.log("DEBUG - isHome:", isHome);
  console.log("DEBUG - userRole === Admin check:", userRole === "Admin");

  if (isHome) {
    if (userRole === "Admin") {
      console.log("Redirecting admin to admin-home.html");
      window.location.href = "admin-home.html";
    } else {
      console.log("Redirecting user to dashboard.html");
      window.location.href = "dashboard.html";
    }
  }

  
});


function updateAuthUI() {
  const loggedIn = !!localStorage.getItem("userEmail");
  // ⚙️ Պրոֆիլ
  const profileItem = document.getElementById("profileItem");
  if (profileItem) profileItem.style.display = loggedIn ? "block" : "none";
  // ⚙️ Ելք
  const logoutItem = document.getElementById("logoutItem");
  if (logoutItem) logoutItem.style.display = loggedIn ? "block" : "none";
}

document.addEventListener("DOMContentLoaded", updateAuthUI);

// Քանի որ արդեն ունեք logout() ֆունկցիա main.js-ում, անմիջապես հետո ավելացրեք.
function logout() {
  localStorage.removeItem("userEmail");
  updateAuthUI();          // navbar-ը թարմացնում ենք
  popup(true, "Դուք դուրս եկաք համակարգից");
}


/*  Forgot-password link (only if you include it outside the login page)  */
document.querySelector(".forgot-password")?.addEventListener("click", e => {
  e.preventDefault();
  window.location.href = "reset-request.html";
});


