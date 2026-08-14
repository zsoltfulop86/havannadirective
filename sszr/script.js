const apiUrl = document.querySelector('meta[name="sszr-api-url"]').content;
const leaderboardsApiUrl = document.querySelector('meta[name="sszr-leaderboards-api-url"]').content;
const counters = document.querySelector("#death-counters");
const status = document.querySelector(".counter-status");
const message = document.querySelector("#counter-message");
const updated = document.querySelector("#counter-updated");
const numberFormat = new Intl.NumberFormat("en-US");
const leaderboardRows = document.querySelector("#leaderboard-rows");
const leaderboardMessage = document.querySelector("#leaderboard-message");
const leaderboardUpdated = document.querySelector("#leaderboard-updated");
const leaderboardSeason = document.querySelector("#leaderboard-season");
const leaderboardStatus = document.querySelector(".leaderboard-status");
const leaderboardTabs = Array.from(document.querySelectorAll("[data-leaderboard-tab]"));
let activeDifficulty = "normal";
let leaderboardData = { normal: [], hard: [] };

function showUnavailable(text) {
  counters.setAttribute("aria-busy", "false");
  status.classList.add("error");
  message.textContent = text;
  updated.textContent = "";
}

async function loadCounters() {
  if (apiUrl.includes("YOUR-SUBDOMAIN")) {
    showUnavailable("Containment network awaiting deployment");
    return;
  }

  try {
    const response = await fetch(apiUrl, { headers: { accept: "application/json" } });
    if (!response.ok) {
      throw new Error(`API returned ${response.status}`);
    }
    const data = await response.json();
    ["total", "normal", "hard"].forEach(function (name) {
      const value = Number(data[name]);
      if (!Number.isSafeInteger(value) || value < 0) {
        throw new Error("API returned an invalid counter");
      }
      document.querySelector(`[data-counter="${name}"]`).textContent = numberFormat.format(value);
    });
    counters.setAttribute("aria-busy", "false");
    message.textContent = "Containment network online";
    updated.textContent = data.updated_at ? `Updated ${new Date(data.updated_at).toLocaleString()}` : "No defender deaths reported";
  } catch (error) {
    console.error("Could not load SS: Zombie Rain counters", error);
    showUnavailable("Containment network temporarily unavailable");
  }
}

function isLeaderboardEntry(entry, expectedRank) {
  return entry
    && Number.isInteger(entry.rank)
    && entry.rank === expectedRank
    && typeof entry.display_name === "string"
    && entry.display_name.length >= 3
    && entry.display_name.length <= 16
    && typeof entry.public_tag === "string"
    && /^[A-F0-9]{4}$/.test(entry.public_tag)
    && Number.isSafeInteger(entry.score)
    && entry.score >= 0
    && Number.isInteger(entry.wave_reached)
    && entry.wave_reached >= 1
    && entry.wave_reached <= 15
    && typeof entry.game_won === "boolean";
}

function validateLeaderboard(data) {
  if (!data || typeof data !== "object" || typeof data.season_id !== "string") {
    throw new Error("API returned an invalid leaderboard");
  }
  ["normal", "hard"].forEach(function (difficulty) {
    if (!Array.isArray(data[difficulty]) || data[difficulty].length > 100) {
      throw new Error("API returned an invalid leaderboard");
    }
    data[difficulty].forEach(function (entry, index) {
      if (!isLeaderboardEntry(entry, index + 1)) {
        throw new Error("API returned an invalid leaderboard entry");
      }
    });
  });
}

function renderLeaderboard() {
  leaderboardRows.replaceChildren();
  const entries = leaderboardData[activeDifficulty];
  leaderboardTabs.forEach(function (tab) {
    tab.setAttribute("aria-selected", String(tab.dataset.leaderboardTab === activeDifficulty));
  });

  if (!entries.length) {
    const row = document.createElement("tr");
    row.className = "leaderboard-empty";
    const cell = document.createElement("td");
    cell.colSpan = 4;
    cell.textContent = "No defenders have posted a personal best yet.";
    row.append(cell);
    leaderboardRows.append(row);
    return;
  }

  entries.forEach(function (entry) {
    const row = document.createElement("tr");
    if (entry.rank <= 3) {
      row.classList.add("leaderboard-podium");
    }
    const rank = document.createElement("td");
    rank.textContent = String(entry.rank).padStart(2, "0");
    const defender = document.createElement("td");
    defender.textContent = `${entry.display_name}  #${entry.public_tag}`;
    const score = document.createElement("td");
    score.textContent = numberFormat.format(entry.score);
    const wave = document.createElement("td");
    wave.textContent = entry.game_won ? "Victory" : `Wave ${entry.wave_reached}`;
    row.append(rank, defender, score, wave);
    leaderboardRows.append(row);
  });
}

function showLeaderboardUnavailable() {
  leaderboardStatus.classList.add("error");
  leaderboardMessage.textContent = "Defender network temporarily unavailable";
  leaderboardUpdated.textContent = "";
  leaderboardRows.replaceChildren();
  const row = document.createElement("tr");
  row.className = "leaderboard-empty";
  const cell = document.createElement("td");
  cell.colSpan = 4;
  cell.textContent = "Leaderboard records could not be loaded.";
  row.append(cell);
  leaderboardRows.append(row);
}

async function loadLeaderboards() {
  try {
    const response = await fetch(leaderboardsApiUrl, { headers: { accept: "application/json" } });
    if (!response.ok) {
      throw new Error(`API returned ${response.status}`);
    }
    const data = await response.json();
    validateLeaderboard(data);
    leaderboardData = { normal: data.normal, hard: data.hard };
    leaderboardSeason.textContent = `${data.season_id.replaceAll("-", " ")} · Top 100`;
    leaderboardStatus.classList.remove("error");
    leaderboardMessage.textContent = "Defender network online";
    leaderboardUpdated.textContent = data.updated_at ? `Updated ${new Date(data.updated_at).toLocaleString()}` : "";
    renderLeaderboard();
  } catch (error) {
    console.error("Could not load SS: Zombie Rain leaderboards", error);
    showLeaderboardUnavailable();
  }
}

leaderboardTabs.forEach(function (tab) {
  tab.addEventListener("click", function () {
    activeDifficulty = tab.dataset.leaderboardTab;
    renderLeaderboard();
  });
});

document.querySelector("#year").textContent = String(new Date().getFullYear());
loadCounters();
loadLeaderboards();
