"use strict";

const initializeNavigation = () => {
  const checkbox = document.querySelector(".site-nav-checkbox");
  const desktopQuery = window.matchMedia("(min-width: 40.01rem)");

  if (!checkbox) {
    return;
  }

  const closeMenu = () => {
    checkbox.checked = false;
  };

  document.querySelectorAll(".site-nav-links a").forEach((link) => {
    link.addEventListener("click", closeMenu);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") {
      return;
    }

    closeMenu();
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

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializeNavigation);
} else {
  initializeNavigation();
}
