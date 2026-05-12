import { supabase } from "./supabase.js";

const logoutButton = document.getElementById("logout");
const homeForm = document.getElementById("homeForm");
const homesList = document.getElementById("homesList");
const homeStatus = document.getElementById("homeStatus");
const saveHomeButton = document.getElementById("saveHome");

let currentUser = null;

/**
 * Sets status message with styling
 * @param {string} message - The message to display
 * @param {string} type - The message type: 'error', 'success', or ''
 */
const setStatus = (message, type = "") => {
  homeStatus.textContent = message;
  homeStatus.className = `status-message ${type}`.trim();
  
  // Auto-clear success messages after 3 seconds
  if (type === "success") {
    setTimeout(() => {
      homeStatus.textContent = "";
      homeStatus.className = "";
    }, 3000);
  }
};

/**
 * Formats square meters to appropriate precision
 * @param {number|string} value - The value to format
 * @returns {number} Formatted square meters
 */
const formatSquareMeters = (value) => {
  const number = Number(value);
  return Number.isInteger(number) ? number : number.toFixed(1);
};

/**
 * Validates home data
 * @param {object} payload - The home data to validate
 * @throws {Error} If validation fails
 */
const validateHomePayload = (payload) => {
  const currentYear = new Date().getFullYear();
  
  if (!payload.address || payload.address.length < 3) {
    throw new Error("Address must be at least 3 characters");
  }
  
  if (!payload.property_type) {
    throw new Error("Property type is required");
  }
  
  if (payload.year_built < 1800 || payload.year_built > currentYear) {
    throw new Error(`Year built must be between 1800 and ${currentYear}`);
  }
  
  if (payload.square_meters <= 0) {
    throw new Error("Square meters must be greater than 0");
  }
};

/**
 * Renders the list of homes
 * @param {Array} homes - Array of home objects
 */
const renderHomes = (homes) => {
  homesList.replaceChildren();

  if (!homes.length) {
    const emptyState = document.createElement("p");
    emptyState.className = "empty-state";
    emptyState.textContent = "No homes added yet.";
    homesList.append(emptyState);
    return;
  }

  for (const home of homes) {
    const card = document.createElement("article");
    const details = document.createElement("div");
    const address = document.createElement("h3");
    const meta = document.createElement("p");
    const size = document.createElement("strong");
    const actionsDiv = document.createElement("div");
    const deleteBtn = document.createElement("button");

    card.className = "home-card";
    address.textContent = home.address;
    meta.textContent = `${home.property_type} - Built ${home.year_built}`;
    size.textContent = `${formatSquareMeters(home.square_meters)} m2`;
    
    actionsDiv.className = "home-card-actions";
    deleteBtn.className = "delete-button";
    deleteBtn.textContent = "Delete";
    deleteBtn.type = "button";
    deleteBtn.addEventListener("click", () => handleDeleteHome(home.id));

    details.append(address, meta);
    actionsDiv.append(deleteBtn);
    card.append(details, size, actionsDiv);
    homesList.append(card);
  }
};

/**
 * Loads homes from database
 */
const loadHomes = async () => {
  if (!currentUser?.id) {
    setStatus("User session lost. Please log in again.", "error");
    window.location.href = "./index.html";
    return;
  }

  const { data, error } = await supabase
    .from("homes")
    .select("id,address,property_type,year_built,square_meters,created_at")
    .eq("owner_id", currentUser.id)
    .order("created_at", { ascending: false });

  if (error) {
    homesList.replaceChildren();
    const emptyState = document.createElement("p");
    emptyState.className = "empty-state";
    emptyState.textContent = "Could not load homes.";
    homesList.append(emptyState);
    setStatus(`Database error: ${error.message}`, "error");
    return;
  }

  renderHomes(data ?? []);
};

/**
 * Gets validated home payload from form
 * @returns {object} Home data object
 * @throws {Error} If validation fails
 */
const getHomePayload = () => {
  const address = document.getElementById("homeAddress").value.trim();
  const propertyType = document.getElementById("propertyType").value;
  const yearBuilt = Number(document.getElementById("yearBuilt").value);
  const squareMeters = Number(document.getElementById("squareMeters").value);

  const payload = {
    owner_id: currentUser.id,
    address,
    property_type: propertyType,
    year_built: yearBuilt,
    square_meters: squareMeters,
  };

  validateHomePayload(payload);
  return payload;
};

/**
 * Handles home creation
 * @param {Event} event - Form submit event
 */
const handleCreateHome = async (event) => {
  event.preventDefault();
  setStatus("");
  
  // Disable entire form to prevent duplicate submissions
  const inputs = homeForm.querySelectorAll("input, select, button");
  inputs.forEach(input => {
    input.disabled = true;
  });
  saveHomeButton.textContent = "Creating...";

  try {
    const payload = getHomePayload();
    const { error } = await supabase.from("homes").insert(payload);

    if (error) {
      setStatus(error.message, "error");
      return;
    }

    homeForm.reset();
    setStatus("Home created successfully!", "success");
    await loadHomes();
  } catch (err) {
    setStatus(err.message, "error");
  } finally {
    inputs.forEach(input => {
      input.disabled = false;
    });
    saveHomeButton.textContent = "Create home";
  }
};

/**
 * Handles home deletion
 * @param {string} homeId - The ID of the home to delete
 */
const handleDeleteHome = async (homeId) => {
  if (!confirm("Are you sure you want to delete this home?")) {
    return;
  }

  setStatus("");
  
  const { error } = await supabase.from("homes").delete().eq("id", homeId);

  if (error) {
    setStatus(`Failed to delete: ${error.message}`, "error");
    return;
  }

  setStatus("Home deleted successfully!", "success");
  await loadHomes();
};

/**
 * Initializes the dashboard
 */
const initDashboard = async () => {
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    window.location.href = "./index.html";
    return;
  }

  currentUser = data.user;
  await loadHomes();
};

logoutButton.addEventListener("click", async () => {
  await supabase.auth.signOut();
  window.location.href = "./index.html";
});

homeForm.addEventListener("submit", handleCreateHome);

initDashboard();
