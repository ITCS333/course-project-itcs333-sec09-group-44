/*
  Requirement: Make the "Manage Assignments" page interactive.

  Instructions:
  1. Link this file to `admin.html` using:
     <script src="admin.js" defer></script>
  
  2. In `admin.html`, add an `id="assignments-tbody"` to the <tbody> element
     so you can select it.
  
  3. Implement the TODOs below.
*/

// --- Global Data Store ---
// This will hold the assignments loaded from the JSON file.
let assignments = [];
let editingAssignmentId = null;

// --- Element Selections ---
const assignmentForm = document.querySelector('#assignment-form');

const assignmentsTableBody = document.querySelector('#assignments-tbody');

// --- Functions ---

/**
 * TODO: Implement the createAssignmentRow function.
 * It takes one assignment object {id, title, dueDate}.
 * It should return a <tr> element with the following <td>s:
 * 1. A <td> for the `title`.
 * 2. A <td> for the `dueDate`.
 * 3. A <td> containing two buttons:
 * - An "Edit" button with class "edit-btn" and `data-id="${id}"`.
 * - A "Delete" button with class "delete-btn" and `data-id="${id}"`.
 */
function createAssignmentRow(assignment) {
  const row = document.createElement('tr');
  
  const titleCell = document.createElement('td');
  titleCell.textContent = assignment.title;
  row.appendChild(titleCell);
  
  const dueDateCell = document.createElement('td');
  dueDateCell.textContent = assignment.due_date;
  row.appendChild(dueDateCell);
  
  const actionsCell = document.createElement('td');
  
  const editButton = document.createElement('button');
  editButton.type = 'button';
  editButton.className = 'edit-btn';
  editButton.dataset.id = assignment.id;
  editButton.textContent = 'Edit';
  actionsCell.appendChild(editButton);
  
  const deleteButton = document.createElement('button');
  deleteButton.type = 'button';
  deleteButton.className = 'delete-btn';
  deleteButton.dataset.id = assignment.id;
  deleteButton.textContent = 'Delete';
  actionsCell.appendChild(deleteButton);
  
  row.appendChild(actionsCell);
  
  return row;
}

/**
 * TODO: Implement the renderTable function.
 * It should:
 * 1. Clear the `assignmentsTableBody`.
 * 2. Loop through the global `assignments` array.
 * 3. For each assignment, call `createAssignmentRow()`, and
 * append the resulting <tr> to `assignmentsTableBody`.
 */
function renderTable() {
  assignmentsTableBody.innerHTML = '';
  
  for (const assignment of assignments) {
    const row = createAssignmentRow(assignment);
    assignmentsTableBody.appendChild(row);
  }
}

/**
 * TODO: Implement the handleAddAssignment function.
 * This is the event handler for the form's 'submit' event.
 * It should:
 * 1. Prevent the form's default submission.
 * 2. Get the values from the title, description, due date, and files inputs.
 * 3. Create a new assignment object with a unique ID (e.g., `id: \`asg_${Date.now()}\``).
 * 4. Add this new assignment object to the global `assignments` array (in-memory only).
 * 5. Call `renderTable()` to refresh the list.
 * 6. Reset the form.
 */
function handleAddAssignment(event) {
  event.preventDefault();
  
  const title = document.querySelector('#assignment-title').value;
  const description = document.querySelector('#assignment-description').value;
  const dueDate = document.querySelector('#assignment-due-date').value;
  const files = document.querySelector('#assignment-files').value;
  
  if (editingAssignmentId) {
    // Update existing assignment via API
    const updateData = {
      id: editingAssignmentId,
      title: title,
      description: description,
      due_date: dueDate,
      files: files
    };
    
    fetch('./api/index.php?resource=assignments', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updateData)
    })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        editingAssignmentId = null;
        document.querySelector('#add-assignment').textContent = 'Add Assignment';
        assignmentForm.reset();
        loadAndInitialize();
      }
    })
    .catch(error => console.error('Error updating assignment:', error));
  } else {
    // Create new assignment via API
    const newAssignmentData = {
      title: title,
      description: description,
      due_date: dueDate,
      files: files
    };
    
    fetch('./api/index.php?resource=assignments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newAssignmentData)
    })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        assignmentForm.reset();
        loadAndInitialize();
      }
    })
    .catch(error => console.error('Error creating assignment:', error));
  }
}

/**
 * TODO: Implement the handleTableClick function.
 * This is an event listener on the `assignmentsTableBody` (for delegation).
 * It should:
 * 1. Check if the clicked element (`event.target`) has the class "delete-btn".
 * 2. If it does, get the `data-id` attribute from the button.
 * 3. Update the global `assignments` array by filtering out the assignment
 * with the matching ID (in-memory only).
 * 4. Call `renderTable()` to refresh the list.
 */
function handleTableClick(event) {
  const target = event.target;
  
  if (target.classList.contains('delete-btn')) {
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    
    const assignmentId = target.dataset.id;
    console.log('Delete clicked for ID:', assignmentId);
    
    // Use a simple prompt instead of confirm - or just delete directly
    const userConfirmed = window.confirm('Are you sure you want to delete this assignment?');
    
    if (userConfirmed) {
      console.log('Confirmed delete for ID:', assignmentId);
      fetch(`./api/index.php?resource=assignments&id=${assignmentId}`, {
        method: 'DELETE'
      })
      .then(response => response.json())
      .then(data => {
        console.log('Delete response:', data);
        if (data.success) {
          console.log('Delete successful, reloading...');
          loadAndInitialize();
        } else {
          alert('Failed to delete assignment: ' + (data.message || 'Unknown error'));
        }
      })
      .catch(error => {
        console.error('Error deleting assignment:', error);
        alert('Error deleting assignment: ' + error.message);
      });
    } else {
      console.log('Delete cancelled');
    }
    
  } else if (target.classList.contains('edit-btn')) {
    event.preventDefault();
    event.stopPropagation();
    
    const assignmentId = target.dataset.id;
    console.log('Edit clicked for ID:', assignmentId);
    
    const assignment = assignments.find(asg => asg.id == assignmentId);
    
    if (assignment) {
      editingAssignmentId = assignmentId;
      
      document.querySelector('#assignment-title').value = assignment.title;
      document.querySelector('#assignment-description').value = assignment.description || '';
      document.querySelector('#assignment-due-date').value = assignment.due_date;
      document.querySelector('#assignment-files').value = assignment.files || '';
      
      document.querySelector('#add-assignment').textContent = 'Update Assignment';
      
      document.querySelector('#assignment-title').focus();
    }
  }
}

/**
 * TODO: Implement the loadAndInitialize function.
 * This function needs to be 'async'.
 * It should:
 * 1. Use `fetch()` to get data from 'assignments.json'.
 * 2. Parse the JSON response and store the result in the global `assignments` array.
 * 3. Call `renderTable()` to populate the table for the first time.
 * 4. Add the 'submit' event listener to `assignmentForm` (calls `handleAddAssignment`).
 * 5. Add the 'click' event listener to `assignmentsTableBody` (calls `handleTableClick`).
 */
async function loadAndInitialize() {
  try {
    const response = await fetch('./api/index.php?resource=assignments');
    const data = await response.json();
    
    if (data.success) {
      assignments = data.data;
    } else {
      assignments = [];
    }
    
    renderTable();
    
    // Only add listeners on first load
    if (assignmentForm && !assignmentForm.hasListener) {
      assignmentForm.addEventListener('submit', handleAddAssignment);
      assignmentForm.hasListener = true;
    }
    
    if (assignmentsTableBody && !assignmentsTableBody.hasListener) {
      assignmentsTableBody.addEventListener('click', handleTableClick);
      assignmentsTableBody.hasListener = true;
    }
  } catch (error) {
    console.error('Error loading assignments:', error);
  }
}

// --- Initial Page Load ---
// Call the main async function to start the application.
loadAndInitialize();
