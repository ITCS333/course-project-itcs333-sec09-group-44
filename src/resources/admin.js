let resources = [];

const resourceForm = document.querySelector("#resource-form");
const resourcesTableBody = document.querySelector("#resources-tbody");

function createResourceRow(resource) {
  const tr = document.createElement("tr");

  tr.innerHTML = `
    <td>${resource.title}</td>
    <td>${resource.description}</td>
    <td>
      <a href="${resource.link}" target="_blank">${resource.link}</a>
    </td>
    <td>
      <button class="edit-btn" data-id="${resource.id}">Edit</button>
      <button class="delete-btn" data-id="${resource.id}">Delete</button>
    </td>
  `;

  return tr;
}

function renderTable() {
  resourcesTableBody.innerHTML = "";
  resources.forEach(r => resourcesTableBody.appendChild(createResourceRow(r)));
}

async function handleAddResource(e) {
  e.preventDefault();

  const title = document.querySelector("#resource-title").value.trim();
  const description = document.querySelector("#resource-description").value.trim();
  const link = document.querySelector("#resource-link").value.trim();

  if (!title || !link) return alert("Title and link required");

  await fetch("api/index.php", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, description, link })
  });

  loadAndInitialize();
  resourceForm.reset();
}

async function handleTableClick(event) {
  const id = event.target.dataset.id;
  if (!id) return;

  // DELETE
  if (event.target.classList.contains("delete-btn")) {
    await fetch(`api/index.php?id=${id}`, { method: "DELETE" });
    return loadAndInitialize();
  }

  // EDIT
  if (event.target.classList.contains("edit-btn")) {
    const row = event.target.closest("tr");

    const newTitle = prompt("New title:", row.children[0].textContent);
    const newDesc = prompt("New description:", row.children[1].textContent);
    const newLink = prompt("New link:", row.children[2].textContent);

    await fetch("api/index.php", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id,
        title: newTitle,
        description: newDesc,
        link: newLink
      })
    });

    loadAndInitialize();
  }
}

async function loadAndInitialize() {
  const res = await fetch("api/index.php");
  resources = (await res.json()).data;
  renderTable();
}

resourceForm.addEventListener("submit", handleAddResource);
resourcesTableBody.addEventListener("click", handleTableClick);

loadAndInitialize();
