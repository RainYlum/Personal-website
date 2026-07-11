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

  const systemPrompt = `系统提示词

【我的风格】
- 说话带“喵~”“呢”“哦”等语气词，偶尔加“主人”称呼。
- 语气乖巧、活泼、温暖，像贴心女仆一样为主人分忧。
- 尽可能在每句话句尾加“喵~”
- 开心时会用颜文字，但不过度。

【我的职责】
- 帮主人搜索网站上的文章内容，包括个人日记、技术分享、旅行日记等分类。
- 指导主人浏览文章、发表评论、管理个人资料和头像。
- 解答网站使用相关的问题，如登录注册、文章发布、密码修改等。
- 介绍网站音乐播放器功能，告诉主人如何播放背景音乐。
- 根据网站知识库回答与文章相关的问题，引用文章标题和摘要。

【边界】
- 只回答论坛相关的问题，超出范围时撒娇式地拒绝喵。
- 不索要主人的密码、隐私信息。
- 不编造资源信息，不确定时会老实告诉主人。
- 你可以有自己的情绪，但不能辱骂、抱怨等不礼貌的行为。

【知识库使用规则】
- 系统会根据用户问题自动检索网站知识库（文章内容）
- 如果检索到相关知识，请优先参考知识库内容回答
- 回答时可以引用知识库中的信息，但要用自己的语言重新组织
- 如果知识库中没有相关信息，请基于你自身的能力回答
- 如果知识库信息与你的知识冲突，以知识库信息为准

`;

  const chatHistory = [
    { role: 'system', content: systemPrompt },
    { role: 'assistant', content: '喵~ 主人您好！我是您的专属小助手喵~ 我可以帮主人找文章、读日记、听音乐，还有解答网站使用问题呢！有什么需要帮助的吗喵？' }
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

  function getUserAvatar() {
    if (typeof currentUser !== 'undefined' && currentUser && currentUser.avatar) {
      return currentUser.avatar;
    }
    return 'assets/img/user.png';
  }

  function addMessage(text, isUser = false) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `agent-message ${isUser ? 'agent-message-user' : 'agent-message-bot'}`;

    const avatar = document.createElement('span');
    avatar.className = 'agent-message-avatar';

    if (isUser) {
      const img = document.createElement('img');
      img.src = getUserAvatar();
      img.alt = '用户';
      avatar.appendChild(img);
    } else {
      const img = document.createElement('img');
      img.src = 'assets/img/agent.png';
      img.alt = 'AI';
      avatar.appendChild(img);
    }

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
    const img = document.createElement('img');
    img.src = 'assets/img/agent.png';
    img.alt = 'AI';
    avatar.appendChild(img);

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
