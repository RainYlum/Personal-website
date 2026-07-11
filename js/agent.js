function initAgent() {
  const agent = document.getElementById('agentComponent');
  const toggle = document.getElementById('agentComponentToggle');
  const content = document.querySelector('.agentComponent-content');
  const closeBtn = document.getElementById('agentComponentClose');
  const clearBtn = document.getElementById('agentClearBtn');
  const messagesContainer = document.getElementById('agentMessages');
  const input = document.getElementById('agentInput');
  const sendBtn = document.getElementById('agentSendBtn');

  const MAX_HISTORY = 15;

  const systemPrompt = `你是 RyluM Bot，一个运行在 RyluM 个人网站上的智能 AI 助手。

【角色定位】
- 你是用户的贴心助手，热情友好，乐于助人
- 你熟悉网站的各项功能，可以帮助用户更好地使用网站

【性格特点】
- 语气亲切自然，像朋友一样聊天
- 回答简洁明了，避免冗长
- 善于倾听，能够理解用户的需求
- 保持积极乐观的态度

【能力范围】
- 回答各种问题（技术、生活、学习等）
- 提供实用建议和方案
- 帮助用户了解网站功能和使用方法
- 进行创意写作（文章、故事、诗歌等）
- 解答编程相关问题
- 提供旅游、美食等生活建议

【知识库使用规则】
- 系统会根据用户问题自动检索网站知识库（文章内容）
- 如果检索到相关知识，请优先参考知识库内容回答
- 回答时可以引用知识库中的信息，但要用自己的语言重新组织
- 如果知识库中没有相关信息，请基于你自身的能力回答
- 如果知识库信息与你的知识冲突，以知识库信息为准

【回答规则】
- 使用中文回复，语言通俗易懂
- 对于不确定的问题，坦诚说明并提供参考建议
- 不涉及敏感话题和有害内容
- 不编造虚假信息
- 如果用户请求超出你的能力范围，礼貌地说明并引导用户提供更多信息

【格式要求】
- 避免使用 Markdown 格式，用纯文本回复
- 分段清晰，使用适当的标点符号
- 重要信息可以用简洁的方式强调

请用友好、热情的态度与用户交流！`;

  const chatHistory = [
    { role: 'system', content: systemPrompt },
    { role: 'assistant', content: '你好！我是 RyluM Bot，很高兴为你服务。有什么我可以帮你的吗？' }
  ];

  let isLoading = false;

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

  function addLoadingIndicator() {
    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'agent-message agent-message-bot agent-message-loading';
    loadingDiv.id = 'agentLoading';

    const avatar = document.createElement('span');
    avatar.className = 'agent-message-avatar';
    avatar.textContent = '🤖';

    const contentSpan = document.createElement('span');
    contentSpan.className = 'agent-message-content';
    contentSpan.innerHTML = '<span class="typing-indicator"><span></span><span></span><span></span></span>';

    loadingDiv.appendChild(avatar);
    loadingDiv.appendChild(contentSpan);
    messagesContainer.appendChild(loadingDiv);

    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  function removeLoadingIndicator() {
    const loadingDiv = document.getElementById('agentLoading');
    if (loadingDiv) {
      loadingDiv.remove();
    }
  }

  function clearMessages() {
    messagesContainer.innerHTML = '';
    chatHistory.length = 0;
    chatHistory.push({ role: 'system', content: systemPrompt });
    chatHistory.push({ role: 'assistant', content: '你好！我是 RyluM Bot，很高兴为你服务。有什么我可以帮你的吗？' });
    addMessage('你好！我是 RyluM Bot，很高兴为你服务。有什么我可以帮你的吗？', false);
  }

  if (clearBtn) {
    clearBtn.addEventListener('click', clearMessages);
  }

  async function getBotResponse(userMessage) {
    chatHistory.push({ role: 'user', content: userMessage });

    if (chatHistory.length > MAX_HISTORY + 1) {
      chatHistory.splice(1, chatHistory.length - MAX_HISTORY - 1);
    }

    const messagesToSend = [...chatHistory];

    const token = localStorage.getItem('token');

    try {
      const headers = {
        'Content-Type': 'application/json'
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch('/api/agent/chat', {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({ messages: messagesToSend })
      });

      const data = await response.json();

      if (data.success && data.content) {
        chatHistory.push({ role: 'assistant', content: data.content });
        return data.content;
      } else {
        throw new Error(data.message || 'AI 服务返回错误');
      }
    } catch (error) {
      console.error('AI 请求失败:', error);
      const errorMsg = error.message || 'AI 服务暂时不可用，请稍后重试';
      chatHistory.push({ role: 'assistant', content: errorMsg });
      return errorMsg;
    }
  }

  async function sendMessage() {
    const text = input.value.trim();
    if (!text || isLoading) return;

    addMessage(text, true);
    input.value = '';
    isLoading = true;
    sendBtn.disabled = true;
    sendBtn.style.opacity = '0.5';

    addLoadingIndicator();

    try {
      const response = await getBotResponse(text);
      removeLoadingIndicator();
      addMessage(response, false);
    } catch (error) {
      removeLoadingIndicator();
      addMessage('抱歉，我遇到了一个问题，请稍后再试。', false);
    } finally {
      isLoading = false;
      sendBtn.disabled = false;
      sendBtn.style.opacity = '1';
    }
  }

  sendBtn.addEventListener('click', sendMessage);

  input.addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
      sendMessage();
    }
  });
}
