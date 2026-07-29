const welcomeMessage = document.getElementById("welcome-message");
const logoutButton = document.getElementById("logout-button");
const chatForm = document.getElementById("chat-form");
const chatInput = document.getElementById("chat-input");
const chatMessages = document.getElementById("chat-messages");
const chatStatus = document.getElementById("chat-status");
const chatHistory = document.getElementById("chat-history");
const newChatButton = document.querySelector(".new-chat-button");

// Check whether the user is logged in
async function loadUser() {
    try {
        const response = await fetch("/api/auth/user");
        const data = await response.json();

        if (!response.ok) {
            window.location.href = "/login.html";
            return;
        }

        welcomeMessage.textContent = `Welcome, ${data.username}!`;
    } catch (error) {
        welcomeMessage.textContent = "Could not load your account.";
    }
}

// Load saved chats from MongoDB
async function loadChats() {
    try {
        const response = await fetch("/api/chats");
        const chats = await response.json();

        if (!response.ok) {
            chatHistory.innerHTML = `
                <p class="empty-history">
                    Could not load chat history.
                </p>
            `;
            return;
        }

        chatHistory.innerHTML = "";

        if (chats.length === 0) {
            chatHistory.innerHTML = `
                <p class="empty-history">
                    Your saved conversations will appear here.
                </p>
            `;
            return;
        }

        chats.forEach(function (chat) {
            const chatItem = document.createElement("div");
            chatItem.classList.add("history-item");

            const chatQuestion = document.createElement("button");
            chatQuestion.classList.add("history-question");
            chatQuestion.textContent = chat.question;

            chatQuestion.addEventListener("click", function () {
                showSavedChat(chat);
            });

            const renameButton = document.createElement("button");
            renameButton.classList.add("rename-chat-button");
            renameButton.textContent = "Rename";

            renameButton.addEventListener("click", async function () {
                const newQuestion = prompt(
                    "Enter a new chat title:",
                    chat.question
                );

                if (!newQuestion || !newQuestion.trim()) {
                    return;
                }

                await renameChat(chat._id, newQuestion);
            });

            const deleteButton = document.createElement("button");
            deleteButton.classList.add("delete-chat-button");
            deleteButton.textContent = "Delete";

            deleteButton.addEventListener("click", async function () {
                await deleteChat(chat._id);
            });

            chatItem.appendChild(chatQuestion);
            chatItem.appendChild(renameButton);
            chatItem.appendChild(deleteButton);
            chatHistory.appendChild(chatItem);
        });
    } catch (error) {
        console.error(error);

        chatHistory.innerHTML = `
            <p class="empty-history">
                Could not load chat history.
            </p>
        `;
    }
}

// Show one saved chat
function showSavedChat(chat) {
    chatMessages.innerHTML = "";

    const userMessage = document.createElement("div");
    userMessage.classList.add("user-message");

    const userTitle = document.createElement("strong");
    userTitle.textContent = "You";

    const userText = document.createElement("p");
    userText.textContent = chat.question;

    userMessage.appendChild(userTitle);
    userMessage.appendChild(userText);

    const aiMessage = document.createElement("div");
    aiMessage.classList.add("ai-message");

    const aiTitle = document.createElement("strong");
    aiTitle.textContent = "AI Study Buddy";

    const aiText = document.createElement("p");
    aiText.textContent = chat.answer;

    aiMessage.appendChild(aiTitle);
    aiMessage.appendChild(aiText);

    chatMessages.appendChild(userMessage);
    chatMessages.appendChild(aiMessage);
}

// Rename a saved chat
async function renameChat(chatId, newQuestion) {
    try {
        const response = await fetch(`/api/chats/${chatId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                question: newQuestion
            })
        });

        const data = await response.json();

        if (!response.ok) {
            alert(data.message);
            return;
        }

        loadChats();
    } catch (error) {
        alert("Could not rename the chat.");
    }
}

// Delete one saved chat
async function deleteChat(chatId) {
    try {
        const response = await fetch(`/api/chats/${chatId}`, {
            method: "DELETE"
        });

        const data = await response.json();

        if (!response.ok) {
            alert(data.message);
            return;
        }

        chatMessages.innerHTML = `
            <div class="ai-message">
                <strong>AI Study Buddy</strong>
                <p>Hi! Ask me a question about any topic you are studying.</p>
            </div>
        `;

        loadChats();
    } catch (error) {
        alert("Could not delete the chat.");
    }
}

// Log out
logoutButton.addEventListener("click", async function () {
    try {
        await fetch("/api/auth/logout", {
            method: "POST"
        });

        window.location.href = "/login.html";
    } catch (error) {
        alert("Could not log out.");
    }
});

// Start a new chat
newChatButton.addEventListener("click", function () {
    chatMessages.innerHTML = `
        <div class="ai-message">
            <strong>AI Study Buddy</strong>
            <p>Hi! Ask me a question about any topic you are studying.</p>
        </div>
    `;

    chatInput.value = "";
    chatStatus.textContent = "";
});

// Send question to Gemini
chatForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const question = chatInput.value.trim();

    if (!question) {
        return;
    }

    const userMessage = document.createElement("div");
    userMessage.classList.add("user-message");

    const userTitle = document.createElement("strong");
    userTitle.textContent = "You";

    const userText = document.createElement("p");
    userText.textContent = question;

    userMessage.appendChild(userTitle);
    userMessage.appendChild(userText);
    chatMessages.appendChild(userMessage);

    chatInput.value = "";
    chatStatus.textContent = "AI Study Buddy is thinking...";

    try {
        const response = await fetch("/api/ai/ask", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                question: question
            })
        });

        const data = await response.json();

        if (!response.ok) {
            chatStatus.textContent = data.message;
            return;
        }

        const aiMessage = document.createElement("div");
        aiMessage.classList.add("ai-message");

        const aiTitle = document.createElement("strong");
        aiTitle.textContent = "AI Study Buddy";

        const aiText = document.createElement("p");
        aiText.textContent = data.answer;

        aiMessage.appendChild(aiTitle);
        aiMessage.appendChild(aiText);
        chatMessages.appendChild(aiMessage);

        chatStatus.textContent = "";
        chatMessages.scrollTop = chatMessages.scrollHeight;

        loadChats();
    } catch (error) {
        console.error(error);
        chatStatus.textContent = "Could not connect to the AI.";
    }
});

loadUser();
loadChats();