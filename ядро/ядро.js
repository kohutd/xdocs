document.querySelectorAll("[data-navigation-item]").forEach((item) => {
  const submenu = document.querySelector(
    `[data-navigation-submenu="${item.getAttribute("data-navigation-item")}"]`,
  );
  if (submenu) {
    item.addEventListener("click", () => {
      if (submenu.getAttribute("data-navigation-submenu-shown") === "true") {
        item.setAttribute("data-navigation-item-expanded", "false");
        submenu.setAttribute("data-navigation-submenu-shown", "false");
      } else {
        item.setAttribute("data-navigation-item-expanded", "true");
        submenu.setAttribute("data-navigation-submenu-shown", "true");
      }
    });
  }
});

function toggleMobileNavigation() {
  const $navigation = document.querySelector("[data-is-navigation=true]");
  if ($navigation.getAttribute("data-hidden-on-mobile") === "true") {
    $navigation.setAttribute("data-hidden-on-mobile", "false");
    document
      .querySelectorAll("[data-is-mobile-navigation-toggle=true]")
      .forEach(($toggle) => {
        $toggle.classList.add("active");
      });
  } else {
    $navigation.setAttribute("data-hidden-on-mobile", "true");
    document
      .querySelectorAll("[data-is-mobile-navigation-toggle=true]")
      .forEach(($toggle) => {
        $toggle.classList.remove("active");
      });
  }
}

document
  .querySelectorAll("[data-is-mobile-navigation-toggle=true]")
  .forEach(($toggle) => {
    $toggle.addEventListener("click", toggleMobileNavigation);
  });

let lastIframeId = 0;
const pendingSearches = new Map();

const $iframe = document.querySelector(".XDocsPageNavigationSearch iframe");

function search(query) {
  return new Promise((res, rej) => {
    $iframe.contentWindow.postMessage(
      { id: ++lastIframeId, type: "search", query },
      "*",
    );
    pendingSearches.set(lastIframeId, { res, rej });
  });
}

window.searchDocs = search;

window.addEventListener("message", (event) => {
  const eventData = event.data;
  const eventId = eventData.id;
  if (pendingSearches.has(eventId)) {
    const { res, rej } = pendingSearches.get(eventId);
    if (eventData.result) {
      res(eventData.result);
    } else {
      rej(eventData.error);
    }
    pendingSearches.delete(eventId);
  }
});

window.addEventListener("keydown", (e) => {
  if (e.key === "/") {
    if (document.activeElement.tagName !== "INPUT") {
      e.preventDefault();
      document.querySelector(".XDocsPageNavigationSearch button").click();
    }
  }
});
