const DEFAULT_AVATAR = "https://minhhoang.info/images/meokhochuhu.png";

const DEFAULT_PROJECTS = [
  {
    title: "Realtime Chat Hub",
    stack: "Node.js • Redis • Socket.IO",
    description:
      "Một playground nho nhỏ để thử nghiệm clustering, queue và bộ lọc tin nhắn realtime.",
    chips: ["Socket.IO", "Redis Streams", "Rate limiter"],
    links: [
      { label: "Wiki", url: "https://minhhoang.info/api/chat" },
      { label: "GitHub", url: "https://github.com/M1nhHoang" }
    ]
  },
  {
    title: "Chess Microservice",
    stack: "Node.js • Stockfish • Docker",
    description:
      "Expose engine Stockfish qua HTTP & WebSocket để build các mini game hoặc automation checkmate.",
    chips: ["Docker", "Queue worker"],
    links: [
      { label: "Demo", url: "https://minhhoang.info/api/chess/getbestmove" }
    ]
  },
  {
    title: "Automation Playground",
    stack: "Python • Playwright • Cron",
    description:
      "Tự động hóa vài công việc lặt vặt: gửi thông báo, kiểm tra server, sync ghi chú.",
    chips: ["Playwright", "Task scheduling"],
    links: [
      { label: "Note", url: "https://minhhoang.info/blog" }
    ]
  }
];

const DEFAULT_CONFIG = {
  socketUrl: "https://minhhoang.info/chat",
  socketOptions: {},
  projects: DEFAULT_PROJECTS
};

const SELECTORS = {
  navLinks: "[data-view-link]",
  sections: "[data-view]",
  navToggle: "[data-nav-toggle]",
  nav: "[data-nav]"
};

const hashFrom = id => (id.startsWith("#") ? id : `#${id}`);

const toKebab = value => value?.toString().toLowerCase() ?? "";

function getCookieValue() {
  if (!document.cookie) return "Khách";
  const firstPair =
    document.cookie
      .split(";")
      .map(pair => pair.trim())
      .filter(Boolean)[0] ?? "";
  if (!firstPair.includes("=")) return firstPair || "Khách";
  const [, ...rest] = firstPair.split("=");
  const decoded = rest.join("=") || "Khách";
  try {
    return decodeURIComponent(decoded);
  } catch {
    return decoded;
  }
}

function formatTimeLabel(value = "") {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit"
  });
}

function sanitizeHtml(text = "") {
  return text.replace(/[<>&"]/g, symbol => {
    switch (symbol) {
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case "&":
        return "&amp;";
      case '"':
        return "&quot;";
      default:
        return symbol;
    }
  });
}

function createChip(label) {
  return `<span class="chip"><i class="fa fa-check-circle" aria-hidden="true"></i>${sanitizeHtml(label)}</span>`;
}

function createProjectCard(project) {
  const chips = (project.chips ?? []).map(createChip).join("");
  const links =
    project.links?.map(
      link =>
        `<a class="chip" href="${link.url}" target="_blank" rel="noreferrer"><i class="fa fa-external-link" aria-hidden="true"></i>${sanitizeHtml(link.label)}</a>`
    ).join("") ?? "";

  return `
    <article class="project-card">
      <div>
        <p class="project-card__stack">${sanitizeHtml(project.stack)}</p>
        <h3 class="project-card__title">${sanitizeHtml(project.title)}</h3>
        <p>${sanitizeHtml(project.description)}</p>
        <div class="project-card__chips">${chips}</div>
      </div>
      <div class="project-card__links">${links}</div>
    </article>
  `;
}

function formatGroupTitle(type) {
  switch (type) {
    case "user":
      return "Bạn bè";
    case "bot":
      return "Bot";
    case "system":
      return "Hệ thống";
    default:
      return type ?? "Khác";
  }
}

function escapeSelector(value = "") {
  if (window.CSS?.escape) {
    return CSS.escape(value);
  }
  return value.replace(/([!"#$%&'()*+,.\/:;<=>?@[\]^`{|}~])/g, "\\$1");
}

function dedupeMessageAvatars(container) {
  const messages = Array.from(container.querySelectorAll(".message"));
  messages.forEach((message, index) => {
    const avatar = message.querySelector(".message__avatar");
    if (!avatar) return;
    const next = messages[index + 1];
    if (next && next.dataset.sender === message.dataset.sender) {
      avatar.style.visibility = "hidden";
    } else {
      avatar.style.visibility = "";
    }
  });
}

export default function initPublicPage(userConfig = {}) {
  const config = {
    ...DEFAULT_CONFIG,
    ...userConfig,
    projects: userConfig.projects ?? DEFAULT_PROJECTS
  };

  const elements = {
    navLinks: Array.from(document.querySelectorAll(SELECTORS.navLinks)),
    sections: Array.from(document.querySelectorAll(SELECTORS.sections)),
    navToggle: document.querySelector(SELECTORS.navToggle),
    nav: document.querySelector(SELECTORS.nav),
    projectBoard: document.querySelector("#project-board"),
    yearLabel: document.querySelector("#current-year"),
    chatOwner: document.querySelector("#chat-owner"),
    chatList: document.querySelector("#chat-list-items"),
    chatSearch: document.querySelector("#chat-search"),
    chatTargetName: document.querySelector("#chat-target-name"),
    chatTargetStatus: document.querySelector("#chat-target-status"),
    chatTargetAvatar: document.querySelector("#chat-target-avatar"),
    chatMessages: document.querySelector("#chat-messages"),
    chatForm: document.querySelector("#chat-form"),
    chatInput: document.querySelector("#chat-input"),
    chatRefresh: document.querySelector("#refresh-chat-list")
  };

  const state = {
    currentSection: "#personal-info",
    socket: null,
    chatTargetId: null,
    chatMeta: new Map(),
    selfProfile: null,
    userId: getCookieValue()
  };

  function setCurrentYear() {
    if (elements.yearLabel) {
      elements.yearLabel.textContent = new Date().getFullYear();
    }
  }

  function toggleNav(forceValue) {
    if (!elements.nav || !elements.navToggle) return;
    const nextValue =
      typeof forceValue === "boolean"
        ? forceValue
        : !elements.nav.classList.contains("is-open");
    elements.navToggle.setAttribute("aria-expanded", nextValue);
    elements.nav.classList.toggle("is-open", nextValue);
  }

  function setActiveSection(hash) {
    if (!hash) return;
    state.currentSection = hash;

    elements.sections.forEach(section => {
      const matches = hashFrom(section.id) === hash;
      section.classList.toggle("view--active", matches);
    });

    elements.navLinks.forEach(link => {
      const matches = link.getAttribute("href") === hash;
      link.classList.toggle("is-active", matches);
    });

    if (hash === "#chat-box") {
      ensureActiveChat();
    }
  }

  function handleNavClick(event) {
    const target = event.currentTarget;
    const href = target.getAttribute("href");
    if (!href) return;
    event.preventDefault();
    window.history.replaceState({}, "", href);
    setActiveSection(href);
    toggleNav(false);
  }

  function setupNavigation() {
    const initialHash = window.location.hash || "#personal-info";
    setActiveSection(initialHash);
    elements.navLinks.forEach(link => {
      link.addEventListener("click", handleNavClick);
    });
    if (elements.navToggle) {
      elements.navToggle.addEventListener("click", () => toggleNav());
    }
    window.addEventListener("hashchange", () => {
      setActiveSection(window.location.hash || "#personal-info");
    });
  }

  function renderProjects() {
    if (!elements.projectBoard) {
      return;
    }
    const markup = config.projects.map(createProjectCard).join("");
    elements.projectBoard.innerHTML = markup;
  }

  function updateChatHeader(targetId) {
    if (!targetId) return;
    const meta = state.chatMeta.get(targetId);
    if (elements.chatTargetName) {
      elements.chatTargetName.textContent = meta?.name ?? targetId;
    }
    if (elements.chatTargetStatus) {
      elements.chatTargetStatus.textContent =
        meta?.des ?? "Đang chờ tin nhắn mới";
    }
    if (elements.chatTargetAvatar) {
      elements.chatTargetAvatar.src = meta?.image || DEFAULT_AVATAR;
    }
  }

  function requestMessageHistory(targetId) {
    if (!state.socket || !targetId || targetId === "SimSimi") return;
    state.socket.emit("client-get-messageList", {
      user: state.userId,
      target: targetId
    });
  }

  function clearMessages() {
    if (elements.chatMessages) {
      elements.chatMessages.innerHTML = "";
    }
  }

  function appendMessage({ text, direction, shouldDedupe = true }) {
    if (!elements.chatMessages) return;
    const message = document.createElement("div");
    message.classList.add(
      "message",
      direction === "incoming" ? "message--incoming" : "message--outgoing"
    );
    message.dataset.sender = direction;

    const avatar = document.createElement("img");
    avatar.className = "message__avatar";
    avatar.alt = direction === "incoming" ? "Tin nhắn đến" : "Tin nhắn đi";
    avatar.src =
      direction === "incoming"
        ? state.chatMeta.get(state.chatTargetId)?.image || DEFAULT_AVATAR
        : state.selfProfile?.image || DEFAULT_AVATAR;

    const bubble = document.createElement("div");
    bubble.className = "message__bubble";
    bubble.textContent = text;

    message.appendChild(avatar);
    message.appendChild(bubble);
    elements.chatMessages.appendChild(message);
    elements.chatMessages.scrollTop = elements.chatMessages.scrollHeight;
    if (shouldDedupe) {
      dedupeMessageAvatars(elements.chatMessages);
    }
  }

  function handleHistory(messageList) {
    const parsed =
      typeof messageList === "string" ? JSON.parse(messageList) : messageList;
    if (!Array.isArray(parsed)) return;
    clearMessages();
    parsed.forEach(item => {
      const direction = item.sender_name === state.userId ? "outgoing" : "incoming";
      appendMessage({
        text: item.content,
        direction,
        shouldDedupe: false
      });
    });
    dedupeMessageAvatars(elements.chatMessages);
  }

  function handleIncomingMessage(payload) {
    if (!payload) return;
    const data = typeof payload === "string" ? JSON.parse(payload) : payload;
    if (data.sender !== state.chatTargetId) {
      return;
    }
    appendMessage({ text: data.content, direction: "incoming" });
  }

  function setActiveChat(targetId) {
    if (!targetId || !elements.chatList) return;
    const selector = `.chat-tab[data-chat-id="${escapeSelector(targetId)}"]`;
    const tab = elements.chatList.querySelector(selector);
    if (!tab) return;

    state.chatTargetId = targetId;
    elements.chatList
      .querySelectorAll(".chat-tab")
      .forEach(item => item.classList.remove("chat-active"));
    tab.classList.add("chat-active");

    updateChatHeader(targetId);
    clearMessages();
    requestMessageHistory(targetId);
  }

  function ensureActiveChat() {
    if (!elements.chatList) return;
    const tabs = elements.chatList.querySelectorAll(
      ".chat-tab:not(.chat-tab--self)"
    );
    if (!tabs.length) {
      state.chatTargetId = null;
       if (elements.chatTargetName) {
         elements.chatTargetName.textContent = "Chọn một liên hệ";
       }
       if (elements.chatTargetStatus) {
         elements.chatTargetStatus.textContent = "Chưa có cuộc trò chuyện nào được chọn.";
       }
      return;
    }
    const current = state.chatTargetId
      ? elements.chatList.querySelector(
          `.chat-tab[data-chat-id="${escapeSelector(state.chatTargetId)}"]`
        )
      : null;
    setActiveChat(current?.dataset.chatId || tabs[0].dataset.chatId);
  }

  function updateChatPreview({ sender_name, recipient_name, content, time }) {
    if (!elements.chatList) return;
    const ids = [sender_name, recipient_name];
    ids.forEach(id => {
      const selector = `.chat-tab[data-chat-id="${escapeSelector(id)}"]`;
      const tab = elements.chatList.querySelector(selector);
      if (!tab) return;
      const previewEl = tab.querySelector("[data-short-message]");
      const timeEl = tab.querySelector("[data-short-time]");
      if (previewEl) {
        previewEl.textContent = content;
      }
      if (timeEl) {
        timeEl.textContent = formatTimeLabel(time);
        timeEl.setAttribute("datetime", time || "");
      }
      tab.dataset.updatedAt = time || new Date().toISOString();
    });
  }

  function sortUserChats() {
    if (!elements.chatList) return;
    const userGroup = elements.chatList.querySelector(
      '[data-chat-group="user"] .chat-group__body'
    );
    if (!userGroup) return;
    const tabs = Array.from(
      userGroup.querySelectorAll(".chat-tab:not(.chat-tab--self)")
    );
    tabs
      .sort((a, b) => {
        const timeA = new Date(a.dataset.updatedAt || 0).getTime();
        const timeB = new Date(b.dataset.updatedAt || 0).getTime();
        return timeB - timeA;
      })
      .forEach(tab => userGroup.appendChild(tab));
  }

  function createChatTab(item, groupType) {
    state.chatMeta.set(item.name, {
      ...item,
      type: groupType
    });
    if (item.name === state.userId) {
      state.selfProfile = item;
    }
    const classes = [
      "chat-tab",
      `chat-tab--${groupType}`,
      item.name === state.userId ? "chat-tab--self" : "",
      item.name === state.chatTargetId ? "chat-active" : ""
    ]
      .filter(Boolean)
      .join(" ");

    const avatar = item.image || DEFAULT_AVATAR;
    return `
      <button type="button"
              class="${classes}"
              data-chat-id="${sanitizeHtml(item.name)}"
              data-search="${sanitizeHtml(
                `${toKebab(item.name)} ${toKebab(item.des)}`
              )}">
        <img class="chat-tab__avatar" src="${sanitizeHtml(avatar)}" alt="Avatar ${sanitizeHtml(
          item.name
        )}">
        <div class="chat-tab__content">
          <div class="chat-tab__meta">
            <strong>${sanitizeHtml(item.name)}</strong>
            <time class="chat-tab__time" data-short-time></time>
          </div>
          <p class="chat-tab__preview" data-short-message>${sanitizeHtml(
            item.des
          )}</p>
        </div>
      </button>
    `;
  }

  function renderChatList(rawList) {
    if (!Array.isArray(rawList)) return;
    if (!elements.chatList) return;
    state.chatMeta.clear();
    let markup = "";
    rawList.forEach(group => {
      const items = Array.isArray(group.chatList) ? group.chatList : [];
      const groupItems = items
        .map(item => createChatTab(item, group.type))
        .join("");
      if (!groupItems) {
        return;
      }
      markup += `
        <article class="chat-group" data-chat-group="${sanitizeHtml(group.type)}">
          <h4 class="chat-group__title">${formatGroupTitle(group.type)}</h4>
          <div class="chat-group__body">
            ${groupItems}
          </div>
        </article>
      `;
    });
    elements.chatList.innerHTML =
      markup || `<p class="empty-state">Chưa có người dùng online.</p>`;
    ensureActiveChat();
  }

  function handleOnlineUsers(payload) {
    try {
      const parsed =
        typeof payload === "string" ? JSON.parse(payload) : payload;
      const hasUser = parsed.some(group =>
        group.chatList.some(item => item.name === state.userId)
      );
      if (!hasUser) {
        throw new Error("Phiên không tồn tại");
      }
      renderChatList(parsed);
    } catch (error) {
      console.warn("Không thể đồng bộ danh sách chat:", error);
    }
  }

  function setupChatUi() {
    if (elements.chatOwner) {
      elements.chatOwner.textContent = state.userId || "Khách";
    }
    if (elements.chatList) {
      elements.chatList.addEventListener("click", event => {
        const tab = event.target.closest(".chat-tab");
        if (!tab || tab.classList.contains("chat-tab--self")) return;
        event.preventDefault();
        setActiveChat(tab.dataset.chatId);
      });
    }
    if (elements.chatSearch) {
      elements.chatSearch.addEventListener("input", event => {
        const query = toKebab(event.target.value);
        const tabs = elements.chatList?.querySelectorAll(".chat-tab") ?? [];
        tabs.forEach(tab => {
          if (tab.classList.contains("chat-tab--self")) return;
          const include = tab.dataset.search?.includes(query) ?? true;
          tab.style.display = include ? "flex" : "none";
        });
      });
    }
    if (elements.chatForm && elements.chatInput) {
      elements.chatForm.addEventListener("submit", event => {
        event.preventDefault();
        const message = elements.chatInput.value.trim();
        if (!message || !state.chatTargetId) return;
        appendMessage({ text: message, direction: "outgoing" });
        elements.chatInput.value = "";
        const payload = {
          sendId: state.userId,
          receiverId: state.chatTargetId,
          message
        };
        state.socket?.emit("client-send-message", payload);
      });

      elements.chatInput.addEventListener("focusin", () => {
        state.socket?.emit("client-send-writing", state.chatTargetId);
      });
      elements.chatInput.addEventListener("focusout", () => {
        state.socket?.emit("client-send-endWrite", state.chatTargetId);
      });
    }
    if (elements.chatRefresh) {
      elements.chatRefresh.addEventListener("click", () => {
        if (state.chatTargetId) {
          requestMessageHistory(state.chatTargetId);
        }
      });
    }
  }

  function setupSocket() {
    if (typeof window.io === "undefined") {
      console.warn("Không tìm thấy socket.io client.");
      return;
    }
    state.socket = window.io(config.socketUrl, config.socketOptions);
    const { socket } = state;
    socket.on("undefined-cookie", () => {
      alert("Phiên đăng nhập không hợp lệ. Vui lòng tải lại trang.");
    });
    socket.on("test", msg => console.log("[socket test]", msg));
    socket.on("server-send-onlineUsers", handleOnlineUsers);
    socket.on("server-send-usersShortMessage", payload => {
      try {
        const data = JSON.parse(payload);
        data.forEach(updateChatPreview);
        sortUserChats();
      } catch (error) {
        console.warn("Không thể cập nhật short message:", error);
      }
    });
    socket.on("server_send_messageList", handleHistory);
    socket.on("server-send-message", handleIncomingMessage);
    socket.on("disconnect", () => {
      console.info("Socket bị ngắt. Đang cố gắng kết nối lại…");
    });
  }

  setCurrentYear();
  setupNavigation();
  renderProjects();
  setupChatUi();
  setupSocket();
}
