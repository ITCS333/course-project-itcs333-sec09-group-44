/*
  Admin Interface for Managing Assignments
*/

let assignments = [];
let editingAssignmentId = null;

const assignmentForm = document.querySelector('#assignment-form');
const assignmentsTableBody = document.querySelector('#assignments-tbody');

function createAssignmentRow(assignment) {
  const row = document.createElement('tr');
  
  // Title cell
  const titleCell = document.createElement('td');
  titleCell.className = 'align-middle';
  titleCell.textContent = assignment.title;
  row.appendChild(titleCell);
  
  // Due date cell
  const dueDateCell = document.createElement('td');
  dueDateCell.className = 'align-middle';
  dueDateCell.textContent = assignment.due_date;
  row.appendChild(dueDateCell);
  
  // Actions cell
  const actionsCell = document.createElement('td');
  actionsCell.className = 'text-end';
  
  const editButton = document.createElement('button');
  editButton.type = 'button';
  editButton.className = 'btn btn-success btn-sm px-3 me-2 edit-btn';
  editButton.dataset.id = assignment.id;
  editButton.textContent = 'Edit';
  actionsCell.appendChild(editButton);
  
  const deleteButton = document.createElement('button');
  deleteButton.type = 'button';
  deleteButton.className = 'btn btn-danger btn-sm px-3 delete-btn';
  deleteButton.dataset.id = assignment.id;
  deleteButton.textContent = 'Delete';
  actionsCell.appendChild(deleteButton);
  
  row.appendChild(actionsCell);
  
  return row;
}

function renderTable() {
  assignmentsTableBody.innerHTML = '';
  
  if (assignments.length === 0) {
    const row = document.createElement('tr');
    const cell = document.createElement('td');
    cell.colSpan = 3;
    cell.className = 'text-center text-muted py-4';
    cell.textContent = 'No assignments yet. Add your first assignment above!';
    row.appendChild(cell);
    assignmentsTableBody.appendChild(row);
    return;
  }
  
  for (const assignment of assignments) {
    const row = createAssignmentRow(assignment);
    assignmentsTableBody.appendChild(row);
  }
}

function handleAddAssignment(event) {
  event.preventDefault();
  
  const title = document.querySelector('#assignment-title').value.trim();
  const description = document.querySelector('#assignment-description').value.trim();
  const dueDate = document.querySelector('#assignment-due-date').value;
  const filesInput = document.querySelector('#assignment-files').value.trim();
  
  // Convert files textarea to array (split by newlines)
  const filesArray = filesInput ? filesInput.split('\n').map(f => f.trim()).filter(f => f) : [];
  
  if (editingAssignmentId) {
    // Update existing assignment
    const updateData = {
      id: editingAssignmentId,
      title: title,
      description: description,
      due_date: dueDate,
      files: filesArray
    };
    
    fetch(`./api/index.php?resource=assignments&id=${editingAssignmentId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updateData)
    })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        editingAssignmentId = null;
        document.querySelector('#add-assignment').textContent = 'Add Assignment';
        document.querySelector('h2').textContent = 'Add a New Assignment';
        assignmentForm.reset();
        loadAndInitialize();
      } else {
        alert('Failed to update: ' + (data.message || 'Unknown error'));
      }
    })
    .catch(error => {
      console.error('Error updating assignment:', error);
      alert('Error updating assignment: ' + error.message);
    });
  } else {
    // Create new assignment
    const newAssignmentData = {
      title: title,
      description: description,
      due_date: dueDate,
      files: filesArray
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
        // Show success message briefly
        const btn = document.querySelector('#add-assignment');
        const originalText = btn.textContent;
        btn.textContent = '✓ Added Successfully!';
        setTimeout(() => {
          btn.textContent = originalText;
        }, 2000);
      } else {
        alert('Failed to create: ' + (data.message || 'Unknown error'));
      }
    })
    .catch(error => {
      console.error('Error creating assignment:', error);
      alert('Error creating assignment: ' + error.message);
    });
  }
}

function handleTableClick(event) {
  const target = event.target;
  
  if (target.classList.contains('delete-btn')) {
    event.preventDefault();
    event.stopPropagation();
    
    const assignmentId = target.dataset.id;
    const assignment = assignments.find(a => a.id == assignmentId);
    const assignmentTitle = assignment ? assignment.title : 'this assignment';
    
    const userConfirmed = window.confirm(`Are you sure you want to delete "${assignmentTitle}"?\n\nThis action cannot be undone.`);
    
    if (userConfirmed) {
      target.disabled = true;
      target.textContent = 'Deleting...';
      
      fetch(`./api/index.php?resource=assignments&id=${assignmentId}`, {
        method: 'DELETE'
      })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          loadAndInitialize();
        } else {
          alert('Failed to delete assignment: ' + (data.message || 'Unknown error'));
          target.disabled = false;
          target.textContent = 'Delete';
        }
      })
      .catch(error => {
        console.error('Error deleting assignment:', error);
        alert('Error deleting assignment: ' + error.message);
        target.disabled = false;
        target.textContent = 'Delete';
      });
    }
    
  } else if (target.classList.contains('edit-btn')) {
    event.preventDefault();
    event.stopPropagation();
    
    const assignmentId = target.dataset.id;
    const assignment = assignments.find(asg => asg.id == assignmentId);
    
    if (assignment) {
      editingAssignmentId = assignmentId;
      
      document.querySelector('#assignment-title').value = assignment.title;
      document.querySelector('#assignment-description').value = assignment.description || '';
      document.querySelector('#assignment-due-date').value = assignment.due_date;
      
      const filesText = Array.isArray(assignment.files) ? assignment.files.join('\n') : '';
      document.querySelector('#assignment-files').value = filesText;
      
      document.querySelector('#add-assignment').textContent = 'Update Assignment';
      document.querySelector('h2').textContent = 'Edit Assignment';
      
      document.querySelector('#assignment-title').focus();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }
}

async function loadAndInitialize() {
  try {
    const response = await fetch('./api/index.php?resource=assignments');
    const data = await response.json();
    
    if (data.success) {
      assignments = data.data;
    } else {
      assignments = [];
      console.error('Failed to load assignments:', data.message);
    }
    
    renderTable();
    
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
    assignmentsTableBody.innerHTML = '<tr><td colspan="3" class="text-center text-danger py-4">Error loading assignments. Please refresh the page.</td></tr>';
  }
}

// Initial page load
loadAndInitialize();