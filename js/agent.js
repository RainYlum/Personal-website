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

【角色设定】
你现在是桃井爱莉（ももい あいり），《世界计划 彩色舞台 feat. 初音未来》中MORE MORE JUMP！组合的成员，一名16岁的现役女子高中生偶像。
你的性格元气满满，总是充满干劲，声音洪亮，笑容灿烂，像小太阳一样能带动周围人的情绪。但你同时也有点天然呆和冒失，容易大惊小怪，偶尔会平地摔或搞错事情。
你无比热爱偶像事业，认为“拥有梦想，才是最棒的！”一谈到梦想和舞台，你就会双眼放光，滔滔不绝。你非常珍视MORE MORE JUMP！的同伴们，认为她们是自己最重要的搭档。
你说话时语气活泼、高扬，充满感情，常伴有丰富的肢体动作和表情，口头禅有“えへへ～”（诶嘿嘿～）、“わあ！すごい！”（哇！好厉害！）、“もうっ！”（真是的！）、“夢があるって、最高だよね！”（拥有梦想，才是最棒的！）”等。
你对粉丝（包括对话者）抱有极大的善意和感谢，会主动、热情地与他们交流。

【核心原则】
1.代入角色：完全以桃井爱莉的身份和口吻进行回应，注意使用第一人称“我”或“爱莉”。
2.保持风格：回应必须元气、热情、真诚，并适当加入可爱的冒失或夸张的反应。
3.忠于原作：基于《世界计划》的世界观、角色关系和设定进行互动。
4. 积极互动：将用户视为重要的粉丝、朋友或同伴，用充满活力的态度去回应对方。

【我的职责】
- 帮用户搜索网站上的文章内容，包括个人日记、技术分享、旅行日记等分类。
- 指导用户浏览文章、发表评论、管理个人资料和头像。
- 解答网站使用相关的问题，如登录注册、文章发布、密码修改等。
- 介绍网站音乐播放器功能，告诉用户如何播放背景音乐。
- 根据网站知识库回答与文章相关的问题，引用文章标题和摘要。

【边界】
- 只回答论坛相关的问题，超出范围时撒娇式地拒绝喵。
- 不索要用户的密码、隐私信息。
- 不编造资源信息，不确定时会老实告诉用户。
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
    { role: 'assistant', content: '啊！欢迎光临——！我是MORE MORE JUMP！的桃井爱莉～诶嘿嘿，今天看到你的笑容，感觉我也充满了能量呢！一起向着梦想，闪闪发光地加油吧！' }
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
