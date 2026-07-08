function generateId() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// theme toggle

const themeToggle = document.querySelector("#theme-toggle");

let isDarkMode = localStorage.getItem("pd_theme") === "light" ? false : true;

function applyTheme() {
  if (isDarkMode) {
    document.documentElement.setAttribute("data-theme", "dark");
    localStorage.setItem("pd_theme", "dark");
  } else {
    document.documentElement.setAttribute("data-theme", "light");
    localStorage.setItem("pd_theme", "light");
  }
}
applyTheme();

themeToggle.addEventListener("click", () => {
  isDarkMode = !isDarkMode;
  applyTheme();
});

// clock and greeting

const clockTime = document.querySelector("#clock-time");
const clockDate = document.querySelector("#clock-date");
const greeting = document.querySelector("#greeting");
const bgLayer = document.querySelector("#bg-layer");

function pad(n) {
  return n < 10 ? "0" + n : n;
}

function getTimeCategory(hour) {
  if (hour >= 5 && hour < 12) return "morning";
  if (hour >= 12 && hour < 17) return "afternoon";
  if (hour >= 17 && hour < 21) return "evening";
  return "night";
}

function updateClock() {
  const now = new Date();
  clockTime.innerHTML = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
  clockDate.innerHTML = now.toLocaleDateString(undefined, {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const category = getTimeCategory(now.getHours());
  if (bgLayer.className !== `tod-${category}`) {
    bgLayer.className = `tod-${category}`;
    if (category === "morning") greeting.innerHTML = "Good morning. Let's build the day.";
    else if (category === "afternoon") greeting.innerHTML = "Good afternoon. Keep the momentum.";
    else if (category === "evening") greeting.innerHTML = "Good evening. Wrap up with intent.";
    else greeting.innerHTML = "Working late — pace yourself.";
  }
}
updateClock();
setInterval(updateClock, 1000);

// navigation

const dashboard = document.querySelector("#dashboard");
const featureCards = document.querySelectorAll(".card");
const backButtons = document.querySelectorAll("[data-back]");

let activeFeature = null;

function openFeature(name) {
  if (activeFeature === name) return;
  const section = document.querySelector(`#feature-${name}`);
  if (!section) return;

  document.querySelectorAll(".feature.is-active").forEach((el) => el.classList.remove("is-active"));
  dashboard.style.display = "none";
  section.classList.add("is-active");
  activeFeature = name;
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function showDashboard() {
  document.querySelectorAll(".feature.is-active").forEach((el) => el.classList.remove("is-active"));
  dashboard.style.display = "grid";
  activeFeature = null;
}

featureCards.forEach((card) => {
  card.addEventListener("click", () => {
    openFeature(card.dataset.feature);
  });
});

backButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    showDashboard();
  });
});

// todo list

const todoForm = document.querySelector("#todo-form");
const todoInput = document.querySelector("#todo-input");
const todoList = document.querySelector("#todo-list");
const todoEmpty = document.querySelector("#todo-empty");
const todoCount = document.querySelector("#todo-count");
const todoPreview = document.querySelector("#todo-preview");
const todoFilterButtons = document.querySelectorAll("#feature-todo .chip-filter");

let todos = JSON.parse(localStorage.getItem("pd_todos")) || [];
let todoFilterValue = "all";

function renderTodos() {
  let visible = todos;
  if (todoFilterValue === "active") visible = todos.filter((t) => !t.done);
  else if (todoFilterValue === "important") visible = todos.filter((t) => t.important && !t.done);
  else if (todoFilterValue === "done") visible = todos.filter((t) => t.done);

  todoList.innerHTML = "";
  visible.forEach((task) => {
    let taskHTML = `<li class="todo-item ${task.done ? "is-done" : ""} ${task.important ? "is-important" : ""}">
      <button class="todo-check" onClick="toggleTodo('${task.id}')">${task.done ? "✓" : ""}</button>
      <span class="todo-text">${task.text}</span>
      <span class="todo-actions">
        <button class="icon-btn ${task.important ? "is-active" : ""}" onClick="toggleImportant('${task.id}')">★</button>
        <button class="icon-btn" onClick="deleteTodo('${task.id}')">✕</button>
      </span>
    </li>`;
    todoList.innerHTML += taskHTML;
  });

  todoEmpty.classList.toggle("is-visible", visible.length === 0);

  let openCount = todos.filter((t) => !t.done).length;
  todoCount.innerHTML = `${openCount} open`;

  let preview = todos.filter((t) => !t.done).slice(0, 3);
  if (preview.length > 0) {
    todoPreview.innerHTML = "";
    preview.forEach((task) => {
      todoPreview.innerHTML += `<div class="mini-row"><span class="mini-dot"></span>${task.text}</div>`;
    });
  } else {
    todoPreview.innerHTML = `<p class="card-empty">No tasks yet — add your first one.</p>`;
  }
}
renderTodos();
localStorage.setItem("pd_todos", JSON.stringify(todos));

todoForm.addEventListener("submit", (e) => {
  e.preventDefault();
  let text = todoInput.value.trim();
  if (text === "") return;

  todos.unshift({ id: generateId(), text: text, done: false, important: false });
  localStorage.setItem("pd_todos", JSON.stringify(todos));
  renderTodos();
  todoForm.reset();
});

function toggleTodo(id) {
  let task = todos.find((t) => t.id === id);
  if (task) task.done = !task.done;
  localStorage.setItem("pd_todos", JSON.stringify(todos));
  renderTodos();
}

function toggleImportant(id) {
  let task = todos.find((t) => t.id === id);
  if (task) task.important = !task.important;
  localStorage.setItem("pd_todos", JSON.stringify(todos));
  renderTodos();
}

function deleteTodo(id) {
  todos = todos.filter((t) => t.id !== id);
  localStorage.setItem("pd_todos", JSON.stringify(todos));
  renderTodos();
}

todoFilterButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    todoFilterValue = btn.dataset.filter;
    todoFilterButtons.forEach((b) => b.classList.toggle("is-active", b === btn));
    renderTodos();
  });
});

// daily planner

const plannerList = document.querySelector("#planner-list");
const plannerCount = document.querySelector("#planner-count");
const plannerPreview = document.querySelector("#planner-preview");

let plan = JSON.parse(localStorage.getItem("pd_planner")) || {};
let plannerSaveTimer = null;

function getHourLabel(h) {
  const period = h < 12 ? "AM" : "PM";
  let display = h % 12;
  if (display === 0) display = 12;
  return `${display}:00 ${period}`;
}

function updatePlannerSummary() {
  const currentHour = new Date().getHours();

  let filled = 0;
  for (let hour in plan) {
    if (plan[hour] && plan[hour].trim() !== "") filled++;
  }
  plannerCount.innerHTML = `${filled} filled`;

  let upcoming = [];
  for (let hour in plan) {
    if (plan[hour] && plan[hour].trim() !== "" && Number(hour) >= currentHour) {
      upcoming.push([Number(hour), plan[hour]]);
    }
  }
  upcoming.sort((a, b) => a[0] - b[0]);
  upcoming = upcoming.slice(0, 3);

  if (upcoming.length > 0) {
    plannerPreview.innerHTML = "";
    upcoming.forEach((entry) => {
      plannerPreview.innerHTML += `<div class="mini-row"><span class="mini-dot"></span>${getHourLabel(entry[0])} — ${entry[1]}</div>`;
    });
  } else {
    plannerPreview.innerHTML = `<p class="card-empty">Nothing scheduled yet.</p>`;
  }
}

function renderPlanner() {
  const currentHour = new Date().getHours();
  plannerList.innerHTML = "";

  for (let h = 0; h < 24; h++) {
    let rowHTML = `<div class="planner-row ${h === currentHour ? "is-now" : ""}" data-hour="${h}">
      <span class="planner-hour">${getHourLabel(h)}</span>
      <input type="text" class="planner-text" placeholder="Nothing planned" maxlength="140" value="${plan[h] || ""}">
    </div>`;
    plannerList.innerHTML += rowHTML;
  }

  updatePlannerSummary();
}
renderPlanner();

plannerList.addEventListener("input", (e) => {
  const input = e.target.closest(".planner-text");
  if (!input) return;

  const hour = input.closest(".planner-row").dataset.hour;
  const value = input.value;

  if (value.trim() !== "") plan[hour] = value;
  else delete plan[hour];

  clearTimeout(plannerSaveTimer);
  plannerSaveTimer = setTimeout(() => {
    localStorage.setItem("pd_planner", JSON.stringify(plan));
    document.querySelectorAll(".planner-row").forEach((row) => {
      row.classList.toggle("is-now", Number(row.dataset.hour) === new Date().getHours());
    });
    updatePlannerSummary();
  }, 500);
});

// daily goals

const goalForm = document.querySelector("#goal-form");
const goalInput = document.querySelector("#goal-input");
const goalsList = document.querySelector("#goals-list");
const goalsEmpty = document.querySelector("#goals-empty");
const goalsCount = document.querySelector("#goals-count");
const goalsProgressFill = document.querySelector("#goals-progress-fill");
const goalsProgressFillFull = document.querySelector("#goals-progress-fill-full");
const goalsProgressLabel = document.querySelector("#goals-progress-label");

let goals = JSON.parse(localStorage.getItem("pd_goals")) || [];

function renderGoals() {
  goalsList.innerHTML = "";
  goals.forEach((goal) => {
    let goalHTML = `<li class="goal-item ${goal.done ? "is-done" : ""}">
      <button class="goal-check" onClick="toggleGoal('${goal.id}')">${goal.done ? "✓" : ""}</button>
      <span class="goal-text">${goal.text}</span>
      <button class="icon-btn" onClick="deleteGoal('${goal.id}')">✕</button>
    </li>`;
    goalsList.innerHTML += goalHTML;
  });

  goalsEmpty.classList.toggle("is-visible", goals.length === 0);

  let total = goals.length;
  let done = goals.filter((g) => g.done).length;
  let pct = total ? Math.round((done / total) * 100) : 0;

  goalsCount.innerHTML = `${done} of ${total}`;
  goalsProgressFill.style.width = `${pct}%`;
  goalsProgressFillFull.style.width = `${pct}%`;
  goalsProgressLabel.innerHTML = `${done} of ${total} completed`;
}
renderGoals();

goalForm.addEventListener("submit", (e) => {
  e.preventDefault();
  let text = goalInput.value.trim();
  if (text === "") return;

  goals.push({ id: generateId(), text: text, done: false });
  localStorage.setItem("pd_goals", JSON.stringify(goals));
  renderGoals();
  goalForm.reset();
});

function toggleGoal(id) {
  let goal = goals.find((g) => g.id === id);
  if (goal) goal.done = !goal.done;
  localStorage.setItem("pd_goals", JSON.stringify(goals));
  renderGoals();
}

function deleteGoal(id) {
  goals = goals.filter((g) => g.id !== id);
  localStorage.setItem("pd_goals", JSON.stringify(goals));
  renderGoals();
}

// motivation quote

const quoteText = document.querySelector("#quote-text");
const quoteAuthor = document.querySelector("#quote-author");
const quoteMini = document.querySelector("#quote-mini");
const quoteCard = document.querySelector("#quote-card");
const quoteRefresh = document.querySelector("#quote-refresh");

const fallbackQuotes = [
  { text: "Small daily improvements are the key to staggering long-term results.", author: "Unknown" },
  { text: "Discipline is choosing between what you want now and what you want most.", author: "Unknown" },
  { text: "The way to get started is to quit talking and begin doing.", author: "Walt Disney" },
  { text: "Focus on being productive instead of busy.", author: "Tim Ferriss" },
  { text: "You do not have to be extreme, just consistent.", author: "Unknown" },
  { text: "What you do today can improve all your tomorrows.", author: "Ralph Marston" },
  { text: "Action is the foundational key to all success.", author: "Pablo Picasso" },
];

function paintQuote(text, author) {
  quoteText.innerHTML = `"${text}"`;
  quoteAuthor.innerHTML = author ? `— ${author}` : "&nbsp;";
  quoteMini.innerHTML = `"${text}"`;
}

function showFallbackQuote() {
  let q = fallbackQuotes[Math.floor(Math.random() * fallbackQuotes.length)];
  paintQuote(q.text, q.author);
}

async function fetchQuote() {
  quoteCard.classList.add("is-loading");
  quoteRefresh.disabled = true;

  try {
    const res = await fetch("https://api.quotable.io/random");
    if (!res.ok) throw new Error("bad response");
    const data = await res.json();
    paintQuote(data.content, data.author);
  } catch (e) {
    showFallbackQuote();
  }

  quoteCard.classList.remove("is-loading");
  quoteRefresh.disabled = false;
}
fetchQuote();

quoteRefresh.addEventListener("click", fetchQuote);

// pomodoro timer

const pomoDisplay = document.querySelector("#pomo-display");
const pomoMini = document.querySelector("#pomo-mini");
const pomoStatusChip = document.querySelector("#pomo-status-chip");
const pomoSessionLabel = document.querySelector("#pomo-session-label");
const pomoStart = document.querySelector("#pomo-start");
const pomoPause = document.querySelector("#pomo-pause");
const pomoReset = document.querySelector("#pomo-reset");
const pomoModeButtons = document.querySelectorAll(".pomo-lengths .chip-filter");

const modeLabels = { work: "Work Session", short: "Short Break", long: "Long Break" };

let pomoMode = "work";
let pomoTotalSeconds = 25 * 60;
let pomoRemaining = pomoTotalSeconds;
let pomoIntervalId = null;

function formatTime(sec) {
  let m = Math.floor(sec / 60);
  let s = sec % 60;
  m = m < 10 ? "0" + m : m;
  s = s < 10 ? "0" + s : s;
  return `${m}:${s}`;
}

function renderPomodoro() {
  let text = formatTime(pomoRemaining);
  pomoDisplay.innerHTML = text;
  pomoMini.innerHTML = text;
  pomoSessionLabel.innerHTML = modeLabels[pomoMode];

  if (pomoIntervalId) pomoStatusChip.innerHTML = modeLabels[pomoMode];
  else if (pomoRemaining === pomoTotalSeconds) pomoStatusChip.innerHTML = "Idle";
  else pomoStatusChip.innerHTML = "Paused";
}

function setPomoMode(newMode, minutes) {
  stopPomodoro();
  pomoMode = newMode;
  pomoTotalSeconds = minutes * 60;
  pomoRemaining = pomoTotalSeconds;
  pomoModeButtons.forEach((b) => b.classList.toggle("is-active", b.dataset.mode === newMode));
  renderPomodoro();
}

function pomodoroTick() {
  pomoRemaining--;
  if (pomoRemaining <= 0) {
    stopPomodoro();
    pomoRemaining = 0;
    renderPomodoro();
    playPomodoroSound();
    alert(`${modeLabels[pomoMode]} finished. Nice work.`);
    return;
  }
  renderPomodoro();
}

function playPomodoroSound() {
  pomoStatusChip.innerHTML = "Done";

  const ctx = new (window.AudioContext || window.webkitAudioContext)();

  function playNote(freq, startTime, duration) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(0.06, startTime + 0.05);
    gain.gain.linearRampToValueAtTime(0, startTime + duration);
    osc.connect(gain).connect(ctx.destination);
    osc.start(startTime);
    osc.stop(startTime + duration);
  }

  const now = ctx.currentTime;
  playNote(880, now, 0.35);
  playNote(660, now + 0.28, 0.45);
  setTimeout(() => ctx.close(), 900);
}

function startPomodoro() {
  if (pomoIntervalId) return;
  pomoIntervalId = setInterval(pomodoroTick, 1000);
  pomoStart.disabled = true;
  pomoPause.disabled = false;
  renderPomodoro();
}

function stopPomodoro() {
  clearInterval(pomoIntervalId);
  pomoIntervalId = null;
  pomoStart.disabled = false;
  pomoPause.disabled = true;
  renderPomodoro();
}

function resetPomodoro() {
  stopPomodoro();
  pomoRemaining = pomoTotalSeconds;
  renderPomodoro();
}

renderPomodoro();
pomoStart.addEventListener("click", startPomodoro);
pomoPause.addEventListener("click", stopPomodoro);
pomoReset.addEventListener("click", resetPomodoro);
pomoModeButtons.forEach((btn) => {
  btn.addEventListener("click", () => setPomoMode(btn.dataset.mode, Number(btn.dataset.mins)));
});
pomoModeButtons[0].classList.add("is-active");

// weather

const weatherPlace = document.querySelector("#weather-place");
const weatherIconBig = document.querySelector("#weather-icon-big");
const weatherTempBig = document.querySelector("#weather-temp-big");
const weatherCondition = document.querySelector("#weather-condition");
const weatherFeels = document.querySelector("#weather-feels");
const weatherWind = document.querySelector("#weather-wind");
const weatherHumidity = document.querySelector("#weather-humidity");
const weatherRetry = document.querySelector("#weather-retry");
const weatherChip = document.querySelector("#weather-chip");
const weatherChipIcon = document.querySelector("#weather-chip-icon");
const weatherChipTemp = document.querySelector("#weather-chip-temp");
const weatherMiniTemp = document.querySelector("#weather-mini-temp");
const weatherMiniPlace = document.querySelector("#weather-mini-place");

const defaultCoords = { lat: 28.6139, lon: 77.209, place: "Delhi, India" };

const weatherCodeMap = {
  0: ["☀️", "Clear sky"],
  1: ["🌤️", "Mostly clear"],
  2: ["⛅", "Partly cloudy"],
  3: ["☁️", "Overcast"],
  45: ["🌫️", "Fog"],
  48: ["🌫️", "Freezing fog"],
  51: ["🌦️", "Light drizzle"],
  53: ["🌦️", "Drizzle"],
  55: ["🌦️", "Dense drizzle"],
  61: ["🌧️", "Light rain"],
  63: ["🌧️", "Rain"],
  65: ["🌧️", "Heavy rain"],
  71: ["🌨️", "Light snow"],
  73: ["🌨️", "Snow"],
  75: ["❄️", "Heavy snow"],
  80: ["🌦️", "Rain showers"],
  81: ["🌧️", "Rain showers"],
  82: ["⛈️", "Violent showers"],
  95: ["⛈️", "Thunderstorm"],
  96: ["⛈️", "Thunderstorm w/ hail"],
  99: ["⛈️", "Severe thunderstorm"],
};

function describeWeather(code) {
  return weatherCodeMap[code] || ["🌡️", "Conditions unavailable"];
}

function paintWeatherLoading() {
  weatherPlace.innerHTML = "Locating you…";
  weatherCondition.innerHTML = "Fetching current conditions…";
  weatherMiniPlace.innerHTML = "Locating…";
}

function paintWeatherError() {
  weatherPlace.innerHTML = "Weather unavailable";
  weatherCondition.innerHTML = "Could not load live weather right now. Try refreshing.";
  weatherTempBig.innerHTML = "--°";
  weatherIconBig.innerHTML = "⚠️";
  weatherFeels.innerHTML = "--°";
  weatherWind.innerHTML = "-- km/h";
  weatherHumidity.innerHTML = "--%";
  weatherChipTemp.innerHTML = "--°";
  weatherChipIcon.innerHTML = "⚠️";
  weatherMiniTemp.innerHTML = "--°C";
  weatherMiniPlace.innerHTML = "Unavailable";
}

function paintWeather(current, placeName) {
  let iconLabel = describeWeather(current.weather_code);
  let icon = iconLabel[0];
  let label = iconLabel[1];
  let temp = Math.round(current.temperature_2m);

  weatherPlace.innerHTML = placeName;
  weatherIconBig.innerHTML = icon;
  weatherTempBig.innerHTML = `${temp}°C`;
  weatherCondition.innerHTML = label;
  weatherFeels.innerHTML = `${Math.round(current.apparent_temperature)}°`;
  weatherWind.innerHTML = `${Math.round(current.wind_speed_10m)} km/h`;
  weatherHumidity.innerHTML = `${Math.round(current.relative_humidity_2m)}%`;

  weatherChipIcon.innerHTML = icon;
  weatherChipTemp.innerHTML = `${temp}°`;
  weatherMiniTemp.innerHTML = `${temp}°C`;
  weatherMiniPlace.innerHTML = placeName;
}

async function fetchWeather(lat, lon, placeName) {
  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
    `&current=temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,wind_speed_10m`;

  const res = await fetch(url);
  if (!res.ok) throw new Error("weather request failed");
  const data = await res.json();
  paintWeather(data.current, placeName);
}

async function reverseGeocodeLabel(lat, lon) {
  try {
    const res = await fetch(`https://geocoding-api.open-meteo.com/v1/reverse?latitude=${lat}&longitude=${lon}&count=1`);
    if (!res.ok) throw new Error("no label");
    const data = await res.json();
    const first = data.results && data.results[0];
    return first ? `${first.name}${first.admin1 ? ", " + first.admin1 : ""}` : "Your location";
  } catch (e) {
    return "Your location";
  }
}

async function loadWeatherForCoords(lat, lon, knownName) {
  try {
    const placeName = knownName || (await reverseGeocodeLabel(lat, lon));
    await fetchWeather(lat, lon, placeName);
  } catch (e) {
    paintWeatherError();
  }
}

function loadWeather() {
  paintWeatherLoading();

  if (!("geolocation" in navigator)) {
    loadWeatherForCoords(defaultCoords.lat, defaultCoords.lon, defaultCoords.place);
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (pos) => loadWeatherForCoords(pos.coords.latitude, pos.coords.longitude),
    () => loadWeatherForCoords(defaultCoords.lat, defaultCoords.lon, defaultCoords.place),
    { timeout: 6000 },
  );
}
loadWeather();

weatherRetry.addEventListener("click", loadWeather);
weatherChip.addEventListener("click", () => openFeature("weather"));
