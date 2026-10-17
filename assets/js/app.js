(function () {
  "use strict";

  const body = document.body;
  const pages = Array.from(document.querySelectorAll("[data-page]"));
  const navLinks = Array.from(document.querySelectorAll("[data-nav]"));
  const mobileNav = document.getElementById("mobile-nav");
  const menuBtn = document.getElementById("menu-btn");
  const menuClose = document.getElementById("menu-close");
  const header = document.getElementById("site-header");

  const titles = {
    home: "Greaves-Hawkins Memorial Funeral Services | Jamaica, NY",
    obituaries: "Obituaries | Greaves-Hawkins Memorial Funeral Services",
    services: "Services We Offer | Greaves-Hawkins Memorial Funeral Services",
    preplanning: "Pre-Planning | Greaves-Hawkins Memorial Funeral Services",
    grief: "Grief & Healing | Greaves-Hawkins Memorial Funeral Services",
    resources: "Resources | Greaves-Hawkins Memorial Funeral Services",
    about: "About Us | Greaves-Hawkins Memorial Funeral Services",
    contact: "Contact Us | Greaves-Hawkins Memorial Funeral Services"
  };

  /* ---------------------------------------------------------------- */
  /* Routing                                                           */
  /* ---------------------------------------------------------------- */

  function parseHash() {
    const raw = window.location.hash.replace(/^#\/?/, "");
    if (!raw) return { route: "home", section: "" };
    const parts = raw.split("/").filter(Boolean);
    return { route: parts[0] || "home", section: parts[1] || "" };
  }

  function setActiveNav(route) {
    navLinks.forEach(function (link) {
      if (link.getAttribute("data-nav") === route) {
        link.setAttribute("aria-current", "page");
      } else {
        link.removeAttribute("aria-current");
      }
    });
  }

  function showRoute(route, section, initial) {
    const target = pages.find(function (page) {
      return page.getAttribute("data-page") === route;
    }) || pages.find(function (page) {
      return page.getAttribute("data-page") === "home";
    });
    if (!target) return;

    pages.forEach(function (page) {
      page.hidden = page !== target;
    });

    const resolvedRoute = target.getAttribute("data-page");
    setActiveNav(resolvedRoute);
    document.title = titles[resolvedRoute] || titles.home;
    closeMenu(false);

    if (section) {
      const destination = document.getElementById(section);
      if (destination && target.contains(destination)) {
        window.requestAnimationFrame(function () {
          destination.scrollIntoView({ behavior: initial ? "auto" : "smooth", block: "start" });
        });
      }
    } else {
      window.scrollTo({ top: 0, behavior: "auto" });
      const heading = target.querySelector("h1");
      if (heading) {
        heading.setAttribute("tabindex", "-1");
        heading.focus({ preventScroll: true });
      }
    }

    if (resolvedRoute === "services") {
      updateServiceNav();
    }
  }

  function handleRoute(initial) {
    const parsed = parseHash();
    showRoute(parsed.route, parsed.section, Boolean(initial));
  }

  window.addEventListener("hashchange", function () {
    handleRoute(false);
  });

  /* ---------------------------------------------------------------- */
  /* Header & mobile navigation                                        */
  /* ---------------------------------------------------------------- */

  function openMenu() {
    mobileNav.hidden = false;
    body.classList.add("is-locked");
    menuBtn.setAttribute("aria-expanded", "true");
    if (menuClose) menuClose.focus();
  }

  function closeMenu(returnFocus) {
    if (!mobileNav || mobileNav.hidden) return;
    mobileNav.hidden = true;
    body.classList.remove("is-locked");
    menuBtn.setAttribute("aria-expanded", "false");
    if (returnFocus !== false) menuBtn.focus();
  }

  if (menuBtn) {
    menuBtn.addEventListener("click", openMenu);
  }
  if (menuClose) {
    menuClose.addEventListener("click", function () { closeMenu(true); });
  }
  if (mobileNav) {
    mobileNav.addEventListener("click", function (event) {
      if (event.target.closest("a")) closeMenu(false);
    });
  }
  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
      if (mobileNav && !mobileNav.hidden) closeMenu(true);
    }
  });

  function updateHeader() {
    if (!header) return;
    header.classList.toggle("is-scrolled", window.scrollY > 12);
  }
  window.addEventListener("scroll", updateHeader, { passive: true });
  updateHeader();

  /* ---------------------------------------------------------------- */
  /* Services sub-navigation                                           */
  /* ---------------------------------------------------------------- */

  const serviceSections = Array.from(document.querySelectorAll(".svc-section"));
  const serviceLinks = Array.from(document.querySelectorAll("[data-svc]"));
  let serviceTicking = false;

  function updateServiceNav() {
    if (!serviceSections.length) return;
    const servicesPage = document.getElementById("page-services");
    if (!servicesPage || servicesPage.hidden) return;
    let current = serviceSections[0].id;
    serviceSections.forEach(function (section) {
      if (section.getBoundingClientRect().top <= 190) current = section.id;
    });
    serviceLinks.forEach(function (link) {
      if (link.getAttribute("data-svc") === current) {
        link.setAttribute("aria-current", "true");
      } else {
        link.removeAttribute("aria-current");
      }
    });
  }

  window.addEventListener("scroll", function () {
    if (serviceTicking) return;
    serviceTicking = true;
    window.requestAnimationFrame(function () {
      updateServiceNav();
      serviceTicking = false;
    });
  }, { passive: true });

  /* ---------------------------------------------------------------- */
  /* Obituary filtering                                                */
  /* ---------------------------------------------------------------- */

  const obitRows = Array.from(document.querySelectorAll("#obit-rows .obit-row"));
  const obitSearch = document.getElementById("obit-search");
  const obitSort = document.getElementById("obit-sort");
  const obitMonth = document.getElementById("obit-month");
  const obitCount = document.getElementById("obit-count");
  const obitEmpty = document.getElementById("obit-empty");
  const obitClear = document.getElementById("obit-clear");

  function filterObituaries() {
    if (!obitRows.length) return;
    const query = (obitSearch ? obitSearch.value : "").trim().toLowerCase();
    const month = obitMonth ? obitMonth.value : "all";
    let visible = 0;

    obitRows.forEach(function (row) {
      const name = (row.getAttribute("data-name") || "").toLowerCase();
      const rowMonth = row.getAttribute("data-month") || "";
      const matchesQuery = !query || name.indexOf(query) !== -1;
      const matchesMonth = month === "all" || rowMonth === month;
      const show = matchesQuery && matchesMonth;
      row.hidden = !show;
      if (show) visible += 1;
    });

    if (obitCount) {
      obitCount.textContent = visible + (visible === 1 ? " obituary" : " obituaries");
    }
    if (obitEmpty) obitEmpty.hidden = visible !== 0;

    if (obitSort && obitSort.value === "name") {
      obitRows.slice().sort(function (a, b) {
        return (a.getAttribute("data-name") || "").localeCompare(b.getAttribute("data-name") || "");
      }).forEach(function (row) {
        row.parentElement.appendChild(row);
      });
    } else {
      obitRows.slice().sort(function (a, b) {
        return (b.getAttribute("data-date") || "").localeCompare(a.getAttribute("data-date") || "");
      }).forEach(function (row) {
        row.parentElement.appendChild(row);
      });
    }
  }

  if (obitSearch) obitSearch.addEventListener("input", filterObituaries);
  if (obitMonth) obitMonth.addEventListener("change", filterObituaries);
  if (obitSort) obitSort.addEventListener("change", filterObituaries);
  if (obitClear) {
    obitClear.addEventListener("click", function () {
      if (obitSearch) obitSearch.value = "";
      if (obitMonth) obitMonth.value = "all";
      if (obitSort) obitSort.value = "recent";
      filterObituaries();
      if (obitSearch) obitSearch.focus();
    });
  }

  /* ---------------------------------------------------------------- */
  /* Forms                                                            */
  /* ---------------------------------------------------------------- */

  function fieldErrorId(field) {
    if (field.type === "radio") return field.name + "-error";
    return field.id + "-error";
  }

  function errorBox(field) {
    return document.getElementById(fieldErrorId(field));
  }

  function messageFor(field) {
    return field.getAttribute("data-error") || "Please complete this field.";
  }

  function validateField(field) {
    const box = errorBox(field);
    let valid = true;

    if (field.type === "radio") {
      const group = field.form ? Array.from(field.form.querySelectorAll('[name="' + field.name + '"]')) : [field];
      valid = group.some(function (radio) { return radio.checked; });
      group.forEach(function (radio) {
        if (valid) radio.removeAttribute("aria-invalid");
        else radio.setAttribute("aria-invalid", "true");
      });
    } else {
      valid = field.checkValidity();
      if (valid) field.removeAttribute("aria-invalid");
      else field.setAttribute("aria-invalid", "true");
    }

    if (box) box.textContent = valid ? "" : messageFor(field);
    return valid;
  }

  function clearFormState(form) {
    form.querySelectorAll("[aria-invalid]").forEach(function (field) {
      field.removeAttribute("aria-invalid");
    });
    form.querySelectorAll(".error-text").forEach(function (box) {
      box.textContent = "";
    });
    const summary = form.querySelector(".error-summary");
    if (summary) {
      summary.hidden = true;
      const list = summary.querySelector("ul");
      if (list) list.innerHTML = "";
    }
  }

  function setupForm(form) {
    const requiredFields = Array.from(form.querySelectorAll("[required]")).filter(function (field) {
      return field.type !== "hidden";
    });
    const success = form.parentElement
      ? form.parentElement.querySelector(".form-success")
      : null;
    const summary = form.querySelector(".error-summary");

    requiredFields.forEach(function (field) {
      field.addEventListener("blur", function () {
        if (field.value || field.type === "radio") validateField(field);
      });
      field.addEventListener("input", function () {
        if (field.getAttribute("aria-invalid") === "true") validateField(field);
      });
      if (field.type === "radio") {
        field.addEventListener("change", function () { validateField(field); });
      }
    });

    if (summary) {
      summary.addEventListener("click", function (event) {
        const link = event.target.closest("a");
        if (!link) return;
        const target = document.querySelector(link.getAttribute("href"));
        if (target) {
          event.preventDefault();
          target.focus();
        }
      });
    }

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      clearFormState(form);

      const invalid = [];
      const seenRadio = new Set();

      requiredFields.forEach(function (field) {
        if (field.type === "radio") {
          if (seenRadio.has(field.name)) return;
          seenRadio.add(field.name);
        }
        if (!validateField(field)) invalid.push(field);
      });

      if (invalid.length) {
        if (summary) {
          const list = summary.querySelector("ul");
          if (list) {
            list.innerHTML = invalid.map(function (field) {
              const id = field.type === "radio" ? field.id : field.id;
              return '<li><a href="#' + id + '">' + messageFor(field) + "</a></li>";
            }).join("");
          }
          summary.hidden = false;
        }
        invalid[0].focus();
        return;
      }

      if (success) {
        const nameField = form.querySelector('input[name="name"], input[name="first-name"]');
        const nameOutput = success.querySelector("[data-success-name]");
        if (nameOutput && nameField && nameField.value.trim()) {
          nameOutput.textContent = nameField.value.trim().split(" ")[0];
        }
        form.hidden = true;
        success.hidden = false;
        success.setAttribute("tabindex", "-1");
        success.focus();
        form.reset();
      }
    });
  }

  document.querySelectorAll("form[data-form]").forEach(setupForm);

  /* ---------------------------------------------------------------- */
  /* Dialog                                                           */
  /* ---------------------------------------------------------------- */

  document.querySelectorAll("[data-dialog-open]").forEach(function (button) {
    button.addEventListener("click", function () {
      const dialog = document.getElementById(button.getAttribute("data-dialog-open"));
      if (dialog && typeof dialog.showModal === "function") {
        dialog.showModal();
        const first = dialog.querySelector("input, textarea, button");
        if (first) first.focus();
      }
    });
  });

  document.querySelectorAll("dialog").forEach(function (dialog) {
    dialog.querySelectorAll("[data-dialog-close]").forEach(function (button) {
      button.addEventListener("click", function () { dialog.close(); });
    });
    dialog.addEventListener("click", function (event) {
      if (event.target === dialog) dialog.close();
    });
  });

  /* ---------------------------------------------------------------- */
  /* Hero photo rotation                                               */
  /* ---------------------------------------------------------------- */

  const heroSlideshow = document.querySelector("[data-slideshow]");

  if (heroSlideshow) {
    const heroSlides = Array.from(heroSlideshow.querySelectorAll(".hero-slide"));
    const heroCaptions = Array.from(heroSlideshow.querySelectorAll(".hero-caption span"));
    const heroDots = Array.from(heroSlideshow.querySelectorAll(".hero-dot"));
    const heroPause = heroSlideshow.querySelector("[data-slide-pause]");
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const heroInterval = 7000;
    let heroIndex = 0;
    let heroTimer = null;
    let heroPaused = false;

    function setHeroSlide(next) {
      heroIndex = (next + heroSlides.length) % heroSlides.length;
      heroSlides.forEach(function (slide, i) {
        const active = i === heroIndex;
        slide.classList.toggle("is-active", active);
        if (active) slide.removeAttribute("aria-hidden");
        else slide.setAttribute("aria-hidden", "true");
      });
      heroCaptions.forEach(function (caption, i) {
        const active = i === heroIndex;
        caption.classList.toggle("is-active", active);
        if (active) caption.removeAttribute("aria-hidden");
        else caption.setAttribute("aria-hidden", "true");
      });
      heroDots.forEach(function (dot, i) {
        const active = i === heroIndex;
        dot.classList.toggle("is-active", active);
        if (active) dot.setAttribute("aria-current", "true");
        else dot.removeAttribute("aria-current");
      });
    }

    function stopHeroRotation() {
      if (heroTimer) {
        window.clearTimeout(heroTimer);
        heroTimer = null;
      }
    }

    function scheduleHeroRotation() {
      stopHeroRotation();
      if (motionQuery.matches || heroPaused) return;
      heroTimer = window.setTimeout(function () {
        setHeroSlide(heroIndex + 1);
        scheduleHeroRotation();
      }, heroInterval);
    }

    function updatePauseButton() {
      if (!heroPause) return;
      heroPause.setAttribute("aria-pressed", heroPaused ? "true" : "false");
      heroPause.setAttribute("aria-label", heroPaused ? "Play photo slideshow" : "Pause photo slideshow");
      const use = heroPause.querySelector("use");
      if (use) use.setAttribute("href", heroPaused ? "#i-play" : "#i-pause");
    }

    heroDots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        setHeroSlide(i);
        scheduleHeroRotation();
      });
    });

    if (heroPause) {
      heroPause.addEventListener("click", function () {
        heroPaused = !heroPaused;
        updatePauseButton();
        scheduleHeroRotation();
      });
    }

    document.addEventListener("visibilitychange", function () {
      if (document.hidden) stopHeroRotation();
      else scheduleHeroRotation();
    });

    function handleMotionPreference() {
      if (motionQuery.matches) stopHeroRotation();
      else scheduleHeroRotation();
    }

    if (typeof motionQuery.addEventListener === "function") {
      motionQuery.addEventListener("change", handleMotionPreference);
    } else if (typeof motionQuery.addListener === "function") {
      motionQuery.addListener(handleMotionPreference);
    }

    setHeroSlide(0);
    scheduleHeroRotation();
  }

  /* ---------------------------------------------------------------- */
  /* Initialize                                                       */
  /* ---------------------------------------------------------------- */

  handleRoute(true);
  filterObituaries();
})();
