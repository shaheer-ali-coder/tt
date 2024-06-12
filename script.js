function cleanText(input) {
    // Remove words within double quotes
    let cleanedText = input.replace(/"\w+"/g, '');

    // Remove standalone emoticons
    // cleanedText = cleanedText.replace(/[\u{1F600}-\u{1F6FF}]/gu, '');

    // Remove hashtags and the words following them
    cleanedText = cleanedText.replace(/#\S+/g, '');

    // Remove words between asterisks
    cleanedText = cleanedText.replace(/\*\w+\*/g, '');
    const lines = cleanedText.split('\n').filter(line => !/(AI|virtual|bot|robot|chatbot)/i.test(line));
    cleanedText = lines.join(' ');
    // Trim any extra spaces left after removal
    cleanedText = cleanedText.replace(/\s{2,}/g, ' ').trim();

    return cleanedText;
}
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
            const botMessage_ = data.result;
            console.log("untrimmed : " + botMessage_)
            const botMessage = cleanText(botMessage_)
            console.log("trimmed : " + botMessage)
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
