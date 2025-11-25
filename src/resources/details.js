/*
  Requirement: Populate the resource detail page and discussion forum.

  Instructions:
  1. Link this file to `details.html` using:
     <script src="details.js" defer></script>

  2. In `details.html`, add the following IDs:
     - To the <h1>: `id="resource-title"`
     - To the description <p>: `id="resource-description"`
     - To the "Access Resource Material" <a> tag: `id="resource-link"`
     - To the <div> for comments: `id="comment-list"`
     - To the "Leave a Comment" <form>: `id="comment-form"`
     - To the <textarea>: `id="new-comment"`

  3. Implement the TODOs below.
*/

// --- Global Data Store ---
// These will hold the data related to *this* resource.
let currentResourceId = null;
let currentComments = [];

// --- Element Selections ---
// TODO: Select all the elements you added IDs for in step 2.
const resourceTitle = document.getElementById("resource-title");
const resourceDescription = document.getElementById("resource-description");
const resourceLink = document.getElementById("resource-link");
const commentList = document.getElementById("comment-list");
const commentForm = document.getElementById("comment-form");
const newComment = document.getElementById("new-comment");

// --- Functions ---

function getResourceIdFromURL() {
  // 1. Get query string
  const query = window.location.search;

  // 2. Use URLSearchParams
  const params = new URLSearchParams(query);

  // 3. Return id
  return params.get("id");
}

function renderResourceDetails(resource) {
  // 1. Set title
  resourceTitle.textContent = resource.title;
  // 2. Set description
  resourceDescription.textContent = resource.description;
  // 3. Set link
  resourceLink.href = resource.link;
}

function createCommentArticle(comment) {
  // Create article element
  const article = document.createElement("article");

  // Comment text
  const p = document.createElement("p");
  p.textContent = comment.text;

  // Author footer
  const footer = document.createElement("footer");
  footer.textContent = `— ${comment.author}`;

  article.appendChild(p);
  article.appendChild(footer);

  return article;
}

function renderComments() {
  // 1. Clear the comment list
  commentList.innerHTML = "";

  // 2. Loop through comments
  currentComments.forEach(comment => {
    const element = createCommentArticle(comment);
    commentList.appendChild(element);
  });
}

function handleAddComment(event) {
  // 1. Prevent default
  event.preventDefault();

  // 2. Get text
  const commentText = newComment.value.trim();

  // 3. If empty, return
  if (!commentText) return;

  // 4. Create new comment object
  const newObj = {
    author: "Student",
    text: commentText,
  };

  // 5. Add to global array
  currentComments.push(newObj);

  // 6. Refresh the list
  renderComments();

  // 7. Clear textarea
  newComment.value = "";
}

async function initializePage() {
  // 1. Get resource ID
  currentResourceId = getResourceIdFromURL();

  // 2. If no ID
  if (!currentResourceId) {
    resourceTitle.textContent = "Resource not found.";
    return;
  }

  try {
    // 3. Fetch resources and comments
    const [resourcesRes, commentsRes] = await Promise.all([
      fetch("resources.json"),
      fetch("resource-comments.json"),
    ]);

    const resources = await resourcesRes.json();
    const commentsData = await commentsRes.json();

    // 5. Find resource
    const resource = resources.find(r => r.id === currentResourceId);

    // 6. Get comments
    currentComments = commentsData[currentResourceId] || [];

    // 8. If not found
    if (!resource) {
      resourceTitle.textContent = "Resource not found.";
      return;
    }

    // 7. Render resource & comments
    renderResourceDetails(resource);
    renderComments();

    // 7. Add submit listener
    commentForm.addEventListener("submit", handleAddComment);

  } catch (err) {
    resourceTitle.textContent = "Error loading resource.";
    console.error(err);
  }
}

// --- Initial Page Load ---
initializePage();
