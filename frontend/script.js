const chatBox = document.getElementById('chatBox');
const userInput = document.getElementById('userInput');
const sendBtn = document.getElementById('sendBtn');

let isTyping = false;

// ── AUTO RESIZE TEXTAREA ──
function autoResize(el) {
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 100) + 'px';
}

// ── HANDLE ENTER KEY ──
function handleKey(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        sendMessage();
    }
}

// ── TOGGLE SIDEBAR ON MOBILE ──
function toggleSidebar() {
    document.querySelector('.left-panel').classList.toggle('open');
    document.getElementById('overlay').classList.toggle('show');
}

// ── USE SUGGESTION ──
function useSuggestion(text) {
    userInput.value = text;
    autoResize(userInput);
    // Close sidebar on mobile
    document.querySelector('.left-panel').classList.remove('open');
    document.getElementById('overlay').classList.remove('show');
    sendMessage();
}

// ── ADD MESSAGE ──
function addMessage(text, sender) {
    const row = document.createElement('div');
    row.classList.add('message-row', sender);

    const avatar = document.createElement('div');
    avatar.classList.add('msg-avatar');
    avatar.textContent = sender === 'bot' ? 'AF' : '👤';

    const content = document.createElement('div');
    content.classList.add('msg-content');

    const bubble = document.createElement('div');
    bubble.classList.add('msg-bubble');
    bubble.innerHTML = marked.parse(text);

    content.appendChild(bubble);

    // Copy button for bot messages only
    if (sender === 'bot') {
        const actions = document.createElement('div');
        actions.classList.add('msg-actions');

        const copyBtn = document.createElement('button');
        copyBtn.classList.add('action-btn');
        copyBtn.innerHTML = '📋 Copy';
        copyBtn.onclick = () => copyText(text, copyBtn);

        actions.appendChild(copyBtn);
        content.appendChild(actions);
    }

    row.appendChild(avatar);
    row.appendChild(content);
    chatBox.appendChild(row);
    scrollToBottom();
}

// ── COPY TEXT ──
function copyText(text, btn) {
    navigator.clipboard.writeText(text).then(() => {
        btn.innerHTML = '✅ Copied!';
        btn.classList.add('copied');
        setTimeout(() => {
            btn.innerHTML = '📋 Copy';
            btn.classList.remove('copied');
        }, 2000);
    });
}

// ── SHOW TYPING ──
function showTyping() {
    const row = document.createElement('div');
    row.classList.add('message-row', 'bot');
    row.id = 'typingRow';

    const avatar = document.createElement('div');
    avatar.classList.add('msg-avatar');
    avatar.textContent = 'AF';

    const content = document.createElement('div');
    content.classList.add('msg-content');

    const bubble = document.createElement('div');
    bubble.classList.add('typing-bubble');
    bubble.innerHTML = '<span></span><span></span><span></span>';

    content.appendChild(bubble);
    row.appendChild(avatar);
    row.appendChild(content);
    chatBox.appendChild(row);
    scrollToBottom();
}

// ── HIDE TYPING ──
function hideTyping() {
    const row = document.getElementById('typingRow');
    if (row) row.remove();
}

// ── SCROLL TO BOTTOM ──
function scrollToBottom() {
    chatBox.scrollTop = chatBox.scrollHeight;
}

// ── SEND MESSAGE ──
async function sendMessage() {
    const message = userInput.value.trim();
    if (!message || isTyping) return;

    addMessage(message, 'user');
    userInput.value = '';
    userInput.style.height = 'auto';

    isTyping = true;
    sendBtn.disabled = true;
    showTyping();

    try {
        const response = await fetch('http://127.0.0.1:8000/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message })
        });

        const data = await response.json();
        hideTyping();
        addMessage(data.reply, 'bot');

    } catch (error) {
        hideTyping();
        addMessage('Sorry, I could not connect. Please try again!', 'bot');
    }

    isTyping = false;
    sendBtn.disabled = false;
    scrollToBottom();
}

// ── CLEAR CHAT ──
async function clearChat() {
    try {
        await fetch('http://127.0.0.1:8000/clear', { method: 'POST' });
    } catch (e) {}

    chatBox.innerHTML = `
        <div class="welcome-msg">
            <div class="welcome-avatar">AF</div>
            <div class="welcome-text">
                <h3>Hi there! 👋</h3>
                <p>I'm AskFaidat, your AI guide to everything about <strong>Faidat Egberinde</strong> — her skills, projects, experience and how to work with her.</p>
                <p>What would you like to know?</p>
            </div>
        </div>
    `;
}