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

  // Formulaire de devis multi-étapes -> passage vers la messagerie (mailto)
  var quote = document.querySelector("#quote-form");
  if (quote) {
    var qStatus = quote.querySelector(".form-status");
    var steps = Array.prototype.slice.call(quote.querySelectorAll(".quote-step"));
    var fill = quote.querySelector(".quote-progress-fill");
    var labels = Array.prototype.slice.call(quote.querySelectorAll(".quote-steps-labels span"));
    var btnPrev = quote.querySelector(".quote-prev");
    var btnNext = quote.querySelector(".quote-next");
    var btnSubmit = quote.querySelector(".quote-submit");
    var urgentNote = quote.querySelector(".quote-urgent-note");
    var recap = quote.querySelector(".quote-recap");
    var currentStep = 1;
    var total = steps.length;

    var qval = function (name) {
      var el = quote.querySelector("[name='" + name + "']:checked") || quote.querySelector("[name='" + name + "']");
      return el ? el.value.trim() : "";
    };

    var showError = function (key, on) {
      var e = quote.querySelector("[data-error='" + key + "']");
      if (e) e.classList.toggle("is-visible", !!on);
    };

    var validateStep = function (n) {
      if (n === 1) {
        var ok = !!quote.querySelector("[name='service']:checked");
        showError("service", !ok);
        return ok;
      }
      if (n === 2) {
        var okU = !!quote.querySelector("[name='urgence']:checked");
        var okM = quote.querySelector("#message").value.trim().length > 2;
        showError("urgence", !okU);
        showError("message", !okM);
        return okU && okM;
      }
      if (n === 3) {
        var okN = quote.querySelector("#name").value.trim() && quote.querySelector("#phone").value.trim();
        showError("coordonnees", !okN);
        return !!okN;
      }
      return true;
    };

    var renderStep = function () {
      steps.forEach(function (s) {
        s.classList.toggle("is-active", parseInt(s.getAttribute("data-step"), 10) === currentStep);
      });
      labels.forEach(function (l, i) {
        l.classList.toggle("is-current", i + 1 === currentStep);
        l.classList.toggle("is-done", i + 1 < currentStep);
      });
      if (fill) fill.style.width = ((currentStep - 1) / (total - 1)) * 100 + "%";
      btnPrev.hidden = currentStep === 1;
      btnNext.hidden = currentStep === total;
      btnSubmit.hidden = currentStep !== total;
      if (currentStep === total) buildRecap();
      var focusable = steps[currentStep - 1].querySelector("input, textarea, button");
      if (focusable) focusable.focus();
    };

    var buildRecap = function () {
      if (!recap) return;
      var rows = [
        ["Besoin", qval("service")],
        ["Urgence", qval("urgence")],
        ["Ville", quote.querySelector("#ville").value.trim() || "—"],
      ];
      recap.innerHTML =
        '<span class="quote-recap-title">Récapitulatif</span>' +
        rows
          .map(function (r) {
            return '<span class="quote-recap-row"><em>' + r[0] + "</em><strong>" + (r[1] || "—") + "</strong></span>";
          })
          .join("");
    };

    // Affiche la note « appelez-nous » si urgence immédiate
    quote.addEventListener("change", function (e) {
      if (e.target.name === "urgence" && urgentNote) {
        urgentNote.hidden = e.target.value !== "Urgence immédiate";
      }
      if (e.target.name === "service") showError("service", false);
    });

    btnNext.addEventListener("click", function () {
      if (!validateStep(currentStep)) return;
      if (currentStep < total) {
        currentStep++;
        renderStep();
      }
    });

    btnPrev.addEventListener("click", function () {
      if (currentStep > 1) {
        currentStep--;
        renderStep();
      }
    });

    quote.addEventListener("submit", function (event) {
      event.preventDefault();
      if (!validateStep(3)) return;

      var name = quote.querySelector("#name").value.trim();
      var phone = quote.querySelector("#phone").value.trim();
      var email = quote.querySelector("#email").value.trim();
      var ville = quote.querySelector("#ville").value.trim();
      var service = qval("service");
      var urgence = qval("urgence");
      var message = quote.querySelector("#message").value.trim();

      var subject = "Demande de devis - " + (service || "Site web");
      var bodyLines = [
        "Nom : " + name,
        "Téléphone : " + phone,
        "Email : " + (email || "non renseigné"),
        "Ville : " + (ville || "non renseignée"),
        "Besoin : " + (service || "non précisé"),
        "Urgence : " + (urgence || "non précisée"),
        "",
        "Message :",
        message,
      ];

      var mailto =
        "mailto:Lmplomberie.contact@gmail.com" +
        "?subject=" + encodeURIComponent(subject) +
        "&body=" + encodeURIComponent(bodyLines.join("\n"));

      window.location.href = mailto;
      qStatus.textContent =
        "Votre messagerie va s'ouvrir avec votre demande pré-remplie. Vous pouvez aussi nous appeler directement au 06 24 63 08 54.";
      qStatus.classList.remove("error");
      qStatus.classList.add("visible", "success");

      if (typeof gtag === "function") {
        gtag("event", "generate_lead", { form_id: "quote-form", service: service || "non précisé" });
      }
    });

    renderStep();
  }

  // Suivi Google Analytics : appels téléphoniques et WhatsApp (mesure des conversions réelles)
  if (typeof gtag === "function") {
    var callZone = function (link) {
      if (link.closest(".sticky-cta-bar")) return "barre_mobile";
      if (link.closest(".topbar")) return "bandeau_haut";
      if (link.closest(".hero-phone, .hero-actions")) return "hero_accueil";
      if (link.closest(".site-footer")) return "pied_de_page";
      if (link.closest(".cta-banner")) return "bandeau_cta";
      return "autre";
    };
    document.querySelectorAll('a[href^="tel:"]').forEach(function (link) {
      link.addEventListener("click", function () {
        gtag("event", "phone_call_click", { call_zone: callZone(link), page_path: window.location.pathname });
      });
    });
    document.querySelectorAll('a.whatsapp-fab, a[href*="wa.me"]').forEach(function (link) {
      link.addEventListener("click", function () {
        gtag("event", "whatsapp_click", { page_path: window.location.pathname });
      });
    });
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

  // Lightbox de la galerie « Nos réalisations »
  var lightbox = document.querySelector("#lightbox");
  var galleryItems = Array.prototype.slice.call(document.querySelectorAll(".gallery-item[data-full]"));
  if (lightbox && galleryItems.length) {
    var lbImg = lightbox.querySelector("#lb-img");
    var lbCap = lightbox.querySelector("#lb-cap");
    var lbCounter = lightbox.querySelector("#lb-counter");
    var btnClose = lightbox.querySelector(".lb-close");
    var btnPrev = lightbox.querySelector(".lb-prev");
    var btnNext = lightbox.querySelector(".lb-next");
    var current = 0;
    var lastFocused = null;

    var render = function () {
      var item = galleryItems[current];
      lbImg.src = item.getAttribute("data-full");
      lbImg.alt = item.getAttribute("aria-label") || "";
      lbCap.textContent = item.getAttribute("data-caption") || "";
      lbCounter.textContent = current + 1 + " / " + galleryItems.length;
      // relance l'animation de zoom à chaque changement
      lbImg.style.animation = "none";
      void lbImg.offsetWidth;
      lbImg.style.animation = "";
    };

    var openAt = function (i) {
      current = i;
      lastFocused = document.activeElement;
      lightbox.hidden = false;
      lightbox.classList.add("is-open");
      document.body.style.overflow = "hidden";
      render();
      btnNext.focus();
    };

    var close = function () {
      lightbox.classList.remove("is-open");
      lightbox.hidden = true;
      document.body.style.overflow = "";
      if (lastFocused && lastFocused.focus) lastFocused.focus();
    };

    var step = function (dir) {
      current = (current + dir + galleryItems.length) % galleryItems.length;
      render();
    };

    galleryItems.forEach(function (item, i) {
      item.addEventListener("click", function () {
        openAt(i);
      });
    });

    btnClose.addEventListener("click", close);
    btnPrev.addEventListener("click", function () {
      step(-1);
    });
    btnNext.addEventListener("click", function () {
      step(1);
    });
    lightbox.addEventListener("click", function (e) {
      if (e.target === lightbox) close();
    });
    document.addEventListener("keydown", function (e) {
      if (lightbox.hidden) return;
      if (e.key === "Escape") close();
      else if (e.key === "ArrowLeft") step(-1);
      else if (e.key === "ArrowRight") step(1);
    });
  }
})();
