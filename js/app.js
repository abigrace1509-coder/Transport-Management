// Transport Management System - Vanilla JS
// All main operations are handled through localStorage + DOM rendering.

const STORAGE_KEYS = {
  vehicles: "tms_vehicles",
  drivers: "tms_drivers",
  routes: "tms_routes",
  trips: "tms_trips",
  theme: "tms_theme"
};

const readData = (key) => JSON.parse(localStorage.getItem(key)) || [];
const saveData = (key, data) => localStorage.setItem(key, JSON.stringify(data));

let vehicles = readData(STORAGE_KEYS.vehicles);
let drivers = readData(STORAGE_KEYS.drivers);
let routes = readData(STORAGE_KEYS.routes);
let trips = readData(STORAGE_KEYS.trips);

// ---------- Navigation ----------
const navLinks = document.querySelectorAll(".nav-link");
const sections = document.querySelectorAll(".section");
const menuToggle = document.getElementById("menuToggle");
const mainNav = document.getElementById("mainNav");

navLinks.forEach((link) => {
  link.addEventListener("click", (e) => {
    e.preventDefault();
    const targetId = link.getAttribute("href").replace("#", "");
    showSection(targetId);
    mainNav.classList.remove("open");
  });
});

menuToggle.addEventListener("click", () => {
  mainNav.classList.toggle("open");
});

function showSection(id) {
  sections.forEach((section) => {
    section.classList.toggle("active-section", section.id === id);
  });

  navLinks.forEach((link) => {
    const isActive = link.getAttribute("href") === `#${id}`;
    link.classList.toggle("active", isActive);
  });
}

// ---------- Dashboard + Reports ----------
function updateDashboard() {
  const activeTrips = trips.filter((trip) => trip.status === "Active").length;
  const completedTrips = trips.filter((trip) => trip.status === "Completed").length;

  document.getElementById("totalVehicles").textContent = vehicles.length;
  document.getElementById("totalDrivers").textContent = drivers.length;
  document.getElementById("activeTrips").textContent = activeTrips;
  document.getElementById("completedTrips").textContent = completedTrips;

  document.getElementById("reportTotalTrips").textContent = trips.length;
  document.getElementById("reportActiveTrips").textContent = activeTrips;
  document.getElementById("reportCompletedTrips").textContent = completedTrips;

  // Simple CSS chart bars
  const total = activeTrips + completedTrips;
  const activePercent = total ? (activeTrips / total) * 100 : 0;
  const completePercent = total ? (completedTrips / total) * 100 : 0;

  document.getElementById("chartActive").style.height = `${activePercent}%`;
  document.getElementById("chartCompleted").style.height = `${completePercent}%`;
}

// ---------- Utility ----------
function validatePhone(phone) {
  // Basic 10-digit mobile validation (allows optional +country code and spaces/hyphen)
  return /^(\+\d{1,3}[\s-]?)?\d{10}$/.test(phone.replace(/\s/g, ""));
}

function showDeleteConfirm(label) {
  return confirm(`Are you sure you want to delete this ${label}?`);
}

function resetForm(formId) {
  document.getElementById(formId).reset();
}

function createOption(value, text = value) {
  const option = document.createElement("option");
  option.value = value;
  option.textContent = text;
  return option;
}

function refreshAll() {
  renderVehicles();
  renderDrivers();
  renderRoutes();
  renderTrips();
  renderReportsTable();
  populateSelects();
  updateDashboard();
}

// ---------- Vehicles ----------
const vehicleForm = document.getElementById("vehicleForm");
const vehicleTableBody = document.getElementById("vehicleTableBody");
const vehicleSearch = document.getElementById("vehicleSearch");

vehicleForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const number = document.getElementById("vehicleNumber").value.trim();
  const type = document.getElementById("vehicleType").value;
  const capacity = document.getElementById("vehicleCapacity").value;
  const status = document.getElementById("vehicleStatus").value;

  if (!number || !type || !capacity || !status) {
    alert("Please fill all vehicle fields.");
    return;
  }

  vehicles.push({
    id: Date.now(),
    number,
    type,
    capacity: Number(capacity),
    status
  });

  saveData(STORAGE_KEYS.vehicles, vehicles);
  resetForm("vehicleForm");
  refreshAll();
});

vehicleSearch.addEventListener("input", () => renderVehicles(vehicleSearch.value));

function renderVehicles(search = "") {
  vehicleTableBody.innerHTML = "";
  const term = search.toLowerCase();

  vehicles
    .filter((v) => `${v.number} ${v.type} ${v.status}`.toLowerCase().includes(term))
    .forEach((vehicle) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${vehicle.number}</td>
        <td>${vehicle.type}</td>
        <td>${vehicle.capacity}</td>
        <td>${vehicle.status}</td>
        <td><button class="delete-btn" data-id="${vehicle.id}" data-type="vehicle">Delete</button></td>
      `;
      vehicleTableBody.appendChild(tr);
    });
}

// ---------- Drivers ----------
const driverForm = document.getElementById("driverForm");
const driverTableBody = document.getElementById("driverTableBody");
const driverSearch = document.getElementById("driverSearch");

driverForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const name = document.getElementById("driverName").value.trim();
  const license = document.getElementById("licenseNumber").value.trim();
  const phone = document.getElementById("phoneNumber").value.trim();
  const assignedVehicle = document.getElementById("assignedVehicle").value;

  if (!name || !license || !phone || !assignedVehicle) {
    alert("Please fill all driver fields.");
    return;
  }

  if (!validatePhone(phone)) {
    alert("Please enter a valid phone number (10 digits).");
    return;
  }

  drivers.push({
    id: Date.now(),
    name,
    license,
    phone,
    assignedVehicle
  });

  saveData(STORAGE_KEYS.drivers, drivers);
  resetForm("driverForm");
  refreshAll();
});

driverSearch.addEventListener("input", () => renderDrivers(driverSearch.value));

function renderDrivers(search = "") {
  driverTableBody.innerHTML = "";
  const term = search.toLowerCase();

  drivers
    .filter((d) => `${d.name} ${d.license} ${d.assignedVehicle}`.toLowerCase().includes(term))
    .forEach((driver) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${driver.name}</td>
        <td>${driver.license}</td>
        <td>${driver.phone}</td>
        <td>${driver.assignedVehicle}</td>
        <td><button class="delete-btn" data-id="${driver.id}" data-type="driver">Delete</button></td>
      `;
      driverTableBody.appendChild(tr);
    });
}

// ---------- Routes ----------
const routeForm = document.getElementById("routeForm");
const routeTableBody = document.getElementById("routeTableBody");

routeForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const routeId = document.getElementById("routeId").value.trim();
  const source = document.getElementById("source").value.trim();
  const destination = document.getElementById("destination").value.trim();
  const distance = document.getElementById("distance").value;

  if (!routeId || !source || !destination || !distance) {
    alert("Please fill all route fields.");
    return;
  }

  routes.push({
    id: Date.now(),
    routeId,
    source,
    destination,
    distance: Number(distance)
  });

  saveData(STORAGE_KEYS.routes, routes);
  resetForm("routeForm");
  refreshAll();
});

function renderRoutes() {
  routeTableBody.innerHTML = "";

  routes.forEach((route) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${route.routeId}</td>
      <td>${route.source}</td>
      <td>${route.destination}</td>
      <td>${route.distance}</td>
      <td><button class="delete-btn" data-id="${route.id}" data-type="route">Delete</button></td>
    `;
    routeTableBody.appendChild(tr);
  });
}

// ---------- Trips ----------
const tripForm = document.getElementById("tripForm");
const tripTableBody = document.getElementById("tripTableBody");

tripForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const tripId = document.getElementById("tripId").value.trim();
  const vehicle = document.getElementById("tripVehicle").value;
  const driver = document.getElementById("tripDriver").value;
  const route = document.getElementById("tripRoute").value;
  const startTime = document.getElementById("startTime").value;
  const endTime = document.getElementById("endTime").value;
  const status = document.getElementById("tripStatus").value;

  if (!tripId || !vehicle || !driver || !route || !startTime || !endTime || !status) {
    alert("Please fill all trip fields.");
    return;
  }

  if (new Date(endTime) < new Date(startTime)) {
    alert("End time must be after start time.");
    return;
  }

  trips.push({
    id: Date.now(),
    tripId,
    vehicle,
    driver,
    route,
    startTime,
    endTime,
    status
  });

  // Update vehicle status based on trip status
  const vehicleObj = vehicles.find((v) => v.number === vehicle);
  if (vehicleObj) {
    vehicleObj.status = status === "Active" ? "On Trip" : "Available";
  }

  saveData(STORAGE_KEYS.trips, trips);
  saveData(STORAGE_KEYS.vehicles, vehicles);
  resetForm("tripForm");
  refreshAll();
});

function renderTrips() {
  tripTableBody.innerHTML = "";

  trips.forEach((trip) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${trip.tripId}</td>
      <td>${trip.vehicle}</td>
      <td>${trip.driver}</td>
      <td>${trip.route}</td>
      <td>${new Date(trip.startTime).toLocaleString()}</td>
      <td>${new Date(trip.endTime).toLocaleString()}</td>
      <td>${trip.status}</td>
      <td><button class="delete-btn" data-id="${trip.id}" data-type="trip">Delete</button></td>
    `;
    tripTableBody.appendChild(tr);
  });
}

// ---------- Reports ----------
const reportTableBody = document.getElementById("reportTableBody");
const filterVehicle = document.getElementById("filterVehicle");
const filterDriver = document.getElementById("filterDriver");
const filterStatus = document.getElementById("filterStatus");
const resetFilters = document.getElementById("resetFilters");

[filterVehicle, filterDriver, filterStatus].forEach((elem) => {
  elem.addEventListener("change", renderReportsTable);
});

resetFilters.addEventListener("click", () => {
  filterVehicle.value = "";
  filterDriver.value = "";
  filterStatus.value = "";
  renderReportsTable();
});

function renderReportsTable() {
  reportTableBody.innerHTML = "";

  const filteredTrips = trips.filter((trip) => {
    const matchVehicle = !filterVehicle.value || trip.vehicle === filterVehicle.value;
    const matchDriver = !filterDriver.value || trip.driver === filterDriver.value;
    const matchStatus = !filterStatus.value || trip.status === filterStatus.value;
    return matchVehicle && matchDriver && matchStatus;
  });

  filteredTrips.forEach((trip) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${trip.tripId}</td>
      <td>${trip.vehicle}</td>
      <td>${trip.driver}</td>
      <td>${trip.route}</td>
      <td>${new Date(trip.startTime).toLocaleString()}</td>
      <td>${new Date(trip.endTime).toLocaleString()}</td>
      <td>${trip.status}</td>
    `;
    reportTableBody.appendChild(tr);
  });
}

function populateSelects() {
  const assignedVehicle = document.getElementById("assignedVehicle");
  const tripVehicle = document.getElementById("tripVehicle");
  const tripDriver = document.getElementById("tripDriver");
  const tripRoute = document.getElementById("tripRoute");

  const vehicleFilters = [filterVehicle, assignedVehicle, tripVehicle];
  const driverFilters = [filterDriver, tripDriver];

  vehicleFilters.forEach((select) => {
    const firstOption = select.options[0];
    select.innerHTML = "";
    select.appendChild(firstOption);
    vehicles.forEach((v) => select.appendChild(createOption(v.number)));
  });

  driverFilters.forEach((select) => {
    const firstOption = select.options[0];
    select.innerHTML = "";
    select.appendChild(firstOption);
    drivers.forEach((d) => select.appendChild(createOption(d.name)));
  });

  const firstRouteOption = tripRoute.options[0];
  tripRoute.innerHTML = "";
  tripRoute.appendChild(firstRouteOption);
  routes.forEach((r) => {
    tripRoute.appendChild(createOption(r.routeId, `${r.routeId} (${r.source} → ${r.destination})`));
  });
}

// ---------- Generic Delete Handling ----------
document.addEventListener("click", (e) => {
  if (!e.target.classList.contains("delete-btn")) return;

  const id = Number(e.target.dataset.id);
  const type = e.target.dataset.type;

  if (!showDeleteConfirm(type)) return;

  if (type === "vehicle") {
    vehicles = vehicles.filter((item) => item.id !== id);
    saveData(STORAGE_KEYS.vehicles, vehicles);
  } else if (type === "driver") {
    drivers = drivers.filter((item) => item.id !== id);
    saveData(STORAGE_KEYS.drivers, drivers);
  } else if (type === "route") {
    routes = routes.filter((item) => item.id !== id);
    saveData(STORAGE_KEYS.routes, routes);
  } else if (type === "trip") {
    trips = trips.filter((item) => item.id !== id);
    saveData(STORAGE_KEYS.trips, trips);
  }

  refreshAll();
});

// ---------- Theme ----------
const themeToggle = document.getElementById("themeToggle");

function applySavedTheme() {
  const savedTheme = localStorage.getItem(STORAGE_KEYS.theme);
  if (savedTheme === "dark") {
    document.body.classList.add("dark");
    themeToggle.textContent = "☀️ Light";
  }
}

themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark");
  const isDark = document.body.classList.contains("dark");
  localStorage.setItem(STORAGE_KEYS.theme, isDark ? "dark" : "light");
  themeToggle.textContent = isDark ? "☀️ Light" : "🌙 Dark";
});

// ---------- Initial Render ----------
applySavedTheme();
refreshAll();
