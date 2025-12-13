let currentResourceId = null;
let currentComments   = [];

const resourceTitle       = document.querySelector('#resource-title');
const resourceDescription = document.querySelector('#resource-description');
const resourceLink        = document.querySelector('#resource-link');
const commentList         = document.querySelector('#comments-list');
const commentForm         = document.querySelector('#comment-form');
const newComment          = document.querySelector('#new-comment');


function getResourceIdFromURL() {
    const params = new URLSearchParams(window.location.search);
    return params.get('id');
}


function renderResourceDetails(resource) {
    resourceTitle.textContent       = resource.title;
    resourceDescription.textContent = resource.description;
    resourceLink.href               = resource.link;
}


function createCommentArticle(comment) {
    const article = document.createElement('article');
    article.classList.add('comment');

    const p = document.createElement('p');
    p.textContent = comment.text;

    const footer = document.createElement('footer');
    footer.innerHTML = `<small>By <strong>${comment.author}</strong> – ${new Date(comment.created_at).toLocaleDateString()}</small>`;

    article.appendChild(p);
    article.appendChild(footer);
    return article;
}

function renderComments() {
    commentList.innerHTML = '';
    if (currentComments.length === 0) {
        commentList.innerHTML = '<p>No comments yet.</p>';
        return;
    }
    currentComments.forEach(c => commentList.appendChild(createCommentArticle(c)));
}


async function loadComments() {
    try {
        const response = await fetch(`api/index.php?action=comments&resource_id=${currentResourceId}`);
        const json     = await response.json();
        if (!json.success) throw new Error(json.message || 'Cannot retrieve comments');
        currentComments = json.data || [];
        renderComments();
    } catch (err) {
        console.error(err);
        commentList.innerHTML = '<p>Comments unavailable.</p>';
    }
}


async function handleAddComment(e) {
    e.preventDefault();
    const text = newComment.value.trim();
    if (!text) return;

    try {
        const response = await fetch('api/index.php?action=comment', {
            method : 'POST',
            headers: { 'Content-Type': 'application/json' },
            body   : JSON.stringify({
                resource_id: currentResourceId,
                author     : 'Student',
                text
            })
        });

        const json = await response.json();
        if (!json.success) {
            alert('Cannot post comment: ' + (json.message || 'Operation failed'));
            return;
        }

        newComment.value = '';
        await loadComments();         
    } catch (err) {
        console.error(err);
        alert('Network error – try again.');
    }
}


async function initializePage() {
    currentResourceId = getResourceIdFromURL();
    if (!currentResourceId) {
        resourceTitle.textContent = 'Material not available.';
        return;
    }

    try {
        const resResp = await fetch(`api/index.php?id=${currentResourceId}`);
        const resJson = await resResp.json();
        if (!resJson.success) {
            resourceTitle.textContent = 'Material not found.';
            return;
        }
        renderResourceDetails(resJson.data);

        await loadComments();
        commentForm.addEventListener('submit', handleAddComment);
    } catch (err) {
        console.error(err);
        resourceTitle.textContent = 'Cannot load material.';
    }
}

initializePage();
