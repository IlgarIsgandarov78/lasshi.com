import { supabase } from "./supabase.js";

const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");
const tabs = document.querySelectorAll(".tab");
const contractorProfileFields = document.getElementById("contractorProfileFields");
const accountTypeInputs = document.querySelectorAll('input[name="accountType"]');
const registerTradeType = document.getElementById("registerTradeType");
const registerCompanyName = document.getElementById("registerCompanyName");

/**
 * Validates email format
 * @param {string} email - Email to validate
 * @returns {boolean} Whether email is valid
 */
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const normalizeAccountType = (value) => (value === "contractor" ? "contractor" : "consumer");

const getSelectedAccountType = () => {
  const selected = document.querySelector('input[name="accountType"]:checked');
  return normalizeAccountType(selected?.value);
};

const getMetadataProfile = (user, overrides = {}) => {
  const metadata = user?.user_metadata ?? {};

  return {
    user_id: user.id,
    email: (overrides.email ?? user.email ?? "").toLowerCase(),
    full_name: overrides.full_name ?? metadata.full_name ?? "",
    account_type: normalizeAccountType(overrides.account_type ?? metadata.account_type),
    trade_type: overrides.trade_type ?? metadata.trade_type ?? null,
    company_name: overrides.company_name ?? metadata.company_name ?? null,
  };
};

const ensureUserProfile = async (user, overrides = {}) => {
  const fallback = getMetadataProfile(user, overrides);

  try {
    const { data, error } = await supabase
      .from("user_profiles")
      .select("user_id,email,full_name,account_type,trade_type,company_name")
      .eq("user_id", user.id)
      .maybeSingle();

    if (error) throw error;
    if (data) return data;

    const { data: createdProfile, error: createError } = await supabase
      .from("user_profiles")
      .upsert(fallback, { onConflict: "user_id" })
      .select("user_id,email,full_name,account_type,trade_type,company_name")
      .single();

    if (createError) throw createError;
    return createdProfile ?? fallback;
  } catch (error) {
    console.warn("Could not load user profile. Falling back to auth metadata.", error);
    return fallback;
  }
};

const redirectForProfile = (profile) => {
  window.location.href = profile.account_type === "contractor" ? "./contractor.html" : "./dashboard.html";
};

const updateRegisterRoleFields = () => {
  const isContractor = getSelectedAccountType() === "contractor";
  contractorProfileFields?.classList.toggle("hidden", !isContractor);
  registerTradeType.required = isContractor;
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
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        alert(error.message);
        return;
      }

      const profile = await ensureUserProfile(data.user);
      redirectForProfile(profile);
    } catch (err) {
      alert(`An unexpected error occurred: ${err.message || "Please try again."}`);
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
    const accountType = getSelectedAccountType();
    const tradeType = accountType === "contractor" ? registerTradeType.value : null;
    const companyName = accountType === "contractor" ? registerCompanyName.value.trim() || null : null;

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

    if (accountType === "contractor" && !tradeType) {
      alert("Please choose your trade");
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
            account_type: accountType,
            trade_type: tradeType,
            company_name: companyName,
          },
        },
      });

      if (error) {
        alert(error.message);
        return;
      }

      if (data.session) {
        const profile = await ensureUserProfile(data.user, {
          email,
          full_name: fullName,
          account_type: accountType,
          trade_type: tradeType,
          company_name: companyName,
        });
        redirectForProfile(profile);
        return;
      }

      alert("Account created. Please check your email to confirm your account.");
      window.showLogin();
    } catch (err) {
      alert(`An unexpected error occurred: ${err.message || "Please try again."}`);
    } finally {
      inputs.forEach(input => {
        input.disabled = false;
      });
      submitButton.textContent = "Create account";
    }
  });
}

accountTypeInputs.forEach((input) => {
  input.addEventListener("change", updateRegisterRoleFields);
});

updateRegisterRoleFields();
