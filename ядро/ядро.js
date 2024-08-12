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
