/*
  Requirement: Populate the "Course Resources" list page.

  Instructions:
  1. Link this file to `list.html` using:
     <script src="list.js" defer></script>

  2. In `list.html`, add an `id="resource-list-section"` to the
     <section> element that will contain the resource articles.
*/

// --- Element Selections ---
const listSection = document.getElementById("resource-list-section");

// --- Functions ---

/**
 * Creates an <article> for one resource.
 * Structure:
 * <article>
 *   <h2>Title</h2>
 *   <p>Description</p>
 *   <a href="details.html?id=NUMBER">View Resource & Discussion</a>
 * </article>
 */
function createResourceArticle(resource) {
  const article = document.createElement("article");

  const titleEl = document.createElement("h2");
  titleEl.textContent = resource.title;

  const descEl = document.createElement("p");
  descEl.textContent = resource.description;

  const linkEl = document.createElement("a");
  linkEl.href = `details.html?id=${resource.id}`;
  linkEl.textContent = "View Resource & Discussion";

  article.appendChild(titleEl);
  article.appendChild(descEl);
  article.appendChild(linkEl);

  return article;
}

/**
 * Loads resources from the API and displays them.
 */
async function loadResources() {
  try {
    const response = await fetch("api/index.php");
    const data = await response.json();
    const resources = data.data;

    // Clear previous content
    listSection.innerHTML = "";

    // Build articles for each resource
    resources.forEach(resource => {
      const article = createResourceArticle(resource);
      listSection.appendChild(article);
    });

  } catch (err) {
    console.error("Error loading resources:", err);
    listSection.innerHTML = "<p>Error loading resources.</p>";
  }
}

// --- Initial Page Load ---
loadResources();
