/*
  Requirement: Populate the weekly detail page and discussion forum.

  Instructions:
  1. Link this file to `details.html` using:
     <script src="details.js" defer></script>

  2. In `details.html`, add the following IDs:
     - To the <h1>: `id="week-title"`
     - To the start date <p>: `id="week-start-date"`
     - To the description <p>: `id="week-description"`
     - To the "Exercises & Resources" <ul>: `id="week-links-list"`
     - To the <div> for comments: `id="comment-list"`
     - To the "Ask a Question" <form>: `id="comment-form"`
     - To the <textarea>: `id="new-comment-text"`

  3. Implement the TODOs below.
*/

// --- Global Data Store ---
// These will hold the data related to *this* specific week.
let currentWeekId = null;
let currentComments = [];

// --- Element Selections ---
const weekTitle = document.querySelector("#week-title");
const weekStartDate = document.querySelector("#week-start-date");
const weekDescription = document.querySelector("#week-description");
const weekLinksList = document.querySelector("#week-links-list");

const commentList = document.querySelector("#comment-list");
const commentForm = document.querySelector("#comment-form");
const newCommentText = document.querySelector("#new-comment-text");

// --- Functions ---

/**
 * Get the week ID from the URL query parameters
 */
function getWeekIdFromURL() {
  let params = new URLSearchParams(window.location.search);
  return params.get("id");
}

/**
 * Render the week details on the page
 */
function renderWeekDetails(week) {
  weekTitle.textContent = week.title;
  weekStartDate.textContent = "Starts on: " + week.startDate;
  weekDescription.textContent = week.description;
  weekLinksList.innerHTML = "";
  
  // Handle links array (could be empty or undefined)
  const links = week.links || [];
  links.forEach(link => {
    const li = document.createElement("li");
    const a = document.createElement("a");
    a.href = link;
    a.textContent = link;
    a.target = "_blank";
    li.appendChild(a);
    weekLinksList.appendChild(li);
  });
}

/**
 * Create a comment article element
 */
function createCommentArticle(comment) {
  const article = document.createElement("article");
  const p = document.createElement("p");
  p.textContent = comment.text;

  const footer = document.createElement("footer");
  footer.textContent = "Posted by: " + comment.author;

  article.appendChild(p);
  article.appendChild(footer);

  return article;
}

/**
 * Render all comments on the page
 */
function renderComments() {
  commentList.innerHTML = "";
  currentComments.forEach(comment => {
    const art = createCommentArticle(comment);
    commentList.appendChild(art);
  });
}

/**
 * Handle adding a new comment
 */
async function handleAddComment(event) {
  event.preventDefault();

  const text = newCommentText.value.trim();
  if (text === "") return;

  // Prepare payload for the API
  const payload = {
    week_id: currentWeekId,
    author: "Student",
    text: text
  };

  try {
    const resp = await fetch("api/index.php?resource=comments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!resp.ok) {
      let errText = await resp.text();
      console.error("Failed to post comment:", resp.status, errText);
      alert("Failed to add comment. Please try again.");
      return;
    }

    const data = await resp.json();

    if (data && data.success) {
      // Re-fetch comments to show the new one
      await fetchComments();
      newCommentText.value = "";
      console.log("Comment added successfully!");
    } else {
      console.error("Unexpected API response when posting comment:", data);
      alert("Error adding comment.");
    }

  } catch (err) {
    console.error("Error posting comment:", err);
    alert("Connection error. Please try again.");
  }
}

/**
 * Initialize the page - load week details and comments
 */
async function initializePage() {
  currentWeekId = getWeekIdFromURL();

  // If no ID in URL, try to get the first week as default
  if (!currentWeekId) {
    console.warn('No week id in URL; attempting to use the first week as default');
    try {
      const wres = await fetch('api/index.php?resource=weeks', { cache: 'no-store' });
      if (wres.ok) {
        const wdata = await wres.json();
        if (Array.isArray(wdata) && wdata.length > 0) {
          currentWeekId = wdata[0].id;
          // Update URL
          const params = new URLSearchParams(window.location.search);
          params.set('id', currentWeekId);
          const newUrl = window.location.pathname + '?' + params.toString();
          window.history.replaceState({}, '', newUrl);
        }
      }
    } catch (e) {
      console.warn('Failed to pick default week:', e);
    }
  }

  if (!currentWeekId) {
    weekTitle.textContent = "Week not found.";
    return;
  }

  try {
    // Fetch week details from API (not from JSON file)
    const weeksRes = await fetch(`api/index.php?resource=weeks&week_id=${currentWeekId}`, { cache: 'no-store' });
    
    if (!weeksRes.ok) {
      throw new Error(`Failed to fetch week: ${weeksRes.status}`);
    }
    
    const week = await weeksRes.json();

    // Check if week exists
    if (!week || !week.id) {
      weekTitle.textContent = "Week not found.";
      return;
    }

    // Render week details
    renderWeekDetails(week);

    // Load comments for this week
    await fetchComments();

    // Add event listener for comment form
    if (commentForm) {
      commentForm.addEventListener("submit", handleAddComment);
    }

  } catch (error) {
    console.error('Error loading page:', error);
    weekTitle.textContent = "Error loading data.";
  }
}

/**
 * Fetch comments for the current week from the API
 */
async function fetchComments() {
  if (!currentWeekId) return;
  
  try {
    const resp = await fetch(`api/index.php?resource=comments&week_id=${encodeURIComponent(currentWeekId)}`, { cache: 'no-store' });
    
    if (!resp.ok) {
      throw new Error(`Failed to fetch comments: ${resp.status}`);
    }
    
    const commentsData = await resp.json();
    currentComments = Array.isArray(commentsData) ? commentsData : [];
    renderComments();
    
  } catch (err) {
    console.error('Error loading comments:', err);
    currentComments = [];
    renderComments();
  }
}

// --- Initial Page Load ---
initializePage();