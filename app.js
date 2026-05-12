import { supabase } from "./supabase.js";

const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");
const tabs = document.querySelectorAll(".tab");

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
 * Validates email format
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid email
 */
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

if (loginForm) {
  loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = loginForm.querySelector('input[type="email"]').value.trim();
    const password = loginForm.querySelector('input[type="password"]').value;
    const submitButton = loginForm.querySelector('button[type="submit"]');

    if (!email || !password) {
      alert("Please fill in all fields");
      return;
    }
        if (!isValidEmail(email)) {
      alert("Please enter a valid email address");
      return;
    }

    // Disable button during submission
    submitButton.disabled = true;
    const originalText = submitButton.textContent;
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
      submitButton.disabled = false;
      submitButton.textContent = originalText;
    }
  });
}
if (registerForm) {
  registerForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const fullName = registerForm.querySelector('input[type="text"]').value.trim();
    const email = registerForm.querySelector('input[type="email"]').value.trim();
    const password = registerForm.querySelector('input[type="password"]').value;
    const submitButton = registerForm.querySelector('button[type="submit"]');

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
    // Disable button during submission
    submitButton.disabled = true;
    const originalText = submitButton.textContent;
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
      submitButton.disabled = false;
      submitButton.textContent = originalText;
    }
  });
}

    
    
