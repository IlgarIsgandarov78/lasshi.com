import { supabase } from "./supabase.js";

const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");
const tabs = document.querySelectorAll(".tab");

window.showLogin = function () {
  loginForm?.classList.remove("hidden");
  registerForm?.classList.add("hidden");

  tabs[0]?.classList.add("active");
  tabs[1]?.classList.remove("active");
};

window.showRegister = function () {
  registerForm?.classList.remove("hidden");
  loginForm?.classList.add("hidden");

  tabs[1]?.classList.add("active");
  tabs[0]?.classList.remove("active");
};

if (loginForm) {
  loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = loginForm.querySelector('input[type="email"]').value.trim();
    const password = loginForm.querySelector('input[type="password"]').value;

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert(error.message);
      return;
    }

    window.location.href = "/dashboard.html";
  });
}

if (registerForm) {
  registerForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const fullName = registerForm.querySelector('input[type="text"]').value.trim();
    const email = registerForm.querySelector('input[type="email"]').value.trim();
    const password = registerForm.querySelector('input[type="password"]').value;

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

    if (data.session) {
      window.location.href = "/dashboard.html";
      return;
    }

    alert("Account created. Please check your email to confirm your account.");
    window.showLogin();
  });
}
