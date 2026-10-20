window.__mkReady = true;

const root = document.documentElement;
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const isGerman = root.lang === "de";

/* Pick the English or German variant of a user-facing string. */
const t = (en, de) => (isGerman ? de : en);

/* ----- Small helpers ------------------------------------------------------ */

const storage = {
  get(key) {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      return null;
    }
  },
  set(key, value) {
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      /* Storage can be unavailable (private mode, blocked site data). */
    }
  },
};

const yearsSince = (year) => new Date().getFullYear() - year;

document.querySelectorAll("[data-year]").forEach((node) => {
  node.textContent = String(new Date().getFullYear());
});

/* ----- Theme -------------------------------------------------------------- */

const themeToggle = document.querySelector("[data-theme-toggle]");
const prefersLight = window.matchMedia("(prefers-color-scheme: light)");
const themeColors = { dark: "#0b0d12", light: "#f5f3ee" };

const currentTheme = () => root.dataset.theme || (prefersLight.matches ? "light" : "dark");

const syncThemeUi = () => {
  const theme = currentTheme();
  const next = theme === "dark" ? "light" : "dark";
  const label = t(
    `Switch to ${next} theme`,
    `Zum ${next === "light" ? "hellen" : "dunklen"} Farbschema wechseln`,
  );
  themeToggle?.setAttribute("aria-label", label);
  if (root.dataset.theme) {
    document.querySelectorAll('meta[name="theme-color"]').forEach((meta) => {
      meta.setAttribute("content", themeColors[theme]);
    });
  }
};

const setTheme = (theme) => {
  root.dataset.theme = theme;
  storage.set("theme", theme);
  syncThemeUi();
};

themeToggle?.addEventListener("click", () => {
  setTheme(currentTheme() === "dark" ? "light" : "dark");
});

prefersLight.addEventListener("change", syncThemeUi);
syncThemeUi();

/* ----- Header & navigation ----------------------------------------------- */

const header = document.querySelector("[data-header]");
const nav = document.querySelector("[data-nav]");
const menuToggle = document.querySelector("[data-menu-toggle]");

const updateHeader = () => {
  header?.classList.toggle("is-scrolled", window.scrollY > 12);
};

updateHeader();
window.addEventListener("scroll", updateHeader, { passive: true });

const setMenu = (open) => {
  if (!nav || !menuToggle) return;
  nav.classList.toggle("is-open", open);
  menuToggle.setAttribute("aria-expanded", String(open));
  const label = menuToggle.querySelector(".sr-only");
  if (label)
    label.textContent = open ? t("Close menu", "Menü schließen") : t("Open menu", "Menü öffnen");
  document.body.classList.toggle("menu-open", open);
};

menuToggle?.addEventListener("click", () => {
  setMenu(menuToggle.getAttribute("aria-expanded") !== "true");
});

nav?.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => setMenu(false));
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && menuToggle?.getAttribute("aria-expanded") === "true") {
    setMenu(false);
    menuToggle.focus();
  }
});

window.matchMedia("(min-width: 1024px)").addEventListener("change", (event) => {
  if (event.matches) setMenu(false);
});

/* Highlight the nav link of the section currently in view. */
const navLinks = new Map();
nav?.querySelectorAll('a[href^="#"]').forEach((link) => {
  navLinks.set(link.getAttribute("href").slice(1), link);
});

if ("IntersectionObserver" in window && navLinks.size) {
  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const link = navLinks.get(entry.target.id);
        if (!link) return;
        if (entry.isIntersecting) {
          navLinks.forEach((other) => other.removeAttribute("aria-current"));
          link.setAttribute("aria-current", "true");
        } else if (link.getAttribute("aria-current")) {
          link.removeAttribute("aria-current");
        }
      });
    },
    { rootMargin: "-45% 0px -50% 0px" },
  );

  navLinks.forEach((_, id) => {
    const section = document.getElementById(id);
    if (section) sectionObserver.observe(section);
  });
}

/* ----- Reveal on scroll --------------------------------------------------- */

const revealItems = document.querySelectorAll(".reveal");

if ("IntersectionObserver" in window && !reducedMotion.matches) {
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    { rootMargin: "0px 0px -6% 0px", threshold: 0.06 },
  );
  revealItems.forEach((item) => revealObserver.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add("is-visible"));
}

/* ----- Card spotlight ----------------------------------------------------- */

if (window.matchMedia("(hover: hover)").matches) {
  document.querySelectorAll("[data-spotlight]").forEach((card) => {
    card.addEventListener("pointermove", (event) => {
      const rect = card.getBoundingClientRect();
      card.style.setProperty("--mx", `${event.clientX - rect.left}px`);
      card.style.setProperty("--my", `${event.clientY - rect.top}px`);
    });
  });
}

/* ----- Copy e-mail -------------------------------------------------------- */

const copyText = async (text) => {
  if (navigator.clipboard && window.isSecureContext) {
    await navigator.clipboard.writeText(text);
    return;
  }
  const field = document.createElement("textarea");
  field.value = text;
  field.setAttribute("readonly", "");
  field.style.position = "fixed";
  field.style.opacity = "0";
  document.body.append(field);
  field.select();
  const ok = document.execCommand("copy");
  field.remove();
  if (!ok) throw new Error("copy failed");
};

document.querySelectorAll("[data-copy]").forEach((button) => {
  const label = button.querySelector("[data-copy-label]");
  const initial = label?.textContent ?? "";
  let timer;

  button.addEventListener("click", async () => {
    try {
      await copyText(button.dataset.copy);
      button.classList.add("is-copied");
      if (label) label.textContent = t("Copied", "Kopiert");
    } catch (error) {
      if (label) label.textContent = t("Press Ctrl+C", "Strg+C drücken");
    }
    window.clearTimeout(timer);
    timer = window.setTimeout(() => {
      button.classList.remove("is-copied");
      if (label) label.textContent = initial;
    }, 2200);
  });
});

/* ----- Terminal ----------------------------------------------------------- */

const terminal = document.querySelector("[data-terminal]");

if (terminal) {
  const body = terminal.querySelector("[data-terminal-body]");
  const log = terminal.querySelector("[data-terminal-log]");
  const form = terminal.querySelector("[data-terminal-form]");
  const input = form?.querySelector("input");
  const hint = terminal.querySelector("[data-terminal-hint]");
  const history = [];
  let historyIndex = 0;

  const ext = (href, text) => `<a href="${href}" target="_blank" rel="noreferrer">${text}</a>`;

  const pad = (value, width) => String(value).padEnd(width, " ");

  const table = (rows, widths) =>
    rows
      .map((row) =>
        row
          .map((cell, i) => pad(cell, widths[i] ?? 0))
          .join("")
          .trimEnd(),
      )
      .join("\n");

  const line = (html, className = "t-out") => {
    const p = document.createElement("p");
    p.className = className;
    p.innerHTML = html;
    log.append(p);
  };

  const text = (value, className = "t-out") => {
    const p = document.createElement("p");
    p.className = className;
    p.textContent = value;
    log.append(p);
  };

  const echoCommand = (value) => {
    const p = document.createElement("p");
    p.className = "t-cmd";
    const prompt = document.createElement("span");
    prompt.className = "t-prompt";
    prompt.setAttribute("aria-hidden", "true");
    prompt.textContent = "~ $";
    p.append(prompt, document.createTextNode(value));
    log.append(p);
  };

  const scrollToEnd = () => {
    body.scrollTop = body.scrollHeight;
  };

  const certs = [
    ["KCNA", "Kubernetes and Cloud Native Associate", "Linux Foundation"],
    ["KCSA", "Kubernetes and Cloud Native Security Associate", "Linux Foundation"],
    ["CKA", "Certified Kubernetes Administrator", "Linux Foundation"],
    ["CKAD", "Certified Kubernetes Application Developer", "Linux Foundation"],
    ["CKS", "Certified Kubernetes Security Specialist", "Linux Foundation"],
    ["CGOA", "Certified GitOps Associate", "Linux Foundation"],
    ["CAPA", "Certified Argo Project Associate", "Linux Foundation"],
    ["ICA", "Istio Certified Associate", "Linux Foundation"],
    ["PCA", "Prometheus Certified Associate", "Linux Foundation"],
    ["AWS-SAA", "AWS Certified Solutions Architect - Associate", "AWS"],
    ["AWS-SCS", "AWS Certified Security - Specialty", "AWS"],
    ["RH", "Red Hat Certified Developer in Cloud-native Applications", "Red Hat"],
  ];

  const talks = [
    [
      "2026-06",
      "https://www.meetup.com/de-DE/lakeside-talks/events/315009679/",
      "Rebuilding sucks, k8s inner dev loop for winners",
      "Lakeside Talks #18, Klagenfurt",
    ],
    [
      "2026-05",
      "https://austrian-plattform-engineering-community.sessionize.com/session/1131330",
      "No Setup. No Friction. Just Code.",
      t("APEC 2026, Vienna", "APEC 2026, Wien"),
    ],
    [
      "2026-05",
      "https://austrian-plattform-engineering-community.sessionize.com/session/1131407",
      "DevX as Code",
      t("APEC 2026, Vienna", "APEC 2026, Wien"),
    ],
    [
      "2024-09",
      "https://www.linkedin.com/posts/fullstacks-gmbh_viennadevopsroundtable-staycool-devops-activity-7237053583802695680-0Mi7",
      "DevOps done right",
      t("Vienna DevOps Roundtable, Vienna", "Vienna DevOps Roundtable, Wien"),
    ],
    [
      "2023-10",
      "https://ocgroups.dev/cncf/group/cloud-native-graz/event/ap3df2r",
      "Don’t get Tilted (or do)",
      "CNCF Meetup Graz",
    ],
    [
      "2022-08",
      "https://github.com/DrackThor/cncf-chapter-graz/blob/main/2022-08-29/workflow-engines.pdf",
      "Kubernetes-native workflow engines",
      "CNCF Meetup Graz",
    ],
    [
      "2021-11",
      "https://github.com/DrackThor/cncf-chapter-graz/blob/main/2021-11/2021_11_gitops_argocd.pdf",
      "GitOps mit Argo CD",
      "CNCF Meetup Graz",
    ],
  ];

  const output = {
    help() {
      line(
        [
          `<b>${t("Available commands", "Verfügbare Befehle")}</b>`,
          `  whoami         ${t("who is this?", "wer ist das?")}`,
          `  focus          ${t("what I work on", "woran ich arbeite")}`,
          "  career         git log --oneline career",
          `  talks          ${t("talks and slides", "Talks und Slides")}`,
          "  certs          kubectl get certifications",
          `  contact        ${t("how to reach me", "so erreichst du mich")}`,
          "  open &lt;name&gt;    linkedin | github | email | community",
          `  theme          ${t("toggle light / dark", "hell / dunkel umschalten")}`,
          `  lang           ${t("Deutsche Version", "English version")}`,
          "  ls, cat, kubectl, history, clear",
          `<span class="t-dim">${t("Tip: Tab completes, ↑ / ↓ walk the history.", "Tipp: Tab vervollständigt, ↑ / ↓ blättern im Verlauf.")}</span>`,
        ].join("\n"),
      );
    },
    whoami() {
      line(
        t(
          "<b>Michael Klug</b> — Senior Platform Architect at FULLSTACKS, Kubestronaut,\n" +
            "guest lecturer at FH Joanneum and organizer of Cloud Native Carinthia.\n" +
            `Based in Villach, Austria. ${yearsSince(2014)} years in infrastructure, Kubernetes since 2018.`,
          "<b>Michael Klug</b> — Senior Platform Architect bei FULLSTACKS, Kubestronaut,\n" +
            "Gastlektor an der FH Joanneum und Organisator von Cloud Native Carinthia.\n" +
            `Aus Villach, Österreich. ${yearsSince(2014)} Jahre Infrastruktur, Kubernetes seit 2018.`,
        ),
      );
    },
    focus() {
      line(
        [
          `<b>01</b>  developer experience     ${t("inner loops, dev environments, golden paths", "Inner Loops, Dev-Umgebungen, Golden Paths")}`,
          `<b>02</b>  rancher &amp; openshift      ${t("platform foundations, multi-cluster patterns", "Plattform-Fundamente, Multi-Cluster-Muster")}`,
          "<b>03</b>  gitops &amp; delivery        argo cd, terraform, gitlab ci",
          `<b>04</b>  platform security        ${t("hardening, policy, cloud security", "Hardening, Policies, Cloud-Security")}`,
          "<b>05</b>  observability &amp; mesh     opentelemetry, istio, prometheus",
        ].join("\n"),
      );
    },
    career() {
      line(
        [
          '<span class="y-s">c0ffee1</span> <span class="t-ok">(HEAD → main)</span> 2025  Senior Platform Architect @ FULLSTACKS',
          '<span class="y-s">fa57e2a</span> 2023  Senior DevOps Engineer @ FULLSTACKS',
          '<span class="y-s">e1b6c03</span> 2022  CSM &amp; Technical Lead @ IBM',
          '<span class="y-s">5ca1ab1</span> 2020  Cloud Engineer → Senior Cloud Engineer @ Beyond by BearingPoint',
          '<span class="y-s">b45c132</span> <span class="t-ok">(tag: education)</span> 2020  BSc Software Design @ FH Joanneum',
          '<span class="y-s">ba52014</span> 2014  IT Professional → Development IT-Services @ KNAPP AG',
        ].join("\n"),
      );
    },
    talks() {
      line(
        talks
          .map(
            ([when, href, title, event]) =>
              `${when}  ${ext(href, title)}  <span class="t-dim">· ${event}</span>`,
          )
          .join("\n"),
      );
    },
    certs() {
      const rows = [
        ["NAME", "ISSUER", "STATUS"],
        ...certs.map(([name, , issuer]) => [name, issuer, "Verified"]),
      ];
      line(table(rows, [10, 19, 8]).replace(/Verified/g, '<span class="t-ok">Verified</span>'));
      line(
        '<span class="t-dim">Kubestronaut: KCNA + KCSA + CKA + CKAD + CKS. Details: kubectl describe certs</span>',
      );
    },
    describeCerts() {
      line(
        certs
          .map(
            ([name, title, issuer]) =>
              `${pad(name, 9)}${title} <span class="t-dim">(${issuer})</span>`,
          )
          .join("\n"),
      );
    },
    contact() {
      line(
        [
          `email      <a href="mailto:michiklug85@gmail.com">michiklug85@gmail.com</a>`,
          `linkedin   ${ext("https://www.linkedin.com/in/michi-klug/", "linkedin.com/in/michi-klug")}`,
          `github     ${ext("https://github.com/sadoMasupilami", "github.com/sadoMasupilami")}`,
          `community  ${ext("https://community.cncf.io/cloud-native-carinthia/", "Cloud Native Carinthia")}`,
        ].join("\n"),
      );
    },
    pods() {
      const rows = [
        ["NAME", "READY", "STATUS", "RESTARTS", "AGE"],
        ["platform-architect", "1/1", "Running", "0", `${yearsSince(2014)}y`],
        ["kubernetes-lecturer", "1/1", "Running", "0", `${yearsSince(2021)}y`],
        ["community-organizer", "1/1", "Running", "0", "-"],
        ["curiosity", "1/1", "Running", "0", "∞"],
      ];
      line(
        table(rows, [22, 8, 10, 11, 5]).replace(/Running/g, '<span class="t-ok">Running</span>'),
      );
    },
    describe() {
      line(
        [
          "Name:         michael-klug",
          "Namespace:    villach-at",
          "Kind:         PlatformArchitect",
          "Labels:       kubestronaut=true",
          "              community=cloud-native-carinthia",
          "Role:         Senior Platform Architect @ FULLSTACKS",
          "Focus:        developer-experience, platform-security, gitops, observability",
          'Status:       <span class="t-ok">Shipping</span>',
          "Events:",
          `  Normal  Teaching   ${t("FH Joanneum, every year since 2021", "FH Joanneum, jedes Jahr seit 2021")}`,
          `  Normal  Speaking   ${t(
            "APEC Vienna, Lakeside Talks Klagenfurt, Vienna DevOps Roundtable, CNCF Graz",
            "APEC Wien, Lakeside Talks Klagenfurt, Vienna DevOps Roundtable, CNCF Graz",
          )}`,
          `  Normal  Hosting    ${t("Cloud Native Carinthia meetups", "Cloud Native Carinthia Meetups")}`,
        ].join("\n"),
      );
    },
    greet() {
      text(
        t(
          "Hi there! Type contact to reach the human behind this terminal.",
          "Servus! Mit contact erreichst du den Menschen hinter diesem Terminal.",
        ),
      );
    },
  };

  const files = {
    "michael-klug.yaml": () =>
      line(terminal.querySelector(".t-yaml code")?.innerHTML ?? "", "t-out"),
    "README.md": () =>
      line(
        t(
          "# michael-klug\nPlatform engineering for people who ship.\nRun <b>help</b> to explore, or <b>contact</b> to say hi.",
          "# michael-klug\nPlatform Engineering für Teams, die liefern.\nMit <b>help</b> umsehen oder mit <b>contact</b> Hallo sagen.",
        ),
      ),
    "talks.txt": output.talks,
    "certs.txt": output.certs,
    "contact.txt": output.contact,
  };

  const links = {
    linkedin: "https://www.linkedin.com/in/michi-klug/",
    github: "https://github.com/sadoMasupilami",
    community: "https://community.cncf.io/cloud-native-carinthia/",
    carinthia: "https://community.cncf.io/cloud-native-carinthia/",
    email: "mailto:michiklug85@gmail.com",
    mail: "mailto:michiklug85@gmail.com",
  };

  const kubectl = (args) => {
    const [verb = "", resource = "", name = ""] = args;
    const target = `${resource} ${name}`.trim();

    if (!verb || verb === "help") {
      line(
        t(
          "kubectl controls the Michael Klug cluster.",
          "kubectl steuert den Michael-Klug-Cluster.",
        ) + "\n  get pods | get certs | describe michael | logs talks | apply -f michael-klug.yaml",
      );
      return;
    }
    if (verb === "version") {
      line("Client Version: v1-curious\nServer Version: Kubestronaut");
      return;
    }
    if (verb === "get") {
      if (/^(po|pod|pods)$/.test(resource)) return output.pods();
      if (/^(cert|certs|certification|certifications)$/.test(resource)) return output.certs();
      if (/^(talk|talks)$/.test(resource)) return output.talks();
      if (/^(ns|namespace|namespaces)$/.test(resource)) {
        line(
          table(
            [
              ["NAME", "STATUS"],
              ["villach-at", "Active"],
              ["vienna-remote", "Active"],
              ["fh-joanneum", "Active"],
            ],
            [20, 8],
          ),
        );
        return;
      }
      text(
        `error: the server doesn't have a resource type "${resource || "<none>"}"`,
        "t-out t-err",
      );
      line(
        `<span class="t-dim">${t("Try", "Probier")}: kubectl get pods | certs | talks | namespaces</span>`,
      );
      return;
    }
    if (verb === "describe") {
      if (/^(cert|certs|certification|certifications)$/.test(resource))
        return output.describeCerts();
      return output.describe();
    }
    if (verb === "logs") {
      if (/talk/.test(target)) return output.talks();
      return output.career();
    }
    if (verb === "apply") {
      line(
        'platformarchitect.people.cloud-native.at/michael-klug <span class="t-ok">unchanged</span>',
      );
      return;
    }
    if (verb === "delete") {
      text(
        t(
          "Error from server (Forbidden): enthusiasm cannot be deleted.",
          "Error from server (Forbidden): Begeisterung lässt sich nicht löschen.",
        ),
        "t-out t-err",
      );
      return;
    }
    if (verb === "exec" || verb === "port-forward") {
      line(
        `${t("Forwarding to a human…", "Weiterleitung an einen Menschen…")} ${ext("https://www.linkedin.com/in/michi-klug/", "linkedin.com/in/michi-klug")} ${t("or", "oder")} <a href="mailto:michiklug85@gmail.com">${t("email", "E-Mail")}</a>.`,
      );
      return;
    }
    text(`error: unknown command "${verb}" for "kubectl"`, "t-out t-err");
  };

  const commands = {
    help: output.help,
    whoami: output.whoami,
    about: output.whoami,
    focus: output.focus,
    skills: output.focus,
    career: output.career,
    experience: output.career,
    talks: output.talks,
    certs: output.certs,
    contact: output.contact,
    social: output.contact,
    lang: (args) => {
      const link = document.querySelector("[data-lang-switch] a[hreflang]");
      const wanted = (args[0] || "").toLowerCase();
      if (!link || (wanted && wanted !== link.hreflang)) {
        text(t("already speaking English", "spricht bereits Deutsch"), "t-out t-dim");
        return;
      }
      text(t("switching to Deutsch…", "wechsle zu English…"), "t-out t-ok");
      window.location.href = link.href;
    },
    pwd: () => text("/home/michael"),
    date: () => text(new Date().toString()),
    ls: () => line(Object.keys(files).join("   ")),
    clear: () => log.replaceChildren(),
    history: () =>
      text(
        history.map((entry, i) => `${String(i + 1).padStart(4, " ")}  ${entry}`).join("\n") ||
          t("(empty)", "(leer)"),
      ),
    echo: (args) => text(args.join(" ")),
    cat: (args) => {
      const file = args[0];
      if (!file)
        return text(
          t("usage: cat <file>  —  try: ls", "Verwendung: cat <datei>  —  Tipp: ls"),
          "t-out t-dim",
        );
      if (files[file]) return files[file]();
      text(`cat: ${file}: No such file or directory`, "t-out t-err");
    },
    open: (args) => {
      const key = (args[0] || "").toLowerCase();
      const href = links[key];
      if (!href)
        return text(
          t(
            "usage: open linkedin | github | email | community",
            "Verwendung: open linkedin | github | email | community",
          ),
          "t-out t-dim",
        );
      if (href.startsWith("mailto:")) {
        window.location.href = href;
      } else {
        window.open(href, "_blank", "noopener,noreferrer");
      }
      text(t(`opening ${key}…`, `öffne ${key}…`), "t-out t-ok");
    },
    theme: (args) => {
      const wanted = args[0];
      const next =
        wanted === "light" || wanted === "dark"
          ? wanted
          : currentTheme() === "dark"
            ? "light"
            : "dark";
      setTheme(next);
      text(
        t(`theme set to ${next}`, `Farbschema: ${next === "light" ? "hell" : "dunkel"}`),
        "t-out t-ok",
      );
    },
    kubectl,
    k: kubectl,
    sudo: () =>
      text("michael is not in the sudoers file. This incident will be reported. ;)", "t-out t-err"),
    rm: () =>
      text(
        t(
          "Nice try. This cluster runs with Pod Security Admission enforced.",
          "Netter Versuch. Dieser Cluster läuft mit erzwungener Pod Security Admission.",
        ),
        "t-out t-err",
      ),
    exit: () =>
      line(
        t(
          'There is no exit — only <a href="#contact">#contact</a>.',
          'Es gibt kein exit – nur <a href="#contact">#contact</a>.',
        ),
      ),
    vim: () =>
      text(
        t(
          "You are now trapped in vim. Just kidding — try :q elsewhere.",
          "Du steckst jetzt in vim fest. Kleiner Scherz – :q bitte woanders.",
        ),
      ),
    hello: output.greet,
    hi: output.greet,
    hallo: output.greet,
    servus: output.greet,
  };

  const run = (raw) => {
    const value = raw.trim();
    echoCommand(value);
    if (!value) return;

    history.push(value);
    historyIndex = history.length;

    const [name, ...args] = value.split(/\s+/);
    const command = commands[name.toLowerCase()];

    if (command) {
      command(args);
    } else {
      text(`command not found: ${name}`, "t-out t-err");
      line(
        `<span class="t-dim">${t("Type help to see what this terminal can do.", "help zeigt, was dieses Terminal kann.")}</span>`,
      );
    }
  };

  const complete = () => {
    const value = input.value;
    if (!value || /\s/.test(value)) return;
    const matches = Object.keys(commands).filter((name) => name.startsWith(value));
    if (matches.length === 1) {
      input.value = `${matches[0]} `;
    } else if (matches.length > 1) {
      echoCommand(value);
      text(matches.join("   "), "t-out t-dim");
      scrollToEnd();
    }
  };

  const activate = () => {
    terminal.classList.remove("is-pending", "is-booting");
    form.hidden = false;
    if (hint) hint.hidden = false;
    scrollToEnd();
  };

  form?.addEventListener("submit", (event) => {
    event.preventDefault();
    run(input.value);
    input.value = "";
    scrollToEnd();
  });

  input?.addEventListener("keydown", (event) => {
    if (event.key === "Tab" && input.value && !/\s/.test(input.value)) {
      event.preventDefault();
      complete();
    } else if (event.key === "ArrowUp" && history.length) {
      event.preventDefault();
      historyIndex = Math.max(0, historyIndex - 1);
      input.value = history[historyIndex] ?? "";
    } else if (event.key === "ArrowDown" && history.length) {
      event.preventDefault();
      historyIndex = Math.min(history.length, historyIndex + 1);
      input.value = history[historyIndex] ?? "";
    } else if (event.key === "l" && event.ctrlKey) {
      event.preventDefault();
      log.replaceChildren();
    }
  });

  body?.addEventListener("click", (event) => {
    if (event.target.closest("a")) return;
    if (window.getSelection()?.toString()) return;
    input?.focus({ preventScroll: true });
  });

  /* Boot sequence: replay the pre-rendered lines once the terminal is in view. */
  const lines = [...log.children];
  lines.forEach((node, index) => node.style.setProperty("--i", String(index)));

  if (reducedMotion.matches || !("IntersectionObserver" in window)) {
    activate();
  } else {
    terminal.classList.add("is-pending");
    const bootObserver = new IntersectionObserver(
      (entries, observer) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        observer.disconnect();
        terminal.classList.replace("is-pending", "is-booting");
        window.setTimeout(activate, lines.length * 140 + 700);
      },
      { threshold: 0.3 },
    );
    bootObserver.observe(terminal);
  }
}
