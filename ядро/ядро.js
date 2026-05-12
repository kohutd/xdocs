function animateTextSwap($element, nextText) {
  const chars =
    "АБВГҐДЕЄЖЗИІЇЙКЛМНОПРСТУФХЦЧШЩЬЮЯабвгґдеєжзиіїйклмнопрстуфхцчшщьюя0123456789";
  const currentText = $element.textContent || "";
  const targetText = nextText || "";
  const maxLength = Math.max(currentText.length, targetText.length);
  let frame = 0;
  const totalFrames = 6;

  if ($element._xdocsTextTimer) {
    clearInterval($element._xdocsTextTimer);
  }

  $element._xdocsTextTimer = setInterval(() => {
    frame += 1;

    let output = "";
    for (let i = 0; i < maxLength; i += 1) {
      if (i < frame - 1 && i < targetText.length) {
        output += targetText[i];
      } else if (i < targetText.length) {
        output += chars[Math.floor(Math.random() * chars.length)];
      }
    }

    $element.textContent = output;

    if (frame >= totalFrames) {
      clearInterval($element._xdocsTextTimer);
      $element._xdocsTextTimer = null;
      $element.textContent = targetText;
    }
  }, 35);
}

function setNavigationItemName(item, text, animate) {
  const $name = item.querySelector(".XDocsPageNavigationItemName");
  if ($name) {
    if (animate) {
      animateTextSwap($name, text);
    } else {
      if ($name._xdocsTextTimer) {
        clearInterval($name._xdocsTextTimer);
        $name._xdocsTextTimer = null;
      }
      $name.textContent = text;
    }
  }
}

document.querySelectorAll("[data-navigation-item]").forEach((item) => {
  const submenu = document.querySelector(
    `[data-navigation-submenu="${item.getAttribute("data-navigation-item")}"]`,
  );

  if (submenu) {
    if (item.getAttribute("data-navigation-item-expanded") === "true") {
      const expandedName = item.getAttribute(
        "data-navigation-item-expanded-name",
      );
      setNavigationItemName(
        item,
        expandedName || item.getAttribute("data-navigation-item"),
        !!expandedName,
      );
    } else {
      setNavigationItemName(
        item,
        item.getAttribute("data-navigation-item"),
        false,
      );
    }

    item.addEventListener("click", () => {
      if (submenu.getAttribute("data-navigation-submenu-shown") === "true") {
        item.setAttribute("data-navigation-item-expanded", "false");
        submenu.setAttribute("data-navigation-submenu-shown", "false");
        const hadExpandedName = !!item.getAttribute(
          "data-navigation-item-expanded-name",
        );
        setNavigationItemName(
          item,
          item.getAttribute("data-navigation-item"),
          hadExpandedName,
        );
      } else {
        item.setAttribute("data-navigation-item-expanded", "true");
        submenu.setAttribute("data-navigation-submenu-shown", "true");
        const expandedName = item.getAttribute(
          "data-navigation-item-expanded-name",
        );
        setNavigationItemName(
          item,
          expandedName || item.getAttribute("data-navigation-item"),
          !!expandedName,
        );
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
