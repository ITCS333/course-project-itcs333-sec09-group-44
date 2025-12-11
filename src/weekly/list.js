/*
  Requirement: Populate the "Weekly Course Breakdown" list page.
  This version loads data ONLY from the database via API
*/

// --- Element Selections ---
let listSection = document.getElementById("week-list-section");

// --- Functions ---

/**
 * Create a week article element
 */
function createWeekArticle(week) {
  let { id, title, startDate, description } = week;

  const article = document.createElement("article");
  const h2 = document.createElement("h2");
  const dateP = document.createElement("p");
  const descP = document.createElement("p");
  const link = document.createElement("a");

  h2.textContent = title;
  dateP.textContent = `Starts on: ${startDate}`;
  descP.textContent = description;
  link.href = `details.html?id=${id}`;
  link.textContent = "View Details & Discussion";

  article.appendChild(h2);
  article.appendChild(dateP);
  article.appendChild(descP);
  article.appendChild(link);

  return article;
}

/**
 * Load weeks from DATABASE ONLY via API
 */
async function loadWeeks() {
  console.log("Loading weeks from database...");

  try {
    // Load ONLY from API (database)
    const response = await fetch('api/index.php?resource=weeks', { 
      cache: 'no-store',
      headers: {
        'Accept': 'application/json'
      }
    });

    console.log("API Response status:", response.status);

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    const body = await response.json();
    console.log("API Response body:", body);

    // Handle different response formats
    const weeks = Array.isArray(body) ? body : (body.data || []);

    console.log("Parsed weeks:", weeks);
    console.log("Number of weeks:", weeks.length);

    // Clear existing content
    listSection.innerHTML = '';

    // Check if we have weeks
    if (weeks.length === 0) {
      listSection.innerHTML = '<p style="text-align:center; color:#666; padding:40px;">No weeks available yet. Add some weeks from the Admin Panel!</p>';
      return;
    }

    // Add each week to the page
    weeks.forEach((week, index) => {
      console.log(`Adding week ${index + 1}:`, week);
      listSection.appendChild(createWeekArticle(week));
    });

    console.log("Successfully loaded", weeks.length, "weeks from database");

  } catch (error) {
    console.error(' Failed to load weeks:', error);
    listSection.innerHTML = `
      <div style="background:#ffebee; color:#c62828; padding:20px; border-radius:8px; text-align:center;">
        <h3> Error Loading Weeks</h3>
        <p>${error.message}</p>
        <p style="font-size:0.9em; margin-top:10px;">Make sure Apache and MySQL are running in XAMPP.</p>
      </div>
    `;
  }
}

// --- Initial Page Load ---
console.log("Page loaded, initializing...");
loadWeeks();

// Listen for changes from admin page (other tab/window)
window.addEventListener('storage', (e) => {
  if (!e.key) return;
  if (e.key === 'weeks_updated') {
    console.log(" Weeks updated in another tab, reloading...");
    loadWeeks();
  }
});
