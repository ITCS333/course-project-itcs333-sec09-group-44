/*
  Requirement: Populate the weekly detail page and discussion forum.
  This version loads data ONLY from the database via API
*/

// --- Global Data Store ---
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
  console.log("Rendering week details:", week);

  weekTitle.textContent = week.title;
  weekStartDate.textContent = "Starts on: " + week.startDate;
  weekDescription.textContent = week.description || "No description available.";
  weekLinksList.innerHTML = "";

  // Handle links array
  const links = week.links || [];

  if (links.length === 0) {
    const li = document.createElement("li");
    li.textContent = "No resources available yet.";
    li.style.color = "#999";
    weekLinksList.appendChild(li);
  } else {
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
  console.log("Rendering comments:", currentComments);

  commentList.innerHTML = "";

  if (currentComments.length === 0) {
    commentList.innerHTML = '<p style="color:#999; font-style:italic;">No comments yet. Be the first to ask a question!</p>';
    return;
  }

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

  console.log("Posting comment for week:", currentWeekId);

  // Prepare payload for the API
  const payload = {
    week_id: currentWeekId,
    author: "Student",
    text: text
  };

  try {
    const resp = await fetch("api/index.php?resource=comments", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify(payload)
    });

    console.log("Comment post response status:", resp.status);

    if (!resp.ok) {
      let errText = await resp.text();
      console.error("Failed to post comment:", resp.status, errText);
      alert("Failed to add comment. Please try again.");
      return;
    }

    const data = await resp.json();
    console.log("Comment post response:", data);

    if (data && data.success) {
      // Re-fetch comments to show the new one
      await fetchComments();
      newCommentText.value = "";
      console.log("✅ Comment added successfully!");
    } else {
      console.error("Unexpected API response when posting comment:", data);
      alert("Error adding comment.");
    }

  } catch (err) {
    console.error("❌ Error posting comment:", err);
    alert("Connection error. Please try again.");
  }
}

/**
 * Fetch comments for the current week from the API
 */
async function fetchComments() {
  if (!currentWeekId) return;

  console.log("Fetching comments for week:", currentWeekId);

  try {
    const resp = await fetch(`api/index.php?resource=comments&week_id=${encodeURIComponent(currentWeekId)}`, { 
      cache: 'no-store',
      headers: {
        'Accept': 'application/json'
      }
    });

    console.log("Comments response status:", resp.status);

    if (!resp.ok) {
      throw new Error(`Failed to fetch comments: ${resp.status}`);
    }

    const commentsData = await resp.json();
    console.log("Comments data:", commentsData);

    currentComments = Array.isArray(commentsData) ? commentsData : [];
    renderComments();

    console.log("✅ Loaded", currentComments.length, "comments");

  } catch (err) {
    console.error('❌ Error loading comments:', err);
    currentComments = [];
    renderComments();
  }
}

/**
 * Initialize the page - load week details and comments
 */
async function initializePage() {
  console.log("Initializing details page...");

  currentWeekId = getWeekIdFromURL();

  // If no ID in URL, try to get the first week as default
  if (!currentWeekId) {
    console.warn('⚠️ No week id in URL; attempting to use the first week as default');
    try {
      const wres = await fetch('api/index.php?resource=weeks', { 
        cache: 'no-store',
        headers: {
          'Accept': 'application/json'
        }
      });

      if (wres.ok) {
        const wdata = await wres.json();
        const weeks = Array.isArray(wdata) ? wdata : (wdata.data || []);

        if (weeks.length > 0) {
          currentWeekId = weeks[0].id;
          console.log("Using first week:", currentWeekId);

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
    weekTitle.textContent = "⚠️ Week not found";
    weekDescription.textContent = "Please select a week from the list.";
    return;
  }

  try {
    // Fetch week details from API
    console.log("Fetching week details for ID:", currentWeekId);

    const weeksRes = await fetch(`api/index.php?resource=weeks&week_id=${currentWeekId}`, { 
      cache: 'no-store',
      headers: {
        'Accept': 'application/json'
      }
    });

    console.log("Week details response status:", weeksRes.status);

    if (!weeksRes.ok) {
      throw new Error(`Failed to fetch week: ${weeksRes.status}`);
    }

    const week = await weeksRes.json();
    console.log("Week details:", week);

    // Check if week exists
    if (!week || !week.id) {
      weekTitle.textContent = "⚠️ Week not found";
      weekDescription.textContent = "This week does not exist in the database.";
      return;
    }

    // Render week details
    renderWeekDetails(week);

    // Load comments for this week
    await fetchComments();

    // Add event listener for comment form
    if (commentForm) {
      commentForm.addEventListener("submit", handleAddComment);
      console.log("✅ Comment form ready");
    }

    console.log("✅ Page initialized successfully");

  } catch (error) {
    console.error('❌ Error loading page:', error);
    weekTitle.textContent = "⚠️ Error loading data";
    weekDescription.textContent = error.message || "Please check console for details.";
  }
}

// --- Initial Page Load ---
console.log("Page loaded, starting initialization...");
initializePage();
