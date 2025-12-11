let currentResourceId = null;
let currentComments = [];

const resourceTitle = document.getElementById("resource-title");
const resourceDescription = document.getElementById("resource-description");
const resourceLink = document.getElementById("resource-link");
const commentList = document.getElementById("comment-list");
const commentForm = document.getElementById("comment-form");
const newComment = document.getElementById("new-comment");

function getResourceIdFromURL() {
  const params = new URLSearchParams(window.location.search);
  return params.get("id");
}

function renderResourceDetails(resource) {
  resourceTitle.textContent = resource.title;
  resourceDescription.textContent = resource.description;
  resourceLink.href = resource.link;
}

function createCommentArticle(comment) {
  const article = document.createElement("article");
  article.innerHTML = `
    <p>${comment.text}</p>
    <footer>— ${comment.author}</footer>
  `;
  return article;
}

function renderComments() {
  commentList.innerHTML = "";
  currentComments.forEach(c => commentList.appendChild(createCommentArticle(c)));
}

async function handleAddComment(event) {
  event.preventDefault();

  const text = newComment.value.trim();
  if (!text) return;

  const newObj = {
    resource_id: currentResourceId,
    author: "Student",
    text
  };

  await fetch("api/index.php?action=add_comment", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(newObj)
  });

  currentComments.push(newObj);
  renderComments();
  newComment.value = "";
}

async function initializePage() {
  currentResourceId = getResourceIdFromURL();
  if (!currentResourceId) return resourceTitle.textContent = "Resource not found.";

  const [resData, commentData] = await Promise.all([
    fetch("api/index.php").then(r => r.json()),
    fetch(`api/index.php?action=comments&resource_id=${currentResourceId}`).then(r => r.json())
  ]);

  const resources = resData.data;
  currentComments = commentData.data;

  const resource = resources.find(r => r.id == currentResourceId);
  if (!resource) return (resourceTitle.textContent = "Resource not found.");

  renderResourceDetails(resource);
  renderComments();
  commentForm.addEventListener("submit", handleAddComment);
}

initializePage();
