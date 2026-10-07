/* =========================================================
   Scripture Union Uyo Central Group — vanilla JavaScript
   ========================================================= */
(() => {
  "use strict";

  const $ = (selector, scope = document) => scope.querySelector(selector);   const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];

  function initHeader() {
    const header = $("#site-header");
    const menuToggle = $(".menu-toggle");
    const navPanel = $(".nav-panel");
    const dropdown = $(".has-dropdown");
    const dropdownToggle = $(".dropdown-toggle");      const updateHeader = () => header?.classList.toggle("scrolled", window.scrollY > 12);     updateHeader();     window.addEventListener("scroll", updateHeader, { passive: true });      const closeMenu = () => {       navPanel?.classList.remove("open");       menuToggle?.classList.remove("active");       menuToggle?.setAttribute("aria-expanded", "false");     };      menuToggle?.addEventListener("click", () => {       if (!navPanel) return;       const isOpen = navPanel.classList.toggle("open");       menuToggle.classList.toggle("active", isOpen);       menuToggle.setAttribute("aria-expanded", String(isOpen));     });      dropdownToggle?.addEventListener("click", (event) => {       if (window.innerWidth <= 820 && dropdown) {         event.preventDefault();         const open = dropdown.classList.toggle("open");         dropdownToggle.setAttribute("aria-expanded", String(open));       }     });      $$(".nav-panel a").forEach(link => link.addEventListener("click", closeMenu));

    document.addEventListener("click", (event) => {
      if (
        window.innerWidth <= 820 &&
        navPanel?.classList.contains("open") &&
        !navPanel.contains(event.target) &&
        !menuToggle?.contains(event.target)
      ) {
        closeMenu();
      }
    });
  }
 function initSmoothScroll() {
    $$('a[href^="#"]').forEach(link => {
      link.addEventListener("click", (event) => {
        const targetId = link.getAttribute("href");
        if (!targetId || targetId === "#") return;
        const target = document.querySelector(targetId);
        if (!target) return;
        event.preventDefault();
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    });
  }

  function initReveal() {
    const elements = $$(".reveal, .reveal-left, .reveal-right");

    if (!("IntersectionObserver" in window)) {
      elements.forEach(el => el.classList.add("is-visible"));
      return;
    }

    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px" });

    elements.forEach(el => observer.observe(el));
  }

  function showToast(message) {
    const toast = $("#toast");     if (!toast) return;     toast.textContent = message;     toast.classList.add("show");     window.clearTimeout(showToast.timer);     showToast.timer = window.setTimeout(() => toast.classList.remove("show"), 2600);   }    async function copyText(text) {     try {       await navigator.clipboard.writeText(text);       showToast("Account number copied!");     } catch {       const temp = document.createElement("textarea");       temp.value = text;       document.body.appendChild(temp);       temp.select();       document.execCommand("copy");       temp.remove();       showToast("Account number copied!");     }   }    function initCopyAccount() {     $$(".copy-btn").forEach(button => {
      button.addEventListener("click", () => copyText(button.dataset.copy || ""));
    });
  }

  function initCarousel() {
    const carousel = $("[data-carousel]");
    if (!carousel) return;
    const track = $(".carousel-track", carousel);     const slides = $$(".impact-slide", carousel);
    const prev = $(".prev", carousel);
    const next = $(".next", carousel);
    const dots = $(".carousel-dots", carousel);

    if (!slides.length || !track) return;

    let index = 0;
    let timer;
    let startX = 0;

    if (dots) {
      dots.innerHTML = "";
      slides.forEach((_, i) => {
        const dot = document.createElement("button");
        dot.type = "button";
        dot.setAttribute("aria-label", `Go to impact story ${i + 1}`);
        dot.addEventListener("click", () => goTo(i));
        dots.appendChild(dot);
      });
    }

    const goTo = (nextIndex) => {
      index = (nextIndex + slides.length) % slides.length;
      track.style.transform = `translateX(-${index * 100}%)`;
      if (dots) {
        $$("button", dots).forEach((dot, i) => dot.classList.toggle("active", i === index));
      }
    };

    const stop = () => window.clearInterval(timer);
    const start = () => {
      stop();
      if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        timer = window.setInterval(() => goTo(index + 1), 5500);
      }
    };

    prev?.addEventListener("click", () => { goTo(index - 1); start(); });
    next?.addEventListener("click", () => { goTo(index + 1); start(); });
    carousel.addEventListener("mouseenter", stop);
    carousel.addEventListener("mouseleave", start);
    carousel.addEventListener("focusin", stop);
    carousel.addEventListener("focusout", start);
    carousel.addEventListener("touchstart", e => { startX = e.changedTouches[0].screenX; stop(); }, { passive: true });
    carousel.addEventListener("touchend", e => {
      const distance = e.changedTouches[0].screenX - startX;
      if (Math.abs(distance) > 45) goTo(index + (distance < 0 ? 1 : -1));
      start();
    }, { passive: true });

    goTo(0);
    start();
  }

  function initContactForm() {
    const form = $("#contact-form");
    if (!form) return;
    const status = $("#form-status");     const fields = $$("input, textarea", form);

    const setError = (field, message) => {
      const group = field.closest(".form-group");
      const error = group ? $(".field-error", group) : null;
      field.classList.toggle("invalid", Boolean(message));
      if (error) error.textContent = message;
    };

    fields.forEach(field => {
      field.addEventListener("input", () => setError(field, ""));
    });

    form.addEventListener("submit", async event => {
      event.preventDefault();
      let valid = true;

      fields.forEach(field => {
        const value = field.value.trim();
        let message = "";
        if (!value) message = "This field is required.";
        else if (field.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) message = "Enter a valid email address.";
        else if (field.type === "tel" && !/^[0-9+\s()-]{7,}$/.test(value)) message = "Enter a valid phone number.";
        setError(field, message);
        if (message) valid = false;
      });

      if (!valid) {
        if (status) {
          status.className = "form-status error";
          status.textContent = "Please correct the highlighted fields and try again.";
        }
        return;
      }

      if (status) {
        status.className = "form-status info";
        status.textContent = "Sending your message...";
      }

      const formData = new FormData(form);

      try {
        const response = await fetch("https://api.web3forms.com/submit", {
          method: "POST",
          body: formData
        });

        const result = await response.json();

        if (result.success) {
          if (status) {
            status.className = "form-status success";
            status.textContent = "Thank you! Your enquiry has been sent successfully.";
          }
          form.reset();
        } else {
          if (status) {
            status.className = "form-status error";
            status.textContent = result.message || "Failed to send email. Please try again.";
          }
        }
      } catch (err) {
        console.error("Submission error:", err);
        if (status) {
          status.className = "form-status error";
          status.textContent = "Something went wrong. Please check your internet connection.";
        }
      }
    });
  }

  function initHeroHover() {
    const heroBg = $(".hero-bg");     if (!heroBg) return;     heroBg.setAttribute("role", "img");     heroBg.setAttribute("aria-label", "Fellowship hero image placeholder");   }    function initCampingHover() {     $$(".camp-photo").forEach(card => {
      card.addEventListener("mouseenter", () => card.classList.add("hovered"));
      card.addEventListener("mouseleave", () => card.classList.remove("hovered"));
    });
  }

  function setCurrentYear() {
    const year = $("#current-year");
    if (year) year.textContent = new Date().getFullYear();
  }

  function init() {
    initHeader();
    initSmoothScroll();
    initReveal();
    initCopyAccount();
    initCarousel();
    initContactForm();
    initHeroHover();
    initCampingHover();
    setCurrentYear();
  }

  document.addEventListener("DOMContentLoaded", init);
})();