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
 * TODO: Implement the getWeekIdFromURL function.
 * It should:
 * 1. Get the query string from `window.location.search`.
 * 2. Use the `URLSearchParams` object to get the value of the 'id' parameter.
 * 3. Return the id.
 */
function getWeekIdFromURL() {
  let params = new URLSearchParams(window.location.search);
  return params.get("id");
}

/**
 * TODO: Implement the renderWeekDetails function.
 * It takes one week object.
 * It should:
 * 1. Set the `textContent` of `weekTitle` to the week's title.
 * 2. Set the `textContent` of `weekStartDate` to "Starts on: " + week's startDate.
 * 3. Set the `textContent` of `weekDescription`.
 * 4. Clear `weekLinksList` and then create and append `<li><a href="...">...</a></li>`
 * for each link in the week's 'links' array. The link's `href` and `textContent`
 * should both be the link URL.
 */
function renderWeekDetails(week) {
  weekTitle.textContent = week.title;
  weekStartDate.textContent = "Starts on: " + week.startDate;
  weekDescription.textContent = week.description;
  weekLinksList.innerHTML = "";
  week.links.forEach(link => {
    const li = document.createElement("li");
    const a = document.createElement("a");

    a.href = link;
    a.textContent = link;

    li.appendChild(a);
    weekLinksList.appendChild(li);
});
}                  

/**
 * TODO: Implement the createCommentArticle function.
 * It takes one comment object {author, text}.
 * It should return an <article> element matching the structure in `details.html`.
 * (e.g., an <article> containing a <p> and a <footer>).
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
 * TODO: Implement the renderComments function.
 * It should:
 * 1. Clear the `commentList`.
 * 2. Loop through the global `currentComments` array.
 * 3. For each comment, call `createCommentArticle()`, and
 * append the resulting <article> to `commentList`.
 */
function renderComments() {
  commentList.innerHTML = "";

  currentComments.forEach(comment => {
  const art = createCommentArticle(comment);
  commentList.appendChild(art);
  });
}

/**
 * TODO: Implement the handleAddComment function.
 * This is the event handler for the `commentForm` 'submit' event.
 * It should:
 * 1. Prevent the form's default submission.
 * 2. Get the text from `newCommentText.value`.
 * 3. If the text is empty, return.
 * 4. Create a new comment object: { author: 'Student', text: commentText }
 * (For this exercise, 'Student' is a fine hardcoded author).
 * 5. Add the new comment to the global `currentComments` array (in-memory only).
 * 6. Call `renderComments()` to refresh the list.
 * 7. Clear the `newCommentText` textarea.
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
      // Try to parse error body for debugging
      let errText = await resp.text();
      console.error("Failed to post comment:", resp.status, errText);
      return;
    }

    const data = await resp.json();

    // If API returned success, re-load comments for this week from the API and render
    if (data && data.success) {
      // Re-fetch the comments for this week to ensure we display the authoritative list
      await fetchComments();
      newCommentText.value = "";
      // Ensure the server-persisted JSON is visible (some setups need a short delay)
      setTimeout(() => location.reload(), 400);
    } else {
      console.error("Unexpected API response when posting comment:", data);
    }

  } catch (err) {
    console.error("Error posting comment:", err);
  }
}

/**
 * TODO: Implement an `initializePage` function.
 * This function needs to be 'async'.
 * It should:
 * 1. Get the `currentWeekId` by calling `getWeekIdFromURL()`.
 * 2. If no ID is found, set `weekTitle.textContent = "Week not found."` and stop.
 * 3. `fetch` both 'weeks.json' and 'week-comments.json' (you can use `Promise.all`).
 * 4. Parse both JSON responses.
 * 5. Find the correct week from the weeks array using the `currentWeekId`.
 * 6. Get the correct comments array from the comments object using the `currentWeekId`.
 * Store this in the global `currentComments` variable. (If no comments exist, use an empty array).
 * 7. If the week is found:
 * - Call `renderWeekDetails()` with the week object.
 * - Call `renderComments()` to show the initial comments.
 * - Add the 'submit' event listener to `commentForm` (calls `handleAddComment`).
 * 8. If the week is not found, display an error in `weekTitle`.
 */
async function initializePage() {
  currentWeekId = getWeekIdFromURL();

  // If no ID in the URL, try to pick the first week as a sensible default so the page still works
  if (!currentWeekId) {
    console.warn('No week id in URL; attempting to use the first week as default');
    try {
      const wres = await fetch('api/weeks.json');
      if (wres.ok) {
        const wdata = await wres.json();
        if (Array.isArray(wdata) && wdata.length > 0) {
          currentWeekId = wdata[0].id;
          // Update URL so users can share/bookmark this week view (but don't reload)
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
    // Fetch week details from weeks.json and comments from the API endpoint for this week
    const weeksRes = await fetch("api/weeks.json", { cache: 'no-store' });
    if (!weeksRes.ok) throw new Error(`Failed to fetch weeks: ${weeksRes.status}`);
    const weeksData = await weeksRes.json();

    // Find the requested week by id (weeks.json uses an array of week objects)
    const week = Array.isArray(weeksData) ? weeksData.find(w => w.id === currentWeekId) : null;
    if (!week) {
      weekTitle.textContent = "Week not found.";
      return;
    }

    renderWeekDetails(week);

    // Load comments for this week from the API (index.php?resource=comments&week_id=...)
    await fetchComments();

    if (commentForm) commentForm.addEventListener("submit", handleAddComment);

  } catch (error) {
    weekTitle.textContent = "Error loading data.";
  }

}


// Fetch comments for the current week from the API and render them
async function fetchComments() {
  if (!currentWeekId) return;
  try {
    // Read comments directly from the static JSON file
    const resp = await fetch('api/comments.json', { cache: 'no-store' });
    if (!resp.ok) throw new Error(`Failed to fetch comments.json: ${resp.status}`);
    const commentsData = await resp.json();
    // comments.json is an object keyed by week id
    currentComments = (commentsData && commentsData[currentWeekId]) ? commentsData[currentWeekId] : [];

    renderComments();
  } catch (err) {
    console.error('Error loading comments:', err);
    currentComments = [];
    renderComments();
  }
}

// --- Initial Page Load ---
initializePage();
