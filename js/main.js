(function () {
  "use strict";

  // Mobile navigation toggle
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.querySelector(".main-nav");

  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var isOpen = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });

    nav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        nav.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  // Sticky header shadow on scroll
  var header = document.querySelector(".site-header");
  if (header) {
    var onScroll = function () {
      header.classList.toggle("is-scrolled", window.scrollY > 8);
    };
    document.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  // Reveal-on-scroll animation (progressive enhancement: content is visible
  // by default via CSS; only hidden once .js-ready flips it, and always
  // force-shown after a short timeout as a safety net).
  var revealEls = document.querySelectorAll(".reveal");
  if (revealEls.length && "IntersectionObserver" in window) {
    document.documentElement.classList.add("js-ready");

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -10% 0px" }
    );
    revealEls.forEach(function (el) {
      observer.observe(el);
    });

    // Safety net: never leave content permanently hidden.
    window.setTimeout(function () {
      revealEls.forEach(function (el) {
        el.classList.add("is-visible");
      });
    }, 2500);
  }

  // Contact form -> mailto handoff
  var form = document.querySelector("#contact-form");
  if (form) {
    var status = form.querySelector(".form-status");

    form.addEventListener("submit", function (event) {
      event.preventDefault();

      var name = form.querySelector("#name").value.trim();
      var phone = form.querySelector("#phone").value.trim();
      var email = form.querySelector("#email").value.trim();
      var service = form.querySelector("#service").value;
      var message = form.querySelector("#message").value.trim();

      if (!name || !phone || !message) {
        showStatus("error", "Merci de renseigner au minimum votre nom, votre téléphone et votre message.");
        return;
      }

      var subject = "Demande de devis - " + (service || "Site web");
      var bodyLines = [
        "Nom : " + name,
        "Téléphone : " + phone,
        "Email : " + (email || "non renseigné"),
        "Service concerné : " + (service || "non précisé"),
        "",
        "Message :",
        message,
      ];

      var mailto =
        "mailto:Lmplomberie.contact@gmail.com" +
        "?subject=" + encodeURIComponent(subject) +
        "&body=" + encodeURIComponent(bodyLines.join("\n"));

      window.location.href = mailto;
      showStatus("success", "Votre messagerie va s'ouvrir avec votre demande pré-remplie. Vous pouvez aussi nous appeler directement.");
    });

    function showStatus(type, text) {
      status.textContent = text;
      status.classList.remove("success", "error");
      status.classList.add("visible", type);
    }
  }

  // Footer year
  var yearEl = document.querySelector("#current-year");
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }
})();
