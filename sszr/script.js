const apiUrl = document.querySelector('meta[name="sszr-api-url"]').content;
const counters = document.querySelector("#death-counters");
const status = document.querySelector(".counter-status");
const message = document.querySelector("#counter-message");
const updated = document.querySelector("#counter-updated");
const numberFormat = new Intl.NumberFormat("en-US");

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
    updated.textContent = data.updated_at ? `Updated ${new Date(data.updated_at).toLocaleString()}` : "No casualties reported";
  } catch (error) {
    console.error("Could not load SS: Zombie Rain counters", error);
    showUnavailable("Containment network temporarily unavailable");
  }
}

document.querySelector("#year").textContent = String(new Date().getFullYear());
loadCounters();

