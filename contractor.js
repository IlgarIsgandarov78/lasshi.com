import { supabase } from "./supabase.js";

const pageTitle = document.getElementById("contractorPageTitle");
const profileMeta = document.getElementById("contractorProfileMeta");
const greeting = document.getElementById("contractorGreeting");
const logoutButton = document.getElementById("logout");
const refreshButton = document.getElementById("refreshContractorWorkspace");
const copyWorkPackButton = document.getElementById("copyWorkPack");
const generateMobileReportButton = document.getElementById("generateMobileReport");
const assignedRoomCount = document.getElementById("assignedRoomCount");
const riskNoteCount = document.getElementById("riskNoteCount");
const sharedDocumentCount = document.getElementById("sharedDocumentCount");
const assignmentSearchInput = document.getElementById("assignmentSearch");
const clearAssignmentSearchButton = document.getElementById("clearAssignmentSearch");
const assignmentsList = document.getElementById("assignmentsList");
const assignmentDetail = document.getElementById("assignmentDetail");
const contractorStatus = document.getElementById("contractorStatus");
const contractorProfileForm = document.getElementById("contractorProfileForm");
const profileCompanyNameInput = document.getElementById("profileCompanyName");
const profileTradeTypeInput = document.getElementById("profileTradeType");
const profileCertificationsInput = document.getElementById("profileCertifications");
const profilePhoneInput = document.getElementById("profilePhone");
const contactRequestForm = document.getElementById("contactRequestForm");
const contactRequestEmailInput = document.getElementById("contactRequestEmail");
const contactRequestMessageInput = document.getElementById("contactRequestMessage");
const mobileAcceptTaskButton = document.getElementById("mobileAcceptTask");
const mobileStartTaskButton = document.getElementById("mobileStartTask");
const mobileWaitingTaskButton = document.getElementById("mobileWaitingTask");
const mobileCompleteTaskButton = document.getElementById("mobileCompleteTask");

let currentUser = null;
let currentProfile = null;
let assignments = [];
let homes = [];
let rooms = [];
let documents = [];
let timelineEvents = [];
let infrastructureItems = [];
let roomLayouts = [];
let workUpdates = [];
let assignmentMessages = [];
let assignmentMedia = [];
let assignmentMaterials = [];
let notifications = [];
let selectedAccessId = null;
let mediaRecorder = null;
let recordedVoiceChunks = [];

const activeAccessStatuses = new Set(["Pending", "Accepted", "In Progress", "Waiting for User", "Completed"]);

const setStatus = (message, type = "") => {
  contractorStatus.textContent = message;
  contractorStatus.className = `status-message ${type}`.trim();
};

const showActionError = (message) => {
  alert(message || "Something went wrong. Please try again.");
};

const normalizeText = (value) => String(value ?? "").toLowerCase().trim();
const normalizeAccountType = (value) => (value === "contractor" ? "contractor" : "consumer");
const createStatLine = (items) => items.filter(Boolean).join(" - ");

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

const formatTimelineDate = (dateValue) => {
  if (!dateValue) return "";

  const date = new Date(`${dateValue}T00:00:00`);
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatDateTime = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
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

const getFallbackProfile = (user) => ({
  user_id: user.id,
  email: (user.email ?? "").toLowerCase(),
  full_name: user.user_metadata?.full_name ?? "",
  account_type: normalizeAccountType(user.user_metadata?.account_type),
  trade_type: user.user_metadata?.trade_type ?? null,
  company_name: user.user_metadata?.company_name ?? null,
  phone: user.user_metadata?.phone ?? null,
  certifications: user.user_metadata?.certifications ?? null,
  service_area: user.user_metadata?.service_area ?? null,
  website: user.user_metadata?.website ?? null,
  past_work_summary: user.user_metadata?.past_work_summary ?? null,
});

const ensureCurrentProfile = async (user) => {
  const fallback = getFallbackProfile(user);

  try {
    const { data, error } = await supabase
      .from("user_profiles")
      .select("user_id,email,full_name,account_type,trade_type,company_name,phone,certifications,service_area,website,past_work_summary")
      .eq("user_id", user.id)
      .maybeSingle();

    if (error) throw error;
    if (data) return data;

    const { data: createdProfile, error: createError } = await supabase
      .from("user_profiles")
      .upsert(fallback, { onConflict: "user_id" })
      .select("user_id,email,full_name,account_type,trade_type,company_name,phone,certifications,service_area,website,past_work_summary")
      .single();

    if (createError) throw createError;
    return createdProfile ?? fallback;
  } catch (error) {
    console.warn("Could not load user profile. Falling back to auth metadata.", error);
    return fallback;
  }
};

const getHome = (homeId) => homes.find((home) => home.id === homeId);
const getRoom = (roomId) => rooms.find((room) => room.id === roomId);
const getHomeAddress = (homeId) => getHome(homeId)?.address ?? "Shared home";
const getRoomName = (roomId) => getRoom(roomId)?.name ?? "Shared room";
const getSelectedAssignment = () => assignments.find((assignment) => assignment.id === selectedAccessId);
const getRoomDocuments = (roomId) => documents.filter((doc) => doc.room_id === roomId);
const getRoomInfrastructure = (roomId) => infrastructureItems.filter((item) => item.room_id === roomId);
const getRoomTimeline = (assignment) => timelineEvents.filter((event) => {
  return event.home_id === assignment.home_id && (!event.room_id || event.room_id === assignment.room_id);
});
const getRoomLayout = (roomId) => roomLayouts.find((layout) => layout.room_id === roomId);
const getAssignmentUpdates = (assignmentId) => workUpdates.filter((update) => update.assignment_id === assignmentId);
const getAssignmentMessages = (assignmentId) => assignmentMessages.filter((message) => message.assignment_id === assignmentId);
const getAssignmentMedia = (assignmentId) => assignmentMedia.filter((item) => item.assignment_id === assignmentId);
const getAssignmentMaterials = (assignmentId) => assignmentMaterials.filter((item) => item.assignment_id === assignmentId);

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

const createStatusPill = (status) => {
  const pill = document.createElement("span");
  const normalized = normalizeText(status || "active").replace(/\s+/g, "-");

  pill.className = `status-pill status-${normalized}`;
  pill.textContent = status || "active";
  return pill;
};

const createSection = (title, detail = "") => {
  const section = document.createElement("section");
  const heading = document.createElement("div");
  const copy = document.createElement("div");
  const titleElement = document.createElement("h3");

  section.className = "content-section";
  heading.className = "section-heading";
  titleElement.textContent = title;
  copy.append(titleElement);

  if (detail) {
    const detailElement = document.createElement("p");
    detailElement.className = "muted";
    detailElement.textContent = detail;
    copy.append(detailElement);
  }

  heading.append(copy);
  section.append(heading);
  return section;
};

const createListSection = (title, detail, rows, emptyTitle, emptyDetail, createItem) => {
  const section = createSection(title, detail);
  const list = document.createElement("div");

  list.className = "stack-list";
  section.append(list);

  if (rows.length) {
    rows.forEach((row) => list.append(createItem(row)));
  } else {
    renderEmptyState(list, emptyTitle, emptyDetail);
  }

  return section;
};

const getAssignmentWindow = (assignment) => {
  if (assignment.starts_on && assignment.ends_on) {
    return `${formatTimelineDate(assignment.starts_on)} to ${formatTimelineDate(assignment.ends_on)}`;
  }

  if (assignment.starts_on) return `Starts ${formatTimelineDate(assignment.starts_on)}`;
  if (assignment.ends_on) return `Ends ${formatTimelineDate(assignment.ends_on)}`;
  return "";
};

const getAssignmentHaystack = (assignment) => {
  const room = getRoom(assignment.room_id);
  const home = getHome(assignment.home_id);
  const risks = getRoomInfrastructure(assignment.room_id).map((item) => `${item.title} ${item.infrastructure_type} ${item.location_note}`).join(" ");
  const docs = getRoomDocuments(assignment.room_id).map((doc) => `${doc.title} ${doc.document_type} ${doc.file_name}`).join(" ");

  return [
    home?.address,
    home?.property_type,
    room?.name,
    room?.room_type,
    assignment.trade_type,
    assignment.work_scope,
    assignment.access_note,
    risks,
    docs,
  ].join(" ");
};

const getFilteredAssignments = () => {
  const query = normalizeText(assignmentSearchInput.value);
  const visibleAssignments = assignments.filter((assignment) => activeAccessStatuses.has(assignment.status));

  if (query.length < 2) return visibleAssignments;
  return visibleAssignments.filter((assignment) => normalizeText(getAssignmentHaystack(assignment)).includes(query));
};

const createAssignmentCard = (assignment) => {
  const button = document.createElement("button");
  const header = document.createElement("div");
  const title = document.createElement("strong");
  const meta = document.createElement("span");
  const scope = document.createElement("span");
  const roomInfrastructure = getRoomInfrastructure(assignment.room_id);
  const highRiskCount = roomInfrastructure.filter((item) => item.risk_level === "High").length;

  button.className = `assignment-card ${assignment.id === selectedAccessId ? "active" : ""}`.trim();
  button.type = "button";
  title.textContent = getRoomName(assignment.room_id);
  meta.textContent = createStatLine([
    getHomeAddress(assignment.home_id),
    assignment.trade_type,
    highRiskCount ? `${highRiskCount} high risk` : "",
  ]);
  scope.textContent = assignment.work_scope;

  header.className = "assignment-card-header";
  header.append(title, createStatusPill(assignment.status));
  button.append(header, meta, scope);
  button.addEventListener("click", () => {
    selectedAccessId = assignment.id;
    renderWorkspace();
  });

  return button;
};

const renderAssignments = () => {
  const visibleAssignments = getFilteredAssignments();
  assignmentsList.replaceChildren();

  if (!visibleAssignments.length) {
    renderEmptyState(
      assignmentsList,
      assignments.length ? "No matching assignments" : "No rooms shared yet",
      assignments.length ? "Try a different search term." : "When a homeowner shares rooms with your email, they will appear here."
    );
    return;
  }

  visibleAssignments.forEach((assignment) => assignmentsList.append(createAssignmentCard(assignment)));
};

const createFactTile = (label, value) => {
  const tile = document.createElement("div");
  const strong = document.createElement("strong");
  const span = document.createElement("span");

  tile.className = "stat-tile compact-stat";
  strong.textContent = value;
  span.textContent = label;
  tile.append(strong, span);
  return tile;
};

const createDocumentItem = (doc) => {
  const item = document.createElement("article");
  const details = document.createElement("div");
  const title = document.createElement("button");
  const meta = document.createElement("p");

  item.className = "list-item";
  title.className = "link-button";
  title.type = "button";
  title.textContent = doc.title;
  title.addEventListener("click", () => handleOpenDocument(doc));
  meta.textContent = createStatLine([doc.document_type, doc.file_name, formatFileSize(doc.file_size)]);

  details.append(title, meta);
  item.append(details);
  return item;
};

const createInfrastructureItem = (item) => {
  const row = document.createElement("article");
  const details = document.createElement("div");
  const header = document.createElement("div");
  const title = document.createElement("h4");
  const meta = document.createElement("p");
  const location = document.createElement("p");

  row.className = "list-item infrastructure-item";
  header.className = "item-header";
  title.textContent = item.title;
  meta.textContent = createStatLine([item.infrastructure_type, `${item.confidence_level} confidence`]);
  location.className = "item-description";
  location.textContent = item.location_note;

  header.append(title, createStatusPill(`${item.risk_level} risk`));
  details.append(header, meta, location);

  if (item.notes) {
    const notes = document.createElement("p");
    notes.className = "item-description";
    notes.textContent = item.notes;
    details.append(notes);
  }

  row.append(details);
  return row;
};

const createTimelineItem = (event) => {
  const item = document.createElement("article");
  const details = document.createElement("div");
  const title = document.createElement("h4");
  const meta = document.createElement("p");

  item.className = "list-item";
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

  item.append(details);
  return item;
};

const createWorkUpdateItem = (update) => {
  const item = document.createElement("article");
  const details = document.createElement("div");
  const header = document.createElement("div");
  const title = document.createElement("h4");
  const meta = document.createElement("p");

  item.className = "list-item";
  header.className = "item-header";
  title.textContent = update.title;
  meta.textContent = createStatLine([update.update_type, formatDateTime(update.created_at)]);

  header.append(title, createStatusPill(update.work_status));
  details.append(header, meta);

  if (update.notes) {
    const notes = document.createElement("p");
    notes.className = "item-description";
    notes.textContent = update.notes;
    details.append(notes);
  }

  item.append(details);
  return item;
};

const createMessageItem = (message) => {
  const item = document.createElement("article");
  const body = document.createElement("p");
  const meta = document.createElement("span");

  item.className = `chat-message ${message.sender_id === currentUser.id ? "own-message" : ""}`.trim();
  body.textContent = message.body || (message.message_type === "voice" ? "Voice note" : "Attachment");
  meta.textContent = formatDateTime(message.created_at);
  item.append(body, meta);
  return item;
};

const createMediaItem = (media) => {
  const item = document.createElement("article");
  const details = document.createElement("div");
  const header = document.createElement("div");
  const title = document.createElement("h4");
  const meta = document.createElement("p");
  const openButton = document.createElement("button");

  item.className = "list-item";
  header.className = "item-header";
  title.textContent = media.title;
  meta.textContent = createStatLine([media.phase, media.file_name, formatFileSize(media.file_size), formatDateTime(media.created_at)]);
  header.append(title, createStatusPill(media.phase));
  details.append(header, meta);

  if (media.notes) {
    const notes = document.createElement("p");
    notes.className = "item-description";
    notes.textContent = media.notes;
    details.append(notes);
  }

  openButton.className = "secondary-button compact-button";
  openButton.type = "button";
  openButton.textContent = "Open";
  openButton.addEventListener("click", () => handleOpenMedia(media));
  item.append(details, openButton);
  return item;
};

const createMaterialItem = (material) => {
  const item = document.createElement("article");
  const details = document.createElement("div");
  const title = document.createElement("h4");
  const meta = document.createElement("p");

  item.className = "list-item";
  title.textContent = material.name;
  meta.textContent = createStatLine([
    material.category,
    material.brand,
    material.model,
    material.color,
    material.quantity ? `${material.quantity} ${material.unit || ""}`.trim() : "",
  ]);
  details.append(title, meta);

  if (material.notes) {
    const notes = document.createElement("p");
    notes.className = "item-description";
    notes.textContent = material.notes;
    details.append(notes);
  }

  item.append(details);
  return item;
};

const createStatusActionsSection = (assignment) => {
  const section = createSection("Task status", "Fast actions for on-site work.");
  const actions = document.createElement("div");
  const buttons = [
    ["Accepted", "Accept"],
    ["In Progress", "Start"],
    ["Waiting for User", "Waiting for user"],
    ["Completed", "Complete"],
  ];

  actions.className = "status-action-grid";
  buttons.forEach(([status, label]) => {
    const button = document.createElement("button");
    button.className = status === "Completed" ? "primary-button" : "secondary-button";
    button.type = "button";
    button.textContent = label;
    button.disabled = assignment.status === status || assignment.status === "Approved" || assignment.status === "Cancelled";
    button.addEventListener("click", () => updateAssignmentStatus(assignment, status));
    actions.append(button);
  });
  section.append(actions);
  return section;
};

const createChatSection = (assignment) => {
  const messages = getAssignmentMessages(assignment.id);
  const section = createSection("Chat", "Ask questions and clarify details with the homeowner.");
  const list = document.createElement("div");
  const form = document.createElement("form");

  list.className = "chat-list";
  if (messages.length) messages.forEach((message) => list.append(createMessageItem(message)));
  else renderEmptyState(list, "No messages yet", "Send the first question or update.");

  form.className = "form inline-message-form";
  form.innerHTML = `
    <input name="message" type="text" placeholder="Message homeowner" required />
    <button class="primary-button compact-button" type="submit">Send</button>
  `;
  form.addEventListener("submit", (event) => handleSendMessage(event, assignment));
  section.append(list, form);
  return section;
};

const createDocumentationSection = (assignment) => {
  const media = getAssignmentMedia(assignment.id);
  const section = createSection("Before, during, after", "Upload photos/files or record a quick voice note.");
  const list = document.createElement("div");
  const form = document.createElement("form");

  list.className = "stack-list";
  if (media.length) media.forEach((item) => list.append(createMediaItem(item)));
  else renderEmptyState(list, "No documentation yet", "Add before, during, after photos, or a voice note.");

  form.className = "form work-documentation-form";
  form.innerHTML = `
    <div class="form-grid">
      <label>
        Phase
        <select name="phase" required>
          <option value="Before">Before</option>
          <option value="During">During</option>
          <option value="After">After</option>
          <option value="Other">Other</option>
        </select>
      </label>
      <label>
        File
        <input name="file" type="file" accept="image/*,.pdf,application/pdf,audio/*" capture="environment" required />
      </label>
    </div>
    <label>
      Title
      <input name="title" type="text" placeholder="Example: Before opening wall" />
    </label>
    <label>
      Notes
      <textarea name="notes" rows="2" placeholder="What does this show?"></textarea>
    </label>
    <div class="action-row">
      <button class="primary-button" type="submit">Upload documentation</button>
      <button class="secondary-button" type="button" data-record-voice>Record voice</button>
      <button class="secondary-button hidden" type="button" data-stop-voice>Stop and upload</button>
    </div>
  `;
  form.addEventListener("submit", (event) => handleUploadDocumentation(event, assignment));
  form.querySelector("[data-record-voice]").addEventListener("click", () => startVoiceRecording(form));
  form.querySelector("[data-stop-voice]").addEventListener("click", () => stopVoiceRecording(assignment, form));
  section.append(list, form);
  return section;
};

const createMaterialsSection = (assignment) => {
  const materials = getAssignmentMaterials(assignment.id);
  const section = createSection("Materials and products", "Log paint, flooring, cable, appliances, parts, and product details.");
  const list = document.createElement("div");
  const form = document.createElement("form");

  list.className = "stack-list";
  if (materials.length) materials.forEach((item) => list.append(createMaterialItem(item)));
  else renderEmptyState(list, "No materials logged yet", "Add products used so future repairs are easier.");

  form.className = "form";
  form.innerHTML = `
    <label>
      Material or product
      <input name="name" type="text" placeholder="Example: Jotun Lady Pure Color" required />
    </label>
    <div class="form-grid">
      <input name="category" type="text" placeholder="Category" />
      <input name="brand" type="text" placeholder="Brand" />
    </div>
    <div class="form-grid">
      <input name="model" type="text" placeholder="Model/type" />
      <input name="color" type="text" placeholder="Color/spec" />
    </div>
    <div class="form-grid">
      <input name="quantity" type="number" min="0" step="0.01" placeholder="Qty" />
      <input name="unit" type="text" placeholder="Unit" />
    </div>
    <label>
      Notes
      <textarea name="notes" rows="2" placeholder="Supplier, batch number, install note, warranty detail"></textarea>
    </label>
    <button class="secondary-button" type="submit">Add material</button>
  `;
  form.addEventListener("submit", (event) => handleAddMaterial(event, assignment));
  section.append(list, form);
  return section;
};

const getChecklistItems = (assignment) => {
  const risks = getRoomInfrastructure(assignment.room_id);
  const highRiskCount = risks.filter((item) => item.risk_level === "High").length;
  const documentsCount = getRoomDocuments(assignment.room_id).length;

  return [
    {
      title: "Confirm the exact work area",
      detail: assignment.access_note || "Ask the homeowner where to start and what should stay untouched.",
    },
    {
      title: highRiskCount ? "Review high-risk notes before opening surfaces" : "Review infrastructure notes before drilling",
      detail: highRiskCount
        ? `${highRiskCount} high-risk note${highRiskCount === 1 ? "" : "s"} in this room.`
        : risks.length ? `${risks.length} infrastructure note${risks.length === 1 ? "" : "s"} available.` : "No infrastructure notes have been recorded yet.",
    },
    {
      title: "Open relevant documents",
      detail: documentsCount ? `${documentsCount} shared document${documentsCount === 1 ? "" : "s"} to review.` : "No shared documents are attached to this room yet.",
    },
    {
      title: "Leave a work update",
      detail: "Record what you found, what changed, blockers, and next actions before you leave.",
    },
  ];
};

const createChecklistSection = (assignment) => {
  const section = createSection("Job checklist", "Practical checks for this visit.");
  const grid = document.createElement("div");

  grid.className = "contractor-checklist";

  getChecklistItems(assignment).forEach((item) => {
    const row = document.createElement("article");
    const title = document.createElement("strong");
    const detail = document.createElement("span");

    row.className = "checklist-item";
    title.textContent = item.title;
    detail.textContent = item.detail;
    row.append(title, detail);
    grid.append(row);
  });

  section.append(grid);
  return section;
};

const createLayoutSection = (assignment) => {
  const section = createSection("Room layout", "Known dimensions and plan details.");
  const layout = getRoomLayout(assignment.room_id);
  const facts = document.createElement("div");

  facts.className = "stats-grid contractor-facts";

  if (!layout) {
    const wrapper = document.createElement("div");
    renderEmptyState(wrapper, "No saved layout", "The homeowner has not saved a layout for this room yet.");
    section.append(wrapper.firstElementChild);
    return section;
  }

  const features = layout.plan_features ?? {};
  facts.append(
    createFactTile("dimensions", layout.dimensions_label || "Not set"),
    createFactTile("doors/windows", String((features.openings ?? []).length)),
    createFactTile("fixtures", String((features.fixtures ?? []).length))
  );
  section.append(facts);
  return section;
};

const createUpdateFormSection = (assignment) => {
  const section = createSection("Add work update", "Visible to the homeowner.");
  const form = document.createElement("form");

  form.className = "form contractor-update-form";
  form.innerHTML = `
    <div class="form-grid">
      <label>
        Type
        <select name="updateType" required>
          <option value="Progress">Progress</option>
          <option value="Visit note">Visit note</option>
          <option value="Issue">Issue</option>
          <option value="Material">Material</option>
          <option value="Completion">Completion</option>
          <option value="Question">Question</option>
        </select>
      </label>
      <label>
        Status
        <select name="workStatus" required>
          <option value="In Progress">In Progress</option>
          <option value="Pending">Pending</option>
          <option value="Accepted">Accepted</option>
          <option value="Waiting for User">Waiting for User</option>
          <option value="Completed">Completed</option>
        </select>
      </label>
    </div>
    <label>
      Title
      <input name="title" type="text" placeholder="Example: Leak source found" required />
    </label>
    <label>
      Notes
      <textarea name="notes" rows="4" placeholder="What you checked, changed, found, or need next"></textarea>
    </label>
    <button class="primary-button" type="submit">Add update</button>
  `;
  form.addEventListener("submit", (event) => handleCreateWorkUpdate(event, assignment));
  section.append(form);
  return section;
};

const renderAssignmentDetail = () => {
  const assignment = getSelectedAssignment();
  assignmentDetail.replaceChildren();
  copyWorkPackButton.disabled = !assignment;
  generateMobileReportButton.disabled = !assignment;

  if (!assignment) {
    renderEmptyState(assignmentDetail, "Choose an assignment", "Select a shared room to see the work pack.");
    updateMobileStatusButtons(null);
    return;
  }

  const room = getRoom(assignment.room_id);
  const home = getHome(assignment.home_id);
  const roomDocuments = getRoomDocuments(assignment.room_id);
  const roomInfrastructure = getRoomInfrastructure(assignment.room_id);
  const roomTimeline = getRoomTimeline(assignment);
  const updates = getAssignmentUpdates(assignment.id);
  const summary = document.createElement("section");
  const titleBlock = document.createElement("div");
  const eyebrow = document.createElement("p");
  const title = document.createElement("h2");
  const meta = document.createElement("p");
  const scope = document.createElement("p");

  summary.className = "view-hero assignment-summary";
  eyebrow.className = "eyebrow";
  eyebrow.textContent = assignment.trade_type;
  title.textContent = room?.name ?? "Shared room";
  meta.className = "muted";
  meta.textContent = createStatLine([
    home?.address,
    room?.room_type,
    getAssignmentWindow(assignment),
  ]);
  scope.className = "item-description";
  scope.textContent = assignment.work_scope;
  titleBlock.append(eyebrow, title, meta, scope);
  summary.append(titleBlock, createStatusPill(assignment.status));
  assignmentDetail.append(summary);
  copyWorkPackButton.disabled = false;
  generateMobileReportButton.disabled = false;
  updateMobileStatusButtons(assignment);

  if (assignment.access_note) {
    const note = createSection("Access note");
    const text = document.createElement("p");
    text.className = "item-description";
    text.textContent = assignment.access_note;
    note.append(text);
    assignmentDetail.append(note);
  }

  assignmentDetail.append(createStatusActionsSection(assignment));
  assignmentDetail.append(createChatSection(assignment));
  assignmentDetail.append(createChecklistSection(assignment));
  assignmentDetail.append(createDocumentationSection(assignment));
  assignmentDetail.append(createMaterialsSection(assignment));
  assignmentDetail.append(createLayoutSection(assignment));
  assignmentDetail.append(createListSection(
    "Infrastructure and risks",
    "Hidden systems and caution zones shared by the homeowner.",
    roomInfrastructure,
    "No infrastructure notes",
    "Ask the homeowner before drilling, opening walls, or moving fixtures.",
    createInfrastructureItem
  ));
  assignmentDetail.append(createListSection(
    "Documents",
    "Photos, PDFs, receipts, manuals, drawings, and certificates.",
    roomDocuments,
    "No documents shared",
    "This room has no documents attached yet.",
    createDocumentItem
  ));
  assignmentDetail.append(createListSection(
    "Room history",
    "Recent renovations, repairs, installations, and inspections.",
    roomTimeline,
    "No room history",
    "There are no timeline events in this work scope yet.",
    createTimelineItem
  ));
  assignmentDetail.append(createListSection(
    "Work updates",
    "Your notes back to the homeowner.",
    updates,
    "No work updates yet",
    "Add the first update when you begin or finish work.",
    createWorkUpdateItem
  ));
  assignmentDetail.append(createUpdateFormSection(assignment));
};

const renderStats = () => {
  const visibleAssignments = assignments.filter((assignment) => activeAccessStatuses.has(assignment.status));
  const visibleRoomIds = new Set(visibleAssignments.map((assignment) => assignment.room_id));
  const visibleRisks = infrastructureItems.filter((item) => visibleRoomIds.has(item.room_id));
  const visibleDocs = documents.filter((doc) => visibleRoomIds.has(doc.room_id));

  assignedRoomCount.textContent = visibleAssignments.length;
  riskNoteCount.textContent = visibleRisks.length;
  sharedDocumentCount.textContent = visibleDocs.length;
};

const renderProfile = () => {
  const name = currentProfile.full_name || currentUser.email || "Contractor";
  const trade = currentProfile.trade_type || "Contractor";

  pageTitle.textContent = "Assigned work";
  profileMeta.textContent = createStatLine([trade, currentProfile.company_name]);
  greeting.textContent = `Welcome, ${name}`;
  profileCompanyNameInput.value = currentProfile.company_name || "";
  profileTradeTypeInput.value = currentProfile.trade_type || "";
  profileCertificationsInput.value = currentProfile.certifications || "";
  profilePhoneInput.value = currentProfile.phone || "";
};

const renderWorkspace = () => {
  renderProfile();
  renderStats();
  renderAssignments();
  renderAssignmentDetail();
};

const fetchRowsByIds = async (table, select, column, ids, order = null) => {
  const safeIds = Array.from(new Set(ids.filter(Boolean)));
  if (!safeIds.length) return [];

  let query = supabase.from(table).select(select).in(column, safeIds);
  if (order) query = query.order(order.column, { ascending: order.ascending });

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
};

const loadAssignments = async () => {
  const { data, error } = await supabase
    .from("work_assignments")
    .select("id,owner_id,contractor_id,contractor_email,contractor_name,contact_id,home_id,room_id,title,description,context_notes,priority,status,due_date,start_date,accepted_at,started_at,waiting_at,contractor_completed_at,completion_summary,owner_approved_at,owner_signature,created_at,updated_at")
    .order("updated_at", { ascending: false });

  if (error) throw error;
  assignments = (data ?? []).map((assignment) => ({
    ...assignment,
    trade_type: currentProfile.trade_type || "Trade work",
    work_scope: assignment.description,
    access_note: assignment.context_notes,
    starts_on: assignment.start_date,
    ends_on: assignment.due_date,
  }));
};

const loadSharedData = async () => {
  const homeIds = assignments.map((assignment) => assignment.home_id);
  const roomIds = assignments.map((assignment) => assignment.room_id);

  homes = await fetchRowsByIds("homes", "id,address,property_type,year_built,square_meters,created_at", "id", homeIds);
  rooms = await fetchRowsByIds("rooms", "id,home_id,name,room_type,created_at", "id", roomIds);
  documents = await fetchRowsByIds(
    "room_documents",
    "id,home_id,room_id,title,document_type,file_name,file_size,mime_type,storage_bucket,storage_path,created_at",
    "room_id",
    roomIds,
    { column: "created_at", ascending: false }
  );
  timelineEvents = await fetchRowsByIds(
    "timeline_events",
    "id,home_id,room_id,event_date,event_type,title,description,created_at",
    "home_id",
    homeIds,
    { column: "event_date", ascending: false }
  );
  infrastructureItems = await fetchRowsByIds(
    "room_infrastructure",
    "id,home_id,room_id,infrastructure_type,title,location_note,risk_level,confidence_level,source_document_id,notes,created_at",
    "room_id",
    roomIds,
    { column: "created_at", ascending: false }
  );

  try {
    roomLayouts = await fetchRowsByIds(
      "room_layouts",
      "id,home_id,room_id,x,y,width,height,floor_name,dimensions_label,plan_features,created_at,updated_at",
      "room_id",
      roomIds,
      { column: "updated_at", ascending: false }
    );
  } catch (error) {
    if (!isMissingTableError(error, "room_layouts")) throw error;
    roomLayouts = [];
  }

  const assignmentIds = assignments.map((assignment) => assignment.id);

  if (!assignmentIds.length) {
    workUpdates = [];
    assignmentMessages = [];
    assignmentMedia = [];
    assignmentMaterials = [];
    notifications = [];
    return;
  }

  const [updatesResult, messagesResult, mediaResult, materialsResult, notificationsResult] = await Promise.all([
    supabase
      .from("assignment_work_updates")
      .select("id,assignment_id,owner_id,contractor_id,home_id,room_id,update_type,work_status,title,notes,created_at,updated_at")
      .in("assignment_id", assignmentIds)
      .order("created_at", { ascending: false }),
    supabase
      .from("assignment_messages")
      .select("id,assignment_id,sender_id,message_type,body,storage_bucket,storage_path,file_name,mime_type,file_size,created_at")
      .in("assignment_id", assignmentIds)
      .order("created_at", { ascending: true }),
    supabase
      .from("assignment_media")
      .select("id,assignment_id,uploader_id,owner_id,home_id,room_id,phase,title,notes,storage_bucket,storage_path,file_name,mime_type,file_size,created_at")
      .in("assignment_id", assignmentIds)
      .order("created_at", { ascending: false }),
    supabase
      .from("assignment_materials")
      .select("id,assignment_id,uploader_id,owner_id,home_id,room_id,name,category,brand,model,color,quantity,unit,product_url,notes,created_at")
      .in("assignment_id", assignmentIds)
      .order("created_at", { ascending: false }),
    supabase
      .from("app_notifications")
      .select("id,user_id,actor_id,notification_type,title,body,assignment_id,contact_id,home_id,room_id,read_at,created_at")
      .eq("user_id", currentUser.id)
      .order("created_at", { ascending: false }),
  ]);

  const childError = updatesResult.error || messagesResult.error || mediaResult.error || materialsResult.error || notificationsResult.error;
  if (childError) throw childError;

  workUpdates = updatesResult.data ?? [];
  assignmentMessages = messagesResult.data ?? [];
  assignmentMedia = mediaResult.data ?? [];
  assignmentMaterials = materialsResult.data ?? [];
  notifications = notificationsResult.data ?? [];
};

const refreshContractorWorkspace = async () => {
  setStatus("Loading workspace...");
  refreshButton.disabled = true;

  try {
    await loadAssignments();
    await loadSharedData();

    if (selectedAccessId && !assignments.some((assignment) => assignment.id === selectedAccessId)) {
      selectedAccessId = null;
    }

    if (!selectedAccessId) {
      selectedAccessId = assignments.find((assignment) => activeAccessStatuses.has(assignment.status))?.id ?? assignments[0]?.id ?? null;
    }

    renderWorkspace();
    setStatus("");
  } catch (error) {
    const missingContractorTables =
      isMissingTableError(error, "work_assignments") ||
      isMissingTableError(error, "assignment_work_updates") ||
      isMissingTableError(error, "assignment_media") ||
      isMissingTableError(error, "assignment_messages") ||
      isMissingTableError(error, "assignment_materials");
    const message = missingContractorTables
      ? "Contractor workspace tables are missing. Run the latest schema.sql in Supabase SQL Editor."
      : error.message;

    renderEmptyState(assignmentsList, "Could not load assignments", message);
    renderEmptyState(assignmentDetail, "Workspace unavailable", message);
    setStatus(message, "error");
  } finally {
    refreshButton.disabled = false;
  }
};

const setFormDisabled = (form, disabled) => {
  form.querySelectorAll("input, select, textarea, button").forEach((input) => {
    input.disabled = disabled;
  });
};

const createNotification = async ({ user_id, notification_type, title, body = "", assignment_id = null, home_id = null, room_id = null }) => {
  if (!user_id) return;

  const { error } = await supabase.from("app_notifications").insert({
    user_id,
    actor_id: currentUser.id,
    notification_type,
    title,
    body,
    assignment_id,
    home_id,
    room_id,
  });

  if (error) console.warn("Could not create notification", error);
};

const updateMobileStatusButtons = (assignment) => {
  const disabled = !assignment || assignment.status === "Approved" || assignment.status === "Cancelled";
  const buttons = [
    [mobileAcceptTaskButton, "Accepted"],
    [mobileStartTaskButton, "In Progress"],
    [mobileWaitingTaskButton, "Waiting for User"],
    [mobileCompleteTaskButton, "Completed"],
  ];

  buttons.forEach(([button, status]) => {
    button.disabled = disabled || assignment?.status === status;
  });
};

const updateAssignmentStatus = async (assignment, status, shouldRefresh = true) => {
  const now = new Date().toISOString();
  const patch = {
    status,
    updated_at: now,
  };

  if (status === "Accepted") patch.accepted_at = now;
  if (status === "In Progress") patch.started_at = now;
  if (status === "Waiting for User") patch.waiting_at = now;
  if (status === "Completed") {
    patch.contractor_completed_at = now;
    patch.completion_summary = assignment.completion_summary || "Work marked completed by trade worker.";
  }

  const { error } = await supabase.from("work_assignments").update(patch).eq("id", assignment.id);
  if (error) throw error;

  await createNotification({
    user_id: assignment.owner_id,
    notification_type: "assignment_status",
    title: `Task ${status.toLowerCase()}`,
    body: assignment.title,
    assignment_id: assignment.id,
    home_id: assignment.home_id,
    room_id: assignment.room_id,
  });

  if (shouldRefresh) {
    setStatus(`Task marked ${status}.`, "success");
    await refreshContractorWorkspace();
  }
};

const sanitizeFileName = (fileName) => {
  return fileName.trim().replace(/[^a-zA-Z0-9._-]/g, "-").replace(/-+/g, "-").toLowerCase();
};

const createUploadId = () => {
  if (typeof globalThis.crypto?.randomUUID === "function") return globalThis.crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

const validateWorkUpdatePayload = (payload) => {
  if (!payload.assignment_id) throw new Error("Choose an assignment first");
  if (!payload.title || payload.title.length < 3) throw new Error("Update title must be at least 3 characters");
  if (!payload.update_type) throw new Error("Choose an update type");
  if (!payload.work_status) throw new Error("Choose a work status");
};

async function handleCreateWorkUpdate(event, assignment) {
  event.preventDefault();
  const form = event.currentTarget;
  const submitButton = form.querySelector('button[type="submit"]');

  setFormDisabled(form, true);
  submitButton.textContent = "Adding...";

  try {
    const formData = new FormData(form);
    const payload = {
      assignment_id: assignment.id,
      owner_id: assignment.owner_id,
      contractor_id: currentUser.id,
      home_id: assignment.home_id,
      room_id: assignment.room_id,
      update_type: formData.get("updateType"),
      work_status: formData.get("workStatus"),
      title: String(formData.get("title") ?? "").trim(),
      notes: String(formData.get("notes") ?? "").trim() || null,
    };

    validateWorkUpdatePayload(payload);
    const { error } = await supabase.from("assignment_work_updates").insert(payload);
    if (error) throw error;

    await updateAssignmentStatus(assignment, payload.work_status, false);

    form.reset();
    setStatus("Work update added.", "success");
    await refreshContractorWorkspace();
  } catch (error) {
    setStatus(error.message, "error");
  } finally {
    setFormDisabled(form, false);
    submitButton.textContent = "Add update";
  }
}

const handleSendMessage = async (event, assignment) => {
  event.preventDefault();
  const form = event.currentTarget;
  const input = form.querySelector('input[name="message"]');
  const body = input.value.trim();
  if (!body) return;

  setFormDisabled(form, true);

  try {
    const { error } = await supabase.from("assignment_messages").insert({
      assignment_id: assignment.id,
      sender_id: currentUser.id,
      message_type: "text",
      body,
    });
    if (error) throw error;

    await createNotification({
      user_id: assignment.owner_id,
      notification_type: "message_received",
      title: "New message from trade worker",
      body,
      assignment_id: assignment.id,
      home_id: assignment.home_id,
      room_id: assignment.room_id,
    });

    form.reset();
    await refreshContractorWorkspace();
  } catch (error) {
    setStatus(error.message, "error");
  } finally {
    setFormDisabled(form, false);
  }
};

const uploadAssignmentFile = async ({ assignment, file, phase, title, notes }) => {
  if (!file) throw new Error("Choose a file first");

  const safeName = sanitizeFileName(file.name || `${phase.toLowerCase()}-${Date.now()}`);
  const storagePath = `${currentUser.id}/${assignment.id}/${createUploadId()}-${safeName}`;
  const { error: uploadError } = await supabase.storage.from("work-documentation").upload(storagePath, file, {
    contentType: file.type || "application/octet-stream",
    upsert: false,
  });

  if (uploadError) throw uploadError;

  const { error: insertError } = await supabase.from("assignment_media").insert({
    assignment_id: assignment.id,
    uploader_id: currentUser.id,
    owner_id: assignment.owner_id,
    home_id: assignment.home_id,
    room_id: assignment.room_id,
    phase,
    title: title || file.name || `${phase} documentation`,
    notes: notes || null,
    storage_bucket: "work-documentation",
    storage_path: storagePath,
    file_name: file.name || `${phase.toLowerCase()}-${Date.now()}`,
    mime_type: file.type || "application/octet-stream",
    file_size: file.size,
  });

  if (insertError) {
    await supabase.storage.from("work-documentation").remove([storagePath]);
    throw insertError;
  }

  await createNotification({
    user_id: assignment.owner_id,
    notification_type: "documentation_uploaded",
    title: `${phase} documentation uploaded`,
    body: assignment.title,
    assignment_id: assignment.id,
    home_id: assignment.home_id,
    room_id: assignment.room_id,
  });
};

const handleUploadDocumentation = async (event, assignment) => {
  event.preventDefault();
  const form = event.currentTarget;
  const formData = new FormData(form);
  const file = formData.get("file");

  setFormDisabled(form, true);

  try {
    await uploadAssignmentFile({
      assignment,
      file,
      phase: formData.get("phase"),
      title: String(formData.get("title") ?? "").trim(),
      notes: String(formData.get("notes") ?? "").trim(),
    });

    form.reset();
    setStatus("Documentation uploaded.", "success");
    await refreshContractorWorkspace();
  } catch (error) {
    setStatus(error.message, "error");
  } finally {
    setFormDisabled(form, false);
  }
};

const startVoiceRecording = async (form) => {
  if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
    setStatus("Voice recording is not supported in this browser. Use the file picker to upload audio.", "error");
    return;
  }

  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  recordedVoiceChunks = [];
  mediaRecorder = new MediaRecorder(stream);
  mediaRecorder.addEventListener("dataavailable", (event) => {
    if (event.data.size > 0) recordedVoiceChunks.push(event.data);
  });
  mediaRecorder.start();
  form.querySelector("[data-record-voice]").classList.add("hidden");
  form.querySelector("[data-stop-voice]").classList.remove("hidden");
  setStatus("Recording voice note...");
};

const stopVoiceRecording = async (assignment, form) => {
  if (!mediaRecorder) return;

  const stopped = new Promise((resolve) => {
    mediaRecorder.addEventListener("stop", resolve, { once: true });
  });
  mediaRecorder.stop();
  mediaRecorder.stream.getTracks().forEach((track) => track.stop());
  await stopped;

  const blob = new Blob(recordedVoiceChunks, { type: "audio/webm" });
  const file = new File([blob], `voice-note-${Date.now()}.webm`, { type: "audio/webm" });

  try {
    await uploadAssignmentFile({
      assignment,
      file,
      phase: "Voice",
      title: "Voice update",
      notes: "Recorded on site",
    });
    setStatus("Voice note uploaded.", "success");
    await refreshContractorWorkspace();
  } catch (error) {
    setStatus(error.message, "error");
  } finally {
    form.querySelector("[data-record-voice]").classList.remove("hidden");
    form.querySelector("[data-stop-voice]").classList.add("hidden");
    mediaRecorder = null;
    recordedVoiceChunks = [];
  }
};

const handleAddMaterial = async (event, assignment) => {
  event.preventDefault();
  const form = event.currentTarget;
  const formData = new FormData(form);
  const name = String(formData.get("name") ?? "").trim();

  if (!name) return;
  setFormDisabled(form, true);

  try {
    const { error } = await supabase.from("assignment_materials").insert({
      assignment_id: assignment.id,
      uploader_id: currentUser.id,
      owner_id: assignment.owner_id,
      home_id: assignment.home_id,
      room_id: assignment.room_id,
      name,
      category: String(formData.get("category") ?? "").trim() || null,
      brand: String(formData.get("brand") ?? "").trim() || null,
      model: String(formData.get("model") ?? "").trim() || null,
      color: String(formData.get("color") ?? "").trim() || null,
      quantity: formData.get("quantity") ? Number(formData.get("quantity")) : null,
      unit: String(formData.get("unit") ?? "").trim() || null,
      notes: String(formData.get("notes") ?? "").trim() || null,
    });
    if (error) throw error;

    await createNotification({
      user_id: assignment.owner_id,
      notification_type: "material_logged",
      title: "Material logged",
      body: name,
      assignment_id: assignment.id,
      home_id: assignment.home_id,
      room_id: assignment.room_id,
    });

    form.reset();
    await refreshContractorWorkspace();
  } catch (error) {
    setStatus(error.message, "error");
  } finally {
    setFormDisabled(form, false);
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

const handleOpenMedia = async (media) => {
  const mediaWindow = window.open("about:blank", "_blank");
  if (mediaWindow) mediaWindow.opener = null;

  const { data, error } = await supabase.storage.from(media.storage_bucket).createSignedUrl(media.storage_path, 60);

  if (error) {
    mediaWindow?.close();
    showActionError(`Could not open file: ${error.message}`);
    return;
  }

  if (mediaWindow) {
    mediaWindow.location.href = data.signedUrl;
  } else {
    window.open(data.signedUrl, "_blank", "noopener");
  }
};

const buildWorkPackText = (assignment) => {
  const home = getHome(assignment.home_id);
  const room = getRoom(assignment.room_id);
  const risks = getRoomInfrastructure(assignment.room_id);
  const docs = getRoomDocuments(assignment.room_id);
  const events = getRoomTimeline(assignment).slice(0, 6);
  const layout = getRoomLayout(assignment.room_id);

  return [
    "LASSHI WORK PACK",
    "",
    "1. Assignment",
    `- Property: ${home?.address ?? "Shared home"}`,
    `- Room: ${room?.name ?? "Shared room"}${room?.room_type ? ` (${room.room_type})` : ""}`,
    `- Trade: ${assignment.trade_type}`,
    `- Scope: ${assignment.work_scope}`,
    assignment.access_note ? `- Access note: ${assignment.access_note}` : "",
    getAssignmentWindow(assignment) ? `- Access window: ${getAssignmentWindow(assignment)}` : "",
    "",
    "2. Layout",
    layout ? `- Dimensions: ${layout.dimensions_label || "Not set"}` : "- No saved room layout",
    layout ? `- Doors/windows: ${(layout.plan_features?.openings ?? []).length}` : "",
    layout ? `- Fixtures: ${(layout.plan_features?.fixtures ?? []).length}` : "",
    "",
    "3. Infrastructure and risks",
    risks.length
      ? risks.map((item) => `- ${item.risk_level} risk ${item.infrastructure_type}: ${item.title}. Location: ${item.location_note}`).join("\n")
      : "- No infrastructure notes shared",
    "",
    "4. Shared documents",
    docs.length ? docs.map((doc) => `- ${doc.title} (${doc.document_type}, ${doc.file_name})`).join("\n") : "- No documents shared",
    "",
    "5. Recent history",
    events.length ? events.map((event) => `- ${formatTimelineDate(event.event_date)}: ${event.event_type} - ${event.title}`).join("\n") : "- No timeline events shared",
    "",
    "6. Materials logged",
    getAssignmentMaterials(assignment.id).length
      ? getAssignmentMaterials(assignment.id).map((item) => `- ${createStatLine([item.name, item.brand, item.model, item.color])}`).join("\n")
      : "- No materials logged",
  ].filter((line) => line !== "").join("\n");
};

const generateWorkReport = (assignment = getSelectedAssignment()) => {
  if (!assignment) return;

  const home = getHome(assignment.home_id);
  const room = getRoom(assignment.room_id);
  const media = getAssignmentMedia(assignment.id);
  const materials = getAssignmentMaterials(assignment.id);
  const updates = getAssignmentUpdates(assignment.id);
  const reportWindow = window.open("", "_blank", "noopener");

  if (!reportWindow) {
    setStatus("Could not open report window. Allow popups and try again.", "error");
    return;
  }

  const escapeHtml = (value) => String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

  reportWindow.document.write(`
    <!doctype html>
    <html>
      <head>
        <title>${escapeHtml(assignment.title)} report</title>
        <style>
          body { font-family: system-ui, -apple-system, Segoe UI, sans-serif; margin: 28px; color: #172033; }
          h1, h2 { margin-bottom: 6px; }
          section { margin-top: 22px; }
          .meta, li { color: #475467; line-height: 1.5; }
          .box { border: 1px solid #d0d5dd; border-radius: 8px; padding: 14px; margin-top: 10px; }
          @media print { button { display: none; } body { margin: 18mm; } }
        </style>
      </head>
      <body>
        <button onclick="window.print()">Save as PDF</button>
        <h1>${escapeHtml(assignment.title)}</h1>
        <p class="meta">${escapeHtml(home?.address)} - ${escapeHtml(room?.name)} - ${escapeHtml(assignment.status)}</p>
        <section class="box">
          <h2>Work summary</h2>
          <p>${escapeHtml(assignment.completion_summary || assignment.description)}</p>
          <p class="meta">Trade worker: ${escapeHtml(currentProfile.company_name || currentProfile.full_name || currentUser.email)}</p>
          <p class="meta">Date: ${escapeHtml(formatDateTime(new Date().toISOString()))}</p>
        </section>
        <section>
          <h2>Materials</h2>
          <ul>${materials.length ? materials.map((item) => `<li>${escapeHtml(createStatLine([item.name, item.brand, item.model, item.color, item.quantity ? `${item.quantity} ${item.unit || ""}`.trim() : ""]))}</li>`).join("") : "<li>No materials logged.</li>"}</ul>
        </section>
        <section>
          <h2>Photos, files, and voice notes</h2>
          <ul>${media.length ? media.map((item) => `<li>${escapeHtml(item.phase)} - ${escapeHtml(item.title)} - ${escapeHtml(item.file_name)}</li>`).join("") : "<li>No documentation uploaded.</li>"}</ul>
        </section>
        <section>
          <h2>Progress notes</h2>
          ${updates.length ? updates.map((item) => `<div class="box"><strong>${escapeHtml(item.title)}</strong><p class="meta">${escapeHtml(item.work_status)} - ${escapeHtml(formatDateTime(item.created_at))}</p><p>${escapeHtml(item.notes || "")}</p></div>`).join("") : "<p>No updates logged.</p>"}
        </section>
      </body>
    </html>
  `);
  reportWindow.document.close();
};

const handleCopyWorkPack = async () => {
  const assignment = getSelectedAssignment();
  if (!assignment) return;

  try {
    await navigator.clipboard.writeText(buildWorkPackText(assignment));
    setStatus("Work pack copied.", "success");
  } catch (error) {
    setStatus("Could not copy automatically. Select details manually.", "error");
  }
};

const handleSaveContractorProfile = async (event) => {
  event.preventDefault();
  setFormDisabled(contractorProfileForm, true);

  try {
    const patch = {
      user_id: currentUser.id,
      email: (currentUser.email ?? "").toLowerCase(),
      full_name: currentProfile.full_name || currentUser.user_metadata?.full_name || "",
      account_type: "contractor",
      company_name: profileCompanyNameInput.value.trim() || null,
      trade_type: profileTradeTypeInput.value.trim() || null,
      certifications: profileCertificationsInput.value.trim() || null,
      phone: profilePhoneInput.value.trim() || null,
      updated_at: new Date().toISOString(),
    };
    const { data, error } = await supabase
      .from("user_profiles")
      .upsert(patch, { onConflict: "user_id" })
      .select("user_id,email,full_name,account_type,trade_type,company_name,phone,certifications,service_area,website,past_work_summary")
      .single();

    if (error) throw error;
    currentProfile = data;
    renderProfile();
    setStatus("Profile saved.", "success");
  } catch (error) {
    setStatus(error.message, "error");
  } finally {
    setFormDisabled(contractorProfileForm, false);
  }
};

const handleSendContactRequest = async (event) => {
  event.preventDefault();
  setFormDisabled(contactRequestForm, true);

  try {
    const recipientEmail = contactRequestEmailInput.value.trim().toLowerCase();
    if (!recipientEmail || recipientEmail === (currentUser.email ?? "").toLowerCase()) {
      throw new Error("Enter a homeowner email that is not your own.");
    }

    const { error } = await supabase
      .from("trade_contacts")
      .insert({
        requester_id: currentUser.id,
        requester_email: (currentUser.email ?? "").toLowerCase(),
        requester_name: currentProfile.full_name || currentUser.email,
        requester_trade_type: currentProfile.trade_type || "Trade worker",
        requester_company_name: currentProfile.company_name || null,
        recipient_email: recipientEmail,
        message: contactRequestMessageInput.value.trim() || null,
        status: "pending",
        updated_at: new Date().toISOString(),
      });

    if (error) throw error;

    contactRequestForm.reset();
    setStatus("Contact request sent.", "success");
  } catch (error) {
    setStatus(error.message, "error");
  } finally {
    setFormDisabled(contactRequestForm, false);
  }
};

const initContractorWorkspace = async () => {
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    window.location.href = "./index.html";
    return;
  }

  currentUser = data.user;
  currentProfile = await ensureCurrentProfile(currentUser);

  if (currentProfile.account_type !== "contractor") {
    window.location.href = "./dashboard.html";
    return;
  }

  await refreshContractorWorkspace();
};

logoutButton.addEventListener("click", async () => {
  await supabase.auth.signOut();
  window.location.href = "./index.html";
});

refreshButton.addEventListener("click", refreshContractorWorkspace);
copyWorkPackButton.addEventListener("click", handleCopyWorkPack);
generateMobileReportButton.addEventListener("click", () => generateWorkReport());
contractorProfileForm.addEventListener("submit", handleSaveContractorProfile);
contactRequestForm.addEventListener("submit", handleSendContactRequest);
mobileAcceptTaskButton.addEventListener("click", () => {
  const assignment = getSelectedAssignment();
  if (assignment) updateAssignmentStatus(assignment, "Accepted");
});
mobileStartTaskButton.addEventListener("click", () => {
  const assignment = getSelectedAssignment();
  if (assignment) updateAssignmentStatus(assignment, "In Progress");
});
mobileWaitingTaskButton.addEventListener("click", () => {
  const assignment = getSelectedAssignment();
  if (assignment) updateAssignmentStatus(assignment, "Waiting for User");
});
mobileCompleteTaskButton.addEventListener("click", () => {
  const assignment = getSelectedAssignment();
  if (assignment) updateAssignmentStatus(assignment, "Completed");
});
assignmentSearchInput.addEventListener("input", renderWorkspace);
clearAssignmentSearchButton.addEventListener("click", () => {
  assignmentSearchInput.value = "";
  renderWorkspace();
});

initContractorWorkspace();
