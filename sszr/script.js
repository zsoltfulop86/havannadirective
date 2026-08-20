const apiUrl = document.querySelector('meta[name="sszr-api-url"]').content;
const leaderboardsApiUrl = document.querySelector('meta[name="sszr-leaderboards-api-url"]').content;
const achievementsApiUrl = document.querySelector('meta[name="sszr-achievements-api-url"]').content;
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
const achievementDialog = document.querySelector("#achievement-dialog");
const achievementDialogClose = document.querySelector("#achievement-dialog-close");
const achievementDefender = document.querySelector("#achievement-defender");
const achievementDialogList = document.querySelector("#achievement-dialog-list");
const achievementList = document.querySelector("#achievement-list");
let achievementCatalog = [];
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
    console.error("Could not load Skyscraper Security: Zombie Rain counters", error);
    showUnavailable("Containment network temporarily unavailable");
  }
}

function isLeaderboardEntry(entry, expectedRank) {
  const hasValidAchievements = entry
    && (entry.achievement_ids === undefined
      || (Array.isArray(entry.achievement_ids)
        && entry.achievement_ids.every(function (achievementId) {
          return typeof achievementId === "string" && /^[a-z0-9_]{3,64}$/.test(achievementId);
        })));
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
    && (entry.completion_time_ms === null
      || (Number.isSafeInteger(entry.completion_time_ms)
        && entry.completion_time_ms >= 1
        && entry.completion_time_ms <= 86400000))
    && typeof entry.game_won === "boolean"
    && hasValidAchievements;
}

function formatCompletionTime(milliseconds) {
  if (milliseconds === null) {
    return "—";
  }
  const hours = Math.floor(milliseconds / 3600000);
  const minutes = Math.floor(milliseconds / 60000) % 60;
  const seconds = Math.floor(milliseconds / 1000) % 60;
  const remainder = milliseconds % 1000;
  const secondsText = String(seconds).padStart(2, "0");
  const remainderText = String(remainder).padStart(3, "0");
  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, "0")}:${secondsText}.${remainderText}`;
  }
  return `${minutes}:${secondsText}.${remainderText}`;
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
    cell.colSpan = 5;
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
    const defenderRecord = document.createElement("div");
    defenderRecord.className = "defender-record";
    const defenderName = document.createElement("span");
    defenderName.className = "defender-name";
    defenderName.textContent = `${entry.display_name}  #${entry.public_tag}`;
    const defenderButton = document.createElement("button");
    defenderButton.className = "defender-achievements-button";
    defenderButton.type = "button";
    defenderButton.textContent = "Achievements";
    defenderButton.setAttribute("aria-label", `View achievements for ${entry.display_name} number ${entry.public_tag}`);
    defenderButton.addEventListener("click", function () {
      openAchievementDialog(entry);
    });
    defenderRecord.append(defenderName, defenderButton);
    defender.append(defenderRecord);
    const score = document.createElement("td");
    score.textContent = numberFormat.format(entry.score);
    const wave = document.createElement("td");
    wave.textContent = entry.game_won ? "Victory" : `Wave ${entry.wave_reached}`;
    const completionTime = document.createElement("td");
    completionTime.textContent = formatCompletionTime(entry.completion_time_ms);
    row.append(rank, defender, score, wave, completionTime);
    leaderboardRows.append(row);
  });
}

function openAchievementDialog(entry) {
  const unlockedIds = new Set(Array.isArray(entry.achievement_ids) ? entry.achievement_ids : []);
  achievementDefender.textContent = `${entry.display_name}  #${entry.public_tag} · ${unlockedIds.size} / ${achievementCatalog.length} unlocked`;
  achievementDialogList.replaceChildren();
  if (!achievementCatalog.length) {
    const unavailable = document.createElement("p");
    unavailable.className = "achievement-catalog-status";
    unavailable.textContent = "Achievement registry temporarily unavailable.";
    achievementDialogList.append(unavailable);
    achievementDialog.showModal();
    return;
  }
  achievementCatalog.forEach(function (achievement) {
    const item = document.createElement("article");
    const unlocked = unlockedIds.has(achievement.id);
    item.className = unlocked ? "achievement-record unlocked" : "achievement-record";
    const statusLabel = document.createElement("span");
    statusLabel.textContent = unlocked ? "Unlocked" : "Not published";
    const title = document.createElement("h3");
    title.textContent = achievement.title;
    const description = document.createElement("p");
    description.textContent = achievement.description;
    item.append(statusLabel, title, description);
    achievementDialogList.append(item);
  });
  achievementDialog.showModal();
}

function isAchievementDefinition(achievement) {
  return achievement
    && typeof achievement.achievement_id === "string"
    && /^[a-z0-9_]{3,64}$/.test(achievement.achievement_id)
    && typeof achievement.title === "string"
    && achievement.title.length >= 1
    && achievement.title.length <= 64
    && typeof achievement.description === "string"
    && achievement.description.length >= 1
    && achievement.description.length <= 256;
}

function renderAchievementCatalog() {
  achievementList.replaceChildren();
  achievementCatalog.forEach(function (achievement) {
    const item = document.createElement("article");
    item.dataset.achievementId = achievement.id;
    const title = document.createElement("h3");
    title.textContent = achievement.title;
    const description = document.createElement("p");
    description.textContent = achievement.description;
    item.append(title, description);
    achievementList.append(item);
  });
}

async function loadAchievementCatalog() {
  try {
    const response = await fetch(achievementsApiUrl, { headers: { accept: "application/json" } });
    if (!response.ok) {
      throw new Error(`API returned ${response.status}`);
    }
    const data = await response.json();
    if (!data || !Array.isArray(data.achievements) || data.achievements.length > 100) {
      throw new Error("API returned an invalid achievement catalog");
    }
    if (!data.achievements.every(isAchievementDefinition)) {
      throw new Error("API returned an invalid achievement definition");
    }
    const uniqueIds = new Set(data.achievements.map(function (achievement) {
      return achievement.achievement_id;
    }));
    if (uniqueIds.size !== data.achievements.length) {
      throw new Error("API returned duplicate achievement definitions");
    }
    achievementCatalog = data.achievements.map(function (achievement) {
      return {
        id: achievement.achievement_id,
        title: achievement.title,
        description: achievement.description,
      };
    });
    renderAchievementCatalog();
  } catch (error) {
    console.error("Could not load the Skyscraper Security: Zombie Rain achievement catalog", error);
    achievementCatalog = [];
    achievementList.replaceChildren();
    const unavailable = document.createElement("p");
    unavailable.className = "achievement-catalog-status";
    unavailable.textContent = "Achievement registry temporarily unavailable.";
    achievementList.append(unavailable);
  }
}

function showLeaderboardUnavailable() {
  leaderboardStatus.classList.add("error");
  leaderboardMessage.textContent = "Defender network temporarily unavailable";
  leaderboardUpdated.textContent = "";
  leaderboardRows.replaceChildren();
  const row = document.createElement("tr");
  row.className = "leaderboard-empty";
  const cell = document.createElement("td");
  cell.colSpan = 5;
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
    console.error("Could not load Skyscraper Security: Zombie Rain leaderboards", error);
    showLeaderboardUnavailable();
  }
}

leaderboardTabs.forEach(function (tab) {
  tab.addEventListener("click", function () {
    activeDifficulty = tab.dataset.leaderboardTab;
    renderLeaderboard();
  });
});

achievementDialogClose.addEventListener("click", function () {
  achievementDialog.close();
});

achievementDialog.addEventListener("click", function (event) {
  if (event.target === achievementDialog) {
    achievementDialog.close();
  }
});

document.querySelector("#year").textContent = String(new Date().getFullYear());
loadCounters();
loadAchievementCatalog().finally(loadLeaderboards);
