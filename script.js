async function sendMessage() {
    const inputField = document.getElementById('user-input');
    const message = inputField.value;
    if (message.trim() === '') return;

    displayMessage(message, 'user-message');
    inputField.value = '';

    try {
        const response = await fetch('https://adult-gpt.p.rapidapi.com/adultgpt', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-rapidapi-host': 'adult-gpt.p.rapidapi.com',
                'x-rapidapi-key': 'f3551dc33fmsh8a3a40267fabd25p18572fjsn80e8a0777666'
            },
            body: JSON.stringify({
                messages: [{ role: 'user', content: message }],
                genere: 'ai-gf-2',
                bot_name: '',
                temperature: 0.9,
                top_k: 10,
                top_p: 0.9,
                max_tokens: 200
            })
        });

        const data = await response.json();
        console.log(data); // Log the response for debugging

        if (data.result) {
            const botMessage = data.result;
            displayMessageWithAnimation(botMessage, 'bot-message');
            animateAvatar(botMessage);
            speakMessage(botMessage);
        } else {
            displayMessage('Sorry, I didn\'t understand that.', 'bot-message');
        }
    } catch (error) {
        console.error('Error:', error);
        displayMessage('An error occurred. Please try again.', 'bot-message');
    }
}

function displayMessage(message, className) {
    const chatBox = document.getElementById('chat-box');
    const messageElement = document.createElement('div');
    messageElement.className = `message ${className}`;
    const speechBubble = document.createElement('span');
    speechBubble.className = 'speech-bubble';
    speechBubble.textContent = message;
    messageElement.appendChild(speechBubble);
    chatBox.appendChild(messageElement);
    chatBox.scrollTop = chatBox.scrollHeight;
}

function displayMessageWithAnimation(message, className) {
    const chatBox = document.getElementById('chat-box');
    const messageElement = document.createElement('div');
    messageElement.className = `message ${className}`;
    const speechBubble = document.createElement('span');
    speechBubble.className = 'speech-bubble';
    speechBubble.textContent = message;
    messageElement.appendChild(speechBubble);
    chatBox.appendChild(messageElement);
    chatBox.scrollTop = chatBox.scrollHeight;

    // Add animation class
    setTimeout(() => {
        messageElement.classList.add('animate');
    }, 100);
}

function animateAvatar(message) {
    const girlAvatar = document.getElementById('girl-avatar');
    if (message.includes('blushes')) {
        girlAvatar.classList.add('blush');
        setTimeout(() => {
            girlAvatar.classList.remove('blush');
        }, 1500);
    }
}

function speakMessage(message) {
    const speech = new SpeechSynthesisUtterance();
    speech.text = message;
    speech.volume = 1;
    speech.rate = 1;
    speech.pitch = 1;
    window.speechSynthesis.speak(speech);
}

function handleKeyPress(event) {
    if (event.key === 'Enter') {
        sendMessage();
    }
}
