"use strict";

const toPersianDigits = (value) =>
  String(value).replace(/\d/g, (digit) => "۰۱۲۳۴۵۶۷۸۹"[digit]);

const convertDigitsInTree = (root) => {
  if (!root) {
    return;
  }

  const skip = new Set(["SCRIPT", "STYLE", "TEXTAREA", "CODE", "PRE"]);
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);

  while (walker.nextNode()) {
    const node = walker.currentNode;
    const parent = node.parentElement;
    if (!parent || skip.has(parent.tagName)) {
      continue;
    }
    if (parent.closest("[data-keep-latin]")) {
      continue;
    }
    if (/\d/.test(node.nodeValue)) {
      node.nodeValue = toPersianDigits(node.nodeValue);
    }
  }

  root.querySelectorAll("input, textarea").forEach((element) => {
    if (element.type === "password" || element.dataset.keepLatin !== undefined) {
      return;
    }
    if (element.value && /\d/.test(element.value)) {
      element.value = toPersianDigits(element.value);
    }
    if (element.placeholder && /\d/.test(element.placeholder)) {
      element.placeholder = toPersianDigits(element.placeholder);
    }
  });
};

const initializePersianDigits = () => {
  convertDigitsInTree(document.body);
};

const initializeNavigation = () => {
  const checkbox = document.querySelector(".site-nav-checkbox");
  const nav = document.querySelector(".site-nav");
  const desktopQuery = window.matchMedia("(min-width: 1051px)");

  if (!checkbox || !nav) {
    return;
  }

  const closeMenu = () => {
    checkbox.checked = false;
  };

  document.querySelectorAll(".site-nav-links a").forEach((link) => {
    link.addEventListener("click", closeMenu);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeMenu();
    }
  });

  const handleDesktopChange = (event) => {
    if (event.matches) {
      closeMenu();
    }
  };

  if (typeof desktopQuery.addEventListener === "function") {
    desktopQuery.addEventListener("change", handleDesktopChange);
  } else {
    desktopQuery.addListener(handleDesktopChange);
  }
};

const initializeTopicSearch = () => {
  const search = document.querySelector(".topic-search input");
  const topics = document.querySelectorAll(".topic-cloud a");

  if (!search || topics.length === 0) {
    return;
  }

  search.addEventListener("input", () => {
    const query = search.value.trim().toLocaleLowerCase("fa-IR");

    topics.forEach((topic) => {
      topic.hidden = !topic.textContent.toLocaleLowerCase("fa-IR").includes(query);
    });
  });
};

const initializeEventSectionSpy = () => {
  const links = Array.from(document.querySelectorAll(".event-post-aside nav a[href^='#']"));

  if (links.length === 0) {
    return;
  }

  const sections = links
    .map((link) => ({
      link,
      section: document.getElementById(link.getAttribute("href").slice(1)),
    }))
    .filter(({ section }) => Boolean(section));

  if (sections.length === 0) {
    return;
  }

  const setActiveLink = (activeLink) => {
    links.forEach((link) => {
      const isActive = link === activeLink;
      link.classList.toggle("active", isActive);

      if (isActive) {
        link.setAttribute("aria-current", "location");
      } else {
        link.removeAttribute("aria-current");
      }
    });
  };

  const updateActiveFromScroll = () => {
    const marker = 140;
    let current = sections[0];

    sections.forEach((item) => {
      const top = item.section.getBoundingClientRect().top;
      if (top - marker <= 0) {
        current = item;
      }
    });

    setActiveLink(current.link);
  };

  let ticking = false;
  const onScroll = () => {
    if (ticking) {
      return;
    }
    ticking = true;
    window.requestAnimationFrame(() => {
      updateActiveFromScroll();
      ticking = false;
    });
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);

  links.forEach((link) => {
    link.addEventListener("click", (event) => {
      const target = document.getElementById(link.getAttribute("href").slice(1));
      if (!target) {
        return;
      }

      event.preventDefault();
      setActiveLink(link);
      target.scrollIntoView({ behavior: "smooth", block: "start" });
      history.replaceState(null, "", link.getAttribute("href"));
    });
  });

  updateActiveFromScroll();
};

const initializeGalleryLightbox = () => {
  const lightbox = document.querySelector("[data-lightbox]");
  if (!lightbox) {
    return;
  }

  const imageEl = lightbox.querySelector("[data-lightbox-image]");
  const captionEl = lightbox.querySelector("[data-lightbox-caption]");
  const currentEl = lightbox.querySelector("[data-lightbox-current]");
  const totalEl = lightbox.querySelector("[data-lightbox-total]");
  const prevBtn = lightbox.querySelector("[data-lightbox-prev]");
  const nextBtn = lightbox.querySelector("[data-lightbox-next]");

  let items = [];
  let index = 0;
  let lastFocus = null;

  const setHidden = (hidden) => {
    lightbox.classList.toggle("is-hidden", hidden);
    if (hidden) {
      lightbox.setAttribute("hidden", "");
      lightbox.setAttribute("aria-hidden", "true");
    } else {
      lightbox.removeAttribute("hidden");
      lightbox.setAttribute("aria-hidden", "false");
    }
  };

  const render = () => {
    if (!items.length) {
      return;
    }

    const item = items[index];
    imageEl.src = item.src;
    imageEl.alt = item.caption || "";
    captionEl.textContent = item.caption || "";
    currentEl.textContent = toPersianDigits(index + 1);
    totalEl.textContent = toPersianDigits(items.length);
    prevBtn.disabled = items.length < 2;
    nextBtn.disabled = items.length < 2;
  };

  const open = (groupItems, startIndex) => {
    items = groupItems;
    index = startIndex;
    lastFocus = document.activeElement;
    render();
    setHidden(false);
    document.body.classList.add("lightbox-open");
    lightbox.querySelector(".lightbox-close").focus();
  };

  const close = () => {
    setHidden(true);
    document.body.classList.remove("lightbox-open");
    imageEl.removeAttribute("src");
    items = [];
    if (lastFocus && typeof lastFocus.focus === "function") {
      lastFocus.focus();
    }
  };

  const showNext = () => {
    if (items.length < 2) {
      return;
    }
    index = (index + 1) % items.length;
    render();
  };

  const showPrev = () => {
    if (items.length < 2) {
      return;
    }
    index = (index - 1 + items.length) % items.length;
    render();
  };

  document.addEventListener("click", (event) => {
    const trigger = event.target.closest("[data-lightbox-item]");
    if (!trigger) {
      return;
    }

    event.preventDefault();
    const group = trigger.closest("[data-lightbox-group]") || document;
    const groupItems = Array.from(group.querySelectorAll("[data-lightbox-item]")).map((node) => ({
      src: node.getAttribute("href"),
      caption: node.getAttribute("data-caption") || "",
    }));
    const startIndex = Math.max(
      0,
      groupItems.findIndex((item) => item.src === trigger.getAttribute("href")),
    );
    open(groupItems, startIndex);
  });

  lightbox.addEventListener("click", (event) => {
    if (event.target.closest("[data-lightbox-prev]")) {
      event.preventDefault();
      showPrev();
      return;
    }
    if (event.target.closest("[data-lightbox-next]")) {
      event.preventDefault();
      showNext();
      return;
    }
    // Close on any click except the photo itself (and nav arrows above).
    if (event.target.closest("[data-lightbox-image]")) {
      return;
    }
    event.preventDefault();
    close();
  });

  document.addEventListener("keydown", (event) => {
    if (lightbox.classList.contains("is-hidden")) {
      return;
    }
    if (event.key === "Escape") {
      close();
    } else if (event.key === "ArrowLeft") {
      showNext();
    } else if (event.key === "ArrowRight") {
      showPrev();
    }
  });

  let touchStartX = 0;
  lightbox.addEventListener(
    "touchstart",
    (event) => {
      touchStartX = event.changedTouches[0].clientX;
    },
    { passive: true },
  );
  lightbox.addEventListener(
    "touchend",
    (event) => {
      if (lightbox.classList.contains("is-hidden")) {
        return;
      }
      const delta = event.changedTouches[0].clientX - touchStartX;
      if (Math.abs(delta) < 40) {
        return;
      }
      if (delta > 0) {
        showPrev();
      } else {
        showNext();
      }
    },
    { passive: true },
  );
};

const initializePageMotion = () => {
  const root = document.documentElement;
  const elements = Array.from(document.querySelectorAll("[data-reveal]"));
  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const revealAll = () => {
    elements.forEach((element) => element.classList.add("is-visible"));
    root.classList.add("is-loaded");
  };

  if (prefersReduced || !("IntersectionObserver" in window)) {
    revealAll();
    return;
  }

  const revealInView = () => {
    elements.forEach((element) => {
      const rect = element.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.92 && rect.bottom > 40) {
        element.classList.add("is-visible");
      }
    });
  };

  // Wait two frames so the initial hidden state paints, then play the entrance.
  window.requestAnimationFrame(() => {
    window.requestAnimationFrame(() => {
      root.classList.add("is-loaded");
      revealInView();
    });
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    { rootMargin: "0px 0px -8% 0px", threshold: 0.12 },
  );

  elements.forEach((element) => observer.observe(element));
};

const initializeCardClicks = () => {
  document.addEventListener("click", (event) => {
    const card = event.target.closest("[data-card]");
    if (!card) {
      return;
    }

    // Let real links/buttons inside the card work normally.
    if (event.target.closest("a, button, input, label, textarea, select")) {
      return;
    }

    const link = card.querySelector("a.card-link, a[href]");
    if (!link) {
      return;
    }

    event.preventDefault();
    window.location.href = link.href;
  });
};

const boot = () => {
  initializeNavigation();
  initializeTopicSearch();
  initializeEventSectionSpy();
  initializeGalleryLightbox();
  initializePersianDigits();
  initializePageMotion();
  initializeCardClicks();
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", boot);
} else {
  boot();
}
