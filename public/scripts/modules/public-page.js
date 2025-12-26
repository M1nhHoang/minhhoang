import auth from './auth/index.js';

const DEFAULT_PROJECTS = [
  {
    title: "Legacy Realtime Chat Hub",
    stack: "Node.js · Redis · Socket.IO (archived)",
    description:
      "Playground thử clustering, queue và lọc tin nhắn realtime — đã tách ra, xem docs/legacy-chat.md.",
    chips: ["Socket.IO", "Redis Streams", "Rate limiter"],
    links: [
      { label: "Wiki", url: "https://minhhoang.info/api/chat" },
      { label: "GitHub", url: "https://github.com/M1nhHoang" }
    ]
  },
  {
    title: "Legacy Chess Microservice",
    stack: "Node.js · Stockfish · Docker (archived)",
    description:
      "Expose engine Stockfish qua HTTP (tạm gỡ). Tham khảo docs/legacy-chess.md nếu cần bật lại.",
    chips: ["Docker", "Queue worker"],
    links: [
      { label: "Demo", url: "https://minhhoang.info/api/chess/getbestmove" }
    ]
  },
  {
    title: "Automation Playground",
    stack: "Python · Playwright · Cron",
    description:
      "Tự động hóa vài công việc lặt vặt: gởi thông báo, kiểm tra server, sync ghi chú.",
    chips: ["Playwright", "Task scheduling"],
    links: [{ label: "Note", url: "https://minhhoang.info/blog" }]
  }
];

const SELECTORS = {
  navLinks: "[data-view-link]",
  sections: "[data-view]",
  navToggle: "[data-nav-toggle]",
  nav: "[data-nav]",
  authTabs: "[data-auth-toggle]",
  authForms: "[data-auth-form]"
};

const AUTH_ENDPOINTS = {
  login: "/api/auth/login",
  forgot: "/api/auth/forgot"
};

const RICKROLL_FALLBACKS = [
  "https://www.youtube.com/shorts/HXe3DieZHNI",
  "https://www.youtube.com/watch?v=bU3dvNu_jss"
];

const hashFrom = id => (id.startsWith("#") ? id : `#${id}`);

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
    project.links
      ?.map(
        link =>
          `<a class="chip" href="${link.url}" target="_blank" rel="noreferrer"><i class="fa fa-external-link" aria-hidden="true"></i>${sanitizeHtml(link.label)}</a>`
      )
      .join("") ?? "";

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

function renderProjects(board, projects) {
  if (!board) return;
  const markup = projects.map(createProjectCard).join("");
  board.innerHTML = markup;
}

function setCurrentYear(label) {
  if (label) {
    label.textContent = new Date().getFullYear();
  }
}

function toggleNav(nav, toggle, forceValue) {
  if (!nav || !toggle) return;
  const nextValue =
    typeof forceValue === "boolean"
      ? forceValue
      : !nav.classList.contains("is-open");
  toggle.setAttribute("aria-expanded", nextValue);
  nav.classList.toggle("is-open", nextValue);
}

function setActiveSection(hash, sections, links) {
  if (!hash) return;
  sections.forEach(section => {
    const matches = hashFrom(section.id) === hash;
    section.classList.toggle("view--active", matches);
  });
  links.forEach(link => {
    const matches = link.getAttribute("href") === hash;
    link.classList.toggle("is-active", matches);
  });
}

function setupNavigation(elements) {
  const initialHash = window.location.hash || "#personal-info";
  setActiveSection(initialHash, elements.sections, elements.navLinks);
  elements.navLinks.forEach(link => {
    link.addEventListener("click", event => {
      const href = link.getAttribute("href");
      if (!href) return;
      event.preventDefault();
      window.history.replaceState({}, "", href);
      setActiveSection(href, elements.sections, elements.navLinks);
      toggleNav(elements.nav, elements.navToggle, false);
    });
  });
  if (elements.navToggle) {
    elements.navToggle.addEventListener("click", () =>
      toggleNav(elements.nav, elements.navToggle)
    );
  }
  window.addEventListener("hashchange", () => {
    setActiveSection(window.location.hash || "#personal-info", elements.sections, elements.navLinks);
  });
}

function pickRandomItem(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function setButtonLoading(button, isLoading) {
  if (!button) return;
  button.disabled = Boolean(isLoading);
  if (isLoading) {
    if (!button.dataset.originalText) {
      button.dataset.originalText = button.textContent;
    }
    button.textContent = "Processing...";
  } else if (button.dataset.originalText) {
    button.textContent = button.dataset.originalText;
  }
}

function setFeedback(feedbackEl, type, message) {
  if (!feedbackEl) return;
  const variants = ["auth-feedback--error", "auth-feedback--warn", "auth-feedback--success"];
  feedbackEl.classList.remove(...variants);
  if (!type) {
    feedbackEl.classList.add("is-hidden");
    feedbackEl.textContent = "";
    return;
  }
  const classMap = {
    error: "auth-feedback--error",
    warn: "auth-feedback--warn",
    success: "auth-feedback--success"
  };
  const nextClass = classMap[type] || classMap.warn;
  feedbackEl.classList.add(nextClass);
  feedbackEl.classList.remove("is-hidden");
  feedbackEl.textContent = message;
}

async function postJson(url, payload) {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  const body = await response.json().catch(() => ({}));
  const data = body?.data ?? body;

  if (!response.ok) {
    const error = new Error(body?.message || data?.message || "Request failed");
    error.data = data;
    error.status = response.status;
    throw error;
  }

  return data;
}

function setupAuthForms(elements) {
  const tabs = Array.from(document.querySelectorAll(SELECTORS.authTabs));
  const forms = Array.from(document.querySelectorAll(SELECTORS.authForms));
  const feedbackEl = document.querySelector("[data-auth-feedback]");
  if (!tabs.length || !forms.length) return;

  const showForm = (target, shouldClearFeedback = true) => {
    tabs.forEach(tab =>
      tab.classList.toggle("is-active", tab.dataset.authToggle === target)
    );
    forms.forEach(form =>
      form.classList.toggle("is-hidden", form.dataset.authForm !== target)
    );
    if (shouldClearFeedback) {
      setFeedback(feedbackEl, null, "");
    }
  };

  tabs.forEach(tab => {
    tab.addEventListener("click", () => showForm(tab.dataset.authToggle));
  });

  const handlers = {
    signin: async form => {
      const username = form.querySelector("input[name=username]")?.value?.trim();
      const password = form.querySelector("input[name=password]")?.value ?? "";
      const submit = form.querySelector("button[type=submit]");

      if (!username || !password) {
        setFeedback(feedbackEl, "error", "Nhập đủ username + mật khẩu đã rồi tính tiếp.");
        return;
      }

      setButtonLoading(submit, true);
      try {
        const result = await auth.login(username, password);
        setFeedback(
          feedbackEl,
          "success",
          result.message || "Đăng nhập thành công!"
        );
        // Redirect based on role
        setTimeout(() => {
          if (result.user.isAdmin) {
            window.location.hash = '#admin-dashboard';
          } else if (result.user.isVIP) {
            window.location.hash = '#vip-zone';
          } else {
            window.location.hash = '#profile';
          }
        }, 1000);
      } catch (error) {
        const data = error.data || {};
        if (error.status === 403) {
          setFeedback(
            feedbackEl,
            "warn",
            data.message || "Tài khoản chưa được kích hoạt đâu, liên hệ admin nhé :D"
          );
          const targetUrl = data.rickrollUrl || pickRandomItem(RICKROLL_FALLBACKS);
          if (targetUrl) {
            window.open(targetUrl, "_blank", "noopener");
          }
          return;
        }
        setFeedback(
          feedbackEl,
          "error",
          error.message || "Sai tên đăng nhập hoặc mật khẩu, thử lại nhé!"
        );
      } finally {
        setButtonLoading(submit, false);
      }
    },
    forgot: async form => {
      const rememberedPassword =
        form.querySelector("input[name=rememberedPassword]")?.value?.trim() ?? "";
      const submit = form.querySelector("button[type=submit]");

      if (!rememberedPassword) {
        setFeedback(feedbackEl, "error", "Nhập mật khẩu bạn còn nhớ đã.");
        return;
      }

      setButtonLoading(submit, true);
      try {
        const data = await postJson(AUTH_ENDPOINTS.forgot, { rememberedPassword });
        const legendMessage =
          data.message ||
          `Chào chiến thần! Tài khoản VIP của bạn đã sẵn sàng. Username: ${data.username}`;
        setFeedback(feedbackEl, "success", legendMessage);
        form.reset();
        showForm("signin", false);
      } catch (error) {
        setFeedback(
          feedbackEl,
          "error",
          error.message || "Tạo tài khoản VIP thất bại, thử lại nhé."
        );
      } finally {
        setButtonLoading(submit, false);
      }
    }
  };

  forms.forEach(form => {
    form.addEventListener("submit", event => {
      event.preventDefault();
      const handler = handlers[form.dataset.authForm];
      if (handler) {
        handler(form);
      }
    });
  });

  showForm("signin");
}

export default function initPublicPage(config = {}) {
  const projects = config.projects ?? DEFAULT_PROJECTS;
  const elements = {
    navLinks: Array.from(document.querySelectorAll(SELECTORS.navLinks)),
    sections: Array.from(document.querySelectorAll(SELECTORS.sections)),
    navToggle: document.querySelector(SELECTORS.navToggle),
    nav: document.querySelector(SELECTORS.nav),
    projectBoard: document.querySelector("#project-board"),
    yearLabel: document.querySelector("#current-year")
  };

  setCurrentYear(elements.yearLabel);
  setupNavigation(elements);
  renderProjects(elements.projectBoard, projects);
  setupAuthForms(elements);
}
