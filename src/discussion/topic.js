/*
  Requirement: Populate the single topic page and manage replies.

  Instructions:
  1. Link this file to `topic.html` using:
     <script src="topic.js" defer></script>

  2. In `topic.html`, add the following IDs:
     - To the <h1>: `id="topic-subject"`
     - To the <article id="original-post">:
       - Add a <p> with `id="op-message"` for the message text.
       - Add a <footer> with `id="op-footer"` for the metadata.
     - To the <div> for the list of replies: `id="reply-list-container"`
     - To the "Post a Reply" <form>: `id="reply-form"`

  3. Implement the TODOs below.
*/

// --- Global Data Store ---
let currentTopicId = null;
let currentReplies = []; // Will hold replies for *this* topic

// --- Element Selections ---
// Select elements added in `topic.html`.
const topicSubject = document.getElementById('topic-subject');
const opMessage = document.getElementById('op-message');
const opFooter = document.getElementById('op-footer');
const replyListContainer = document.getElementById('reply-list-container');
const replyForm = document.getElementById('reply-form');
const newReplyText = document.getElementById('new-reply');

// --- Functions ---

/**
 * TODO: Implement the getTopicIdFromURL function.
 * It should:
 * 1. Get the query string from `window.location.search`.
 * 2. Use the `URLSearchParams` object to get the value of the 'id' parameter.
 * 3. Return the id.
 */
function getTopicIdFromURL() {
  const params = new URLSearchParams(window.location.search);
  return params.get('id');
}

/**
 * TODO: Implement the renderOriginalPost function.
 * It takes one topic object.
 * It should:
 * 1. Set the `textContent` of `topicSubject` to the topic's subject.
 * 2. Set the `textContent` of `opMessage` to the topic's message.
 * 3. Set the `textContent` of `opFooter` to "Posted by: {author} on {date}".
 * 4. (Optional) Add a "Delete" button with `data-id="${topic.id}"` to the OP.
 */
function renderOriginalPost(topic) {
  if (!topicSubject || !opMessage || !opFooter) return;
  topicSubject.textContent = topic.subject || 'No subject';
  opMessage.textContent = topic.message || '';
  opFooter.textContent = `Posted by: ${topic.author || 'Unknown'} on ${topic.date || ''}`;
}

/**
 * TODO: Implement the createReplyArticle function.
 * It takes one reply object {id, author, date, text}.
 * It should return an <article> element matching the structure in `topic.html`.
 * - Include a <p> for the `text`.
 * - Include a <footer> for the `author` and `date`.
 * - Include a "Delete" button with class "delete-reply-btn" and `data-id="${id}"`.
 */
function createReplyArticle(reply) {
  const article = document.createElement('article');
  article.className = 'reply';

  const p = document.createElement('p');
  p.textContent = reply.text;

  const footer = document.createElement('footer');
  footer.textContent = `Posted by: ${reply.author} on ${reply.date}`;

  const actions = document.createElement('div');
  actions.className = 'reply-actions';

  const editBtn = document.createElement('a');
  editBtn.href = '#';
  editBtn.className = 'btn-edit';
  editBtn.textContent = 'Edit';

  const deleteBtn = document.createElement('a');
  deleteBtn.href = '#';
  deleteBtn.className = 'delete-reply-btn btn-delete';
  deleteBtn.setAttribute('data-id', reply.id);
  deleteBtn.textContent = 'Delete';

  actions.appendChild(editBtn);
  actions.appendChild(deleteBtn);

  article.appendChild(p);
  article.appendChild(footer);
  article.appendChild(actions);

  return article;
}

/**
 * TODO: Implement the renderReplies function.
 * It should:
 * 1. Clear the `replyListContainer`.
 * 2. Loop through the global `currentReplies` array.
 * 3. For each reply, call `createReplyArticle()`, and
 * append the resulting <article> to `replyListContainer`.
 */
function renderReplies() {
  if (!replyListContainer) return;
  replyListContainer.innerHTML = '';
  currentReplies.forEach(r => {
    const el = createReplyArticle(r);
    replyListContainer.appendChild(el);
  });
}

/**
 * TODO: Implement the handleAddReply function.
 * This is the event handler for the `replyForm` 'submit' event.
 * It should:
 * 1. Prevent the form's default submission.
 * 2. Get the text from `newReplyText.value`.
 * 3. If the text is empty, return.
 * 4. Create a new reply object:
 * {
 * id: `reply_${Date.now()}`,
 * author: 'Student' (hardcoded),
 * date: new Date().toISOString().split('T')[0],
 * text: (reply text value)
 * }
 * 5. Add this new reply to the global `currentReplies` array (in-memory only).
 * 6. Call `renderReplies()` to refresh the list.
 * 7. Clear the `newReplyText` textarea.
 */
function handleAddReply(event) {
  event.preventDefault();
  if (!newReplyText) return;
  const text = newReplyText.value.trim();
  if (!text) return;

  const newReply = {
    id: `reply_${Date.now()}`,
    author: 'Student',
    date: new Date().toISOString().split('T')[0],
    text
  };

  currentReplies.push(newReply);
  renderReplies();
  if (replyForm) replyForm.reset();
}

/**
 * TODO: Implement the handleReplyListClick function.
 * This is an event listener on the `replyListContainer` (for delegation).
 * It should:
 * 1. Check if the clicked element (`event.target`) has the class "delete-reply-btn".
 * 2. If it does, get the `data-id` attribute from the button.
 * 3. Update the global `currentReplies` array by filtering out the reply
 * with the matching ID (in-memory only).
 * 4. Call `renderReplies()` to refresh the list.
 */
function handleReplyListClick(event) {
  const target = event.target;
  if (target.classList && target.classList.contains('delete-reply-btn')) {
    const id = target.getAttribute('data-id');
    if (!id) return;
    currentReplies = currentReplies.filter(r => r.id !== id);
    renderReplies();
  }
}

/**
 * TODO: Implement an `initializePage` function.
 * This function needs to be 'async'.
 * It should:
 * 1. Get the `currentTopicId` by calling `getTopicIdFromURL()`.
 * 2. If no ID is found, set `topicSubject.textContent = "Topic not found."` and stop.
 * 3. `fetch` both 'topics.json' and 'replies.json' (you can use `Promise.all`).
 * 4. Parse both JSON responses.
 * 5. Find the correct topic from the topics array using the `currentTopicId`.
 * 6. Get the correct replies array from the replies object using the `currentTopicId`.
 * Store this in the global `currentReplies` variable. (If no replies exist, use an empty array).
 * 7. If the topic is found:
 * - Call `renderOriginalPost()` with the topic object.
 * - Call `renderReplies()` to show the initial replies.
 * - Add the 'submit' event listener to `replyForm` (calls `handleAddReply`).
 * - Add the 'click' event listener to `replyListContainer` (calls `handleReplyListClick`).
 * 8. If the topic is not found, display an error in `topicSubject`.
 */
async function initializePage() {
  currentTopicId = getTopicIdFromURL();
  if (!currentTopicId) {
    if (topicSubject) topicSubject.textContent = 'Topic not found.';
    return;
  }

  try {
    const [topicsResp, commentsResp] = await Promise.all([
      fetch('api/topics.json'),
      fetch('api/comments.json')
    ]);

    const topics = await topicsResp.json();
    const comments = await commentsResp.json();

    const topic = Array.isArray(topics)
      ? topics.find(t => t.id === currentTopicId)
      : null;

    currentReplies = (comments && comments[currentTopicId]) ? comments[currentTopicId].slice() : [];

    if (topic) {
      renderOriginalPost(topic);
      renderReplies();
      if (replyForm) replyForm.addEventListener('submit', handleAddReply);
      if (replyListContainer) replyListContainer.addEventListener('click', handleReplyListClick);
    } else {
      if (topicSubject) topicSubject.textContent = 'Topic not found.';
    }
  } catch (err) {
    console.error('Error initializing topic page:', err);
    if (topicSubject) topicSubject.textContent = 'Error loading topic.';
  }
}

// --- Initial Page Load ---
initializePage();
