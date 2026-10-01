(() => {
  "use strict";
  document.documentElement.classList.add("js");
  document.querySelectorAll("[data-year]").forEach((year) => {
    year.textContent = String(new Date().getFullYear());
  });
  const header = document.querySelector("[data-header]");
  const updateHeader = () =>
    header?.classList.toggle("is-scrolled", window.scrollY > 8);
  updateHeader();
  window.addEventListener("scroll", updateHeader, { passive: true });
  const menu = document.querySelector("[data-menu]");
  const toggle = document.querySelector("[data-menu-toggle]");
  const menuLabel = document.querySelector("[data-menu-label]");
  const mobile = window.matchMedia("(max-width: 800px)");
  if (menu && toggle) {
    toggle.hidden = false;
    const setMenu = (open, restoreFocus = false) => {
      menu.classList.toggle("is-open", open);
      toggle.setAttribute("aria-expanded", String(open));
      if (menuLabel) menuLabel.textContent = open ? "Close" : "Menu";
      if (restoreFocus) toggle.focus();
    };
    toggle.addEventListener("click", () =>
      setMenu(toggle.getAttribute("aria-expanded") !== "true"),
    );
    menu.querySelectorAll("a").forEach((link) =>
      link.addEventListener("click", () => {
        setMenu(false);
        // Move keyboard focus to the destination when the mobile menu closes.
        if (mobile.matches && link.hash) {
          const section = document.getElementById(link.hash.slice(1));
          if (section) {
            section.setAttribute("tabindex", "-1");
            section.focus({ preventScroll: true });
          }
        }
      }),
    );
    document.addEventListener("keydown", (event) => {
      if (
        event.key === "Escape" &&
        toggle.getAttribute("aria-expanded") === "true"
      )
        setMenu(false, true);
    });
    document.addEventListener("click", (event) => {
      if (!header?.contains(event.target)) setMenu(false);
    });
    document.addEventListener("focusin", (event) => {
      if (!header?.contains(event.target)) setMenu(false);
    });
    mobile.addEventListener("change", () => setMenu(false));
  }
  const flowContent = {
    build: {
      title: "Start with a good developer day.",
      text: "Reproducible environments, short feedback loops, and documentation that gets you from checkout to your first useful change.",
    },
    ship: {
      title: "Make change clear and repeatable.",
      text: "Reviewed configuration, automated delivery, and secure defaults. GitOps connects the change in Git with the desired state of the platform.",
    },
    understand: {
      title: "Close the loop with real signals.",
      text: "Traces, metrics, and logs give teams the context to understand production. Feed those lessons back into the next change, instead of guessing.",
    },
  };
  const flowControls = document.querySelector("[data-flow-controls]");
  const description = document.querySelector("[data-flow-description]");
  if (flowControls && description) {
    flowControls.hidden = false;
    flowControls.querySelectorAll("[data-flow]").forEach((button) =>
      button.addEventListener("click", () => {
        const stage = button.dataset.flow;
        const content = flowContent[stage];
        if (!content) return;
        flowControls.querySelectorAll("[data-flow]").forEach((control) => {
          const active = control === button;
          control.classList.toggle("is-active", active);
          control.setAttribute("aria-pressed", String(active));
        });
        document
          .querySelectorAll("[data-flow-node]")
          .forEach((node) =>
            node.classList.toggle("is-active", node.dataset.flowNode === stage),
          );
        description.querySelector("h3").textContent = content.title;
        description.querySelector("p").textContent = content.text;
      }),
    );
  }
  const copyButton = document.querySelector("[data-copy-email]");
  const copyStatus = document.querySelector("[data-copy-status]");
  if (
    copyButton &&
    copyStatus &&
    navigator.clipboard &&
    window.isSecureContext
  ) {
    copyButton.hidden = false;
    let resetTimer;
    copyButton.addEventListener("click", async () => {
      clearTimeout(resetTimer);
      copyButton.disabled = true;
      try {
        await navigator.clipboard.writeText("michiklug85@gmail.com");
        copyButton.firstChild.textContent = "Email address copied ";
        copyStatus.textContent = "Email address copied to clipboard.";
      } catch {
        copyButton.firstChild.textContent = "Copy unavailable ";
        copyStatus.textContent =
          "Could not copy. The email address is shown below this button.";
      } finally {
        copyButton.disabled = false;
        resetTimer = window.setTimeout(() => {
          copyButton.firstChild.textContent = "Copy email address ";
          copyStatus.textContent = "";
        }, 3500);
      }
    });
  }
})();
