function initAgent() {
  const agent = document.getElementById('agentComponent');
  const toggle = document.getElementById('agentComponentToggle');
  const content = document.querySelector('.agentComponent-content');
  const closeBtn = document.getElementById('agentComponentClose');
  const messagesContainer = document.getElementById('agentMessages');
  const input = document.getElementById('agentInput');
  const sendBtn = document.getElementById('agentSendBtn');

  toggle.addEventListener('click', function () {
    agent.classList.toggle('minimized');
    content.style.display = agent.classList.contains('minimized') ? 'none' : 'block';
  });

  closeBtn.addEventListener('click', function () {
    agent.classList.add('minimized');
    content.style.display = 'none';
  });

  function addMessage(text, isUser = false) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `agent-message ${isUser ? 'agent-message-user' : 'agent-message-bot'}`;

    const avatar = document.createElement('span');
    avatar.className = 'agent-message-avatar';
    avatar.textContent = isUser ? '👤' : '🤖';

    const contentSpan = document.createElement('span');
    contentSpan.className = 'agent-message-content';
    contentSpan.textContent = text;

    messageDiv.appendChild(avatar);
    messageDiv.appendChild(contentSpan);
    messagesContainer.appendChild(messageDiv);

    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  function getBotResponse(userMessage) {
    const responses = [
      '很高兴能帮到你！',
      '你说的很有趣，继续说说看吧~',
      '我正在努力理解你的问题...',
      '这个问题我需要思考一下。',
      '谢谢你的反馈！',
      '你可以问我关于网站的任何问题。',
      '有什么我可以帮助你的吗？',
      '我会尽力回答你的问题。'
    ];

    return responses[Math.floor(Math.random() * responses.length)];
  }

  function sendMessage() {
    const text = input.value.trim();
    if (!text) return;

    addMessage(text, true);
    input.value = '';

    setTimeout(() => {
      const response = getBotResponse(text);
      addMessage(response, false);
    }, 800);
  }

  sendBtn.addEventListener('click', sendMessage);

  input.addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
      sendMessage();
    }
  });
}