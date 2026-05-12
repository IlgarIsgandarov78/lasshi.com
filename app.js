import { supabase } from "./supabase.js";

const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");
const tabs = document.querySelectorAll(".tab");

/**
 * Validates email format
 * @param {string} email - Email to validate
 * @returns {boolean} Whether email is valid
 */
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Shows login form and hides register form
 */
window.showLogin = function () {
  loginForm?.classList.remove("hidden");
  registerForm?.classList.add("hidden");

  tabs[0]?.classList.add("active");
  tabs[1]?.classList.remove("active");
};

/**
 * Shows register form and hides login form
 */
window.showRegister = function () {
  registerForm?.classList.remove("hidden");
  loginForm?.classList.add("hidden");

  tabs[1]?.classList.add("active");
  tabs[0]?.classList.remove("active");
};

/**
 * Handles user login
 */
if (loginForm) {
  loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const emailInput = loginForm.querySelector('input[type="email"]');
    const passwordInput = loginForm.querySelector('input[type="password"]');
    const submitButton = loginForm.querySelector('button[type="submit"]');
    
    const email = emailInput.value.trim();
    const password = passwordInput.value;

    // Validation
    if (!email || !password) {
      alert("Please fill in all fields");
      return;
    }

    if (!isValidEmail(email)) {
      alert("Please enter a valid email address");
      return;
    }

    // Disable form during submission
    const inputs = loginForm.querySelectorAll("input, button");
    inputs.forEach(input => {
      input.disabled = true;
    });
    submitButton.textContent = "Logging in...";

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        alert(error.message);
        return;
      }

      window.location.href = "./dashboard.html";
    } catch (err) {
      alert("An unexpected error occurred. Please try again.");
    } finally {
      inputs.forEach(input => {
        input.disabled = false;
      });
      submitButton.textContent = "Login";
    }
  });
}

/**
 * Handles user registration
 */
if (registerForm) {
  registerForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const fullNameInput = registerForm.querySelector('input[type="text"]');
    const emailInput = registerForm.querySelector('input[type="email"]');
    const passwordInput = registerForm.querySelector('input[type="password"]');
    const submitButton = registerForm.querySelector('button[type="submit"]');
    
    const fullName = fullNameInput.value.trim();
    const email = emailInput.value.trim();
    const password = passwordInput.value;

    // Validation
    if (!fullName || !email || !password) {
      alert("Please fill in all fields");
      return;
    }

    if (fullName.length < 2) {
      alert("Full name must be at least 2 characters");
      return;
    }

    if (!isValidEmail(email)) {
      alert("Please enter a valid email address");
      return;
    }

    if (password.length < 6) {
      alert("Password must be at least 6 characters");
      return;
    }

    // Disable form during submission
    const inputs = registerForm.querySelectorAll("input, button");
    inputs.forEach(input => {
      input.disabled = true;
    });
    submitButton.textContent = "Creating account...";

    try {
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
        window.location.href = "./dashboard.html";
        return;
      }

      alert("Account created. Please check your email to confirm your account.");
      window.showLogin();
    } catch (err) {
      alert("An unexpected error occurred. Please try again.");
    } finally {
      inputs.forEach(input => {
        input.disabled = false;
      });
      submitButton.textContent = "Create account";
    }
  });
}
