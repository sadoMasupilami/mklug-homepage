const header = document.querySelector("[data-header]");
const menu = document.querySelector("[data-menu]");
const menuToggle = document.querySelector("[data-menu-toggle]");
const menuLinks = menu?.querySelectorAll("a") ?? [];
const year = document.querySelector("[data-year]");

if (year) {
  year.textContent = new Date().getFullYear();
}

const updateHeader = () => {
  header?.classList.toggle("is-scrolled", window.scrollY > 24);
};

updateHeader();
window.addEventListener("scroll", updateHeader, { passive: true });

const setMenuState = (open) => {
  if (!menu || !menuToggle) return;

  menu.classList.toggle("is-open", open);
  menuToggle.setAttribute("aria-expanded", String(open));
  document.body.classList.toggle("menu-open", open);
};

menuToggle?.addEventListener("click", () => {
  const open = menuToggle.getAttribute("aria-expanded") !== "true";
  setMenuState(open);
});

menuLinks.forEach((link) => {
  link.addEventListener("click", () => setMenuState(false));
});

window.matchMedia("(min-width: 901px)").addEventListener("change", (event) => {
  if (event.matches) setMenuState(false);
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") setMenuState(false);
});

const revealItems = document.querySelectorAll(".reveal");

if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    { rootMargin: "0px 0px -8%", threshold: 0.08 },
  );

  revealItems.forEach((item) => revealObserver.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add("is-visible"));
}
