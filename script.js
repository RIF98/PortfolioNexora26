/* ==========================================================
   MIFTAQHUDIN RIFAI — PORTFOLIO
   Interactions: intro, navigation, reveal, form, utilities
   ========================================================== */

(function () {
  "use strict";

  const prefersReducedMotion =
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ------------------------------------------------------
     1. INTRO SCREEN
     ------------------------------------------------------ */
  const intro = document.getElementById("intro");
  const mainContent = document.getElementById("mainContent");
  const enterButton = document.getElementById("enterButton");

  function lockScroll(lock) {
    document.body.style.overflow = lock ? "hidden" : "";
  }

  function openPortfolio() {
    if (!intro || !mainContent) return;

    mainContent.hidden = false;

    if (prefersReducedMotion) {
      intro.remove();
    } else {
      intro.classList.add("intro--gone");
      window.setTimeout(function () {
        if (intro.parentNode) intro.parentNode.removeChild(intro);
      }, 750);
    }

    lockScroll(false);
    window.scrollTo({ top: 0, behavior: "auto" });

    // trigger reveal for elements already in view
    window.requestAnimationFrame(function () {
      revealAboveFold();
    });
  }

  if (intro && mainContent) {
    lockScroll(true);

    if (enterButton) {
      enterButton.addEventListener("click", openPortfolio);
    }

    document.addEventListener("keydown", function (event) {
      if (event.key === "Enter" && document.body.contains(intro)) {
        openPortfolio();
      }
    });
  }

  /* ------------------------------------------------------
     2. NAVBAR — mobile toggle + scrolled state
     ------------------------------------------------------ */
  const navbar = document.getElementById("navbar");
  const navToggle = document.getElementById("navToggle");
  const navLinks = document.getElementById("navLinks");

  function closeMenu() {
    if (!navLinks || !navToggle) return;
    navLinks.classList.remove("is-open");
    navToggle.setAttribute("aria-expanded", "false");
  }

  if (navToggle && navLinks) {
    navToggle.addEventListener("click", function () {
      const isOpen = navLinks.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", String(isOpen));
    });

    navLinks.addEventListener("click", function (event) {
      if (event.target.closest("a")) closeMenu();
    });

    document.addEventListener("click", function (event) {
      if (!navLinks.classList.contains("is-open")) return;
      if (navLinks.contains(event.target) || navToggle.contains(event.target)) {
        return;
      }
      closeMenu();
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") closeMenu();
    });

    window.addEventListener("resize", function () {
      if (window.innerWidth > 860) closeMenu();
    });
  }

  if (navbar) {
    const onScroll = function () {
      navbar.classList.toggle("navbar--scrolled", window.scrollY > 24);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ------------------------------------------------------
     3. SMOOTH ANCHOR NAVIGATION (offset for fixed navbar)
     ------------------------------------------------------ */
  const anchorLinks = document.querySelectorAll('a[href^="#"]');

  anchorLinks.forEach(function (link) {
    link.addEventListener("click", function (event) {
      const targetId = link.getAttribute("href");
      if (!targetId || targetId === "#") return;

      const target = document.querySelector(targetId);
      if (!target) return;

      event.preventDefault();

      const navHeight = navbar ? navbar.offsetHeight : 0;
      const top =
        target.getBoundingClientRect().top + window.scrollY - navHeight - 8;

      window.scrollTo({
        top: Math.max(top, 0),
        behavior: prefersReducedMotion ? "auto" : "smooth"
      });

      if (history.replaceState) {
        history.replaceState(null, "", targetId);
      }
    });
  });

  /* ------------------------------------------------------
     4. SCROLL REVEAL
     ------------------------------------------------------ */
  const revealTargets = [];

  function addReveal(selector, delayStep, delayStart) {
    document.querySelectorAll(selector).forEach(function (el, index) {
      if (el.classList.contains("reveal")) return;
      el.classList.add("reveal");
      if (delayStart || delayStep) {
        const delay = (delayStart || 0) + index * (delayStep || 0);
        el.style.setProperty("--reveal-delay", delay + "ms");
      }
      revealTargets.push(el);
    });
  }

  // Hero content staged on entry
  addReveal(
    ".hero .section-label, .hero-title, .hero-subtitle, .hero-text, .hero-actions, .hero-stats",
    90,
    120
  );
  addReveal(".hero-visual", 0, 420);

  // Sections
  addReveal(".section-head > *", 70, 0);
  addReveal(".about-copy > p", 90, 0);
  addReveal(".rail-card", 110, 0);
  addReveal(".skill-card", 90, 0);
  addReveal(".project-card", 100, 0);
  addReveal(".footer > *", 80, 0);

  let revealObserver = null;

  function revealAboveFold() {
    if (!mainContent || mainContent.hidden) return;

    revealTargets.forEach(function (el) {
      if (el.classList.contains("is-visible")) return;
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.92 && rect.bottom > 0) {
        el.classList.add("is-visible");
      }
    });
  }

  function revealNow() {
    revealTargets.forEach(function (el) {
      el.classList.add("is-visible");
    });
  }

  if (prefersReducedMotion) {
    revealNow();
  } else if ("IntersectionObserver" in window) {
    revealObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.12 }
    );

    revealTargets.forEach(function (el) {
      revealObserver.observe(el);
    });
  } else {
    revealNow();
  }

  /* ------------------------------------------------------
     5. ACTIVE NAV LINK ON SCROLL
     ------------------------------------------------------ */
  const sections = ["home", "about", "skills", "projects", "contact"]
    .map(function (id) {
      return document.getElementById(id);
    })
    .filter(Boolean);

  const menuLinks = document.querySelectorAll(".nav-links a");

  function setActiveLink(id) {
    menuLinks.forEach(function (link) {
      link.classList.toggle(
        "active",
        link.getAttribute("href") === "#" + id
      );
    });
  }

  if (sections.length && "IntersectionObserver" in window) {
    const sectionObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) setActiveLink(entry.target.id);
        });
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: 0 }
    );

    sections.forEach(function (section) {
      sectionObserver.observe(section);
    });
  }

  /* ------------------------------------------------------
     6. CONTACT FORM (demo submit with validation)
     ------------------------------------------------------ */
  const contactForm = document.getElementById("contactForm");
  const formNotice = document.getElementById("formNotice");

  function setNotice(message, isError) {
    if (!formNotice) return;
    formNotice.textContent = message || "";
    formNotice.classList.toggle("is-error", Boolean(isError));
  }

  if (contactForm) {
    contactForm.addEventListener("submit", function (event) {
      event.preventDefault();

      const nameInput = document.getElementById("name");
      const emailInput = document.getElementById("email");
      const messageInput = document.getElementById("message");

      const name = nameInput ? nameInput.value.trim() : "";
      const email = emailInput ? emailInput.value.trim() : "";
      const message = messageInput ? messageInput.value.trim() : "";

      if (!name || !email || !message) {
        setNotice("Please complete your name, email, and message.", true);
        const firstEmpty = !name ? nameInput : !email ? emailInput : messageInput;
        if (firstEmpty) firstEmpty.focus();
        return;
      }

      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
      if (!emailPattern.test(email)) {
        setNotice("Please enter a valid email address.", true);
        if (emailInput) emailInput.focus();
        return;
      }

      setNotice(
        "Thank you, " + name + " — your message has been noted in this demo.",
        false
      );

      contactForm.reset();
    });
  }

  /* ------------------------------------------------------
     7. ORB PARALLAX (pointer only, deliberately subtle)
     ------------------------------------------------------ */
  const orbTilt = document.getElementById("orbTilt");
  const orbSystem = document.querySelector(".orb-system");
  const heroVisual = document.querySelector(".hero-visual");
  const motionQuery = window.matchMedia
    ? window.matchMedia("(prefers-reduced-motion: reduce)")
    : null;
  const pointerQuery = window.matchMedia
    ? window.matchMedia("(hover: hover) and (pointer: fine)")
    : null;

  if (
    orbTilt &&
    heroVisual &&
    (!pointerQuery || pointerQuery.matches) &&
    !(motionQuery && motionQuery.matches)
  ) {
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;
    let frame = null;

    function renderOrb() {
      currentX += (targetX - currentX) * 0.075;
      currentY += (targetY - currentY) * 0.075;

      orbTilt.style.transform =
        "translate3d(" + (currentX * 9).toFixed(2) + "px, " + (currentY * 9).toFixed(2) + "px, 0)";

      if (orbSystem) {
        orbSystem.style.transform =
          "translate3d(" + (currentX * -15).toFixed(2) + "px, " + (currentY * -15).toFixed(2) + "px, 0)";
      }

      const settled =
        Math.abs(targetX - currentX) < 0.001 && Math.abs(targetY - currentY) < 0.001;

      frame = settled ? null : window.requestAnimationFrame(renderOrb);
    }

    function queueRender() {
      if (frame === null) frame = window.requestAnimationFrame(renderOrb);
    }

    heroVisual.addEventListener("mousemove", function (event) {
      const rect = heroVisual.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      targetX = (event.clientX - rect.left) / rect.width - 0.5;
      targetY = (event.clientY - rect.top) / rect.height - 0.5;
      queueRender();
    });

    heroVisual.addEventListener("mouseleave", function () {
      targetX = 0;
      targetY = 0;
      queueRender();
    });
  }

  /* ------------------------------------------------------
     8. FOOTER YEAR
     ------------------------------------------------------ */
  const year = document.getElementById("year");
  if (year) {
    year.textContent = String(new Date().getFullYear());
  }
})();
