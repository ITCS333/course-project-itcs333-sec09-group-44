/*
  Requirement: Populate the "Weekly Course Breakdown" list page.

  Instructions:
  1. Link this file to `list.html` using:
     <script src="list.js" defer></script>

  2. In `list.html`, add an `id="week-list-section"` to the
     <section> element that will contain the weekly articles.

  3. Implement the TODOs below.
*/

// --- Element Selections ---
let listSection = document.getElementById("week-list-section");

// --- Functions ---

/**
 * TODO: Implement the createWeekArticle function.
 * It takes one week object {id, title, startDate, description}.
 * It should return an <article> element matching the structure in `list.html`.
 * - The "View Details & Discussion" link's `href` MUST be set to `details.html?id=${id}`.
 * (This is how the detail page will know which week to load).
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
 * TODO: Implement the loadWeeks function.
 * This function needs to be 'async'.
 * It should:
 * 1. Use `fetch()` to get data from 'weeks.json'.
 * 2. Parse the JSON response into an array.
 * 3. Clear any existing content from `listSection`.
 * 4. Loop through the weeks array. For each week:
 * - Call `createWeekArticle()`.
 * - Append the returned <article> element to `listSection`.
 */
async function loadWeeks() {
  try {
    // Prefer the API endpoint so list reflects admin changes
    let response = await fetch('api/index.php?resource=weeks', { cache: 'no-store' });
    if (!response.ok) {
      // fallback to static JSON
      response = await fetch('api/weeks.json', { cache: 'no-store' });
      if (!response.ok) throw new Error(`Failed to fetch weeks: ${response.status}`);
      const weeks = await response.json();
      listSection.innerHTML = '';
      weeks.forEach(week => listSection.appendChild(createWeekArticle(week)));
      return;
    }

    const body = await response.json();
    const weeks = Array.isArray(body) ? body : (body.data || []);
    listSection.innerHTML = '';
    weeks.forEach(week => listSection.appendChild(createWeekArticle(week)));
  } catch (error) {
    console.error('Failed to load weeks:', error);
    listSection.innerHTML = "<p style='color:red;'>Error loading weeks data.</p>";
  }
}

// --- Initial Page Load ---
// Call the function to populate the page.
loadWeeks();

// Listen for changes from admin page (other tab/window) using localStorage event
window.addEventListener('storage', (e) => {
  if (!e.key) return;
  if (e.key === 'weeks_updated') {
    // reload weeks when admin notifies a change
    loadWeeks();
  }
});
