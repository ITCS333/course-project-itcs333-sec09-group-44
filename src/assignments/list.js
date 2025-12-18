/*
  Requirement: Populate the "Course Assignments" list page from the Database API.
*/

// --- Element Selections ---
const listSection = document.querySelector('#assignment-list-section');

// --- Functions ---

function createAssignmentArticle(assignment) {
  const article = document.createElement('article');
  article.className = 'col-12 mb-4';
  
  const card = document.createElement('div');
  card.className = 'card h-100 shadow-sm border-0 p-4';
  
  // Title
  const h2 = document.createElement('h2');
  h2.className = 'h4';
  h2.style.color = 'var(--custom-purple)';
  h2.textContent = assignment.title;
  card.appendChild(h2);
  
  // Due Date (Database uses 'due_date')
  const dateP = document.createElement('p');
  dateP.className = 'text-muted fw-bold';
  dateP.textContent = 'Due: ' + assignment.due_date;
  card.appendChild(dateP);
  
  // Description
  const descP = document.createElement('p');
  descP.textContent = assignment.description;
  card.appendChild(descP);
  
  // Link - CRITICAL: Uses the Database ID (e.g., asg_173...)
  const link = document.createElement('a');
  link.href = `details.html?id=${assignment.id}`;
  link.className = 'btn btn-outline-custom mt-auto';
  link.textContent = 'View Details & Discussion';
  card.appendChild(link);
  
  article.appendChild(card);
  return article;
}

async function loadAssignments() {
  listSection.innerHTML = '<p class="text-center w-100">Loading assignments...</p>';

  try {
    // 1. Fetch from the PHP Database API
    const response = await fetch('./api/index.php?resource=assignments');
    const json = await response.json();
    
    // Clear loading message
    listSection.innerHTML = '';
    
    // 2. Check for success and data
    if (!json.success || !json.data || json.data.length === 0) {
        listSection.innerHTML = '<p class="text-center w-100 text-muted">No assignments found in the database.</p>';
        return;
    }

    // 3. Loop through REAL database data
    for (const assignment of json.data) {
      const article = createAssignmentArticle(assignment);
      listSection.appendChild(article);
    }

  } catch (error) {
    console.error('Error loading assignments:', error);
    listSection.innerHTML = '<p class="text-center w-100 text-danger">Error loading assignments. Please try again later.</p>';
  }
}

// --- Initial Page Load ---
loadAssignments();