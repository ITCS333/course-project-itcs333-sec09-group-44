/*
  Requirement: Make the "Manage Weekly Breakdown" page interactive.
*/

// --- Global Data Store ---
let weeks = [];
let editWeekId = null;
let initialized = false;

// --- Element Selections ---
let weekForm = document.querySelector("#week-form");
let weeksTableBody = document.querySelector("#weeks-tbody");
let submitBtn = document.querySelector("#add-week");

// Input fields
let titleInput = document.querySelector("#week-title");
let startDateInput = document.querySelector("#week-start-date");
let descriptionInput = document.querySelector("#week-description");
let linksInput = document.querySelector("#week-links");

// --- Functions ---

/**
 * Create a table row for a week
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
 * Render the table with all weeks
 */
function renderTable() {
  weeksTableBody.innerHTML = "";
  weeks.forEach((week) => {
    const row = createWeekRow(week);
    weeksTableBody.appendChild(row);
  });
}

/**
 * Handle form submission (Add or Edit)
 */
function handleAddWeek(event) {
  event.preventDefault();

  const linksArray = linksInput.value.split("\n").filter(x => x.trim() !== "");  

  const payload = {
    title: titleInput.value,
    startDate: startDateInput.value,
    description: descriptionInput.value,
    links: linksArray
  };

  // If editing, send PUT request
  if (editWeekId) {
    payload.id = editWeekId;
    
    console.log("Updating week with ID:", editWeekId);
    console.log("Payload:", payload);
    
    fetch(`api/index.php?resource=weeks`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    .then(r => r.json())
    .then(res => {
      console.log("Update response:", res);
      
      if (res.success) {
        // Update local data
        weeks = weeks.map(w => (w.id == editWeekId ? res.data : w));
        renderTable();
        
        // Reset form and edit mode
        resetForm();
        
        // Notify other tabs
        try { 
          localStorage.setItem('weeks_updated', Date.now().toString()); 
        } catch(e) {}
        
        alert("Week updated successfully!");
      } else {
        console.error(res.error || 'Update failed');
        alert("Failed to update week: " + (res.error || 'Unknown error'));
      }
    })
    .catch(err => {
      console.error("Error during update:", err);
      alert("Error updating week. Check console for details.");
    });
  } 
  // If adding new, send POST request
  else {
    console.log("Adding new week");
    console.log("Payload:", payload);
    
    fetch(`api/index.php?resource=weeks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    .then(r => r.json())
    .then(res => {
      console.log("Create response:", res);
      
      if (res.success) {
        // Add to local data
        weeks.push(res.data);
        renderTable();
        
        // Reset form
        resetForm();
        
        // Notify other tabs
        try { 
          localStorage.setItem('weeks_updated', Date.now().toString()); 
        } catch(e) {}
        
        alert("Week added successfully!");
      } else {
        console.error(res.error || 'Create failed');
        alert("Failed to add week: " + (res.error || 'Unknown error'));
      }
    })
    .catch(err => {
      console.error("Error during create:", err);
      alert("Error adding week. Check console for details.");
    });
  }
}

/**
 * Reset form to add mode
 */
function resetForm() {
  editWeekId = null;
  weekForm.reset();
  
  if (submitBtn) {
    submitBtn.textContent = "Add Week";
  }
  
  console.log("Form reset, edit mode disabled");
}

/**
 * Handle table clicks (Edit or Delete)
 */
function handleTableClick(event) {
  const target = event.target;
  
  // Handle Delete button
  if (target.classList.contains("delete-btn")) {
    const id = target.dataset.id;
    
    console.log("Delete clicked for ID:", id);
    
    if (!confirm("Are you sure you want to delete this week?")) {
      return;
    }
    
    fetch(`api/index.php?resource=weeks&week_id=${encodeURIComponent(id)}`, {
      method: 'DELETE'
    })
    .then(r => r.json())
    .then(res => {
      console.log("Delete response:", res);
      
      if (res.success) {
        // Remove from local data
        weeks = weeks.filter(w => w.id != id);
        renderTable();
        
        // Notify other tabs
        try { 
          localStorage.setItem('weeks_updated', Date.now().toString()); 
        } catch(e) {}
        
        alert("Week deleted successfully!");
      } else {
        console.error(res.error || 'Delete failed');
        alert("Failed to delete week: " + (res.error || 'Unknown error'));
      }
    })
    .catch(err => {
      console.error("Error during delete:", err);
      alert("Error deleting week. Check console for details.");
    });
    
    return;
  }

  // Handle Edit button
  if (target.classList.contains("edit-btn")) {
    const id = target.dataset.id;
    
    console.log("Edit clicked for ID:", id);
    console.log("Current weeks array:", weeks);
    
    const wk = weeks.find(w => w.id == id);
    
    console.log("Found week:", wk);
    
    if (!wk) {
      alert("Week not found in data!");
      console.error("Week with ID", id, "not found in weeks array");
      return;
    }
    
    // Fill form with week data
    if (titleInput) titleInput.value = wk.title || '';
    if (startDateInput) startDateInput.value = wk.startDate || '';
    if (descriptionInput) descriptionInput.value = wk.description || '';
    if (linksInput) linksInput.value = (wk.links || []).join('\n');
    
    // Set edit mode
    editWeekId = id;
    
    console.log("Edit mode enabled for ID:", editWeekId);
    
    // Change button text
    if (submitBtn) {
      submitBtn.textContent = "Update Week";
      console.log("Button text changed to 'Update Week'");
    } else {
      console.error("Submit button not found!");
    }
    
    // Scroll to form
    if (weekForm) {
      weekForm.scrollIntoView({ behavior: 'smooth' });
    }
    
    return;
  }
}

/**
 * Load weeks data and initialize page
 */
async function loadAndInitialize() {
  console.log("Initializing admin page...");
  
  try {
    const resp = await fetch("api/index.php?resource=weeks", { cache: 'no-store' });
    
    if (!resp.ok) {
      throw new Error(`API fetch failed: ${resp.status}`);
    }
    
    const body = await resp.json();
    
    if (Array.isArray(body)) {
      weeks = body;
    } else if (body && body.success && Array.isArray(body.data)) {
      weeks = body.data;
    } else {
      weeks = [];
    }
    
    console.log("Loaded weeks:", weeks);
  } catch (err) {
    console.error('API fetch failed:', err);
    weeks = [];
  }

  renderTable();

  // Add event listeners only once
  if (!initialized) {
    if (weekForm) {
      weekForm.addEventListener("submit", handleAddWeek);
      console.log("Form submit listener added");
    } else {
      console.error("Week form not found!");
    }
    
    if (weeksTableBody) {
      weeksTableBody.addEventListener("click", handleTableClick);
      console.log("Table click listener added");
    } else {
      console.error("Weeks table body not found!");
    }
    
    if (!submitBtn) {
      console.error("Submit button #add-week not found!");
    }
    
    initialized = true;
  }
}

// --- Initial Page Load ---
loadAndInitialize();