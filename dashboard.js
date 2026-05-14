import { supabase } from "./supabase.js";

const pageTitle = document.getElementById("pageTitle");
const logoutButton = document.getElementById("logout");
const searchPanel = document.querySelector(".search-panel");

const views = {
  homes: document.getElementById("homesView"),
  home: document.getElementById("homeView"),
  layout: document.getElementById("layoutView"),
  room: document.getElementById("roomView"),
};

const homesGrid = document.getElementById("homesGrid");
const homesToolbar = document.getElementById("homesToolbar");
const firstUseOnboarding = document.getElementById("firstUseOnboarding");
const startFirstHomeButton = document.getElementById("startFirstHome");
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
const homeNextSteps = document.getElementById("homeNextSteps");
const homeRoomsGrid = document.getElementById("homeRoomsGrid");
const homeDocumentsList = document.getElementById("homeDocumentsList");
const homeTimelineList = document.getElementById("homeTimelineList");

const layoutHomeMeta = document.getElementById("layoutHomeMeta");
const layoutHomeTitle = document.getElementById("layoutHomeTitle");
const layoutStartPanel = document.getElementById("layoutStartPanel");
const layoutEditorActions = document.getElementById("layoutEditorActions");
const layoutModelBar = document.getElementById("layoutModelBar");
const layoutCanvas = document.getElementById("layoutCanvas");
const layoutSidebar = document.getElementById("layoutSidebar");
const layoutStatus = document.getElementById("layoutStatus");
const buildFloorPlanButton = document.getElementById("buildFloorPlan");
const setLayoutBaselineButton = document.getElementById("setLayoutBaseline");
const layoutSourceBadge = document.getElementById("layoutSourceBadge");
const saveLayoutButton = document.getElementById("saveLayout");
const resetLayoutButton = document.getElementById("resetLayout");
const layoutRoomTitle = document.getElementById("layoutRoomTitle");
const layoutRoomMeta = document.getElementById("layoutRoomMeta");
const layoutFloorCountInput = document.getElementById("layoutFloorCount");
const layoutFloorTabs = document.getElementById("layoutFloorTabs");
const layoutFloorTools = document.getElementById("layoutFloorTools");
const layoutRoomPlacement = document.getElementById("layoutRoomPlacement");
const newFloorNameInput = document.getElementById("newFloorName");
const addFloorButton = document.getElementById("addFloor");
const layoutAddRoomSelect = document.getElementById("layoutAddRoomSelect");
const addRoomToFloorButton = document.getElementById("addRoomToFloor");
const createRoomOnFloorButton = document.getElementById("createRoomOnFloor");
const layoutRoomFloorSelect = document.getElementById("layoutRoomFloorSelect");
const layoutDimensionsInput = document.getElementById("layoutDimensionsInput");
const addDoorButton = document.getElementById("addDoor");
const addWindowButton = document.getElementById("addWindow");
const removeSelectedPlanItemButton = document.getElementById("removeSelectedPlanItem");
const layoutRoomStats = document.getElementById("layoutRoomStats");
const openSelectedRoomButton = document.getElementById("openSelectedRoom");
const uploadSelectedRoomDocumentButton = document.getElementById("uploadSelectedRoomDocument");
const addSelectedRoomNoteButton = document.getElementById("addSelectedRoomNote");

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
  jobBrief: document.getElementById("jobBriefModal"),
};

const homeForm = document.getElementById("homeForm");
const homeModalTitle = document.getElementById("homeModalTitle");
const homeModalIntro = document.getElementById("homeModalIntro");
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

const jobBriefForm = document.getElementById("jobBriefForm");
const jobBriefHomeSelect = document.getElementById("jobBriefHomeId");
const jobBriefRoomSelect = document.getElementById("jobBriefRoomId");
const jobBriefTypeSelect = document.getElementById("jobBriefType");
const jobBriefUrgencySelect = document.getElementById("jobBriefUrgency");
const jobBriefDescriptionInput = document.getElementById("jobBriefDescription");
const jobBriefStatus = document.getElementById("jobBriefStatus");
const generateJobBriefButton = document.getElementById("generateJobBrief");
const copyJobBriefButton = document.getElementById("copyJobBrief");
const jobBriefOutput = document.getElementById("jobBriefOutput");

let currentUser = null;
let homes = [];
let rooms = [];
let homeFloors = [];
let roomLayouts = [];
let documents = [];
let timelineEvents = [];
let timelineDocumentLinks = [];
let infrastructureItems = [];
let selectedHomeId = null;
let selectedRoomId = null;
let selectedLayoutRoomId = null;
let layoutDrafts = new Map();
let baselineDrafts = new Map();
let layoutDraftHomeId = null;
let layoutEditorStarted = false;
let activeFloorName = "Main Floor";
let layoutDirty = false;
let baselineDirty = false;
let roomLayoutsAvailable = true;
let selectedPlanItem = null;
let pendingLayoutRoomFloorName = null;
let generatedJobBriefText = "";
let timelineEvidenceAvailable = true;
let isOnboardingHomeCreate = false;

const starterRooms = [
  { name: "Kitchen", room_type: "Kitchen" },
  { name: "Bathroom", room_type: "Bathroom" },
  { name: "Living room", room_type: "Living room" },
  { name: "Bedroom", room_type: "Bedroom" },
  { name: "Utility", room_type: "Utility room" },
];

const emptyPlanFeatures = { openings: [], fixtures: [] };
const UNASSIGNED_FLOOR = "__unassigned__";

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

  return message;
};

const clearModalStatuses = () => {
  [homeStatus, roomStatus, documentStatus, timelineStatus, infrastructureStatus, jobBriefStatus].forEach((status) => {
    setStatus(status, "");
  });
};

const getSelectedHome = () => homes.find((home) => home.id === selectedHomeId);
const getSelectedRoom = () => rooms.find((room) => room.id === selectedRoomId);
const getHomeRooms = (homeId) => rooms.filter((room) => room.home_id === homeId);
const getHomeFloors = (homeId) => {
  const explicitFloors = homeFloors.filter((floor) => floor.home_id === homeId);
  const floorNames = new Set(explicitFloors.map((floor) => floor.name));

  roomLayouts
    .filter((layout) => layout.home_id === homeId && layout.floor_name && layout.floor_name !== UNASSIGNED_FLOOR)
    .forEach((layout) => floorNames.add(layout.floor_name));

  if (!floorNames.size) floorNames.add("Main Floor");

  const explicitOrder = new Map(explicitFloors.map((floor) => [floor.name, floor.sort_order]));
  return Array.from(floorNames)
    .map((name) => ({ name, sort_order: explicitOrder.get(name) ?? 999 }))
    .sort((a, b) => a.sort_order - b.sort_order || a.name.localeCompare(b.name));
};
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
const getRoomLayout = (roomId) => roomLayouts.find((layout) => layout.room_id === roomId);
const getLayoutDraft = (roomId) => layoutDrafts.get(roomId);
const getBaselineDraft = (roomId) => baselineDrafts.get(roomId);

const cloneJson = (value) => JSON.parse(JSON.stringify(value ?? null));

const getDefaultFeatures = () => cloneJson(emptyPlanFeatures);

const normalizeFeatures = (features, room) => {
  const fallback = getDefaultFeatures(room);
  let value = features;

  if (typeof features === "string") {
    try {
      value = JSON.parse(features || "{}");
    } catch {
      value = {};
    }
  }

  const openings = Array.isArray(value?.openings) ? value.openings : fallback.openings;
  const fixtures = Array.isArray(value?.fixtures) ? value.fixtures : fallback.fixtures;

  return { openings, fixtures };
};

const getDefaultDimensionsLabel = () => "Add dimensions";

const getDefaultFloorNames = (count) => {
  const safeCount = clamp(Number(count) || 1, 1, 8);
  return Array.from({ length: safeCount }, (_, index) => {
    if (index === 0) return "Main Floor";
    return `Floor ${index + 1}`;
  });
};

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const isMissingTableError = (error, tableName) => {
  const message = error?.message ?? "";
  return (
    error?.code === "42P01" ||
    error?.code === "PGRST205" ||
    (
      message.includes(tableName) &&
      (message.includes("Could not find") || message.includes("does not exist") || message.includes("schema cache") || message.includes("relation"))
    )
  );
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

const formatBriefList = (items, emptyText) => {
  if (!items.length) return `- ${emptyText}`;
  return items.map((item) => `- ${item}`).join("\n");
};

const showView = (viewName) => {
  for (const [name, view] of Object.entries(views)) {
    view.classList.toggle("active", name === viewName);
  }

  pageTitle.textContent = {
    homes: homes.length ? "Your homes" : "Welcome",
    home: "Home detail",
    layout: "Home layout",
    room: "Room detail",
  }[viewName];

  window.scrollTo({ top: 0, behavior: "smooth" });
};

const setHomeCreationMode = (isOnboarding = false) => {
  isOnboardingHomeCreate = isOnboarding;
  modals.home.classList.toggle("onboarding-modal", isOnboarding);
  homeModalIntro.classList.toggle("hidden", !isOnboarding);
  homeModalTitle.textContent = isOnboarding ? "Create your home record" : "Add home";
  saveHomeButton.textContent = isOnboarding ? "Prepare my record" : "Create home";
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

const createNextStepButton = (label, detail, action, isPrimary = false) => {
  const button = document.createElement("button");
  const title = document.createElement("strong");
  const copy = document.createElement("span");

  button.className = `next-step ${isPrimary ? "next-step-primary" : ""}`.trim();
  button.type = "button";
  title.textContent = label;
  copy.textContent = detail;
  button.append(title, copy);
  button.addEventListener("click", action);

  return button;
};

const renderHomeNextSteps = (homeId) => {
  const homeRooms = getHomeRooms(homeId);
  const homeDocuments = getHomeDocuments(homeId);
  const homeEvents = getHomeEvents(homeId);
  const steps = [];

  if (!homeRooms.length) {
    steps.push(createNextStepButton(
      "Add a room",
      "Give documents and notes a precise place to live.",
      () => openActionModal("room"),
      true
    ));
  } else {
    steps.push(createNextStepButton(
      "Open home layout",
      "Arrange rooms into a simple visual map.",
      () => navigateToLayout(homeId),
      !homeDocuments.length
    ));
  }

  if (!homeDocuments.length) {
    steps.push(createNextStepButton(
      "Upload first document",
      "Add a photo, PDF, receipt, manual, or drawing.",
      () => openActionModal("document"),
      Boolean(homeRooms.length)
    ));
  }

  if (!homeEvents.length) {
    steps.push(createNextStepButton(
      "Add renovation history",
      "Record what changed, when, and why it matters.",
      () => openActionModal("timeline")
    ));
  }

  steps.push(createNextStepButton(
    "Generate a job brief",
    "Turn your record into a clear handoff for a professional.",
    () => openActionModal("jobBrief")
  ));

  if (homeDocuments.length && homeEvents.length && homeRooms.length) {
    homeNextSteps.classList.add("hidden");
    homeNextSteps.replaceChildren();
    return;
  }

  const copy = document.createElement("div");
  const eyebrow = document.createElement("p");
  const title = document.createElement("h3");
  const text = document.createElement("p");
  const actions = document.createElement("div");

  eyebrow.className = "eyebrow";
  eyebrow.textContent = "Next best steps";
  title.textContent = "Your home record is ready. Now make it useful.";
  text.textContent = "Add one piece of proof or one important change. Small inputs make the record valuable quickly.";
  actions.className = "next-step-actions";
  actions.append(...steps.slice(0, 3));
  copy.append(eyebrow, title, text);

  homeNextSteps.classList.remove("hidden");
  homeNextSteps.replaceChildren(copy, actions);
};

const getDefaultLayout = (index, total, room = null) => {
  const columns = total <= 1 ? 1 : total <= 4 ? 2 : 3;
  const rows = Math.ceil(total / columns);
  const gap = 3;
  const width = (100 - gap * (columns + 1)) / columns;
  const height = (100 - gap * (rows + 1)) / rows;
  const column = index % columns;
  const row = Math.floor(index / columns);

  return {
    x: gap + column * (width + gap),
    y: gap + row * (height + gap),
    width,
    height,
    floor_name: UNASSIGNED_FLOOR,
    dimensions_label: room ? getDefaultDimensionsLabel(room) : "Add dimensions",
    plan_features: getDefaultFeatures(),
    baseline_source: "manual",
  };
};

const normalizeLayout = (layout, index, total, room = null) => {
  const fallback = getDefaultLayout(index, total, room);
  const width = clamp(Number(layout?.width ?? fallback.width), 12, 96);
  const height = clamp(Number(layout?.height ?? fallback.height), 10, 96);

  return {
    x: clamp(Number(layout?.x ?? fallback.x), 0, 100 - width),
    y: clamp(Number(layout?.y ?? fallback.y), 0, 100 - height),
    width,
    height,
    floor_name: layout?.floor_name || fallback.floor_name,
    dimensions_label: layout?.dimensions_label || fallback.dimensions_label,
    plan_features: normalizeFeatures(layout?.plan_features, room),
    baseline_source: layout?.baseline_source || fallback.baseline_source,
  };
};

const getPersistedBaselineLayout = (layout, room, index, total) => {
  if (layout?.baseline_layout) {
    return normalizeLayout({
      ...layout.baseline_layout,
      baseline_source: layout.baseline_source,
    }, index, total, room);
  }

  return normalizeLayout(layout, index, total, room);
};

const syncLayoutDrafts = (homeId, force = false) => {
  const homeRooms = getHomeRooms(homeId);

  if (force || layoutDraftHomeId !== homeId || (!layoutDirty && layoutDrafts.size !== homeRooms.length)) {
    layoutDrafts = new Map();
    baselineDrafts = new Map();

    homeRooms.forEach((room, index) => {
      const storedLayout = getRoomLayout(room.id);
      const draft = storedLayout
        ? normalizeLayout(storedLayout, index, homeRooms.length, room)
        : normalizeLayout({ floor_name: UNASSIGNED_FLOOR }, index, homeRooms.length, room);

      layoutDrafts.set(room.id, draft);
      baselineDrafts.set(room.id, storedLayout ? getPersistedBaselineLayout(storedLayout, room, index, homeRooms.length) : cloneJson(draft));
    });

    layoutDraftHomeId = homeId;
    layoutDirty = false;
    baselineDirty = false;
  }

  for (const [index, room] of homeRooms.entries()) {
    if (!layoutDrafts.has(room.id)) {
      const storedLayout = getRoomLayout(room.id);
      const draft = storedLayout
        ? normalizeLayout(storedLayout, index, homeRooms.length, room)
        : normalizeLayout({ floor_name: UNASSIGNED_FLOOR }, index, homeRooms.length, room);
      layoutDrafts.set(room.id, draft);
      baselineDrafts.set(room.id, cloneJson(draft));
    }
  }
};

const homeHasSavedLayout = (homeId) => roomLayouts.some((layout) => layout.home_id === homeId);
const homeHasFloors = (homeId) => homeFloors.some((floor) => floor.home_id === homeId) || homeHasSavedLayout(homeId);

const updateLayoutModeVisibility = () => {
  const hasSavedLayout = selectedHomeId ? homeHasSavedLayout(selectedHomeId) : false;
  const showEditor = layoutEditorStarted || hasSavedLayout;

  layoutStartPanel.classList.toggle("hidden", showEditor);
  layoutStartPanel.classList.toggle("layout-choice-only", !showEditor);
  layoutEditorActions.classList.toggle("hidden", !showEditor);
  layoutModelBar.classList.toggle("hidden", !showEditor);
  layoutFloorTabs.classList.toggle("hidden", !showEditor);
  layoutFloorTools.classList.toggle("hidden", !showEditor);
  layoutRoomPlacement.classList.toggle("hidden", !showEditor);
  layoutCanvas.classList.toggle("hidden", !showEditor);
  layoutSidebar.classList.toggle("hidden", !showEditor);
};

const updateLayoutControls = () => {
  const homeRooms = selectedHomeId ? getHomeRooms(selectedHomeId) : [];
  const firstRoom = homeRooms[0];
  const firstBaseline = firstRoom ? getBaselineDraft(firstRoom.id) : null;
  const showEditor = layoutEditorStarted || (selectedHomeId && homeHasSavedLayout(selectedHomeId));

  saveLayoutButton.disabled = !showEditor || !roomLayoutsAvailable || !homeRooms.length || !layoutDirty;
  resetLayoutButton.disabled = !showEditor || !homeRooms.length;
  setLayoutBaselineButton.disabled = !showEditor || !homeRooms.length;
  addDoorButton.disabled = !showEditor || !selectedLayoutRoomId;
  addWindowButton.disabled = !showEditor || !selectedLayoutRoomId;
  layoutDimensionsInput.disabled = !showEditor || !selectedLayoutRoomId;
  layoutRoomFloorSelect.disabled = !showEditor || !selectedLayoutRoomId;
  addFloorButton.disabled = !showEditor || !newFloorNameInput.value.trim();
  addRoomToFloorButton.disabled = !showEditor || !layoutAddRoomSelect.value;
  createRoomOnFloorButton.disabled = !showEditor || !selectedHomeId;
  layoutSourceBadge.textContent = "Manual model";
  removeSelectedPlanItemButton.disabled = !selectedPlanItem;

  if (!roomLayoutsAvailable) {
    setStatus(layoutStatus, "Layout saving needs the room_layouts table. Run the latest schema.sql in Supabase.", "error");
  } else if (!layoutDirty && layoutStatus.classList.contains("error")) {
    setStatus(layoutStatus, "");
  }
};

const selectLayoutRoom = (roomId) => {
  selectedLayoutRoomId = roomId;
  selectedPlanItem = null;
  renderLayoutRoomPanel();

  layoutCanvas.querySelectorAll(".layout-room").forEach((element) => {
    element.classList.toggle("selected", element.dataset.roomId === roomId);
  });
};

const renderLayoutRoomPanel = () => {
  const room = rooms.find((item) => item.id === selectedLayoutRoomId);
  const disabled = !room;

  openSelectedRoomButton.disabled = disabled;
  uploadSelectedRoomDocumentButton.disabled = disabled;
  addSelectedRoomNoteButton.disabled = disabled;
  layoutRoomStats.replaceChildren();
  layoutDimensionsInput.value = "";
  layoutRoomFloorSelect.replaceChildren();

  if (!room) {
    layoutRoomTitle.textContent = "Choose a room";
    layoutRoomMeta.textContent = "Select a room on the layout to see its record.";
    updateLayoutControls();
    return;
  }

  const roomDocuments = getRoomDocuments(room.id);
  const roomEvents = getRoomEvents(room.id);
  const roomInfrastructure = getRoomInfrastructure(room.id);
  const layout = getLayoutDraft(room.id);
  const floors = selectedHomeId ? getHomeFloors(selectedHomeId) : [];

  layoutRoomTitle.textContent = room.name;
  layoutRoomMeta.textContent = createStatLine([room.room_type, layout?.dimensions_label, getHomeAddress(room.home_id)]);
  layoutDimensionsInput.value = layout?.dimensions_label === "Add dimensions" ? "" : layout?.dimensions_label ?? "";
  floors.forEach((floor) => {
    const option = document.createElement("option");
    option.value = floor.name;
    option.textContent = floor.name;
    layoutRoomFloorSelect.append(option);
  });
  layoutRoomFloorSelect.value = layout?.floor_name || activeFloorName;

  [
    ["Documents", roomDocuments.length],
    ["History", roomEvents.length],
    ["Infrastructure", roomInfrastructure.length],
  ].forEach(([label, value]) => {
    const item = document.createElement("span");
    item.innerHTML = `<strong>${value}</strong>${label}`;
    layoutRoomStats.append(item);
  });

  updateLayoutControls();
};

const setLayoutDirty = () => {
  layoutDirty = true;
  setStatus(layoutStatus, "Unsaved layout changes.");
  updateLayoutControls();
};

const updateSelectedRoomLayout = (updater) => {
  if (!selectedLayoutRoomId) return;

  const current = getLayoutDraft(selectedLayoutRoomId);
  if (!current) return;

  layoutDrafts.set(selectedLayoutRoomId, updater(cloneJson(current)));
  setLayoutDirty();
  renderLayout();
};

const updateSelectedRoomDimensions = () => {
  updateSelectedRoomLayout((layout) => {
    layout.dimensions_label = layoutDimensionsInput.value.trim() || "Add dimensions";
    return layout;
  });
};

const updateSelectedRoomFloor = () => {
  const nextFloor = layoutRoomFloorSelect.value;
  if (!nextFloor) return;

  activeFloorName = nextFloor;
  updateSelectedRoomLayout((layout) => {
    layout.floor_name = nextFloor;
    return layout;
  });
};

const selectLayoutFloor = (floorName) => {
  activeFloorName = floorName;
  selectedLayoutRoomId = null;
  selectedPlanItem = null;
  renderLayout();
};

const renderLayoutFloors = () => {
  const floors = selectedHomeId ? getHomeFloors(selectedHomeId) : [];
  layoutFloorTabs.replaceChildren();

  floors.forEach((floor) => {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = floor.name;
    button.className = floor.name === activeFloorName ? "active" : "";
    button.addEventListener("click", () => selectLayoutFloor(floor.name));
    layoutFloorTabs.append(button);
  });
};

const renderRoomPlacementOptions = () => {
  const homeRooms = selectedHomeId ? getHomeRooms(selectedHomeId) : [];
  const selectedValue = layoutAddRoomSelect.value;
  layoutAddRoomSelect.replaceChildren();

  const placeholder = document.createElement("option");
  placeholder.value = "";
  placeholder.textContent = homeRooms.length ? "Select room" : "No rooms in this home yet";
  layoutAddRoomSelect.append(placeholder);

  homeRooms
    .filter((room) => getLayoutDraft(room.id)?.floor_name !== activeFloorName)
    .forEach((room) => {
      const option = document.createElement("option");
      const floorName = getLayoutDraft(room.id)?.floor_name ?? UNASSIGNED_FLOOR;
      const floorLabel = floorName === UNASSIGNED_FLOOR ? "Unassigned" : floorName;
      option.value = room.id;
      option.textContent = `${room.name} (${floorLabel})`;
      layoutAddRoomSelect.append(option);
    });

  layoutAddRoomSelect.value = Array.from(layoutAddRoomSelect.options).some((option) => option.value === selectedValue)
    ? selectedValue
    : "";
};

const moveRoomToActiveFloor = (roomId) => {
  const room = rooms.find((item) => item.id === roomId);
  if (!room || !selectedHomeId) return;

  const homeRooms = getHomeRooms(selectedHomeId);
  const index = Math.max(homeRooms.findIndex((item) => item.id === room.id), 0);
  const currentLayout = getLayoutDraft(room.id) ?? normalizeLayout(null, index, homeRooms.length, room);
  const nextLayout = {
    ...cloneJson(currentLayout),
    floor_name: activeFloorName,
  };

  layoutDrafts.set(room.id, nextLayout);
  if (!baselineDrafts.has(room.id) || getBaselineDraft(room.id)?.floor_name === UNASSIGNED_FLOOR) {
    baselineDrafts.set(room.id, cloneJson(nextLayout));
  }
  selectedLayoutRoomId = room.id;
  selectedPlanItem = null;
  layoutDirty = true;
  setStatus(layoutStatus, `${room.name} added to ${activeFloorName}.`);
  renderLayout();
};

const handleAddRoomToFloor = () => {
  if (!layoutAddRoomSelect.value) return;
  moveRoomToActiveFloor(layoutAddRoomSelect.value);
};

const openCreateRoomOnActiveFloor = () => {
  if (!selectedHomeId) return;

  pendingLayoutRoomFloorName = activeFloorName;
  selectedRoomId = null;
  openActionModal("room");
};

const selectPlanItem = (roomId, kind, index) => {
  selectedLayoutRoomId = roomId;
  selectedPlanItem = { roomId, kind, index };
  renderLayoutRoomPanel();

  layoutCanvas.querySelectorAll(".layout-plan-item-selected").forEach((element) => {
    element.classList.remove("layout-plan-item-selected");
  });

  const selector = `[data-room-id="${roomId}"] [data-plan-kind="${kind}"][data-plan-index="${index}"]`;
  layoutCanvas.querySelector(selector)?.classList.add("layout-plan-item-selected");
  updateLayoutControls();
};

const addOpeningToSelectedRoom = (type) => {
  updateSelectedRoomLayout((layout) => {
    layout.plan_features.openings = layout.plan_features.openings ?? [];
    layout.plan_features.openings.push({ type, side: "bottom", offset: 50 });
    return layout;
  });
};

const getFixtureDefaults = (type) => {
  const wide = new Set(["bath", "bed", "counter"]);
  const tall = new Set(["shower"]);

  return {
    type,
    x: 50,
    y: 50,
    width: wide.has(type) ? 28 : 10,
    height: type === "counter" ? 8 : tall.has(type) ? 18 : wide.has(type) ? 24 : 10,
  };
};

const addFixtureToSelectedRoom = (type) => {
  updateSelectedRoomLayout((layout) => {
    layout.plan_features.fixtures = layout.plan_features.fixtures ?? [];
    layout.plan_features.fixtures.push(getFixtureDefaults(type));
    return layout;
  });
};

const removeSelectedPlanItem = () => {
  if (!selectedPlanItem) return;

  const { roomId, kind, index } = selectedPlanItem;
  const current = getLayoutDraft(roomId);
  if (!current) return;

  const key = kind === "opening" ? "openings" : "fixtures";
  const nextLayout = cloneJson(current);
  nextLayout.plan_features[key].splice(index, 1);
  layoutDrafts.set(roomId, nextLayout);
  selectedPlanItem = null;
  setLayoutDirty();
  renderLayout();
};

const applyRoomElementLayout = (element, layout) => {
  element.style.left = `${layout.x}%`;
  element.style.top = `${layout.y}%`;
  element.style.width = `${layout.width}%`;
  element.style.height = `${layout.height}%`;
};

const startLayoutInteraction = (event, roomId, mode) => {
  if (event.button !== 0) return;

  const roomElement = event.currentTarget.closest(".layout-room");
  const canvasRect = layoutCanvas.getBoundingClientRect();
  const initialLayout = { ...getLayoutDraft(roomId) };
  const startX = event.clientX;
  const startY = event.clientY;
  let didMove = false;

  event.preventDefault();
  event.stopPropagation();

  const handlePointerMove = (moveEvent) => {
    const dx = ((moveEvent.clientX - startX) / canvasRect.width) * 100;
    const dy = ((moveEvent.clientY - startY) / canvasRect.height) * 100;
    const nextLayout = { ...initialLayout };

    didMove = didMove || Math.abs(moveEvent.clientX - startX) > 3 || Math.abs(moveEvent.clientY - startY) > 3;

    if (mode === "move") {
      nextLayout.x = clamp(initialLayout.x + dx, 0, 100 - initialLayout.width);
      nextLayout.y = clamp(initialLayout.y + dy, 0, 100 - initialLayout.height);
    } else {
      nextLayout.width = clamp(initialLayout.width + dx, 12, 100 - initialLayout.x);
      nextLayout.height = clamp(initialLayout.height + dy, 10, 100 - initialLayout.y);
    }

    layoutDrafts.set(roomId, nextLayout);
    applyRoomElementLayout(roomElement, nextLayout);
    setLayoutDirty();
  };

  const handlePointerUp = () => {
    window.removeEventListener("pointermove", handlePointerMove);
    window.removeEventListener("pointerup", handlePointerUp);

    if (!didMove) selectLayoutRoom(roomId);
  };

  window.addEventListener("pointermove", handlePointerMove);
  window.addEventListener("pointerup", handlePointerUp);
};

const startOpeningInteraction = (event, roomId, openingIndex) => {
  const roomElement = event.currentTarget.closest(".layout-room");
  const roomRect = roomElement.getBoundingClientRect();

  event.preventDefault();
  event.stopPropagation();
  selectPlanItem(roomId, "opening", openingIndex);

  const handlePointerMove = (moveEvent) => {
    const layout = cloneJson(getLayoutDraft(roomId));
    const opening = layout.plan_features.openings[openingIndex];
    const x = ((moveEvent.clientX - roomRect.left) / roomRect.width) * 100;
    const y = ((moveEvent.clientY - roomRect.top) / roomRect.height) * 100;
    const distances = [
      { side: "top", value: Math.abs(y) },
      { side: "right", value: Math.abs(100 - x) },
      { side: "bottom", value: Math.abs(100 - y) },
      { side: "left", value: Math.abs(x) },
    ];
    const nearest = distances.sort((a, b) => a.value - b.value)[0].side;

    opening.side = nearest;
    opening.offset = nearest === "top" || nearest === "bottom"
      ? clamp(x, 8, 92)
      : clamp(y, 8, 92);

    layoutDrafts.set(roomId, layout);
    setLayoutDirty();
    renderLayout();
    selectPlanItem(roomId, "opening", openingIndex);
  };

  const handlePointerUp = () => {
    window.removeEventListener("pointermove", handlePointerMove);
    window.removeEventListener("pointerup", handlePointerUp);
  };

  window.addEventListener("pointermove", handlePointerMove);
  window.addEventListener("pointerup", handlePointerUp);
};

const startFixtureInteraction = (event, roomId, fixtureIndex) => {
  const roomElement = event.currentTarget.closest(".layout-room");
  const roomRect = roomElement.getBoundingClientRect();

  event.preventDefault();
  event.stopPropagation();
  selectPlanItem(roomId, "fixture", fixtureIndex);

  const handlePointerMove = (moveEvent) => {
    const layout = cloneJson(getLayoutDraft(roomId));
    const fixture = layout.plan_features.fixtures[fixtureIndex];
    fixture.x = clamp(((moveEvent.clientX - roomRect.left) / roomRect.width) * 100, 4, 92);
    fixture.y = clamp(((moveEvent.clientY - roomRect.top) / roomRect.height) * 100, 4, 92);

    layoutDrafts.set(roomId, layout);
    setLayoutDirty();
    renderLayout();
    selectPlanItem(roomId, "fixture", fixtureIndex);
  };

  const handlePointerUp = () => {
    window.removeEventListener("pointermove", handlePointerMove);
    window.removeEventListener("pointerup", handlePointerUp);
  };

  window.addEventListener("pointermove", handlePointerMove);
  window.addEventListener("pointerup", handlePointerUp);
};

const createOpeningElement = (opening, roomId, index) => {
  const element = document.createElement("span");
  const side = ["top", "right", "bottom", "left"].includes(opening.side) ? opening.side : "bottom";
  const offset = clamp(Number(opening.offset ?? 50), 8, 92);

  element.className = `layout-opening layout-opening-${opening.type === "window" ? "window" : "door"} ${side}`;
  element.dataset.planKind = "opening";
  element.dataset.planIndex = String(index);
  element.title = `Drag ${opening.type} along a wall`;

  if (side === "top" || side === "bottom") {
    element.style.left = `${offset}%`;
  } else {
    element.style.top = `${offset}%`;
  }

  element.addEventListener("pointerdown", (event) => startOpeningInteraction(event, roomId, index));
  return element;
};

const createFixtureElement = (fixture, roomId, index) => {
  const element = document.createElement("span");
  const type = normalizeText(fixture.type || "fixture").replace(/[^a-z0-9-]/g, "-");

  element.className = `layout-fixture fixture-${type}`;
  element.dataset.planKind = "fixture";
  element.dataset.planIndex = String(index);
  element.style.left = `${clamp(Number(fixture.x ?? 50), 4, 92)}%`;
  element.style.top = `${clamp(Number(fixture.y ?? 50), 4, 92)}%`;

  if (fixture.width) element.style.width = `${clamp(Number(fixture.width), 8, 80)}%`;
  if (fixture.height) element.style.height = `${clamp(Number(fixture.height), 8, 80)}%`;
  element.dataset.label = String(fixture.type ?? "");
  element.title = `Drag ${fixture.type}`;

  element.addEventListener("pointerdown", (event) => startFixtureInteraction(event, roomId, index));
  return element;
};

const createLayoutRoomElement = (room) => {
  const roomDocuments = getRoomDocuments(room.id);
  const roomEvents = getRoomEvents(room.id);
  const layout = getLayoutDraft(room.id);
  const element = document.createElement("article");
  const label = document.createElement("div");
  const title = document.createElement("strong");
  const meta = document.createElement("span");
  const dimensions = document.createElement("span");
  const resizeHandle = document.createElement("span");

  element.className = "layout-room";
  element.dataset.roomId = room.id;
  element.tabIndex = 0;
  element.setAttribute("role", "button");
  element.setAttribute("aria-label", `${room.name} room layout`);

  label.className = "layout-room-label";
  title.textContent = room.name;
  dimensions.className = "layout-room-dimensions";
  dimensions.textContent = layout.dimensions_label;
  meta.textContent = createStatLine([
    room.room_type,
    `${roomDocuments.length} docs`,
    `${roomEvents.length} events`,
  ]);
  resizeHandle.className = "layout-resize-handle";
  resizeHandle.setAttribute("aria-hidden", "true");

  applyRoomElementLayout(element, layout);
  label.append(title, dimensions, meta);
  element.append(label);

  for (const [index, opening] of (layout.plan_features.openings ?? []).entries()) {
    element.append(createOpeningElement(opening, room.id, index));
  }

  for (const [index, fixture] of (layout.plan_features.fixtures ?? []).entries()) {
    element.append(createFixtureElement(fixture, room.id, index));
  }

  element.append(resizeHandle);

  element.addEventListener("pointerdown", (event) => startLayoutInteraction(event, room.id, "move"));
  resizeHandle.addEventListener("pointerdown", (event) => startLayoutInteraction(event, room.id, "resize"));
  element.addEventListener("keydown", (event) => {
    if (event.key === "Enter") navigateToRoom(room.id);
  });
  element.addEventListener("dblclick", () => navigateToRoom(room.id));

  return element;
};

const renderLayout = () => {
  const home = getSelectedHome();

  if (!home) {
    selectedHomeId = null;
    selectedLayoutRoomId = null;
    showView("homes");
    return;
  }

  const homeRooms = getHomeRooms(home.id);
  const hasSavedLayout = homeHasSavedLayout(home.id);
  const floors = getHomeFloors(home.id);

  layoutHomeMeta.textContent = home.property_type;
  layoutHomeTitle.textContent = home.address;
  syncLayoutDrafts(home.id);
  if (!floors.some((floor) => floor.name === activeFloorName)) {
    activeFloorName = floors[0]?.name ?? "Main Floor";
  }
  layoutEditorStarted = layoutEditorStarted || hasSavedLayout;
  updateLayoutModeVisibility();
  renderLayoutFloors();
  renderRoomPlacementOptions();
  layoutCanvas.replaceChildren();

  if (!layoutEditorStarted && !hasSavedLayout) {
    selectedLayoutRoomId = null;
    renderLayoutRoomPanel();
    updateLayoutControls();
    return;
  }

  if (!homeRooms.length) {
    renderEmptyState(layoutCanvas, "No rooms yet", "Add rooms first, then arrange them into a simple home layout.");
    selectedLayoutRoomId = null;
    renderLayoutRoomPanel();
    updateLayoutControls();
    return;
  }

  const floorRooms = homeRooms.filter((room) => getLayoutDraft(room.id)?.floor_name === activeFloorName);

  if (!floorRooms.length) {
    renderEmptyState(layoutCanvas, `${activeFloorName} has no rooms yet`, "Use the controls above to add an existing room to this floor, or create a new room directly here.");
    selectedLayoutRoomId = null;
    renderLayoutRoomPanel();
    updateLayoutControls();
    return;
  }

  if (!selectedLayoutRoomId || !floorRooms.some((room) => room.id === selectedLayoutRoomId)) {
    selectedLayoutRoomId = floorRooms[0].id;
  }

  for (const room of floorRooms) {
    layoutCanvas.append(createLayoutRoomElement(room));
  }

  selectLayoutRoom(selectedLayoutRoomId);
  updateLayoutControls();
};

const resetLayoutDrafts = () => {
  if (!selectedHomeId) return;

  const homeRooms = getHomeRooms(selectedHomeId);
  layoutDrafts = new Map(homeRooms.map((room, index) => [
    room.id,
    cloneJson(getBaselineDraft(room.id) ?? normalizeLayout(null, index, homeRooms.length, room)),
  ]));
  layoutDraftHomeId = selectedHomeId;
  layoutEditorStarted = true;
  layoutDirty = true;
  setStatus(layoutStatus, "Reset to the saved model. Save to keep this as the active layout.");
  renderLayout();
};

const buildStarterFloorPlan = () => {
  if (!selectedHomeId) return;

  const homeRooms = getHomeRooms(selectedHomeId);
  const floorNames = getDefaultFloorNames(layoutFloorCountInput.value);
  activeFloorName = floorNames[0];
  layoutDrafts = new Map(homeRooms.map((room, index) => [
    room.id,
    normalizeLayout({ floor_name: UNASSIGNED_FLOOR }, index, homeRooms.length, room),
  ]));
  baselineDrafts = new Map(Array.from(layoutDrafts, ([roomId, layout]) => [
    roomId,
    { ...cloneJson(layout), baseline_source: "manual" },
  ]));
  layoutDraftHomeId = selectedHomeId;
  layoutEditorStarted = true;
  layoutDirty = true;
  baselineDirty = true;
  setStatus(layoutStatus, "Floors created. Add rooms to each floor when ready.");
  renderLayout();
};

const ensureHomeFloors = async (floorNames) => {
  const existingFloors = homeFloors.filter((floor) => floor.home_id === selectedHomeId);
  const existingNames = new Set(existingFloors.map((floor) => floor.name));

  roomLayouts
    .filter((layout) => layout.home_id === selectedHomeId && layout.floor_name && layout.floor_name !== UNASSIGNED_FLOOR)
    .forEach((layout) => existingNames.add(layout.floor_name));

  const rows = floorNames
    .filter((name) => !existingNames.has(name))
    .map((name, index) => ({
      owner_id: currentUser.id,
      home_id: selectedHomeId,
      name,
      sort_order: existingFloors.length + index,
    }));

  if (!rows.length) return;

  const { error } = await supabase.from("home_floors").insert(rows);
  if (error) {
    if (isMissingTableError(error, "home_floors")) {
      homeFloors.push(...rows.map((row, index) => ({
        id: `local-${Date.now()}-${index}`,
        created_at: new Date().toISOString(),
        ...row,
      })));
      setStatus(layoutStatus, "Floors are available for this session. Run latest schema.sql to persist floor names.", "error");
      return;
    }

    throw error;
  }

  await loadHomeFloors();
};

const handleBuildStarterFloorPlan = async () => {
  const floorNames = getDefaultFloorNames(layoutFloorCountInput.value);

  try {
    await ensureHomeFloors(floorNames);
    buildStarterFloorPlan();
  } catch (error) {
    setStatus(layoutStatus, `Could not create floors: ${error.message}`, "error");
  }
};

const handleAddFloor = async () => {
  const floorName = newFloorNameInput.value.trim();
  if (!selectedHomeId || !floorName) return;

  try {
    await ensureHomeFloors([floorName]);
    newFloorNameInput.value = "";
    activeFloorName = floorName;
    setStatus(layoutStatus, `${floorName} added.`);
    renderLayout();
  } catch (error) {
    setStatus(layoutStatus, `Could not add floor: ${error.message}`, "error");
  }
};

const setCurrentLayoutAsBaseline = () => {
  if (!selectedHomeId) return;

  baselineDrafts = new Map(Array.from(layoutDrafts, ([roomId, layout]) => [
    roomId,
    { ...cloneJson(layout), baseline_source: "manual" },
  ]));
  baselineDirty = true;
  layoutDirty = true;
  setStatus(layoutStatus, "Current layout is now the reset model. Save to keep it.");
  renderLayout();
};

const saveLayout = async () => {
  if (!selectedHomeId || !roomLayoutsAvailable) return;

  const homeRooms = getHomeRooms(selectedHomeId);
  const rows = homeRooms
    .map((room) => {
      const layout = getLayoutDraft(room.id);
      if (!layout || layout.floor_name === UNASSIGNED_FLOOR) return null;

      const savedBaseline = getBaselineDraft(room.id);
      const baseline = !savedBaseline || savedBaseline.floor_name === UNASSIGNED_FLOOR ? layout : savedBaseline;
      return {
        owner_id: currentUser.id,
        home_id: selectedHomeId,
        room_id: room.id,
        x: Number(layout.x.toFixed(2)),
        y: Number(layout.y.toFixed(2)),
        width: Number(layout.width.toFixed(2)),
        height: Number(layout.height.toFixed(2)),
        floor_name: layout.floor_name,
        dimensions_label: layout.dimensions_label,
        plan_features: layout.plan_features,
        baseline_layout: baseline,
        baseline_features: baseline.plan_features,
        baseline_source: baseline.baseline_source || "manual",
        updated_at: new Date().toISOString(),
      };
    })
    .filter(Boolean);

  saveLayoutButton.disabled = true;
  saveLayoutButton.textContent = "Saving...";
  setStatus(layoutStatus, "Saving layout...");

  if (!rows.length) {
    layoutDirty = false;
    baselineDirty = false;
    saveLayoutButton.textContent = "Save layout";
    setStatus(layoutStatus, "Floors saved. Add rooms to a floor when ready.", "success");
    updateLayoutControls();
    renderLayout();
    return;
  }

  const { error } = await supabase.from("room_layouts").upsert(rows, { onConflict: "room_id" });

  saveLayoutButton.textContent = "Save layout";

  if (error) {
    if (isMissingTableError(error, "room_layouts")) {
      roomLayoutsAvailable = false;
      updateLayoutControls();
      return;
    }

    setStatus(layoutStatus, `Could not save layout: ${error.message}`, "error");
    updateLayoutControls();
    return;
  }

  layoutDirty = false;
  baselineDirty = false;
  setStatus(layoutStatus, "Layout saved.", "success");
  await loadRoomLayouts();
  renderLayout();
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
  const hasHomes = Boolean(homes.length);

  firstUseOnboarding.classList.toggle("hidden", hasHomes);
  homesToolbar.classList.toggle("hidden", !hasHomes);
  homesGrid.classList.toggle("hidden", !hasHomes);
  searchPanel.classList.toggle("hidden", !hasHomes);

  if (!hasHomes) {
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
  renderHomeNextSteps(home.id);

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

const getJobBriefContext = (payload) => {
  const home = homes.find((item) => item.id === payload.home_id);
  const room = payload.room_id ? rooms.find((item) => item.id === payload.room_id) : null;
  const scopedDocuments = documents.filter((doc) => doc.home_id === payload.home_id && (!payload.room_id || doc.room_id === payload.room_id));
  const scopedEvents = timelineEvents.filter((event) => event.home_id === payload.home_id && (!payload.room_id || event.room_id === payload.room_id));
  const scopedInfrastructure = infrastructureItems.filter((item) => item.home_id === payload.home_id && (!payload.room_id || item.room_id === payload.room_id));
  const highRiskInfrastructure = scopedInfrastructure.filter((item) => item.risk_level === "High");
  const mediumRiskInfrastructure = scopedInfrastructure.filter((item) => item.risk_level === "Medium");

  return {
    home,
    room,
    documents: scopedDocuments,
    events: scopedEvents,
    infrastructure: scopedInfrastructure,
    highRiskInfrastructure,
    mediumRiskInfrastructure,
  };
};

const createJobBriefText = (payload) => {
  const context = getJobBriefContext(payload);
  const location = context.room ? `${context.room.name} (${context.room.room_type})` : "Whole home";
  const importantInfrastructure = [...context.highRiskInfrastructure, ...context.mediumRiskInfrastructure].slice(0, 8);
  const recentEvents = context.events.slice(0, 6);
  const relevantDocuments = context.documents.slice(0, 8);
  const documentsByType = relevantDocuments.map((doc) => `${doc.title} (${doc.document_type}, ${getRoomName(doc.room_id)})`);
  const infrastructureLines = importantInfrastructure.map((item) => {
    const evidence = item.source_document_id ? ` Evidence: ${getDocumentTitle(item.source_document_id) || "linked document"}.` : " No linked evidence yet.";
    return `${item.risk_level} risk ${item.infrastructure_type}: ${item.title}. Location: ${item.location_note}.${evidence}`;
  });
  const timelineLines = recentEvents.map((event) => {
    const evidenceCount = getEventDocuments(event.id).length;
    return `${formatTimelineDate(event.event_date)} - ${event.event_type}: ${event.title}${evidenceCount ? ` (${evidenceCount} linked evidence document${evidenceCount === 1 ? "" : "s"})` : ""}`;
  });
  const missingEvidenceWarnings = [];

  if (!context.documents.length) missingEvidenceWarnings.push("No documents are attached to this scope yet.");
  if (!context.infrastructure.length) missingEvidenceWarnings.push("No hidden infrastructure notes are recorded for this scope yet.");
  if (context.highRiskInfrastructure.some((item) => !item.source_document_id)) {
    missingEvidenceWarnings.push("Some high-risk infrastructure notes do not have linked evidence.");
  }

  return [
    "AI JOB BRIEF",
    "",
    "1. Request",
    `- Job type: ${payload.job_type}`,
    `- Urgency: ${payload.urgency}`,
    `- Property: ${context.home.address}`,
    `- Location: ${location}`,
    `- Home details: ${context.home.property_type}, built ${context.home.year_built}, ${formatSquareMeters(context.home.square_meters)} m2`,
    `- Homeowner description: ${payload.description}`,
    "",
    "2. Contractor-ready summary",
    `The requested work is a ${payload.job_type.toLowerCase()} task at ${location}. Review the hidden infrastructure notes and evidence below before drilling, opening walls/floors, changing plumbing/electrical routes, or pricing the work.`,
    "",
    "3. Known risks and hidden systems",
    formatBriefList(infrastructureLines, "No hidden infrastructure risks recorded for this scope."),
    "",
    "4. Relevant documents to review",
    formatBriefList(documentsByType, "No documents found for this scope."),
    "",
    "5. Recent history",
    formatBriefList(timelineLines, "No timeline events found for this scope."),
    "",
    "6. Missing information / uncertainty",
    formatBriefList(missingEvidenceWarnings, "No obvious documentation gaps found from the current home twin."),
    "",
    "7. Suggested contractor questions",
    "- Can the work be done without drilling or cutting near recorded hidden systems?",
    "- Do you need additional photos before pricing the job?",
    "- Should any area be opened for inspection before committing to scope or price?",
    "- Are permits, waterproofing certificates, or electrical documentation needed after completion?",
    "",
    "8. Suggested job package",
    "- Share this brief with the contractor.",
    "- Attach the relevant documents listed above.",
    "- Ask the contractor to return photos, receipts, and completion notes so the home twin stays updated.",
  ].join("\n");
};

const createAiJobBriefPayload = (payload) => {
  const context = getJobBriefContext(payload);

  return {
    request: {
      job_type: payload.job_type,
      urgency: payload.urgency,
      description: payload.description,
    },
    home: {
      address: context.home.address,
      property_type: context.home.property_type,
      year_built: context.home.year_built,
      square_meters: context.home.square_meters,
    },
    room: context.room
      ? {
          name: context.room.name,
          room_type: context.room.room_type,
        }
      : null,
    documents: context.documents.slice(0, 12).map((doc) => ({
      title: doc.title,
      document_type: doc.document_type,
      file_name: doc.file_name,
      room: getRoomName(doc.room_id),
    })),
    timeline: context.events.slice(0, 10).map((event) => ({
      date: event.event_date,
      type: event.event_type,
      title: event.title,
      description: event.description,
      room: event.room_id ? getRoomName(event.room_id) : "Whole home",
      linked_documents: getEventDocuments(event.id).map((doc) => doc.title),
    })),
    infrastructure: context.infrastructure.slice(0, 12).map((item) => ({
      type: item.infrastructure_type,
      title: item.title,
      location: item.location_note,
      risk_level: item.risk_level,
      confidence_level: item.confidence_level,
      linked_document: getDocumentTitle(item.source_document_id),
      notes: item.notes,
    })),
  };
};

const requestAiJobBrief = async (payload) => {
  const { data, error } = await supabase.functions.invoke("generate-job-brief", {
    body: createAiJobBriefPayload(payload),
  });

  if (error) {
    const response = error.context;

    if (response && typeof response.clone === "function") {
      try {
        const body = await response.clone().json();
        if (body?.error) throw new Error(body.error);
      } catch (parseError) {
        if (parseError instanceof Error && parseError.message !== "Unexpected end of JSON input") {
          throw parseError;
        }
      }
    }

    throw error;
  }

  if (data?.error) throw new Error(data.error);
  if (!data?.brief) throw new Error("AI did not return a job brief");

  return data;
};

const getJobBriefAiErrorMessage = (error) => {
  const message = error?.message ?? "The AI request failed.";

  if (message.includes("Failed to send a request to the Edge Function")) {
    return [
      message,
      "Likely fix: redeploy the Supabase Edge Function so supabase/config.toml is applied.",
    ].join(" ");
  }

  return message;
};

const renderApp = () => {
  renderHomes();

  if (selectedHomeId) renderHomeDetail();
  if (selectedHomeId) renderLayout();
  if (selectedRoomId) renderRoomDetail();
};

const navigateToHome = (homeId) => {
  selectedHomeId = homeId;
  selectedRoomId = null;
  renderHomeDetail();
  showView("home");
};

const navigateToLayout = (homeId) => {
  selectedHomeId = homeId;
  selectedRoomId = null;
  selectedPlanItem = null;
  activeFloorName = getHomeFloors(homeId)[0]?.name ?? "Main Floor";
  layoutEditorStarted = homeHasFloors(homeId);
  layoutDirty = false;
  layoutDraftHomeId = null;
  renderLayout();
  showView("layout");
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

  if (!timelineEvidenceAvailable) {
    const placeholder = document.createElement("option");
    placeholder.value = "";
    placeholder.textContent = "Run schema.sql to enable evidence links";
    timelineDocumentSelect.append(placeholder);
    timelineDocumentSelect.disabled = true;
    return;
  }

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

const resetJobBriefOutput = () => {
  generatedJobBriefText = "";
  jobBriefOutput.textContent = "";
  jobBriefOutput.classList.add("hidden");
  copyJobBriefButton.classList.add("hidden");
};

const updateModalDisabledStates = () => {
  const hasHomes = Boolean(homes.length);
  const documentHasRoom = Boolean(documentRoomSelect.value);
  const infrastructureHasRoom = Boolean(infrastructureRoomSelect.value);
  const timelineHasDocuments = timelineEvidenceAvailable && documents.some((doc) => {
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
  jobBriefTypeSelect.disabled = !hasHomes;
  jobBriefUrgencySelect.disabled = !hasHomes;
  jobBriefDescriptionInput.disabled = !hasHomes;
  generateJobBriefButton.disabled = !hasHomes;
};

const populateModalSelects = () => {
  populateHomeSelect(roomHomeSelect, "Select home");
  populateHomeSelect(documentHomeSelect, "Select home");
  populateHomeSelect(timelineHomeSelect, "Select home");
  populateHomeSelect(infrastructureHomeSelect, "Select home");
  populateHomeSelect(jobBriefHomeSelect, "Select home");

  populateRoomSelect(documentRoomSelect, documentHomeSelect.value, false);
  populateRoomSelect(timelineRoomSelect, timelineHomeSelect.value, true);
  populateRoomSelect(infrastructureRoomSelect, infrastructureHomeSelect.value, false);
  populateRoomSelect(jobBriefRoomSelect, jobBriefHomeSelect.value, true);
  populateInfrastructureDocumentSelect();
  populateTimelineDocumentSelect();
  updateModalDisabledStates();
};

const preselectModalContext = (name) => {
  if (selectedHomeId) {
    const firstHomeRoom = getHomeRooms(selectedHomeId)[0];
    roomHomeSelect.value = selectedHomeId;
    documentHomeSelect.value = selectedHomeId;
    timelineHomeSelect.value = selectedHomeId;
    infrastructureHomeSelect.value = selectedHomeId;
    jobBriefHomeSelect.value = selectedHomeId;
    populateRoomSelect(documentRoomSelect, selectedHomeId, false);
    populateRoomSelect(timelineRoomSelect, selectedHomeId, true);
    populateRoomSelect(infrastructureRoomSelect, selectedHomeId, false);
    populateRoomSelect(jobBriefRoomSelect, selectedHomeId, true);
    if (name === "document" && firstHomeRoom) documentRoomSelect.value = firstHomeRoom.id;
    if (name === "infrastructure" && firstHomeRoom) infrastructureRoomSelect.value = firstHomeRoom.id;
    populateTimelineDocumentSelect();
    populateInfrastructureDocumentSelect();
  }

  if (selectedRoomId) {
    const room = getSelectedRoom();
    if (room) {
      documentHomeSelect.value = room.home_id;
      timelineHomeSelect.value = room.home_id;
      infrastructureHomeSelect.value = room.home_id;
      jobBriefHomeSelect.value = room.home_id;
      populateRoomSelect(documentRoomSelect, room.home_id, false);
      populateRoomSelect(timelineRoomSelect, room.home_id, true);
      populateRoomSelect(infrastructureRoomSelect, room.home_id, false);
      populateRoomSelect(jobBriefRoomSelect, room.home_id, true);
      documentRoomSelect.value = room.id;
      timelineRoomSelect.value = room.id;
      infrastructureRoomSelect.value = room.id;
      jobBriefRoomSelect.value = room.id;
      populateInfrastructureDocumentSelect();
      populateTimelineDocumentSelect();
    }
  }

  if (name === "room" && selectedHomeId) {
    roomHomeSelect.value = selectedHomeId;
  }
};

const openActionModal = (name, options = {}) => {
  clearModalStatuses();
  if (name === "home") setHomeCreationMode(Boolean(options.onboarding));
  if (name === "jobBrief") resetJobBriefOutput();
  populateModalSelects();
  preselectModalContext(name);
  updateModalDisabledStates();
  openModal(name);
};

const createStarterRooms = async (homeId) => {
  const rows = starterRooms.map((room) => ({
    ...room,
    home_id: homeId,
    owner_id: currentUser.id,
  }));

  const { error } = await supabase.from("rooms").insert(rows);
  if (error) throw error;
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

const loadHomeFloors = async () => {
  const { data, error } = await supabase
    .from("home_floors")
    .select("id,home_id,name,sort_order,created_at")
    .eq("owner_id", currentUser.id)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) {
    if (isMissingTableError(error, "home_floors")) {
      homeFloors = [];
      return;
    }

    throw error;
  }

  homeFloors = data ?? [];
};

const loadRoomLayouts = async () => {
  if (!roomLayoutsAvailable) {
    roomLayouts = [];
    return;
  }

  const { data, error } = await supabase
    .from("room_layouts")
    .select("id,home_id,room_id,x,y,width,height,floor_name,dimensions_label,plan_features,baseline_layout,baseline_features,baseline_source,created_at,updated_at")
    .eq("owner_id", currentUser.id)
    .order("updated_at", { ascending: false });

  if (error) {
    if (isMissingTableError(error, "room_layouts")) {
      roomLayoutsAvailable = false;
      roomLayouts = [];
      return;
    }

    throw error;
  }

  roomLayoutsAvailable = true;
  roomLayouts = data ?? [];
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

  if (error) {
    if (error.message?.includes("timeline_event_documents")) {
      timelineEvidenceAvailable = false;
      timelineDocumentLinks = [];
      return;
    }

    throw error;
  }

  timelineEvidenceAvailable = true;
  timelineDocumentLinks = data ?? [];
};

const refreshDashboard = async () => {
  try {
    await loadHomes();
    await loadRooms();
    await loadHomeFloors();
    await loadRoomLayouts();
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
  if (documentIds.length && !timelineEvidenceAvailable) {
    throw new Error("Timeline evidence table is missing. Run schema.sql in Supabase SQL Editor, then refresh this page.");
  }

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

const validateJobBriefPayload = (payload) => {
  if (!payload.home_id) throw new Error("Choose a home for this job brief");
  if (!homes.some((home) => home.id === payload.home_id)) throw new Error("Selected home was not found");
  if (payload.room_id && !rooms.some((room) => room.id === payload.room_id && room.home_id === payload.home_id)) {
    throw new Error("Selected room does not belong to the selected home");
  }
  if (!payload.job_type) throw new Error("Choose a job type");
  if (!payload.urgency) throw new Error("Choose an urgency");
  if (!payload.description || payload.description.length < 10) throw new Error("Describe the work in at least 10 characters");
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
  const shouldCreateStarterRooms = isOnboardingHomeCreate;
  let starterRoomError = null;
  setStatus(homeStatus, "");
  setFormDisabled(homeForm, true);
  saveHomeButton.textContent = shouldCreateStarterRooms ? "Preparing..." : "Creating...";

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

    if (shouldCreateStarterRooms) {
      try {
        await createStarterRooms(data.id);
      } catch (error) {
        starterRoomError = error;
      }
    }

    selectedHomeId = data.id;
    homeForm.reset();
    closeModal();
    setStatus(homeStatus, "Home created successfully!", "success");
    await refreshDashboard();
    showView("home");

    if (starterRoomError) {
      showActionError(`Home created, but starter rooms could not be prepared: ${starterRoomError.message}`);
    }
  } catch (error) {
    setStatus(homeStatus, error.message, "error");
  } finally {
    setFormDisabled(homeForm, false);
    saveHomeButton.textContent = isOnboardingHomeCreate ? "Prepare my record" : "Create home";
  }
};

const handleCreateRoom = async (event) => {
  event.preventDefault();
  const targetLayoutFloorName = pendingLayoutRoomFloorName;
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

    if (targetLayoutFloorName) {
      activeFloorName = targetLayoutFloorName;
      layoutEditorStarted = true;
      moveRoomToActiveFloor(data.id);
      showView("layout");
    } else {
      showView("room");
    }
  } catch (error) {
    setStatus(roomStatus, error.message, "error");
  } finally {
    pendingLayoutRoomFloorName = null;
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

const handleGenerateJobBrief = async (event) => {
  event.preventDefault();
  setStatus(jobBriefStatus, "");
  generateJobBriefButton.disabled = true;
  generateJobBriefButton.textContent = "Generating...";

  try {
    const payload = {
      home_id: jobBriefHomeSelect.value,
      room_id: jobBriefRoomSelect.value || null,
      job_type: jobBriefTypeSelect.value,
      urgency: jobBriefUrgencySelect.value,
      description: jobBriefDescriptionInput.value.trim(),
    };

    validateJobBriefPayload(payload);
    let statusMessage = "AI job brief generated. Review it before sending to a contractor.";

    try {
      const aiResult = await requestAiJobBrief(payload);
      generatedJobBriefText = aiResult.brief;
    } catch (aiError) {
      generatedJobBriefText = createJobBriefText(payload);
      statusMessage = `AI unavailable, generated local fallback instead. ${getJobBriefAiErrorMessage(aiError)}`.trim();
    }

    jobBriefOutput.textContent = generatedJobBriefText;
    jobBriefOutput.classList.remove("hidden");
    copyJobBriefButton.classList.remove("hidden");
    setStatus(jobBriefStatus, statusMessage, "success");
  } catch (error) {
    setStatus(jobBriefStatus, error.message, "error");
  } finally {
    generateJobBriefButton.disabled = false;
    generateJobBriefButton.textContent = "Generate brief";
  }
};

const handleCopyJobBrief = async () => {
  if (!generatedJobBriefText) {
    setStatus(jobBriefStatus, "Generate a brief first.", "error");
    return;
  }

  try {
    await navigator.clipboard.writeText(generatedJobBriefText);
    setStatus(jobBriefStatus, "Job brief copied.", "success");
  } catch (error) {
    setStatus(jobBriefStatus, "Could not copy automatically. Select the text and copy it manually.", "error");
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

startFirstHomeButton.addEventListener("click", () => openActionModal("home", { onboarding: true }));
document.getElementById("openHomeModal").addEventListener("click", () => openActionModal("home"));
document.getElementById("openRoomModal").addEventListener("click", () => openActionModal("room"));
document.getElementById("openLayoutView").addEventListener("click", () => {
  if (selectedHomeId) navigateToLayout(selectedHomeId);
});
document.getElementById("openJobBriefModal").addEventListener("click", () => openActionModal("jobBrief"));
document.getElementById("openDocumentModal").addEventListener("click", () => openActionModal("document"));
document.getElementById("openTimelineModal").addEventListener("click", () => openActionModal("timeline"));
document.getElementById("openRoomInfrastructureModal").addEventListener("click", () => openActionModal("infrastructure"));
document.getElementById("openRoomInfrastructureModalSecondary").addEventListener("click", () => openActionModal("infrastructure"));
document.getElementById("openRoomJobBriefModal").addEventListener("click", () => openActionModal("jobBrief"));
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
document.getElementById("backToHomeFromLayout").addEventListener("click", () => {
  renderHomeDetail();
  showView("home");
});
saveLayoutButton.addEventListener("click", saveLayout);
resetLayoutButton.addEventListener("click", resetLayoutDrafts);
buildFloorPlanButton.addEventListener("click", handleBuildStarterFloorPlan);
setLayoutBaselineButton.addEventListener("click", setCurrentLayoutAsBaseline);
addFloorButton.addEventListener("click", handleAddFloor);
newFloorNameInput.addEventListener("input", updateLayoutControls);
layoutAddRoomSelect.addEventListener("change", updateLayoutControls);
addRoomToFloorButton.addEventListener("click", handleAddRoomToFloor);
createRoomOnFloorButton.addEventListener("click", openCreateRoomOnActiveFloor);
layoutRoomFloorSelect.addEventListener("change", updateSelectedRoomFloor);
layoutDimensionsInput.addEventListener("change", updateSelectedRoomDimensions);
layoutDimensionsInput.addEventListener("blur", updateSelectedRoomDimensions);
addDoorButton.addEventListener("click", () => addOpeningToSelectedRoom("door"));
addWindowButton.addEventListener("click", () => addOpeningToSelectedRoom("window"));
removeSelectedPlanItemButton.addEventListener("click", removeSelectedPlanItem);
document.querySelectorAll("[data-fixture]").forEach((button) => {
  button.addEventListener("click", () => addFixtureToSelectedRoom(button.dataset.fixture));
});
openSelectedRoomButton.addEventListener("click", () => {
  if (selectedLayoutRoomId) navigateToRoom(selectedLayoutRoomId);
});
uploadSelectedRoomDocumentButton.addEventListener("click", () => {
  const room = rooms.find((item) => item.id === selectedLayoutRoomId);
  if (!room) return;
  selectedHomeId = room.home_id;
  selectedRoomId = room.id;
  openActionModal("document");
});
addSelectedRoomNoteButton.addEventListener("click", () => {
  const room = rooms.find((item) => item.id === selectedLayoutRoomId);
  if (!room) return;
  selectedHomeId = room.home_id;
  selectedRoomId = room.id;
  openActionModal("infrastructure");
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
jobBriefHomeSelect.addEventListener("change", populateModalSelects);
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
jobBriefForm.addEventListener("submit", handleGenerateJobBrief);
copyJobBriefButton.addEventListener("click", handleCopyJobBrief);

initDashboard();
