import { supabase } from "./supabase.js";

const logoutButton = document.getElementById("logout");
const homeForm = document.getElementById("homeForm");
const homesList = document.getElementById("homesList");
const homeStatus = document.getElementById("homeStatus");
const saveHomeButton = document.getElementById("saveHome");

let currentUser = null;

const setStatus = (message, type = "") => {
  homeStatus.textContent = message;
  homeStatus.className = `status-message ${type}`.trim();
};

const formatSquareMeters = (value) => {
  const number = Number(value);
  return Number.isInteger(number) ? number : number.toFixed(1);
};

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

    card.className = "home-card";
    address.textContent = home.address;
    meta.textContent = `${home.property_type} - Built ${home.year_built}`;
    size.textContent = `${formatSquareMeters(home.square_meters)} m2`;

    details.append(address, meta);
    card.append(details, size);
    homesList.append(card);
  }
};

const loadHomes = async () => {
  const { data, error } = await supabase
    .from("homes")
    .select("id,address,property_type,year_built,square_meters,created_at")
    .eq("owner_id", currentUser.id)
    .order("created_at", { ascending: false });

  if (error) {
    homesList.replaceChildren();
    const emptyState = document.createElement("p");
    emptyState.className = "empty-state";
    emptyState.textContent = "Could not load homes yet.";
    homesList.append(emptyState);
    setStatus(`Database error: ${error.message}`, "error");
    return;
  }

  renderHomes(data ?? []);
};

const getHomePayload = () => {
  const address = document.getElementById("homeAddress").value.trim();
  const propertyType = document.getElementById("propertyType").value;
  const yearBuilt = Number(document.getElementById("yearBuilt").value);
  const squareMeters = Number(document.getElementById("squareMeters").value);

  return {
    owner_id: currentUser.id,
    address,
    property_type: propertyType,
    year_built: yearBuilt,
    square_meters: squareMeters,
  };
};

const handleCreateHome = async (event) => {
  event.preventDefault();
  setStatus("");
  saveHomeButton.disabled = true;
  saveHomeButton.textContent = "Creating...";

  const payload = getHomePayload();

  const { error } = await supabase.from("homes").insert(payload);

  saveHomeButton.disabled = false;
  saveHomeButton.textContent = "Create home";

  if (error) {
    setStatus(error.message, "error");
    return;
  }

  homeForm.reset();
  setStatus("Home created.", "success");
  await loadHomes();
};

const initDashboard = async () => {
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    window.location.href = "/";
    return;
  }

  currentUser = data.user;
  await loadHomes();
};

logoutButton.addEventListener("click", async () => {
  await supabase.auth.signOut();
  window.location.href = "/";
});

homeForm.addEventListener("submit", handleCreateHome);

initDashboard();
