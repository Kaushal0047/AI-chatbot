const API_KEY = 'AIzaSyAfsCF8nLH9IIyjoH1sdvcEfWZgSDCZrlU';
const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent';

const chatMessages = document.getElementById('chat-messages');
const userInput = document.getElementById('user-input');
const sendButton = document.getElementById('send-button');

async function generateResponse(prompt) {
    const response = await fetch(`${API_URL}?key=${API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }]
        })
    });

    if (!response.ok) throw new Error('Failed to generate response');
    
    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
}

function cleanMarkdown(text) {
    return text.replace(/#{1,6}\s?/g, '').replace(/\*\*/g, '').replace(/\n{3,}/g, '\n\n').trim();
}

function addMessage(message, isUser) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message', isUser ? 'user-message' : 'bot-message');

    const profileImage = document.createElement('img');
    profileImage.classList.add('profile-image');
    
    // Corrected file paths and consistent file extensions (make sure your actual files match these)
    profileImage.src = isUser ? 'Designer.jpeg' : 'chatbot.jpeg'; 
    profileImage.alt = isUser ? 'User' : 'Bot';

    const messageContent = document.createElement('div');
    messageContent.classList.add('message-content');
    messageContent.textContent = message;

    // Create the Copy button
    const copyButton = document.createElement('button');
    copyButton.classList.add('copy');
    copyButton.textContent = 'Copy';
    
    // Add event listener for the Copy button
    copyButton.addEventListener('click', () => {
        const textToCopy = messageContent.textContent
            .replace(/\s+/g, " ")
            .trim();

        navigator.clipboard.writeText(textToCopy).then(() => {
            const originalText = copyButton.textContent;
            copyButton.textContent = "Copied!";
            copyButton.disabled = true;

            setTimeout(() => {
                copyButton.textContent = originalText;
                copyButton.disabled = false;
            }, 2000); // Revert after 2 seconds
        }).catch(err => {
            console.error("Failed to copy: ", err);
        });
    });

    // Append profile image, message content, and copy button to the message element
    messageElement.appendChild(profileImage);
    messageElement.appendChild(messageContent);
    messageElement.appendChild(copyButton);
    chatMessages.appendChild(messageElement);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

async function handleUserInput() {
    const userMessage = userInput.value.trim();
    if (!userMessage) return;

    addMessage(userMessage, true);
    userInput.value = '';
    sendButton.disabled = userInput.disabled = true;

    try {
        const botMessage = await generateResponse(userMessage);
        addMessage(cleanMarkdown(botMessage), false);
    } catch (error) {
        console.error('Error:', error);
        addMessage('Sorry, I encountered an error. Please try again.', false);
    } finally {
        sendButton.disabled = userInput.disabled = false;
        userInput.focus();
    }
}

sendButton.addEventListener('click', handleUserInput);
userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleUserInput();
    }
});
