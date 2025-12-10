/*
  Requirement: Make the "Manage Resources" page interactive.

  Instructions:
  1. Link this file to `admin.html` using:
     <script src="admin.js" defer></script>
  
  2. In `admin.html`, add an `id="resources-tbody"` to the <tbody> element
     inside your `resources-table`.
  
  3. Implement the TODOs below.
*/

// --- Global Data Store ---
// This will hold the resources loaded from the JSON file.
let resources = [
  { id: "res_1", title: "Chapter 1 Notes", description: "Summary of the first chapter.", link: "https://example.com/notes/chapter1.pdf" },
  { id: "res_2", title: "External Tutorial", description: "Link to an online resource.", link: "https://example.com/tutorial" }
];

// --- Element Selections ---
// TODO: Select the resource form ('#resource-form').
const resourceForm = document.querySelector("#resource-form");

// TODO: Select the resources table body ('#resources-tbody').
const resourcesTableBody = document.querySelector("#resources-tbody");

// --- Functions ---

/**
 * TODO: Implement the createResourceRow function.
 * It takes one resource object {id, title, description}.
 * It should return a <tr> element with the following <td>s:
 * 1. A <td> for the `title`.
 * 2. A <td> for the `description`.
 * 3. A <td> containing two buttons:
 * - An "Edit" button with class "edit-btn" and `data-id="${id}"`.
 * - A "Delete" button with class "delete-btn" and `data-id="${id}"`.
 */
function createResourceRow(resource) {
  const tr = document.createElement("tr");

  const titleTd = document.createElement("td");
  titleTd.textContent = resource.title;

  const descTd = document.createElement("td");
  descTd.textContent = resource.description;

  const actionsTd = document.createElement("td");

  const editBtn = document.createElement("button");
  editBtn.textContent = "Edit";
  editBtn.classList.add("edit-btn");
  editBtn.dataset.id = resource.id;

  const viewBtn = document.createElement("button");
  viewBtn.textContent = "View";
  viewBtn.onclick = () => window.open(`details.html?id=${resource.id}`, "_blank");

  const deleteBtn = document.createElement("button");
  deleteBtn.textContent = "Delete";
  deleteBtn.classList.add("delete-btn");
  deleteBtn.dataset.id = resource.id;

  actionsTd.appendChild(editBtn);
  actionsTd.appendChild(viewBtn);
  actionsTd.appendChild(deleteBtn);

  tr.appendChild(titleTd);
  tr.appendChild(descTd);
  tr.appendChild(actionsTd);

  return tr;
}

/**
 * TODO: Implement the renderTable function.
 * It should:
 * 1. Clear the `resourcesTableBody`.
 * 2. Loop through the global `resources` array.
 * 3. For each resource, call `createResourceRow()`, and
 * append the resulting <tr> to `resourcesTableBody`.
 */
function renderTable() {
  resourcesTableBody.innerHTML = "";

  resources.forEach((res) => {
    const row = createResourceRow(res);
    resourcesTableBody.appendChild(row);
  });
}

/**
 * TODO: Implement the handleAddResource function.
 * This is the event handler for the form's 'submit' event.
 * It should:
 * 1. Prevent the form's default submission.
 * 2. Get the values from the title, description, and link inputs.
 * 3. Create a new resource object with a unique ID (e.g., `id: \`res_${Date.now()}\``).
 * 4. Add this new resource object to the global `resources` array (in-memory only).
 * 5. Call `renderTable()` to refresh the list.
 * 6. Reset the form.
 */
async function handleAddResource(event) {
  event.preventDefault();

  const title = document.querySelector("#resource-title").value.trim();
  const description = document.querySelector("#resource-description").value.trim();
  const link = document.querySelector("#resource-link").value.trim();

  const editId = resourceForm.dataset.editId;
  if (editId) {
    const idx = resources.findIndex(r => r.id === editId);
    if (idx !== -1) {
      resources[idx] = { ...resources[idx], title, description, link };
    }
    delete resourceForm.dataset.editId;
  } else {
    const newResource = {
      id: `res_${Date.now()}`,
      title,
      description,
      link
    };
    resources.push(newResource);

    // <<< NEW: create empty comments entry for this resource >>>
    try {
      // read current comments file
      const readRes  = await fetch("comments.json");
      const commentsObj = await readRes.json();
      commentsObj[newResource.id] = [];          // add empty array for new resource

      // write it back (pseudo-PUT: whole file replaced)
      await fetch("api/comments.php", {          // **see small PHP helper below**
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(commentsObj)
      });
    } catch (e) {
      console.warn("Could not initialise empty comments for new resource", e);
    }
  }

  renderTable();
  resourceForm.reset();
}

/**
 * TODO: Implement the handleTableClick function.
 * This is an event listener on the `resourcesTableBody` (for delegation).
 * It should:
 * 1. Check if the clicked element (`event.target`) has the class "delete-btn".
 * 2. If it does, get the `data-id` attribute from the button.
 * 3. Update the global `resources` array by filtering out the resource
 * with the matching ID (in-memory only).
 * 4. Call `renderTable()` to refresh the list.
 */
function handleTableClick(event) {
  const { target } = event;

  if (target.classList.contains("delete-btn")) {
    const id = target.dataset.id;
    resources = resources.filter((res) => res.id !== id);
    renderTable();
  }

  if (target.classList.contains("edit-btn")) {
    const id = target.dataset.id;
    const res = resources.find(r => r.id === id);
    if (res) {
      document.querySelector("#resource-title").value = res.title;
      document.querySelector("#resource-description").value = res.description;
      document.querySelector("#resource-link").value = res.link;
      resourceForm.dataset.editId = id;
    }
  }
}

/**
 * TODO: Implement the loadAndInitialize function.
 * This function needs to be 'async'.
 * It should:
 * 1. Use `fetch()` to get data from 'resources.json'.
 * 2. Parse the JSON response and store the result in the global `resources` array.
 * 3. Call `renderTable()` to populate the table for the first time.
 * 4. Add the 'submit' event listener to `resourceForm` (calls `handleAddResource`).
 * 5. Add the 'click' event listener to `resourcesTableBody` (calls `handleTableClick`).
 */
async function loadAndInitialize() {
  try {
    const response = await fetch("resources.json");
    const data = await response.json();
    resources = data;
  } catch (err) {
    console.warn("Could not load resources.json – using built-in dummy data");
  }
  renderTable();
  resourceForm.addEventListener("submit", handleAddResource);
  resourcesTableBody.addEventListener("click", handleTableClick);
}

// --- Initial Page Load ---
// Call the main async function to start the application.
loadAndInitialize();
