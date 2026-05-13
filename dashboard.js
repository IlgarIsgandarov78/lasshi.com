import { supabase } from "./supabase.js";

const pageTitle = document.getElementById("pageTitle");
const logoutButton = document.getElementById("logout");

const views = {
  homes: document.getElementById("homesView"),
  home: document.getElementById("homeView"),
  room: document.getElementById("roomView"),
};

const homesGrid = document.getElementById("homesGrid");
const globalSearchInput = document.getElementById("globalSearch");
const clearSearchButton = document.getElementById("clearSearch");
const searchResults = document.getElementById("searchResults");
const homeDetailMeta = document.getElementById("homeDetailMeta");
const homeDetailTitle = document.getElementById("homeDetailTitle");
const homeDetailInfo = document.getElementById("homeDetailInfo");
const homeRoomCount = document.getElementById("homeRoomCount");
const homeDocumentCount = document.getElementById("homeDocumentCount");
const homeEventCount = document.getElementById("homeEventCount");
const homeHealthScore = document.getElementById("homeHealthScore");
const homeHealthSummary = document.getElementById("homeHealthSummary");
const homeHealthList = document.getElementById("homeHealthList");
const homeRoomsGrid = document.getElementById("homeRoomsGrid");
const homeDocumentsList = document.getElementById("homeDocumentsList");
const homeTimelineList = document.getElementById("homeTimelineList");

const roomDetailHome = document.getElementById("roomDetailHome");
const roomDetailTitle = document.getElementById("roomDetailTitle");
const roomDetailMeta = document.getElementById("roomDetailMeta");
const roomDetailInfrastructureCount = document.getElementById("roomDetailInfrastructureCount");
const roomDetailDocumentCount = document.getElementById("roomDetailDocumentCount");
const roomDetailEventCount = document.getElementById("roomDetailEventCount");
const roomDetailInfrastructure = document.getElementById("roomDetailInfrastructure");
const roomDetailDocuments = document.getElementById("roomDetailDocuments");
const roomDetailTimeline = document.getElementById("roomDetailTimeline");

const modalBackdrop = document.getElementById("modalBackdrop");
const modals = {
  home: document.getElementById("homeModal"),
  room: document.getElementById("roomModal"),
  document: document.getElementById("documentModal"),
  timeline: document.getElementById("timelineModal"),
  infrastructure: document.getElementById("infrastructureModal"),
};

const homeForm = document.getElementById("homeForm");
const homeStatus = document.getElementById("homeStatus");
const saveHomeButton = document.getElementById("saveHome");

const roomForm = document.getElementById("roomForm");
const roomHomeSelect = document.getElementById("roomHomeId");
const roomNameInput = document.getElementById("roomName");
const roomTypeSelect = document.getElementById("roomType");
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
const timelineDocumentSelect = document.getElementById("timelineDocumentIds");
const timelineStatus = document.getElementById("timelineStatus");
const saveTimelineEventButton = document.getElementById("saveTimelineEvent");

const infrastructureForm = document.getElementById("infrastructureForm");
const infrastructureHomeSelect = document.getElementById("infrastructureHomeId");
const infrastructureRoomSelect = document.getElementById("infrastructureRoomId");
const infrastructureTypeSelect = document.getElementById("infrastructureType");
const infrastructureTitleInput = document.getElementById("infrastructureTitle");
const infrastructureLocationInput = document.getElementById("infrastructureLocation");
const infrastructureRiskSelect = document.getElementById("infrastructureRisk");
const infrastructureConfidenceSelect = document.getElementById("infrastructureConfidence");
const infrastructureDocumentSelect = document.getElementById("infrastructureDocumentId");
const infrastructureNotesInput = document.getElementById("infrastructureNotes");
const infrastructureStatus = document.getElementById("infrastructureStatus");
const saveInfrastructureButton = document.getElementById("saveInfrastructure");

let currentUser = null;
let homes = [];
let rooms = [];
let documents = [];
let timelineEvents = [];
let timelineDocumentLinks = [];
let infrastructureItems = [];
let selectedHomeId = null;
let selectedRoomId = null;

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

const showActionError = (message) => {
  alert(message || "Something went wrong. Please try again.");
};

const getDashboardErrorMessage = (error) => {
  const message = error?.message ?? "Something went wrong while loading the dashboard.";

  if (message.includes("room_infrastructure")) {
    return "Infrastructure table is missing. Run schema.sql in Supabase SQL Editor, then refresh this page.";
  }

  if (message.includes("timeline_event_documents")) {
    return "Timeline evidence table is missing. Run schema.sql in Supabase SQL Editor, then refresh this page.";
  }

  return message;
};

const clearModalStatuses = () => {
  [homeStatus, roomStatus, documentStatus, timelineStatus, infrastructureStatus].forEach((status) => {
    setStatus(status, "");
  });
};

const getSelectedHome = () => homes.find((home) => home.id === selectedHomeId);
const getSelectedRoom = () => rooms.find((room) => room.id === selectedRoomId);
const getHomeRooms = (homeId) => rooms.filter((room) => room.home_id === homeId);
const getHomeDocuments = (homeId) => documents.filter((doc) => doc.home_id === homeId);
const getHomeEvents = (homeId) => timelineEvents.filter((event) => event.home_id === homeId);
const getHomeInfrastructure = (homeId) => infrastructureItems.filter((item) => item.home_id === homeId);
const getRoomDocuments = (roomId) => documents.filter((doc) => doc.room_id === roomId);
const getRoomEvents = (roomId) => timelineEvents.filter((event) => event.room_id === roomId);
const getRoomInfrastructure = (roomId) => infrastructureItems.filter((item) => item.room_id === roomId);
const getHomeAddress = (homeId) => homes.find((home) => home.id === homeId)?.address ?? "Unknown home";
const getRoomName = (roomId) => rooms.find((room) => room.id === roomId)?.name ?? "Whole home";
const getDocumentTitle = (documentId) => documents.find((doc) => doc.id === documentId)?.title ?? "";
const getEventDocumentLinks = (eventId) => timelineDocumentLinks.filter((link) => link.event_id === eventId);
const getEventDocuments = (eventId) => {
  const eventDocumentIds = new Set(getEventDocumentLinks(eventId).map((link) => link.document_id));
  return documents.filter((doc) => eventDocumentIds.has(doc.id));
};

const formatSquareMeters = (value) => {
  const number = Number(value);
  return Number.isInteger(number) ? number : number.toFixed(1);
};

const formatFileSize = (bytes) => {
  if (!bytes) return "";

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

const showView = (viewName) => {
  for (const [name, view] of Object.entries(views)) {
    view.classList.toggle("active", name === viewName);
  }

  pageTitle.textContent = {
    homes: "Your homes",
    home: "Home detail",
    room: "Room detail",
  }[viewName];

  window.scrollTo({ top: 0, behavior: "smooth" });
};

const openModal = (name) => {
  modalBackdrop.classList.remove("hidden");
  modalBackdrop.setAttribute("aria-hidden", "false");

  for (const [modalName, modal] of Object.entries(modals)) {
    modal.classList.toggle("hidden", modalName !== name);
  }
};

const closeModal = () => {
  modalBackdrop.classList.add("hidden");
  modalBackdrop.setAttribute("aria-hidden", "true");

  for (const modal of Object.values(modals)) {
    modal.classList.add("hidden");
  }
};

const renderEmptyState = (container, title, detail = "") => {
  container.replaceChildren();

  const empty = document.createElement("div");
  const heading = document.createElement("strong");
  const copy = document.createElement("span");

  empty.className = "empty-state";
  heading.textContent = title;
  copy.textContent = detail;

  empty.append(heading);
  if (detail) empty.append(copy);
  container.append(empty);
};

const createStatLine = (items) => items.filter(Boolean).join(" - ");

const normalizeText = (value) => String(value ?? "").toLowerCase().trim();

const getSelectedValues = (select) => Array.from(select.selectedOptions).map((option) => option.value).filter(Boolean);

const createInfrastructureItem = (item) => {
  const article = document.createElement("article");
  const details = document.createElement("div");
  const header = document.createElement("div");
  const title = document.createElement("h4");
  const risk = document.createElement("span");
  const meta = document.createElement("p");
  const location = document.createElement("p");
  const deleteButton = document.createElement("button");

  article.className = "list-item infrastructure-item";
  header.className = "item-header";
  title.textContent = item.title;
  risk.className = `risk-pill risk-${item.risk_level.toLowerCase()}`;
  risk.textContent = `${item.risk_level} risk`;

  meta.textContent = createStatLine([
    item.infrastructure_type,
    `${item.confidence_level} confidence`,
    item.source_document_id ? `Evidence: ${getDocumentTitle(item.source_document_id) || "Linked document"}` : "",
  ]);

  location.className = "item-description";
  location.textContent = item.location_note;

  header.append(title, risk);
  details.append(header, meta, location);

  if (item.notes) {
    const notes = document.createElement("p");
    notes.className = "item-description";
    notes.textContent = item.notes;
    details.append(notes);
  }

  deleteButton.className = "danger-text-button";
  deleteButton.type = "button";
  deleteButton.textContent = "Delete";
  deleteButton.addEventListener("click", () => handleDeleteInfrastructure(item.id));

  article.append(details, deleteButton);
  return article;
};

const createDocumentItem = (doc) => {
  const item = document.createElement("article");
  const details = document.createElement("div");
  const title = document.createElement("button");
  const meta = document.createElement("p");
  const deleteButton = document.createElement("button");

  item.className = "list-item";
  title.className = "link-button";
  title.type = "button";
  title.textContent = doc.title;
  title.addEventListener("click", () => handleOpenDocument(doc));

  meta.textContent = createStatLine([
    doc.document_type,
    getRoomName(doc.room_id),
    doc.file_size ? formatFileSize(doc.file_size) : "",
  ]);

  deleteButton.className = "danger-text-button";
  deleteButton.type = "button";
  deleteButton.textContent = "Delete";
  deleteButton.addEventListener("click", () => handleDeleteDocument(doc));

  details.append(title, meta);
  item.append(details, deleteButton);
  return item;
};

const createTimelineItem = (event) => {
  const linkedDocuments = getEventDocuments(event.id);
  const item = document.createElement("article");
  const details = document.createElement("div");
  const title = document.createElement("h4");
  const meta = document.createElement("p");
  const deleteButton = document.createElement("button");

  item.className = "list-item timeline-list-item";
  title.textContent = event.title;
  meta.textContent = createStatLine([
    formatTimelineDate(event.event_date),
    event.event_type,
    event.room_id ? getRoomName(event.room_id) : "Whole home",
  ]);

  details.append(title, meta);

  if (event.description) {
    const description = document.createElement("p");
    description.className = "item-description";
    description.textContent = event.description;
    details.append(description);
  }

  if (linkedDocuments.length) {
    const evidence = document.createElement("div");
    const label = document.createElement("p");

    evidence.className = "evidence-list";
    label.className = "evidence-label";
    label.textContent = "Evidence";
    evidence.append(label);

    for (const doc of linkedDocuments) {
      const documentButton = document.createElement("button");
      documentButton.className = "evidence-chip";
      documentButton.type = "button";
      documentButton.textContent = doc.title;
      documentButton.addEventListener("click", () => handleOpenDocument(doc));
      evidence.append(documentButton);
    }

    details.append(evidence);
  }

  deleteButton.className = "danger-text-button";
  deleteButton.type = "button";
  deleteButton.textContent = "Delete";
  deleteButton.addEventListener("click", () => handleDeleteTimelineEvent(event.id));

  item.append(details, deleteButton);
  return item;
};

const createRoomCard = (room) => {
  const roomInfrastructure = getRoomInfrastructure(room.id);
  const roomDocuments = getRoomDocuments(room.id);
  const roomEvents = getRoomEvents(room.id);
  const card = document.createElement("article");
  const details = document.createElement("div");
  const title = document.createElement("h3");
  const meta = document.createElement("p");
  const actions = document.createElement("div");
  const openButton = document.createElement("button");
  const deleteButton = document.createElement("button");

  card.className = "room-card";
  title.textContent = room.name;
  meta.textContent = createStatLine([
    room.room_type,
    `${roomInfrastructure.length} infrastructure`,
    `${roomDocuments.length} document${roomDocuments.length === 1 ? "" : "s"}`,
    `${roomEvents.length} event${roomEvents.length === 1 ? "" : "s"}`,
  ]);

  openButton.className = "secondary-button compact-button";
  openButton.type = "button";
  openButton.textContent = "Open";
  openButton.addEventListener("click", () => navigateToRoom(room.id));

  deleteButton.className = "danger-button compact-button";
  deleteButton.type = "button";
  deleteButton.textContent = "Delete";
  deleteButton.addEventListener("click", () => handleDeleteRoom(room.id));

  details.append(title, meta);
  actions.className = "card-actions";
  actions.append(openButton, deleteButton);
  card.append(details, actions);
  return card;
};

const renderHomes = () => {
  homesGrid.replaceChildren();

  if (!homes.length) {
    renderEmptyState(homesGrid, "No homes yet", "Add your first property to start building its digital memory.");
    return;
  }

  for (const home of homes) {
    const homeRooms = getHomeRooms(home.id);
    const homeDocuments = getHomeDocuments(home.id);
    const homeEvents = getHomeEvents(home.id);
    const card = document.createElement("article");
    const header = document.createElement("div");
    const title = document.createElement("h3");
    const meta = document.createElement("p");
    const stats = document.createElement("div");
    const openButton = document.createElement("button");
    const deleteButton = document.createElement("button");
    const actions = document.createElement("div");

    card.className = "home-card";
    title.textContent = home.address;
    meta.textContent = `${home.property_type} - Built ${home.year_built} - ${formatSquareMeters(home.square_meters)} m2`;

    stats.className = "mini-stats";
    stats.innerHTML = `
      <span>${homeRooms.length} rooms</span>
      <span>${homeDocuments.length} docs</span>
      <span>${homeEvents.length} events</span>
    `;

    openButton.className = "primary-button";
    openButton.type = "button";
    openButton.textContent = "Open home";
    openButton.addEventListener("click", () => navigateToHome(home.id));

    deleteButton.className = "danger-text-button";
    deleteButton.type = "button";
    deleteButton.textContent = "Delete";
    deleteButton.addEventListener("click", () => handleDeleteHome(home.id));

    header.append(title, meta);
    actions.className = "card-actions";
    actions.append(openButton, deleteButton);
    card.append(header, stats, actions);
    homesGrid.append(card);
  }
};

const renderHomeDetail = () => {
  const home = getSelectedHome();

  if (!home) {
    selectedHomeId = null;
    showView("homes");
    return;
  }

  const homeRooms = getHomeRooms(home.id);
  const homeDocuments = getHomeDocuments(home.id);
  const homeEvents = getHomeEvents(home.id);

  homeDetailMeta.textContent = home.property_type;
  homeDetailTitle.textContent = home.address;
  homeDetailInfo.textContent = `Built ${home.year_built} - ${formatSquareMeters(home.square_meters)} m2`;
  homeRoomCount.textContent = homeRooms.length;
  homeDocumentCount.textContent = homeDocuments.length;
  homeEventCount.textContent = homeEvents.length;
  renderHomeHealth(home.id);

  homeRoomsGrid.replaceChildren();
  if (homeRooms.length) {
    for (const room of homeRooms) homeRoomsGrid.append(createRoomCard(room));
  } else {
    renderEmptyState(homeRoomsGrid, "No rooms yet", "Add rooms to organize this home's documents and history.");
  }

  homeDocumentsList.replaceChildren();
  if (homeDocuments.length) {
    for (const doc of homeDocuments.slice(0, 5)) homeDocumentsList.append(createDocumentItem(doc));
  } else {
    renderEmptyState(homeDocumentsList, "No documents yet");
  }

  homeTimelineList.replaceChildren();
  if (homeEvents.length) {
    for (const event of homeEvents.slice(0, 5)) homeTimelineList.append(createTimelineItem(event));
  } else {
    renderEmptyState(homeTimelineList, "No history yet");
  }
};

const renderRoomDetail = () => {
  const room = getSelectedRoom();

  if (!room) {
    selectedRoomId = null;
    showView(selectedHomeId ? "home" : "homes");
    return;
  }

  const roomDocuments = getRoomDocuments(room.id);
  const roomEvents = getRoomEvents(room.id);
  const roomInfrastructure = getRoomInfrastructure(room.id);

  roomDetailHome.textContent = getHomeAddress(room.home_id);
  roomDetailTitle.textContent = room.name;
  roomDetailMeta.textContent = room.room_type;
  roomDetailInfrastructureCount.textContent = roomInfrastructure.length;
  roomDetailDocumentCount.textContent = roomDocuments.length;
  roomDetailEventCount.textContent = roomEvents.length;

  roomDetailInfrastructure.replaceChildren();
  if (roomInfrastructure.length) {
    for (const item of roomInfrastructure) roomDetailInfrastructure.append(createInfrastructureItem(item));
  } else {
    renderEmptyState(roomDetailInfrastructure, "No infrastructure notes yet", "Add hidden systems, risk zones, and evidence notes for this room.");
  }

  roomDetailDocuments.replaceChildren();
  if (roomDocuments.length) {
    for (const doc of roomDocuments) roomDetailDocuments.append(createDocumentItem(doc));
  } else {
    renderEmptyState(roomDetailDocuments, "No room documents yet");
  }

  roomDetailTimeline.replaceChildren();
  if (roomEvents.length) {
    for (const event of roomEvents) roomDetailTimeline.append(createTimelineItem(event));
  } else {
    renderEmptyState(roomDetailTimeline, "No room history yet");
  }
};

const createHealthItem = (item) => {
  const row = document.createElement("article");
  const marker = document.createElement("span");
  const details = document.createElement("div");
  const title = document.createElement("strong");
  const detail = document.createElement("p");

  row.className = `health-item ${item.ok ? "health-ok" : "health-missing"}`;
  marker.className = "health-marker";
  marker.textContent = item.ok ? "OK" : "Missing";
  title.textContent = item.title;
  detail.textContent = item.detail;

  details.append(title, detail);
  row.append(marker, details);
  return row;
};

const getHomeHealthItems = (homeId) => {
  const homeRooms = getHomeRooms(homeId);
  const homeDocuments = getHomeDocuments(homeId);
  const homeEvents = getHomeEvents(homeId);
  const homeInfrastructure = getHomeInfrastructure(homeId);
  const roomsWithoutDocuments = homeRooms.filter((room) => !getRoomDocuments(room.id).length);
  const eventsWithoutEvidence = homeEvents.filter((event) => !getEventDocuments(event.id).length);
  const infrastructureWithoutEvidence = homeInfrastructure.filter((item) => !item.source_document_id);
  const highRiskWithoutDetail = homeInfrastructure.filter((item) => item.risk_level === "High" && (!item.source_document_id || !item.notes));

  return [
    {
      ok: homeRooms.length > 0,
      title: "Rooms created",
      detail: homeRooms.length ? `${homeRooms.length} room${homeRooms.length === 1 ? "" : "s"} documented.` : "Add rooms so documents and history have a place to live.",
    },
    {
      ok: homeDocuments.length > 0,
      title: "Documents uploaded",
      detail: homeDocuments.length ? `${homeDocuments.length} document${homeDocuments.length === 1 ? "" : "s"} stored.` : "Upload photos, PDFs, receipts, manuals, or drawings.",
    },
    {
      ok: homeRooms.length > 0 && roomsWithoutDocuments.length === 0,
      title: "Every room has documentation",
      detail: !homeRooms.length
        ? "Create rooms before checking room documentation coverage."
        : roomsWithoutDocuments.length
          ? `${roomsWithoutDocuments.length} room${roomsWithoutDocuments.length === 1 ? "" : "s"} still need documents.`
          : "Each room has at least one supporting document.",
    },
    {
      ok: homeEvents.length > 0,
      title: "Timeline started",
      detail: homeEvents.length ? `${homeEvents.length} timeline event${homeEvents.length === 1 ? "" : "s"} recorded.` : "Add renovations, repairs, installations, or inspections.",
    },
    {
      ok: homeEvents.length > 0 && eventsWithoutEvidence.length === 0,
      title: "Timeline has evidence",
      detail: !homeEvents.length
        ? "Add timeline events before checking evidence coverage."
        : eventsWithoutEvidence.length
          ? `${eventsWithoutEvidence.length} timeline event${eventsWithoutEvidence.length === 1 ? "" : "s"} need linked documents.`
          : "Timeline events are backed by linked documents.",
    },
    {
      ok: homeInfrastructure.length > 0,
      title: "Infrastructure recorded",
      detail: homeInfrastructure.length
        ? `${homeInfrastructure.length} infrastructure note${homeInfrastructure.length === 1 ? "" : "s"} added.`
        : "Add hidden systems like water, electricity, heating cables, drainage, or ventilation.",
    },
    {
      ok: homeInfrastructure.length > 0 && infrastructureWithoutEvidence.length === 0,
      title: "Infrastructure evidence linked",
      detail: !homeInfrastructure.length
        ? "Add infrastructure notes before checking evidence coverage."
        : infrastructureWithoutEvidence.length
          ? `${infrastructureWithoutEvidence.length} infrastructure note${infrastructureWithoutEvidence.length === 1 ? "" : "s"} need linked evidence.`
          : "Infrastructure notes are tied to supporting documents.",
    },
    {
      ok: highRiskWithoutDetail.length === 0,
      title: "High-risk notes are detailed",
      detail: highRiskWithoutDetail.length
        ? `${highRiskWithoutDetail.length} high-risk note${highRiskWithoutDetail.length === 1 ? "" : "s"} need evidence and notes.`
        : "High-risk infrastructure notes have the detail a contractor needs.",
    },
  ];
};

const renderHomeHealth = (homeId) => {
  const healthItems = getHomeHealthItems(homeId);
  const completed = healthItems.filter((item) => item.ok).length;
  const score = Math.round((completed / healthItems.length) * 100);

  homeHealthScore.textContent = `${score}%`;
  homeHealthSummary.textContent = `${completed} of ${healthItems.length} checks complete.`;
  homeHealthList.replaceChildren(...healthItems.map(createHealthItem));
};

const createSearchResultItem = (result) => {
  const item = document.createElement("article");
  const details = document.createElement("div");
  const type = document.createElement("span");
  const title = document.createElement("h4");
  const meta = document.createElement("p");
  const action = document.createElement("button");

  item.className = "list-item search-result";
  type.className = "result-type";
  type.textContent = result.type;
  title.textContent = result.title;
  meta.textContent = result.meta;

  action.className = "secondary-button compact-button";
  action.type = "button";
  action.textContent = result.actionLabel;
  action.addEventListener("click", result.action);

  details.append(type, title, meta);
  item.append(details, action);
  return item;
};

const getSearchResults = (query) => {
  const normalizedQuery = normalizeText(query);
  if (normalizedQuery.length < 2) return [];

  const results = [];
  const addResult = (result) => {
    if (normalizeText(result.haystack).includes(normalizedQuery)) results.push(result);
  };

  for (const home of homes) {
    addResult({
      type: "Home",
      title: home.address,
      meta: createStatLine([home.property_type, `Built ${home.year_built}`, `${formatSquareMeters(home.square_meters)} m2`]),
      actionLabel: "Open home",
      action: () => navigateToHome(home.id),
      haystack: [home.address, home.property_type, home.year_built, home.square_meters].join(" "),
    });
  }

  for (const room of rooms) {
    addResult({
      type: "Room",
      title: room.name,
      meta: createStatLine([getHomeAddress(room.home_id), room.room_type]),
      actionLabel: "Open room",
      action: () => navigateToRoom(room.id),
      haystack: [room.name, room.room_type, getHomeAddress(room.home_id)].join(" "),
    });
  }

  for (const doc of documents) {
    addResult({
      type: "Document",
      title: doc.title,
      meta: createStatLine([getHomeAddress(doc.home_id), getRoomName(doc.room_id), doc.document_type, doc.file_name]),
      actionLabel: "Open file",
      action: () => handleOpenDocument(doc),
      haystack: [doc.title, doc.document_type, doc.file_name, getHomeAddress(doc.home_id), getRoomName(doc.room_id)].join(" "),
    });
  }

  for (const event of timelineEvents) {
    const linkedDocumentTitles = getEventDocuments(event.id).map((doc) => doc.title).join(" ");
    addResult({
      type: "Timeline",
      title: event.title,
      meta: createStatLine([getHomeAddress(event.home_id), event.room_id ? getRoomName(event.room_id) : "Whole home", event.event_type]),
      actionLabel: event.room_id ? "Open room" : "Open home",
      action: () => (event.room_id ? navigateToRoom(event.room_id) : navigateToHome(event.home_id)),
      haystack: [
        event.title,
        event.description,
        event.event_type,
        event.event_date,
        getHomeAddress(event.home_id),
        event.room_id ? getRoomName(event.room_id) : "Whole home",
        linkedDocumentTitles,
      ].join(" "),
    });
  }

  for (const item of infrastructureItems) {
    addResult({
      type: "Infrastructure",
      title: item.title,
      meta: createStatLine([getHomeAddress(item.home_id), getRoomName(item.room_id), item.infrastructure_type, `${item.risk_level} risk`]),
      actionLabel: "Open room",
      action: () => navigateToRoom(item.room_id),
      haystack: [
        item.title,
        item.location_note,
        item.notes,
        item.infrastructure_type,
        item.risk_level,
        item.confidence_level,
        getHomeAddress(item.home_id),
        getRoomName(item.room_id),
        getDocumentTitle(item.source_document_id),
      ].join(" "),
    });
  }

  return results.slice(0, 20);
};

const renderSearchResults = () => {
  const query = globalSearchInput.value;
  const results = getSearchResults(query);

  searchResults.replaceChildren();
  searchResults.classList.toggle("hidden", normalizeText(query).length < 2);

  if (normalizeText(query).length < 2) return;

  if (!results.length) {
    renderEmptyState(searchResults, "No results found", "Try another room, document, system, or event name.");
    return;
  }

  for (const result of results) searchResults.append(createSearchResultItem(result));
};

const renderApp = () => {
  renderHomes();

  if (selectedHomeId) renderHomeDetail();
  if (selectedRoomId) renderRoomDetail();
};

const navigateToHome = (homeId) => {
  selectedHomeId = homeId;
  selectedRoomId = null;
  renderHomeDetail();
  showView("home");
};

const navigateToRoom = (roomId) => {
  const room = rooms.find((item) => item.id === roomId);
  if (!room) return;

  selectedHomeId = room.home_id;
  selectedRoomId = room.id;
  renderRoomDetail();
  showView("room");
};

const populateHomeSelect = (select, placeholderText) => {
  const selectedValue = select.value;
  select.replaceChildren();

  const placeholder = document.createElement("option");
  placeholder.value = "";
  placeholder.textContent = homes.length ? placeholderText : "Add a home first";
  select.append(placeholder);

  for (const home of homes) {
    const option = document.createElement("option");
    option.value = home.id;
    option.textContent = home.address;
    select.append(option);
  }

  select.value = homes.some((home) => home.id === selectedValue) ? selectedValue : "";
};

const populateRoomSelect = (select, homeId, includeWholeHome = false) => {
  const selectedValue = select.value;
  const selectableRooms = rooms.filter((room) => room.home_id === homeId);

  select.replaceChildren();

  const placeholder = document.createElement("option");
  placeholder.value = "";
  placeholder.textContent = includeWholeHome ? "Whole home" : homeId ? "Select room" : "Select home first";
  select.append(placeholder);

  for (const room of selectableRooms) {
    const option = document.createElement("option");
    option.value = room.id;
    option.textContent = room.name;
    select.append(option);
  }

  select.value = selectableRooms.some((room) => room.id === selectedValue) ? selectedValue : "";
  select.disabled = !includeWholeHome && !selectableRooms.length;
};

const populateInfrastructureDocumentSelect = () => {
  const selectedValue = infrastructureDocumentSelect.value;
  const selectableDocuments = documents.filter((doc) => doc.room_id === infrastructureRoomSelect.value);

  infrastructureDocumentSelect.replaceChildren();

  const placeholder = document.createElement("option");
  placeholder.value = "";
  placeholder.textContent = selectableDocuments.length ? "No linked document" : "No room documents yet";
  infrastructureDocumentSelect.append(placeholder);

  for (const doc of selectableDocuments) {
    const option = document.createElement("option");
    option.value = doc.id;
    option.textContent = doc.title;
    infrastructureDocumentSelect.append(option);
  }

  infrastructureDocumentSelect.value = selectableDocuments.some((doc) => doc.id === selectedValue) ? selectedValue : "";
  infrastructureDocumentSelect.disabled = !infrastructureRoomSelect.value || !selectableDocuments.length;
};

const populateTimelineDocumentSelect = () => {
  const selectedValues = new Set(getSelectedValues(timelineDocumentSelect));
  const selectableDocuments = documents.filter((doc) => {
    if (doc.home_id !== timelineHomeSelect.value) return false;
    if (timelineRoomSelect.value && doc.room_id !== timelineRoomSelect.value) return false;
    return true;
  });

  timelineDocumentSelect.replaceChildren();

  if (!selectableDocuments.length) {
    const placeholder = document.createElement("option");
    placeholder.value = "";
    placeholder.textContent = timelineHomeSelect.value ? "No matching documents yet" : "Select home first";
    timelineDocumentSelect.append(placeholder);
  }

  for (const doc of selectableDocuments) {
    const option = document.createElement("option");
    option.value = doc.id;
    option.textContent = `${doc.title} (${getRoomName(doc.room_id)})`;
    option.selected = selectedValues.has(doc.id);
    timelineDocumentSelect.append(option);
  }

  timelineDocumentSelect.disabled = !selectableDocuments.length;
};

const updateModalDisabledStates = () => {
  const hasHomes = Boolean(homes.length);
  const documentHasRoom = Boolean(documentRoomSelect.value);
  const infrastructureHasRoom = Boolean(infrastructureRoomSelect.value);
  const timelineHasDocuments = documents.some((doc) => {
    if (doc.home_id !== timelineHomeSelect.value) return false;
    if (timelineRoomSelect.value && doc.room_id !== timelineRoomSelect.value) return false;
    return true;
  });

  roomNameInput.disabled = !hasHomes;
  roomTypeSelect.disabled = !hasHomes;
  saveRoomButton.disabled = !hasHomes;
  documentTypeSelect.disabled = !documentHasRoom;
  documentTitleInput.disabled = !documentHasRoom;
  documentFileInput.disabled = !documentHasRoom;
  uploadDocumentButton.disabled = !documentHasRoom;
  timelineDateInput.disabled = !hasHomes;
  timelineTypeSelect.disabled = !hasHomes;
  timelineTitleInput.disabled = !hasHomes;
  timelineDescriptionInput.disabled = !hasHomes;
  timelineDocumentSelect.disabled = !timelineHasDocuments;
  saveTimelineEventButton.disabled = !hasHomes;
  infrastructureTypeSelect.disabled = !infrastructureHasRoom;
  infrastructureTitleInput.disabled = !infrastructureHasRoom;
  infrastructureLocationInput.disabled = !infrastructureHasRoom;
  infrastructureRiskSelect.disabled = !infrastructureHasRoom;
  infrastructureConfidenceSelect.disabled = !infrastructureHasRoom;
  infrastructureNotesInput.disabled = !infrastructureHasRoom;
  saveInfrastructureButton.disabled = !infrastructureHasRoom;
};

const populateModalSelects = () => {
  populateHomeSelect(roomHomeSelect, "Select home");
  populateHomeSelect(documentHomeSelect, "Select home");
  populateHomeSelect(timelineHomeSelect, "Select home");
  populateHomeSelect(infrastructureHomeSelect, "Select home");

  populateRoomSelect(documentRoomSelect, documentHomeSelect.value, false);
  populateRoomSelect(timelineRoomSelect, timelineHomeSelect.value, true);
  populateRoomSelect(infrastructureRoomSelect, infrastructureHomeSelect.value, false);
  populateInfrastructureDocumentSelect();
  populateTimelineDocumentSelect();
  updateModalDisabledStates();
};

const preselectModalContext = (name) => {
  if (selectedHomeId) {
    roomHomeSelect.value = selectedHomeId;
    documentHomeSelect.value = selectedHomeId;
    timelineHomeSelect.value = selectedHomeId;
    infrastructureHomeSelect.value = selectedHomeId;
    populateRoomSelect(documentRoomSelect, selectedHomeId, false);
    populateRoomSelect(timelineRoomSelect, selectedHomeId, true);
    populateRoomSelect(infrastructureRoomSelect, selectedHomeId, false);
    populateTimelineDocumentSelect();
  }

  if (selectedRoomId) {
    const room = getSelectedRoom();
    if (room) {
      documentHomeSelect.value = room.home_id;
      timelineHomeSelect.value = room.home_id;
      infrastructureHomeSelect.value = room.home_id;
      populateRoomSelect(documentRoomSelect, room.home_id, false);
      populateRoomSelect(timelineRoomSelect, room.home_id, true);
      populateRoomSelect(infrastructureRoomSelect, room.home_id, false);
      documentRoomSelect.value = room.id;
      timelineRoomSelect.value = room.id;
      infrastructureRoomSelect.value = room.id;
      populateInfrastructureDocumentSelect();
      populateTimelineDocumentSelect();
    }
  }

  if (name === "room" && selectedHomeId) {
    roomHomeSelect.value = selectedHomeId;
  }
};

const openActionModal = (name) => {
  clearModalStatuses();
  populateModalSelects();
  preselectModalContext(name);
  updateModalDisabledStates();
  openModal(name);
};

const loadHomes = async () => {
  const { data, error } = await supabase
    .from("homes")
    .select("id,address,property_type,year_built,square_meters,created_at")
    .eq("owner_id", currentUser.id)
    .order("created_at", { ascending: false });

  if (error) throw error;
  homes = data ?? [];
};

const loadRooms = async () => {
  const { data, error } = await supabase
    .from("rooms")
    .select("id,home_id,name,room_type,created_at")
    .eq("owner_id", currentUser.id)
    .order("created_at", { ascending: true });

  if (error) throw error;
  rooms = data ?? [];
};

const loadDocuments = async () => {
  const { data, error } = await supabase
    .from("room_documents")
    .select("id,home_id,room_id,title,document_type,file_name,file_size,mime_type,storage_bucket,storage_path,created_at")
    .eq("owner_id", currentUser.id)
    .order("created_at", { ascending: false });

  if (error) throw error;
  documents = data ?? [];
};

const loadTimelineEvents = async () => {
  const { data, error } = await supabase
    .from("timeline_events")
    .select("id,home_id,room_id,event_date,event_type,title,description,created_at")
    .eq("owner_id", currentUser.id)
    .order("event_date", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) throw error;
  timelineEvents = data ?? [];
};

const loadInfrastructure = async () => {
  const { data, error } = await supabase
    .from("room_infrastructure")
    .select("id,home_id,room_id,infrastructure_type,title,location_note,risk_level,confidence_level,source_document_id,notes,created_at")
    .eq("owner_id", currentUser.id)
    .order("created_at", { ascending: false });

  if (error) throw error;
  infrastructureItems = data ?? [];
};

const loadTimelineDocumentLinks = async () => {
  const { data, error } = await supabase
    .from("timeline_event_documents")
    .select("id,home_id,event_id,document_id,created_at")
    .eq("owner_id", currentUser.id)
    .order("created_at", { ascending: true });

  if (error) throw error;
  timelineDocumentLinks = data ?? [];
};

const refreshDashboard = async () => {
  try {
    await loadHomes();
    await loadRooms();
    await loadDocuments();
    await loadTimelineEvents();
    await loadInfrastructure();
    await loadTimelineDocumentLinks();

    if (selectedHomeId && !homes.some((home) => home.id === selectedHomeId)) {
      selectedHomeId = null;
      selectedRoomId = null;
      showView("homes");
    }

    if (selectedRoomId && !rooms.some((room) => room.id === selectedRoomId)) {
      selectedRoomId = null;
      showView(selectedHomeId ? "home" : "homes");
    }

    populateModalSelects();
    renderApp();
    renderSearchResults();
  } catch (error) {
    renderEmptyState(homesGrid, "Could not load dashboard", getDashboardErrorMessage(error));
    showView("homes");
  }
};

const validateHomePayload = (payload) => {
  const currentYear = new Date().getFullYear();

  if (!payload.address || payload.address.length < 3) throw new Error("Address must be at least 3 characters");
  if (!payload.property_type) throw new Error("Property type is required");
  if (!Number.isInteger(payload.year_built)) throw new Error("Year built must be a whole number");
  if (payload.year_built < 1600 || payload.year_built > currentYear) {
    throw new Error(`Year built must be between 1600 and ${currentYear}`);
  }
  if (!Number.isFinite(payload.square_meters)) throw new Error("Square meters must be a valid number");
  if (payload.square_meters <= 0) throw new Error("Square meters must be greater than 0");
};

const validateRoomPayload = (payload) => {
  if (!payload.home_id) throw new Error("Choose a home before creating a room");
  if (!homes.some((home) => home.id === payload.home_id)) throw new Error("Selected home was not found");
  if (!payload.name || payload.name.length < 2) throw new Error("Room name must be at least 2 characters");
  if (!payload.room_type) throw new Error("Room type is required");
};

const validateDocumentPayload = (payload, file) => {
  const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/heic", "image/heif", "application/pdf"];

  if (!payload.home_id) throw new Error("Choose a home for this document");
  if (!payload.room_id) throw new Error("Choose a room for this document");
  if (!rooms.some((room) => room.id === payload.room_id && room.home_id === payload.home_id)) {
    throw new Error("Selected room does not belong to the selected home");
  }
  if (!payload.document_type) throw new Error("Document type is required");
  if (!file) throw new Error("Choose a file to upload");
  if (file.size > 20 * 1024 * 1024) throw new Error("File must be 20 MB or smaller");
  if (!allowedTypes.includes(file.type)) throw new Error("Upload an image or PDF file");
};

const validateTimelinePayload = (payload) => {
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  const eventDate = new Date(`${payload.event_date}T00:00:00`);

  if (!payload.home_id) throw new Error("Choose a home for this event");
  if (!homes.some((home) => home.id === payload.home_id)) throw new Error("Selected home was not found");
  if (payload.room_id && !rooms.some((room) => room.id === payload.room_id && room.home_id === payload.home_id)) {
    throw new Error("Selected room does not belong to the selected home");
  }
  if (!payload.event_date || Number.isNaN(eventDate.getTime())) throw new Error("Choose a valid event date");
  if (eventDate > today) throw new Error("Timeline events cannot be in the future");
  if (!payload.event_type) throw new Error("Event type is required");
  if (!payload.title || payload.title.length < 3) throw new Error("Event title must be at least 3 characters");
};

const validateTimelineDocumentIds = (payload, documentIds) => {
  for (const documentId of documentIds) {
    const doc = documents.find((item) => item.id === documentId);

    if (!doc || doc.home_id !== payload.home_id) {
      throw new Error("Linked documents must belong to the selected home");
    }

    if (payload.room_id && doc.room_id !== payload.room_id) {
      throw new Error("Room-specific timeline events can only link documents from the same room");
    }
  }
};

const validateInfrastructurePayload = (payload) => {
  const allowedRiskLevels = ["Low", "Medium", "High"];
  const allowedConfidenceLevels = ["Low", "Medium", "High"];

  if (!payload.home_id) throw new Error("Choose a home for this infrastructure note");
  if (!payload.room_id) throw new Error("Choose a room for this infrastructure note");
  if (!rooms.some((room) => room.id === payload.room_id && room.home_id === payload.home_id)) {
    throw new Error("Selected room does not belong to the selected home");
  }
  if (!payload.infrastructure_type) throw new Error("Infrastructure type is required");
  if (!payload.title || payload.title.length < 3) throw new Error("Title must be at least 3 characters");
  if (!payload.location_note || payload.location_note.length < 3) throw new Error("Location must be at least 3 characters");
  if (!allowedRiskLevels.includes(payload.risk_level)) throw new Error("Choose a valid risk level");
  if (!allowedConfidenceLevels.includes(payload.confidence_level)) throw new Error("Choose a valid confidence level");
  if (
    payload.source_document_id &&
    !documents.some((doc) => doc.id === payload.source_document_id && doc.home_id === payload.home_id && doc.room_id === payload.room_id)
  ) {
    throw new Error("Linked document does not belong to the selected room");
  }
};

const sanitizeFileName = (fileName) => {
  return fileName.trim().replace(/[^a-zA-Z0-9._-]/g, "-").replace(/-+/g, "-").toLowerCase();
};

const createUploadId = () => {
  if (typeof globalThis.crypto?.randomUUID === "function") return globalThis.crypto.randomUUID();

  if (globalThis.crypto?.getRandomValues) {
    const values = new Uint32Array(4);
    globalThis.crypto.getRandomValues(values);
    return Array.from(values, (value) => value.toString(16).padStart(8, "0")).join("");
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

const setFormDisabled = (form, disabled) => {
  form.querySelectorAll("input, select, textarea, button").forEach((input) => {
    input.disabled = disabled;
  });
};

const handleCreateHome = async (event) => {
  event.preventDefault();
  setStatus(homeStatus, "");
  setFormDisabled(homeForm, true);
  saveHomeButton.textContent = "Creating...";

  try {
    const payload = {
      owner_id: currentUser.id,
      address: document.getElementById("homeAddress").value.trim(),
      property_type: document.getElementById("propertyType").value,
      year_built: Number(document.getElementById("yearBuilt").value),
      square_meters: Number(document.getElementById("squareMeters").value),
    };

    validateHomePayload(payload);
    const { data, error } = await supabase.from("homes").insert(payload).select("id").single();
    if (error) throw error;

    selectedHomeId = data.id;
    homeForm.reset();
    closeModal();
    setStatus(homeStatus, "Home created successfully!", "success");
    await refreshDashboard();
    showView("home");
  } catch (error) {
    setStatus(homeStatus, error.message, "error");
  } finally {
    setFormDisabled(homeForm, false);
    saveHomeButton.textContent = "Create home";
  }
};

const handleCreateRoom = async (event) => {
  event.preventDefault();
  setStatus(roomStatus, "");
  setFormDisabled(roomForm, true);
  saveRoomButton.textContent = "Creating...";

  try {
    const payload = {
      owner_id: currentUser.id,
      home_id: roomHomeSelect.value,
      name: roomNameInput.value.trim(),
      room_type: roomTypeSelect.value,
    };

    validateRoomPayload(payload);
    const { data, error } = await supabase.from("rooms").insert(payload).select("id,home_id").single();
    if (error) throw error;

    selectedHomeId = data.home_id;
    selectedRoomId = data.id;
    roomForm.reset();
    closeModal();
    setStatus(roomStatus, "Room created successfully!", "success");
    await refreshDashboard();
    showView("room");
  } catch (error) {
    setStatus(roomStatus, error.message, "error");
  } finally {
    setFormDisabled(roomForm, false);
    saveRoomButton.textContent = "Create room";
    populateModalSelects();
  }
};

const handleUploadDocument = async (event) => {
  event.preventDefault();
  setStatus(documentStatus, "");
  setFormDisabled(documentForm, true);
  uploadDocumentButton.textContent = "Uploading...";

  let uploadedPath = "";

  try {
    const file = documentFileInput.files[0];
    const payload = {
      owner_id: currentUser.id,
      home_id: documentHomeSelect.value,
      room_id: documentRoomSelect.value,
      title: documentTitleInput.value.trim() || file?.name || "Untitled document",
      document_type: documentTypeSelect.value,
    };

    validateDocumentPayload(payload, file);

    const safeFileName = sanitizeFileName(file.name);
    const storagePath = `${currentUser.id}/${payload.home_id}/${payload.room_id}/${createUploadId()}-${safeFileName}`;
    const { error: uploadError } = await supabase.storage.from("room-documents").upload(storagePath, file, {
      contentType: file.type,
      upsert: false,
    });

    if (uploadError) throw uploadError;
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
      throw insertError;
    }

    selectedHomeId = payload.home_id;
    selectedRoomId = payload.room_id;
    documentForm.reset();
    closeModal();
    setStatus(documentStatus, "Documentation uploaded successfully!", "success");
    await refreshDashboard();
    showView("room");
  } catch (error) {
    if (uploadedPath) await supabase.storage.from("room-documents").remove([uploadedPath]);
    setStatus(documentStatus, error.message, "error");
  } finally {
    setFormDisabled(documentForm, false);
    uploadDocumentButton.textContent = "Upload";
    populateModalSelects();
  }
};

const handleCreateTimelineEvent = async (event) => {
  event.preventDefault();
  setStatus(timelineStatus, "");
  setFormDisabled(timelineForm, true);
  saveTimelineEventButton.textContent = "Adding...";

  try {
    const payload = {
      owner_id: currentUser.id,
      home_id: timelineHomeSelect.value,
      room_id: timelineRoomSelect.value || null,
      event_date: timelineDateInput.value,
      event_type: timelineTypeSelect.value,
      title: timelineTitleInput.value.trim(),
      description: timelineDescriptionInput.value.trim() || null,
    };
    const linkedDocumentIds = getSelectedValues(timelineDocumentSelect);

    validateTimelinePayload(payload);
    validateTimelineDocumentIds(payload, linkedDocumentIds);
    const { data, error } = await supabase.from("timeline_events").insert(payload).select("id").single();
    if (error) throw error;

    if (linkedDocumentIds.length) {
      const linkRows = linkedDocumentIds.map((documentId) => ({
        owner_id: currentUser.id,
        home_id: payload.home_id,
        event_id: data.id,
        document_id: documentId,
      }));
      const { error: linkError } = await supabase.from("timeline_event_documents").insert(linkRows);
      if (linkError) {
        await supabase.from("timeline_events").delete().eq("id", data.id);
        throw linkError;
      }
    }

    selectedHomeId = payload.home_id;
    selectedRoomId = payload.room_id;
    timelineForm.reset();
    closeModal();
    setStatus(timelineStatus, "Timeline event added successfully!", "success");
    await refreshDashboard();
    showView(payload.room_id ? "room" : "home");
  } catch (error) {
    setStatus(timelineStatus, error.message, "error");
  } finally {
    setFormDisabled(timelineForm, false);
    saveTimelineEventButton.textContent = "Add event";
    populateModalSelects();
  }
};

const handleCreateInfrastructure = async (event) => {
  event.preventDefault();
  setStatus(infrastructureStatus, "");
  setFormDisabled(infrastructureForm, true);
  saveInfrastructureButton.textContent = "Saving...";

  try {
    const payload = {
      owner_id: currentUser.id,
      home_id: infrastructureHomeSelect.value,
      room_id: infrastructureRoomSelect.value,
      infrastructure_type: infrastructureTypeSelect.value,
      title: infrastructureTitleInput.value.trim(),
      location_note: infrastructureLocationInput.value.trim(),
      risk_level: infrastructureRiskSelect.value,
      confidence_level: infrastructureConfidenceSelect.value,
      source_document_id: infrastructureDocumentSelect.value || null,
      notes: infrastructureNotesInput.value.trim() || null,
    };

    validateInfrastructurePayload(payload);
    const { error } = await supabase.from("room_infrastructure").insert(payload);
    if (error) throw error;

    selectedHomeId = payload.home_id;
    selectedRoomId = payload.room_id;
    infrastructureForm.reset();
    closeModal();
    setStatus(infrastructureStatus, "Infrastructure note saved successfully!", "success");
    await refreshDashboard();
    showView("room");
  } catch (error) {
    setStatus(infrastructureStatus, error.message, "error");
  } finally {
    setFormDisabled(infrastructureForm, false);
    saveInfrastructureButton.textContent = "Save infrastructure";
    populateModalSelects();
  }
};

const handleOpenDocument = async (doc) => {
  const documentWindow = window.open("about:blank", "_blank");
  if (documentWindow) documentWindow.opener = null;

  const { data, error } = await supabase.storage.from(doc.storage_bucket).createSignedUrl(doc.storage_path, 60);

  if (error) {
    documentWindow?.close();
    showActionError(`Could not open document: ${error.message}`);
    return;
  }

  if (documentWindow) {
    documentWindow.location.href = data.signedUrl;
  } else {
    window.open(data.signedUrl, "_blank", "noopener");
  }
};

const handleDeleteHome = async (homeId) => {
  if (!confirm("Delete this home and everything inside it?")) return;

  const homeDocuments = getHomeDocuments(homeId);
  const { error } = await supabase.from("homes").delete().eq("id", homeId);
  if (error) {
    showActionError(`Could not delete home: ${error.message}`);
    return;
  }

  if (homeDocuments.length) {
    const { error: storageError } = await supabase.storage
      .from("room-documents")
      .remove(homeDocuments.map((doc) => doc.storage_path));

    if (storageError) showActionError(`Home was deleted, but some files could not be removed: ${storageError.message}`);
  }

  if (selectedHomeId === homeId) {
    selectedHomeId = null;
    selectedRoomId = null;
    showView("homes");
  }

  await refreshDashboard();
};

const handleDeleteRoom = async (roomId) => {
  if (!confirm("Delete this room? Its infrastructure notes and documents will be removed. Its history will stay in the home timeline.")) return;

  const roomDocuments = getRoomDocuments(roomId);
  const { error } = await supabase.from("rooms").delete().eq("id", roomId);
  if (error) {
    showActionError(`Could not delete room: ${error.message}`);
    return;
  }

  if (roomDocuments.length) {
    const { error: storageError } = await supabase.storage
      .from("room-documents")
      .remove(roomDocuments.map((doc) => doc.storage_path));

    if (storageError) showActionError(`Room was deleted, but some files could not be removed: ${storageError.message}`);
  }

  if (selectedRoomId === roomId) {
    selectedRoomId = null;
    showView(selectedHomeId ? "home" : "homes");
  }

  await refreshDashboard();
};

const handleDeleteDocument = async (doc) => {
  if (!confirm("Delete this document?")) return;

  const { error: deleteError } = await supabase.from("room_documents").delete().eq("id", doc.id);
  if (deleteError) {
    showActionError(`Could not delete document: ${deleteError.message}`);
    return;
  }

  const { error: storageError } = await supabase.storage.from(doc.storage_bucket).remove([doc.storage_path]);
  if (storageError) showActionError(`Document record was deleted, but the file could not be removed: ${storageError.message}`);

  await refreshDashboard();
};

const handleDeleteTimelineEvent = async (eventId) => {
  if (!confirm("Delete this timeline event?")) return;

  const { error } = await supabase.from("timeline_events").delete().eq("id", eventId);
  if (error) {
    showActionError(`Could not delete timeline event: ${error.message}`);
    return;
  }

  await refreshDashboard();
};

const handleDeleteInfrastructure = async (infrastructureId) => {
  if (!confirm("Delete this infrastructure note?")) return;

  const { error } = await supabase.from("room_infrastructure").delete().eq("id", infrastructureId);
  if (error) {
    showActionError(`Could not delete infrastructure note: ${error.message}`);
    return;
  }

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
  showView("homes");
};

document.getElementById("openHomeModal").addEventListener("click", () => openActionModal("home"));
document.getElementById("openRoomModal").addEventListener("click", () => openActionModal("room"));
document.getElementById("openDocumentModal").addEventListener("click", () => openActionModal("document"));
document.getElementById("openTimelineModal").addEventListener("click", () => openActionModal("timeline"));
document.getElementById("openRoomInfrastructureModal").addEventListener("click", () => openActionModal("infrastructure"));
document.getElementById("openRoomInfrastructureModalSecondary").addEventListener("click", () => openActionModal("infrastructure"));
document.getElementById("openRoomDocumentModal").addEventListener("click", () => openActionModal("document"));
document.getElementById("openRoomTimelineModal").addEventListener("click", () => openActionModal("timeline"));
document.getElementById("backToHomes").addEventListener("click", () => {
  selectedHomeId = null;
  selectedRoomId = null;
  showView("homes");
});
document.getElementById("backToHome").addEventListener("click", () => {
  selectedRoomId = null;
  renderHomeDetail();
  showView("home");
});

modalBackdrop.addEventListener("click", (event) => {
  if (event.target === modalBackdrop || event.target.hasAttribute("data-close-modal")) {
    closeModal();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeModal();
});

logoutButton.addEventListener("click", async () => {
  await supabase.auth.signOut();
  window.location.href = "./index.html";
});

roomHomeSelect.addEventListener("change", populateModalSelects);
documentHomeSelect.addEventListener("change", populateModalSelects);
documentRoomSelect.addEventListener("change", updateModalDisabledStates);
timelineHomeSelect.addEventListener("change", populateModalSelects);
timelineRoomSelect.addEventListener("change", () => {
  populateTimelineDocumentSelect();
  updateModalDisabledStates();
});
infrastructureHomeSelect.addEventListener("change", populateModalSelects);
infrastructureRoomSelect.addEventListener("change", () => {
  populateInfrastructureDocumentSelect();
  updateModalDisabledStates();
});
globalSearchInput.addEventListener("input", renderSearchResults);
clearSearchButton.addEventListener("click", () => {
  globalSearchInput.value = "";
  renderSearchResults();
});
homeForm.addEventListener("submit", handleCreateHome);
roomForm.addEventListener("submit", handleCreateRoom);
documentForm.addEventListener("submit", handleUploadDocument);
timelineForm.addEventListener("submit", handleCreateTimelineEvent);
infrastructureForm.addEventListener("submit", handleCreateInfrastructure);

initDashboard();
