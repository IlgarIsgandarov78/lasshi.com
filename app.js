// app.js
import { supabase } from "./supabase.js";

/* =========================================================
   TAB SWITCHING (EXPOSED TO WINDOW FOR onclick)
   ========================================================= */

window.showLogin = function () {
  document.getElementById("loginForm").classList.remove("hidden");
  document.getElementById("registerForm").classList.add("hidden");

  const tabs = document.querySelectorAll(".tab");
  tabs[0].classList.add("active");
  tabs[1].classList.remove("active");
};

window.showRegister = function () {
  document.getElementById("registerForm").classList.remove("hidden");
  document.getElementById("loginForm").classList.add("hidden");

  const tabs = document.querySelectorAll(".tab");
  tabs[1].classList.add("active");
  tabs[0].classList.remove("active");
};

/* =========================================================
   LOGIN
   ========================================================= */

const loginForm = document.getElementById("loginForm");

if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = loginForm.querySelector('input[type="email"]').value.trim();
    const password = loginForm
      .querySelector('input[type="password"]')
      .value;

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert(error.message);
      return;
    }

    // ✅ Login successful
    window.location.href = "/dashboard.html";
  });
}

/* =========================================================
   REGISTER
   ========================================================= */

const registerForm = document.getElementById("registerForm");

if (registerForm) {
  registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const fullName = registerForm
      .querySelector('input[type="text"]')
      .value.trim();
    const email = registerForm
      .querySelector('input[type="email"]')
      .value.trim();
    const password = registerForm
      .querySelector('input[type="password"]')
      .value;

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    if (error) {
      alert(error.message);
      return;
    }

