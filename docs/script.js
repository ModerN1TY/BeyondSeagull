// ==============================
// Classroom Archive - script.js
// 기능 코드입니다. 평소에는 data.js만 수정하면 됩니다.
// ==============================

const siteData = window.siteData || {
  documents: [],
  assignments: [],
  notices: []
};

const intro = document.querySelector("#intro");
const typeText = document.querySelector("#typeText");
const siteHeader = document.querySelector("#siteHeader");
const mainContent = document.querySelector("#mainContent");
const siteFooter = document.querySelector("#siteFooter");
const menuToggle = document.querySelector("#menuToggle");
const navMenu = document.querySelector("#navMenu");
const navLinks = document.querySelectorAll("[data-section]");
const sections = document.querySelectorAll(".section");

const documentSearch = document.querySelector("#documentSearch");
const categoryFilter = document.querySelector("#categoryFilter");
const sortOrder = document.querySelector("#sortOrder");
const documentCount = document.querySelector("#documentCount");

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function parseDate(dateString) {
  if (!dateString) return 0;

  const normalized = dateString.replaceAll(".", "-").replaceAll("/", "-");
  const time = new Date(normalized).getTime();

  return Number.isNaN(time) ? 0 : time;
}

function sortByDate(items, dateKey = "date", order = "latest") {
  return [...items].sort((a, b) => {
    const aTime = parseDate(a[dateKey]);
    const bTime = parseDate(b[dateKey]);

    return order === "oldest" ? aTime - bTime : bTime - aTime;
  });
}

function typeIntroText() {
  const text = "Hello World!";

  if (prefersReducedMotion) {
    typeText.textContent = text;
    finishIntro();
    return;
  }

  let index = 0;

  const intervalId = setInterval(() => {
    typeText.textContent = text.slice(0, index + 1);
    index += 1;

    if (index === text.length) {
      clearInterval(intervalId);
      setTimeout(finishIntro, 900);
    }
  }, 95);
}

function finishIntro() {
  intro.classList.add("is-finished");

  [siteHeader, mainContent, siteFooter].forEach((element) => {
    element.classList.remove("hidden");
    element.classList.add("visible");
  });
}

function showSection(sectionId) {
  sections.forEach((section) => {
    section.classList.toggle("active-section", section.id === sectionId);
  });

  document.querySelectorAll(".nav-menu a").forEach((link) => {
    link.classList.toggle("is-active", link.dataset.section === sectionId);
  });

  navMenu.classList.remove("is-open");
  menuToggle.setAttribute("aria-expanded", "false");

  window.scrollTo({ top: 0, behavior: prefersReducedMotion ? "auto" : "smooth" });
}

function getSectionFromHash() {
  const hash = window.location.hash.replace("#", "");
  const validSections = ["documents", "submit", "notice"];

  return validSections.includes(hash) ? hash : "home";
}

function setupCategoryFilter() {
  const categories = [...new Set(siteData.documents.map((item) => item.category))].sort();

  categoryFilter.innerHTML = [
    '<option value="all">All</option>',
    ...categories.map((category) => `<option value="${category}">${category}</option>`)
  ].join("");
}

function getFilteredDocuments() {
  const keyword = documentSearch.value.trim().toLowerCase();
  const selectedCategory = categoryFilter.value;
  const selectedSortOrder = sortOrder.value;

  const filteredItems = siteData.documents.filter((item) => {
    const matchesCategory = selectedCategory === "all" || item.category === selectedCategory;
    const searchableText = [
      item.title,
      item.category,
      item.date,
      item.description,
      item.file
    ].join(" ").toLowerCase();

    const matchesKeyword = searchableText.includes(keyword);

    return matchesCategory && matchesKeyword;
  });

  return sortByDate(filteredItems, "date", selectedSortOrder);
}

function renderDocuments() {
  const documentList = document.querySelector("#documentList");
  const documents = getFilteredDocuments();

  documentCount.textContent = `${documents.length}개의 자료가 표시되고 있습니다.`;

  if (!documents.length) {
    documentList.innerHTML = '<div class="empty-state">조건에 맞는 자료가 없습니다.</div>';
    return;
  }

  documentList.innerHTML = documents.map((item) => `
    <article class="card">
      <div>
        <div class="card-meta">
          <span class="badge">${item.category}</span>
          <span>${item.date}</span>
        </div>
        <h3>${item.title}</h3>
        <p>${item.description}</p>
      </div>
      <a class="card-link" href="${item.file}" target="_blank" rel="noopener noreferrer">Open file</a>
    </article>
  `).join("");
}

function renderAssignments() {
  const assignmentList = document.querySelector("#assignmentList");
  const assignments = sortByDate(siteData.assignments, "dueDate", "latest");

  if (!assignments.length) {
    assignmentList.innerHTML = '<div class="empty-state">아직 등록된 제출 과제가 없습니다.</div>';
    return;
  }

  assignmentList.innerHTML = assignments.map((item) => {
    const hasValidLink = item.submitUrl && !item.submitUrl.includes("여기에_구글폼_링크를_넣으세요");

    return `
      <article class="card">
        <div>
          <div class="card-meta">
            <span class="badge">${item.category}</span>
            <span>Due ${item.dueDate}</span>
          </div>
          <h3>${item.title}</h3>
          <p>${item.description}</p>
        </div>
        ${
          hasValidLink
            ? `<a class="card-link" href="${item.submitUrl}" target="_blank" rel="noopener noreferrer">Submit assignment</a>`
            : `<span class="card-link disabled">Submit link needed</span>`
        }
      </article>
    `;
  }).join("");
}

function renderNotices() {
  const noticeList = document.querySelector("#noticeList");
  const notices = sortByDate(siteData.notices, "date", "latest");

  if (!notices.length) {
    noticeList.innerHTML = '<div class="empty-state">아직 등록된 공지가 없습니다.</div>';
    return;
  }

  noticeList.innerHTML = notices.map((item) => `
    <article class="list-item">
      <div class="list-item-header">
        <h3>${item.title}</h3>
        <span class="date">${item.date}</span>
      </div>
      <p>${item.body}</p>
    </article>
  `).join("");
}

menuToggle.addEventListener("click", () => {
  const isOpen = navMenu.classList.toggle("is-open");
  menuToggle.setAttribute("aria-expanded", String(isOpen));
});

navLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    event.preventDefault();

    const sectionId = link.dataset.section;
    history.pushState(null, "", `#${sectionId}`);
    showSection(sectionId);
  });
});

[documentSearch, categoryFilter, sortOrder].forEach((element) => {
  element.addEventListener("input", renderDocuments);
  element.addEventListener("change", renderDocuments);
});

window.addEventListener("popstate", () => {
  showSection(getSectionFromHash());
});

document.querySelector("#year").textContent = new Date().getFullYear();

setupCategoryFilter();
renderDocuments();
renderAssignments();
renderNotices();
showSection(getSectionFromHash());
typeIntroText();
