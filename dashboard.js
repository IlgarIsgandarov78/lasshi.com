import { supabase } from "./supabase.js";

const logoutButton = document.getElementById("logout");
const homeForm = document.getElementById("homeForm");
const homesList = document.getElementById("homesList");
const homeStatus = document.getElementById("homeStatus");
const saveHomeButton = document.getElementById("saveHome");
const roomForm = document.getElementById("roomForm");
const roomHomeSelect = document.getElementById("roomHomeId");
const roomNameInput = document.getElementById("roomName");
const roomTypeSelect = document.getElementById("roomType");
const roomsList = document.getElementById("roomsList");
const roomStatus = document.getElementById("roomStatus");
const saveRoomButton = document.getElementById("saveRoom");
const documentForm = document.getElementById("documentForm");
const documentHomeSelect = document.getElementById("documentHomeId");
const documentRoomSelect = document.getElementById("documentRoomId");
const documentTypeSelect = document.getElementById("documentType");
const documentTitleInput = document.getElementById("documentTitle");
const documentFileInput = document.getElementById("documentFile");
const documentStatus = document.getElementById("documentStatus");
const uploadDocumentButton = document.getElementById("uploadDocument");
const timelineForm = document.getElementById("timelineForm");
const timelineHomeSelect = document.getElementById("timelineHomeId");
const timelineRoomSelect = document.getElementById("timelineRoomId");
const timelineDateInput = document.getElementById("timelineDate");
const timelineTypeSelect = document.getElementById("timelineType");
const timelineTitleInput = document.getElementById("timelineTitle");
const timelineDescriptionInput = document.getElementById("timelineDescription");
const timelineStatus = document.getElementById("timelineStatus");
const saveTimelineEventButton = document.getElementById("saveTimelineEvent");
const timelineList = document.getElementById("timelineList");

let currentUser = null;
let homes = [];
let rooms = [];
let documents = [];
let timelineEvents = [];

const setStatus = (element, message, type = "") => {
  const className = `status-message ${type}`.trim();
  element.textContent = message;
  element.className = className;

  if (type === "success") {
    setTimeout(() => {
      if (element.textContent === message && element.className === className) {
        element.textContent = "";
        element.className = "status-message";
      }
    }, 3000);
  }
};

const setHomeStatus = (message, type = "") => {
  setStatus(homeStatus, message, type);
};

const setRoomStatus = (message, type = "") => {
  setStatus(roomStatus, message, type);
};

const setDocumentStatus = (message, type = "") => {
  setStatus(documentStatus, message, type);
};

const setTimelineStatus = (message, type = "") => {
  setStatus(timelineStatus, message, type);
};

const formatSquareMeters = (value) => {
  const number = Number(value);
  return Number.isInteger(number) ? number : number.toFixed(1);
};

const formatFileSize = (bytes) => {
  if (!bytes) {
    return "";
  }

  const units = ["B", "KB", "MB", "GB"];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex += 1;
  }

  return `${size.toFixed(unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
};

const formatTimelineDate = (dateValue) => {
  const date = new Date(`${dateValue}T00:00:00`);
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const getHomeAddress = (homeId) => {
  return homes.find((home) => home.id === homeId)?.address ?? "Unknown home";
};

const getRoomName = (roomId) => {
  return rooms.find((room) => room.id === roomId)?.name ?? "Unknown room";
};

const validateHomePayload = (payload) => {
  const currentYear = new Date().getFullYear();

  if (!payload.address || payload.address.length < 3) {
    throw new Error("Address must be at least 3 characters");
  }

  if (!payload.property_type) {
    throw new Error("Property type is required");
  }

  if (payload.year_built < 1600 || payload.year_built > currentYear) {
    throw new Error(`Year built must be between 1600 and ${currentYear}`);
  }

  if (payload.square_meters <= 0) {
    throw new Error("Square meters must be greater than 0");
  }
};

const validateRoomPayload = (payload) => {
  if (!payload.home_id) {
    throw new Error("Choose a home before creating a room");
  }

  if (!homes.some((home) => home.id === payload.home_id)) {
    throw new Error("Selected home was not found");
  }

  if (!payload.name || payload.name.length < 2) {
    throw new Error("Room name must be at least 2 characters");
  }

  if (!payload.room_type) {
    throw new Error("Room type is required");
  }
};

const validateDocumentPayload = (payload, file) => {
  const maxFileSize = 20 * 1024 * 1024;
  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
    "image/heic",
    "image/heif",
    "application/pdf",
  ];

  if (!payload.home_id) {
    throw new Error("Choose a home for this document");
  }

  if (!payload.room_id) {
    throw new Error("Choose a room for this document");
  }

  if (!rooms.some((room) => room.id === payload.room_id && room.home_id === payload.home_id)) {
    throw new Error("Selected room does not belong to the selected home");
  }

  if (!payload.document_type) {
    throw new Error("Document type is required");
  }

  if (!file) {
    throw new Error("Choose a file to upload");
  }

  if (file.size > maxFileSize) {
    throw new Error("File must be 20 MB or smaller");
  }

  if (!allowedTypes.includes(file.type)) {
    throw new Error("Upload an image or PDF file");
  }
};

const validateTimelinePayload = (payload) => {
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  const eventDate = new Date(`${payload.event_date}T00:00:00`);

  if (!payload.home_id) {
    throw new Error("Choose a home for this event");
  }

  if (!homes.some((home) => home.id === payload.home_id)) {
    throw new Error("Selected home was not found");
  }

  if (payload.room_id && !rooms.some((room) => room.id === payload.room_id && room.home_id === payload.home_id)) {
    throw new Error("Selected room does not belong to the selected home");
  }

  if (!payload.event_date || Number.isNaN(eventDate.getTime())) {
    throw new Error("Choose a valid event date");
  }

  if (eventDate > today) {
    throw new Error("Timeline events cannot be in the future");
  }

  if (!payload.event_type) {
    throw new Error("Event type is required");
  }

  if (!payload.title || payload.title.length < 3) {
    throw new Error("Event title must be at least 3 characters");
  }
};

const renderEmptyState = (container, message) => {
  container.replaceChildren();
  const emptyState = document.createElement("p");
  emptyState.className = "empty-state";
  emptyState.textContent = message;
  container.append(emptyState);
};

const populateRoomHomeSelect = () => {
  const selectedHomeId = roomHomeSelect.value;
  roomHomeSelect.replaceChildren();

  const placeholder = document.createElement("option");
  placeholder.value = "";
  placeholder.textContent = homes.length ? "Select home" : "Add a home first";
  roomHomeSelect.append(placeholder);

  for (const home of homes) {
    const option = document.createElement("option");
    option.value = home.id;
    option.textContent = home.address;
    roomHomeSelect.append(option);
  }

  roomHomeSelect.value = homes.some((home) => home.id === selectedHomeId)
    ? selectedHomeId
    : "";
  roomHomeSelect.disabled = !homes.length;
  roomNameInput.disabled = !homes.length;
  roomTypeSelect.disabled = !homes.length;
  saveRoomButton.disabled = !homes.length;
};

const populateDocumentHomeSelect = () => {
  const selectedHomeId = documentHomeSelect.value;
  documentHomeSelect.replaceChildren();

  const placeholder = document.createElement("option");
  placeholder.value = "";
  placeholder.textContent = homes.length ? "Select home" : "Add a home first";
  documentHomeSelect.append(placeholder);

  for (const home of homes) {
    const option = document.createElement("option");
    option.value = home.id;
    option.textContent = home.address;
    documentHomeSelect.append(option);
  }

  documentHomeSelect.value = homes.some((home) => home.id === selectedHomeId)
    ? selectedHomeId
    : "";
};

const populateDocumentRoomSelect = () => {
  const selectedRoomId = documentRoomSelect.value;
  const selectedHomeId = documentHomeSelect.value;
  const selectableRooms = rooms.filter((room) => room.home_id === selectedHomeId);

  documentRoomSelect.replaceChildren();

  const placeholder = document.createElement("option");
  placeholder.value = "";
  placeholder.textContent = selectedHomeId
    ? selectableRooms.length
      ? "Select room"
      : "Add a room first"
    : "Select home first";
  documentRoomSelect.append(placeholder);

  for (const room of selectableRooms) {
    const option = document.createElement("option");
    option.value = room.id;
    option.textContent = room.name;
    documentRoomSelect.append(option);
  }

  documentRoomSelect.value = selectableRooms.some((room) => room.id === selectedRoomId)
    ? selectedRoomId
    : "";

  const hasSelectableRoom = Boolean(selectableRooms.length);
  documentRoomSelect.disabled = !hasSelectableRoom;
  documentTypeSelect.disabled = !hasSelectableRoom;
  documentTitleInput.disabled = !hasSelectableRoom;
  documentFileInput.disabled = !hasSelectableRoom;
  uploadDocumentButton.disabled = !hasSelectableRoom;
};

const populateDocumentSelects = () => {
  populateDocumentHomeSelect();
  populateDocumentRoomSelect();
};

const populateTimelineHomeSelect = () => {
  const selectedHomeId = timelineHomeSelect.value;
  timelineHomeSelect.replaceChildren();

  const placeholder = document.createElement("option");
  placeholder.value = "";
  placeholder.textContent = homes.length ? "Select home" : "Add a home first";
  timelineHomeSelect.append(placeholder);

  for (const home of homes) {
    const option = document.createElement("option");
    option.value = home.id;
    option.textContent = home.address;
    timelineHomeSelect.append(option);
  }

  timelineHomeSelect.value = homes.some((home) => home.id === selectedHomeId)
    ? selectedHomeId
    : "";
};

const populateTimelineRoomSelect = () => {
  const selectedRoomId = timelineRoomSelect.value;
  const selectedHomeId = timelineHomeSelect.value;
  const selectableRooms = rooms.filter((room) => room.home_id === selectedHomeId);

  timelineRoomSelect.replaceChildren();

  const placeholder = document.createElement("option");
  placeholder.value = "";
  placeholder.textContent = "Whole home";
  timelineRoomSelect.append(placeholder);

  for (const room of selectableRooms) {
    const option = document.createElement("option");
    option.value = room.id;
    option.textContent = room.name;
    timelineRoomSelect.append(option);
  }

  timelineRoomSelect.value = selectableRooms.some((room) => room.id === selectedRoomId)
    ? selectedRoomId
    : "";

  const hasHome = Boolean(selectedHomeId);
  timelineHomeSelect.disabled = !homes.length;
  timelineRoomSelect.disabled = !hasHome || !selectableRooms.length;
  timelineDateInput.disabled = !homes.length;
  timelineTypeSelect.disabled = !homes.length;
  timelineTitleInput.disabled = !homes.length;
  timelineDescriptionInput.disabled = !homes.length;
  saveTimelineEventButton.disabled = !homes.length;
};

const populateTimelineSelects = () => {
  populateTimelineHomeSelect();
  populateTimelineRoomSelect();
};

const renderHomes = () => {
  homesList.replaceChildren();

  if (!homes.length) {
    renderEmptyState(homesList, "No homes added yet.");
    return;
  }

  for (const home of homes) {
    const roomCount = rooms.filter((room) => room.home_id === home.id).length;
    const eventCount = timelineEvents.filter((event) => event.home_id === home.id).length;
    const card = document.createElement("article");
    const details = document.createElement("div");
    const address = document.createElement("h3");
    const meta = document.createElement("p");
    const size = document.createElement("strong");
    const actionsDiv = document.createElement("div");
    const deleteBtn = document.createElement("button");

    card.className = "home-card";
    address.textContent = home.address;
    meta.textContent = `${home.property_type} - Built ${home.year_built} - ${roomCount} room${roomCount === 1 ? "" : "s"} - ${eventCount} event${eventCount === 1 ? "" : "s"}`;
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

const renderRooms = () => {
  roomsList.replaceChildren();

  if (!homes.length) {
    renderEmptyState(roomsList, "Add a home before adding rooms.");
    return;
  }

  if (!rooms.length) {
    renderEmptyState(roomsList, "No rooms added yet.");
    return;
  }

  for (const room of rooms) {
    const roomDocuments = documents.filter((document) => document.room_id === room.id);
    const card = document.createElement("article");
    const details = document.createElement("div");
    const name = document.createElement("h3");
    const meta = document.createElement("p");
    const documentList = document.createElement("div");
    const actionsDiv = document.createElement("div");
    const deleteBtn = document.createElement("button");

    card.className = "room-card";
    name.textContent = room.name;
    meta.textContent = `${room.room_type} - ${getHomeAddress(room.home_id)} - ${roomDocuments.length} document${roomDocuments.length === 1 ? "" : "s"}`;

    documentList.className = "document-list";

    if (roomDocuments.length) {
      for (const doc of roomDocuments) {
        const documentItem = document.createElement("div");
        const documentInfo = document.createElement("button");
        const documentMeta = document.createElement("span");
        const documentDeleteBtn = document.createElement("button");

        documentItem.className = "document-item";
        documentInfo.className = "document-link";
        documentInfo.type = "button";
        documentInfo.textContent = doc.title;
        documentInfo.addEventListener("click", () => handleOpenDocument(doc));

        documentMeta.textContent = `${doc.document_type}${doc.file_size ? ` - ${formatFileSize(doc.file_size)}` : ""}`;

        documentDeleteBtn.className = "text-danger-button";
        documentDeleteBtn.type = "button";
        documentDeleteBtn.textContent = "Delete";
        documentDeleteBtn.addEventListener("click", () => handleDeleteDocument(doc));

        documentItem.append(documentInfo, documentMeta, documentDeleteBtn);
        documentList.append(documentItem);
      }
    } else {
      const emptyDocuments = document.createElement("p");
      emptyDocuments.className = "document-empty";
      emptyDocuments.textContent = "No documentation attached yet.";
      documentList.append(emptyDocuments);
    }

    actionsDiv.className = "home-card-actions";
    deleteBtn.className = "delete-button";
    deleteBtn.textContent = "Delete";
    deleteBtn.type = "button";
    deleteBtn.addEventListener("click", () => handleDeleteRoom(room.id));

    details.append(name, meta, documentList);
    actionsDiv.append(deleteBtn);
    card.append(details, actionsDiv);
    roomsList.append(card);
  }
};

const renderTimeline = () => {
  timelineList.replaceChildren();

  if (!homes.length) {
    renderEmptyState(timelineList, "Add a home before adding timeline events.");
    return;
  }

  if (!timelineEvents.length) {
    renderEmptyState(timelineList, "No timeline events yet.");
    return;
  }

  let activeYear = "";

  for (const event of timelineEvents) {
    const eventYear = event.event_date.slice(0, 4);

    if (eventYear !== activeYear) {
      activeYear = eventYear;
      const yearHeading = document.createElement("h3");
      yearHeading.className = "timeline-year";
      yearHeading.textContent = eventYear;
      timelineList.append(yearHeading);
    }

    const item = document.createElement("article");
    const marker = document.createElement("div");
    const content = document.createElement("div");
    const header = document.createElement("div");
    const title = document.createElement("h4");
    const meta = document.createElement("p");
    const description = document.createElement("p");
    const deleteBtn = document.createElement("button");

    item.className = "timeline-item";
    marker.className = "timeline-marker";
    content.className = "timeline-content";
    header.className = "timeline-item-header";
    title.textContent = event.title;
    meta.textContent = `${formatTimelineDate(event.event_date)} - ${event.event_type} - ${getHomeAddress(event.home_id)}${event.room_id ? ` - ${getRoomName(event.room_id)}` : ""}`;
    deleteBtn.className = "text-danger-button";
    deleteBtn.type = "button";
    deleteBtn.textContent = "Delete";
    deleteBtn.addEventListener("click", () => handleDeleteTimelineEvent(event.id));

    header.append(title, deleteBtn);
    content.append(header, meta);

    if (event.description) {
      description.className = "timeline-description";
      description.textContent = event.description;
      content.append(description);
    }

    item.append(marker, content);
    timelineList.append(item);
  }
};

const loadHomes = async () => {
  const { data, error } = await supabase
    .from("homes")
    .select("id,address,property_type,year_built,square_meters,created_at")
    .eq("owner_id", currentUser.id)
    .order("created_at", { ascending: false });

  if (error) {
    renderEmptyState(homesList, "Could not load homes yet.");
    setHomeStatus(`Database error: ${error.message}`, "error");
    return false;
  }

  homes = data ?? [];
  populateRoomHomeSelect();
  populateDocumentSelects();
  populateTimelineSelects();
  return true;
};

const loadRooms = async () => {
  if (!homes.length) {
    rooms = [];
    documents = [];
    timelineEvents = [];
    populateDocumentSelects();
    populateTimelineSelects();
    renderHomes();
    renderRooms();
    renderTimeline();
    return true;
  }

  const { data, error } = await supabase
    .from("rooms")
    .select("id,home_id,name,room_type,created_at")
    .eq("owner_id", currentUser.id)
    .order("created_at", { ascending: true });

  if (error) {
    renderEmptyState(roomsList, "Could not load rooms yet.");
    setRoomStatus(`Database error: ${error.message}`, "error");
    return false;
  }

  rooms = data ?? [];
  populateDocumentSelects();
  populateTimelineSelects();
  return true;
};

const loadDocuments = async () => {
  if (!rooms.length) {
    documents = [];
    renderHomes();
    renderRooms();
    return true;
  }

  const { data, error } = await supabase
    .from("room_documents")
    .select("id,home_id,room_id,title,document_type,file_name,file_size,mime_type,storage_bucket,storage_path,created_at")
    .eq("owner_id", currentUser.id)
    .order("created_at", { ascending: false });

  if (error) {
    documents = [];
    setDocumentStatus(`Database error: ${error.message}`, "error");
    renderHomes();
    renderRooms();
    return false;
  }

  documents = data ?? [];
  renderHomes();
  renderRooms();
  return true;
};

const loadTimelineEvents = async () => {
  if (!homes.length) {
    timelineEvents = [];
    renderTimeline();
    return true;
  }

  const { data, error } = await supabase
    .from("timeline_events")
    .select("id,home_id,room_id,event_date,event_type,title,description,created_at")
    .eq("owner_id", currentUser.id)
    .order("event_date", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    timelineEvents = [];
    renderEmptyState(timelineList, "Could not load timeline yet.");
    setTimelineStatus(`Database error: ${error.message}`, "error");
    return false;
  }

  timelineEvents = data ?? [];
  renderHomes();
  renderTimeline();
  return true;
};

const refreshDashboard = async () => {
  if (!currentUser?.id) {
    setHomeStatus("User session lost. Please log in again.", "error");
    window.location.href = "./index.html";
    return;
  }

  const homesLoaded = await loadHomes();
  if (homesLoaded) {
    const roomsLoaded = await loadRooms();
    if (roomsLoaded) {
      await loadDocuments();
      await loadTimelineEvents();
    }
  }
};

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

const getRoomPayload = () => {
  const payload = {
    owner_id: currentUser.id,
    home_id: roomHomeSelect.value,
    name: roomNameInput.value.trim(),
    room_type: roomTypeSelect.value,
  };

  validateRoomPayload(payload);
  return payload;
};

const sanitizeFileName = (fileName) => {
  return fileName
    .trim()
    .replace(/[^a-zA-Z0-9._-]/g, "-")
    .replace(/-+/g, "-")
    .toLowerCase();
};

const createUploadId = () => {
  if (globalThis.crypto?.randomUUID) {
    return globalThis.crypto.randomUUID();
  }

  if (globalThis.crypto?.getRandomValues) {
    const values = new Uint32Array(4);
    globalThis.crypto.getRandomValues(values);
    return Array.from(values, (value) => value.toString(16).padStart(8, "0")).join("");
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

const getDocumentPayload = () => {
  const file = documentFileInput.files[0];
  const title = documentTitleInput.value.trim() || file?.name || "Untitled document";
  const payload = {
    owner_id: currentUser.id,
    home_id: documentHomeSelect.value,
    room_id: documentRoomSelect.value,
    title,
    document_type: documentTypeSelect.value,
  };

  validateDocumentPayload(payload, file);
  return { payload, file };
};

const getTimelinePayload = () => {
  const payload = {
    owner_id: currentUser.id,
    home_id: timelineHomeSelect.value,
    room_id: timelineRoomSelect.value || null,
    event_date: timelineDateInput.value,
    event_type: timelineTypeSelect.value,
    title: timelineTitleInput.value.trim(),
    description: timelineDescriptionInput.value.trim() || null,
  };

  validateTimelinePayload(payload);
  return payload;
};

const handleCreateHome = async (event) => {
  event.preventDefault();
  setHomeStatus("");

  const inputs = homeForm.querySelectorAll("input, select, button");
  inputs.forEach((input) => {
    input.disabled = true;
  });
  saveHomeButton.textContent = "Creating...";

  try {
    const payload = getHomePayload();
    const { error } = await supabase.from("homes").insert(payload);

    if (error) {
      setHomeStatus(error.message, "error");
      return;
    }

    homeForm.reset();
    setHomeStatus("Home created successfully!", "success");
    await refreshDashboard();
  } catch (err) {
    setHomeStatus(err.message, "error");
  } finally {
    inputs.forEach((input) => {
      input.disabled = false;
    });
    saveHomeButton.textContent = "Create home";
    populateRoomHomeSelect();
  }
};

const handleCreateRoom = async (event) => {
  event.preventDefault();
  setRoomStatus("");

  const inputs = roomForm.querySelectorAll("input, select, button");
  inputs.forEach((input) => {
    input.disabled = true;
  });
  saveRoomButton.textContent = "Creating...";

  try {
    const payload = getRoomPayload();
    const { error } = await supabase.from("rooms").insert(payload);

    if (error) {
      setRoomStatus(error.message, "error");
      return;
    }

    const selectedHomeId = roomHomeSelect.value;
    roomForm.reset();
    roomHomeSelect.value = selectedHomeId;
    setRoomStatus("Room created successfully!", "success");
    await refreshDashboard();
  } catch (err) {
    setRoomStatus(err.message, "error");
  } finally {
    inputs.forEach((input) => {
      input.disabled = false;
    });
    saveRoomButton.textContent = "Create room";
    populateRoomHomeSelect();
  }
};

const handleUploadDocument = async (event) => {
  event.preventDefault();
  setDocumentStatus("");

  const inputs = documentForm.querySelectorAll("input, select, button");
  inputs.forEach((input) => {
    input.disabled = true;
  });
  uploadDocumentButton.textContent = "Uploading...";

  let uploadedPath = "";

  try {
    const { payload, file } = getDocumentPayload();
    const safeFileName = sanitizeFileName(file.name);
    const storagePath = `${currentUser.id}/${payload.home_id}/${payload.room_id}/${createUploadId()}-${safeFileName}`;

    const { error: uploadError } = await supabase.storage
      .from("room-documents")
      .upload(storagePath, file, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      setDocumentStatus(uploadError.message, "error");
      return;
    }

    uploadedPath = storagePath;

    const { error: insertError } = await supabase.from("room_documents").insert({
      ...payload,
      file_name: file.name,
      file_size: file.size,
      mime_type: file.type,
      storage_bucket: "room-documents",
      storage_path: storagePath,
    });

    if (insertError) {
      await supabase.storage.from("room-documents").remove([uploadedPath]);
      setDocumentStatus(insertError.message, "error");
      return;
    }

    const selectedHomeId = documentHomeSelect.value;
    const selectedRoomId = documentRoomSelect.value;
    documentForm.reset();
    documentHomeSelect.value = selectedHomeId;
    populateDocumentRoomSelect();
    documentRoomSelect.value = selectedRoomId;
    setDocumentStatus("Documentation uploaded successfully!", "success");
    await refreshDashboard();
  } catch (err) {
    if (uploadedPath) {
      await supabase.storage.from("room-documents").remove([uploadedPath]);
    }
    setDocumentStatus(err.message, "error");
  } finally {
    inputs.forEach((input) => {
      input.disabled = false;
    });
    uploadDocumentButton.textContent = "Upload";
    populateDocumentSelects();
  }
};

const handleOpenDocument = async (doc) => {
  setDocumentStatus("");
  const documentWindow = window.open("about:blank", "_blank");

  if (documentWindow) {
    documentWindow.opener = null;
  }

  const { data, error } = await supabase.storage
    .from(doc.storage_bucket)
    .createSignedUrl(doc.storage_path, 60);

  if (error) {
    documentWindow?.close();
    setDocumentStatus(`Could not open document: ${error.message}`, "error");
    return;
  }

  if (documentWindow) {
    documentWindow.location.href = data.signedUrl;
  } else {
    const openedWindow = window.open(data.signedUrl, "_blank", "noopener");
    if (!openedWindow) {
      setDocumentStatus("Your browser blocked the document window. Allow pop-ups and try again.", "error");
    }
  }
};

const handleCreateTimelineEvent = async (event) => {
  event.preventDefault();
  setTimelineStatus("");

  const inputs = timelineForm.querySelectorAll("input, select, textarea, button");
  inputs.forEach((input) => {
    input.disabled = true;
  });
  saveTimelineEventButton.textContent = "Adding...";

  try {
    const payload = getTimelinePayload();
    const { error } = await supabase.from("timeline_events").insert(payload);

    if (error) {
      setTimelineStatus(error.message, "error");
      return;
    }

    const selectedHomeId = timelineHomeSelect.value;
    const selectedRoomId = timelineRoomSelect.value;
    timelineForm.reset();
    timelineHomeSelect.value = selectedHomeId;
    populateTimelineRoomSelect();
    timelineRoomSelect.value = selectedRoomId;
    setTimelineStatus("Timeline event added successfully!", "success");
    await refreshDashboard();
  } catch (err) {
    setTimelineStatus(err.message, "error");
  } finally {
    inputs.forEach((input) => {
      input.disabled = false;
    });
    saveTimelineEventButton.textContent = "Add event";
    populateTimelineSelects();
  }
};

const handleDeleteHome = async (homeId) => {
  if (!confirm("Are you sure you want to delete this home? Its rooms will also be deleted.")) {
    return;
  }

  setHomeStatus("");
  const homeDocuments = documents.filter((doc) => doc.home_id === homeId);
  const { error } = await supabase.from("homes").delete().eq("id", homeId);

  if (error) {
    setHomeStatus(`Failed to delete: ${error.message}`, "error");
    return;
  }

  if (homeDocuments.length) {
    const { error: storageError } = await supabase.storage
      .from("room-documents")
      .remove(homeDocuments.map((doc) => doc.storage_path));

    if (storageError) {
      setDocumentStatus(`Home deleted, but document cleanup failed: ${storageError.message}`, "error");
    }
  }

  setHomeStatus("Home deleted successfully!", "success");
  await refreshDashboard();
};

const handleDeleteDocument = async (doc) => {
  if (!confirm("Are you sure you want to delete this document?")) {
    return;
  }

  setDocumentStatus("");

  const { error: deleteError } = await supabase
    .from("room_documents")
    .delete()
    .eq("id", doc.id);

  if (deleteError) {
    setDocumentStatus(`Failed to delete: ${deleteError.message}`, "error");
    return;
  }

  const { error: storageError } = await supabase.storage
    .from(doc.storage_bucket)
    .remove([doc.storage_path]);

  if (storageError) {
    setDocumentStatus(`Metadata deleted, but file cleanup failed: ${storageError.message}`, "error");
    await refreshDashboard();
    return;
  }

  setDocumentStatus("Document deleted successfully!", "success");
  await refreshDashboard();
};

const handleDeleteRoom = async (roomId) => {
  if (!confirm("Are you sure you want to delete this room?")) {
    return;
  }

  setRoomStatus("");
  const roomDocuments = documents.filter((doc) => doc.room_id === roomId);
  const { error } = await supabase.from("rooms").delete().eq("id", roomId);

  if (error) {
    setRoomStatus(`Failed to delete: ${error.message}`, "error");
    return;
  }

  if (roomDocuments.length) {
    const { error: storageError } = await supabase.storage
      .from("room-documents")
      .remove(roomDocuments.map((doc) => doc.storage_path));

    if (storageError) {
      setDocumentStatus(`Room deleted, but document cleanup failed: ${storageError.message}`, "error");
    }
  }

  setRoomStatus("Room deleted successfully!", "success");
  await refreshDashboard();
};

const handleDeleteTimelineEvent = async (eventId) => {
  if (!confirm("Are you sure you want to delete this timeline event?")) {
    return;
  }

  setTimelineStatus("");
  const { error } = await supabase.from("timeline_events").delete().eq("id", eventId);

  if (error) {
    setTimelineStatus(`Failed to delete: ${error.message}`, "error");
    return;
  }

  setTimelineStatus("Timeline event deleted successfully!", "success");
  await refreshDashboard();
};

const initDashboard = async () => {
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    window.location.href = "./index.html";
    return;
  }

  currentUser = data.user;
  await refreshDashboard();
};

logoutButton.addEventListener("click", async () => {
  await supabase.auth.signOut();
  window.location.href = "./index.html";
});

homeForm.addEventListener("submit", handleCreateHome);
roomForm.addEventListener("submit", handleCreateRoom);
documentForm.addEventListener("submit", handleUploadDocument);
documentHomeSelect.addEventListener("change", populateDocumentRoomSelect);
timelineForm.addEventListener("submit", handleCreateTimelineEvent);
timelineHomeSelect.addEventListener("change", populateTimelineRoomSelect);

initDashboard();
