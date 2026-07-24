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
  var prefersReduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var revealEls = document.querySelectorAll(".reveal");
  if (revealEls.length && "IntersectionObserver" in window) {
    document.documentElement.classList.add("js-ready");

    // Décalage progressif : les éléments d'un même groupe apparaissent l'un
    // après l'autre pour un effet en cascade plus vivant.
    if (!prefersReduced) {
      revealEls.forEach(function (el) {
        var parent = el.parentElement;
        if (!parent) return;
        var siblings = Array.prototype.filter.call(parent.children, function (c) {
          return c.classList && c.classList.contains("reveal");
        });
        if (siblings.length > 1) {
          var i = siblings.indexOf(el);
          if (i > 0) el.style.setProperty("--reveal-delay", (i * 0.09).toFixed(2) + "s");
        }
      });
    }

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

  // Flottement continu de la photo du hero après son entrée
  var heroPhoto = document.querySelector(".hero-photo");
  if (heroPhoto && !prefersReduced) {
    heroPhoto.addEventListener("animationend", function onEnter(e) {
      if (e.animationName === "heroIn") {
        heroPhoto.classList.add("is-floating");
        heroPhoto.removeEventListener("animationend", onEnter);
      }
    });
    // Filet de sécurité si l'événement ne se déclenche pas
    window.setTimeout(function () {
      heroPhoto.classList.add("is-floating");
    }, 1500);
  }

  // Compteurs animés (chiffres clés + note Google)
  var counters = document.querySelectorAll("[data-count]");
  if (counters.length) {
    var animateCount = function (el) {
      var raw = el.getAttribute("data-count");
      var m = raw.match(/^([^\d]*)([\d]+(?:[.,]\d+)?)(.*)$/);
      if (!m) {
        el.textContent = raw;
        return;
      }
      var prefix = m[1] || "";
      var numStr = m[2];
      var suffix = m[3] || "";
      var decimals = /[.,]/.test(numStr) ? 1 : 0;
      var sep = numStr.indexOf(",") !== -1 ? "," : ".";
      var target = parseFloat(numStr.replace(",", "."));
      if (prefersReduced) {
        el.textContent = raw;
        return;
      }
      var duration = 1200;
      var start = null;
      var step = function (ts) {
        if (start === null) start = ts;
        var p = Math.min((ts - start) / duration, 1);
        var eased = 1 - Math.pow(1 - p, 3);
        var val = (target * eased).toFixed(decimals);
        if (decimals === 1) val = val.replace(".", sep);
        el.textContent = prefix + val + suffix;
        if (p < 1) window.requestAnimationFrame(step);
        else el.textContent = raw;
      };
      window.requestAnimationFrame(step);
    };

    if ("IntersectionObserver" in window) {
      var cObs = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              entry.target.classList.add("counting");
              animateCount(entry.target);
              cObs.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.5 }
      );
      counters.forEach(function (el) {
        cObs.observe(el);
      });
    } else {
      counters.forEach(function (el) {
        el.textContent = el.getAttribute("data-count");
      });
    }
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

  // FAQ accordion
  document.querySelectorAll(".faq-item").forEach(function (item) {
    var question = item.querySelector(".faq-question");
    var answer = item.querySelector(".faq-answer");

    question.addEventListener("click", function () {
      var isOpen = item.classList.contains("is-open");

      document.querySelectorAll(".faq-item.is-open").forEach(function (openItem) {
        if (openItem !== item) {
          openItem.classList.remove("is-open");
          openItem.querySelector(".faq-answer").style.maxHeight = null;
          openItem.querySelector(".faq-question").setAttribute("aria-expanded", "false");
        }
      });

      if (isOpen) {
        item.classList.remove("is-open");
        answer.style.maxHeight = null;
        question.setAttribute("aria-expanded", "false");
      } else {
        item.classList.add("is-open");
        answer.style.maxHeight = answer.scrollHeight + "px";
        question.setAttribute("aria-expanded", "true");
      }
    });
  });

  // Footer year
  var yearEl = document.querySelector("#current-year");
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }
})();
