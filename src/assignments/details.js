/*
  Requirement: Populate the assignment detail page and discussion forum from API.
  FIX: Handles "fake" file links by showing an alert instead of a 404 error.
*/

// --- Global Data Store ---
let currentAssignmentId = null;
let currentComments = [];

// --- Element Selections ---
const assignmentTitle = document.querySelector('#assignment-title');
const assignmentDueDate = document.querySelector('#assignment-due-date');
const assignmentDescription = document.querySelector('#assignment-description');
const assignmentFilesList = document.querySelector('#assignment-files-list');
const commentList = document.querySelector('#comment-list');
const commentForm = document.querySelector('#comment-form');
const newCommentText = document.querySelector('#new-comment-text');

// --- Functions ---

function getAssignmentIdFromURL() {
  const params = new URLSearchParams(window.location.search);
  return params.get('id');
}

function renderAssignmentDetails(assignment) {
  assignmentTitle.textContent = assignment.title;
  assignmentDueDate.textContent = 'Due: ' + assignment.due_date;
  assignmentDescription.textContent = assignment.description;
  
  assignmentFilesList.innerHTML = '';
  
  // FIXED: Handle Files Safely
  const filesArray = Array.isArray(assignment.files) ? assignment.files : [];
  
  if (filesArray.length === 0) {
      assignmentFilesList.innerHTML = '<li class="list-group-item text-muted">No attached files.</li>';
  } else {
      for (const file of filesArray) {
        const li = document.createElement('li');
        li.className = 'list-group-item d-flex justify-content-between align-items-center';
        
        const a = document.createElement('a');
        a.textContent = file;
        a.className = 'text-decoration-none fw-bold text-primary';
        
        // LOGIC: Check if it is a real link or a fake file
        if (file.startsWith('http')) {
            // Real Link -> Open in new tab
            a.href = file;
            a.target = '_blank';
        } else {
            // Fake File -> Prevent error and show alert
            a.href = '#';
            a.onclick = (e) => {
                e.preventDefault();
                alert(`(Demo) Downloading file:\n${file}\n\nThis is a simulation because no file server is connected.`);
            };
        }
        
        // Add a nice "Download" badge
        const badge = document.createElement('span');
        badge.className = 'badge bg-light text-dark border';
        badge.textContent = file.startsWith('http') ? 'Open Link' : 'Download';

        li.appendChild(a);
        li.appendChild(badge);
        assignmentFilesList.appendChild(li);
      }
  }
}

function createCommentArticle(comment) {
  const article = document.createElement('article');
  article.className = 'bg-light p-3 rounded mb-3';
  
  const p = document.createElement('p');
  p.className = 'mb-1';
  p.textContent = comment.text;
  article.appendChild(p);
  
  const footer = document.createElement('footer');
  footer.className = 'text-muted small';
  
  const dateStr = comment.created_at ? ` on ${comment.created_at}` : '';
  footer.innerHTML = `Posted by: <strong>${comment.author}</strong>${dateStr}`;
  article.appendChild(footer);
  
  return article;
}

function renderComments() {
  commentList.innerHTML = '';
  
  if (currentComments.length === 0) {
      commentList.innerHTML = '<p class="text-muted">No comments yet. Be the first!</p>';
      return;
  }

  for (const comment of currentComments) {
    const article = createCommentArticle(comment);
    commentList.appendChild(article);
  }
}

async function handleAddComment(event) {
  event.preventDefault();
  
  const commentText = newCommentText.value;
  
  if (!commentText.trim()) {
    return;
  }
  
  try {
      const response = await fetch('./api/index.php?resource=comments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
              assignment_id: currentAssignmentId,
              author: 'Student', 
              text: commentText
          })
      });

      const json = await response.json();

      if (json.success) {
          newCommentText.value = '';
          loadComments(); 
      } else {
          alert('Error posting comment: ' + json.message);
      }
  } catch (error) {
      console.error('Error posting comment:', error);
  }
}

async function loadComments() {
    try {
        const response = await fetch(`./api/index.php?resource=comments&assignment_id=${currentAssignmentId}`);
        const json = await response.json();
        
        if (json.success) {
            currentComments = json.data;
            renderComments();
        }
    } catch (error) {
        console.error('Error loading comments:', error);
    }
}

async function initializePage() {
  try {
    currentAssignmentId = getAssignmentIdFromURL();
    
    if (!currentAssignmentId) {
      assignmentTitle.textContent = 'Error: No assignment ID provided';
      assignmentDescription.textContent = 'Please go back to the list and select an assignment.';
      return;
    }
    
    // 1. Fetch Assignment Details
    const assignmentResponse = await fetch(`./api/index.php?resource=assignments&id=${currentAssignmentId}`);
    const assignmentJson = await assignmentResponse.json();
    
    if (assignmentJson.success) {
        renderAssignmentDetails(assignmentJson.data);
        
        // 2. Fetch Comments
        await loadComments();
        
        // 3. Enable Form
        if (commentForm) {
            commentForm.addEventListener('submit', handleAddComment);
        }
    } else {
        assignmentTitle.textContent = 'Error: Assignment not found';
        assignmentDescription.textContent = 'The assignment ID does not exist in the database.';
    }

  } catch (error) {
    console.error('Error loading page:', error);
    assignmentTitle.textContent = 'Error loading assignment details';
  }
}

// --- Initial Page Load ---
initializePage();