/*
  Requirement: Make the "Manage Weekly Breakdown" page interactive.

  Instructions:
  1. Link this file to `admin.html` using:
     <script src="admin.js" defer></script>
  
  2. In `admin.html`, add an `id="weeks-tbody"` to the <tbody> element
     inside your `weeks-table`.
  
  3. Implement the TODOs below.
*/

// --- Global Data Store ---
// This will hold the weekly data loaded from the JSON file.
let weeks = [];
let editWeekId = null;
let initialized = false; // guard to avoid duplicate listeners

// --- Element Selections ---
let weekForm = document.querySelector("#week-form");

let weeksTableBody = document.querySelector("#weeks-tbody");


// --- Functions ---

/**
 * TODO: Implement the createWeekRow function.
 * It takes one week object {id, title, description}.
 * It should return a <tr> element with the following <td>s:
 * 1. A <td> for the `title`.
 * 2. A <td> for the `description`.
 * 3. A <td> containing two buttons:
 * - An "Edit" button with class "edit-btn" and `data-id="${id}"`.
 * - A "Delete" button with class "delete-btn" and `data-id="${id}"`.
 */
function createWeekRow(week) {
  const tr = document.createElement("tr");

  tr.innerHTML = `
    <td>${week.title}</td>
    <td>${week.description}</td>
    <td>
        <button type="button" class="edit-btn" data-id="${week.id}">Edit</button>
        <button type="button" class="delete-btn" data-id="${week.id}">Delete</button>
    </td>
  `;

  return tr;
}
  


/**
 * TODO: Implement the renderTable function.
 * It should:
 * 1. Clear the `weeksTableBody`.
 * 2. Loop through the global `weeks` array.
 * 3. For each week, call `createWeekRow()`, and
 * append the resulting <tr> to `weeksTableBody`.
 */
function renderTable() {
  weeksTableBody.innerHTML = "";
  weeks.forEach((week) => {
    const row = createWeekRow(week);
    weeksTableBody.appendChild(row);
  });
}


/**
 * TODO: Implement the handleAddWeek function.
 * This is the event handler for the form's 'submit' event.
 * It should:
 * 1. Prevent the form's default submission.
 * 2. Get the values from the title, start date, and description inputs.
 * 3. Get the value from the 'week-links' textarea. Split this value
 * by newlines (`\n`) to create an array of link strings.
 * 4. Create a new week object with a unique ID (e.g., `id: \`week_${Date.now()}\``).
 * 5. Add this new week object to the global `weeks` array (in-memory only).
 * 6. Call `renderTable()` to refresh the list.
 * 7. Reset the form.
 */
function handleAddWeek(event) {
  event.preventDefault();
const titleInput = document.querySelector("#week-title");
const startDateInput = document.querySelector("#week-start-date");
const descriptionInput = document.querySelector("#week-description");
const linksInput = document.querySelector("#week-links");
const linksArray = linksInput.value.split("\n").filter(x => x.trim() !== "");  
  const payload = {
    title: titleInput.value,
    startDate: startDateInput.value,
    description: descriptionInput.value,
    links: linksArray
  };

  // If editing, send PUT, otherwise POST
  if (editWeekId) {
    payload.id = editWeekId;
    fetch(`api/index.php?resource=weeks`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).then(r => r.json()).then(res => {
      if (res.success) {
        editWeekId = null;
        weekForm.reset();
        // If API returned the updated week, update local store and re-render immediately.
        if (res.data && res.data.id) {
          weeks = weeks.map(w => (w.id === res.data.id ? res.data : w));
          renderTable();
        } else {
          loadAndInitialize();
        }
        // Notify other windows/tabs that weeks changed so list page can refresh
        try { localStorage.setItem('weeks_updated', Date.now().toString()); } catch(e){}
        // Refresh the full page shortly after success so the user sees server-side changes
        setTimeout(() => location.reload(), 400);
      } else {
        console.error(res.error || 'Update failed');
      }
    }).catch(console.error);
  } else {
    fetch(`api/index.php?resource=weeks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).then(r => r.json()).then(res => {
      if (res.success) {
        weekForm.reset();
        // If API returned the created week, append locally and re-render immediately.
        if (res.data && res.data.id) {
          weeks.push(res.data);
          renderTable();
        } else {
          loadAndInitialize();
        }
        // Notify other windows/tabs that weeks changed so list page can refresh
        try { localStorage.setItem('weeks_updated', Date.now().toString()); } catch(e){}
        // Refresh page to ensure server persisted the new week is visible everywhere
        setTimeout(() => location.reload(), 400);
      } else {
        console.error(res.error || 'Create failed');
      }
    }).catch(console.error);
  }
}

/**
 * TODO: Implement the handleTableClick function.
 * This is an event listener on the `weeksTableBody` (for delegation).
 * It should:
 * 1. Check if the clicked element (`event.target`) has the class "delete-btn".
 * 2. If it does, get the `data-id` attribute from the button.
 * 3. Update the global `weeks` array by filtering out the week
 * with the matching ID (in-memory only).
 * 4. Call `renderTable()` to refresh the list.
 */
function handleTableClick(event) {
   const target = event.target;
   if (target.classList.contains("delete-btn")) {
    const id = target.dataset.id;
    fetch(`api/index.php?resource=weeks&week_id=${encodeURIComponent(id)}`, {
      method: 'DELETE'
    }).then(r => r.json()).then(res => {
        if (res.success) {
          // Optimistically remove locally and re-render immediately so the user sees the change.
          weeks = weeks.filter(w => w.id !== id);
          renderTable();
          // Notify other windows/tabs that weeks changed so list page can refresh
          try { localStorage.setItem('weeks_updated', Date.now().toString()); } catch(e){}
          // Also refresh the full page shortly after delete so the server-side state is visible
          setTimeout(() => location.reload(), 400);
        } else console.error(res.error || 'Delete failed');
    }).catch(console.error);
    return;
  }

  if (target.classList.contains("edit-btn")) {
    const id = target.dataset.id;
    // find week
    const wk = weeks.find(w => w.id === id);
    if (!wk) return;
    document.querySelector('#week-title').value = wk.title || '';
    document.querySelector('#week-start-date').value = wk.startDate || '';
    document.querySelector('#week-description').value = wk.description || '';
    document.querySelector('#week-links').value = (wk.links || []).join('\n');
    editWeekId = id;
    return;
  }
}

/**
 * TODO: Implement the loadAndInitialize function.
 * This function needs to be 'async'.
 * It should:
 * 1. Use `fetch()` to get data from 'weeks.json'.
 * 2. Parse the JSON response and store the result in the global `weeks` array.
 * 3. Call `renderTable()` to populate the table for the first time.
 * 4. Add the 'submit' event listener to `weekForm` (calls `handleAddWeek`).
 * 5. Add the 'click' event listener to `weeksTableBody` (calls `handleTableClick`).
 */
async function loadAndInitialize() {
  // Try the API endpoint first (keeps data in sync after POST/PUT/DELETE).
  try {
  const resp = await fetch("api/index.php?resource=weeks", { cache: 'no-store' });
    if (!resp.ok) throw new Error(`API fetch failed: ${resp.status}`);
    const body = await resp.json();
    if (Array.isArray(body)) weeks = body;
    else if (body && body.success && Array.isArray(body.data)) weeks = body.data;
    else weeks = [];
  } catch (err) {
    console.warn('API fetch failed, falling back to static weeks.json', err);
    try {
  const fallback = await fetch("api/weeks.json", { cache: 'no-store' });
      if (!fallback.ok) throw new Error(`Fallback fetch failed: ${fallback.status}`);
      weeks = await fallback.json();
    } catch (err2) {
      console.error('Failed to load weeks data', err2);
      weeks = [];
    }
  }

  renderTable();

  // Add event listeners only once to avoid duplicate handlers
  if (!initialized) {
    if (weekForm) weekForm.addEventListener("submit", handleAddWeek);
    if (weeksTableBody) weeksTableBody.addEventListener("click", handleTableClick);
    initialized = true;
  }
}

// --- Initial Page Load ---
// Call the main async function to start the application.
loadAndInitialize();
