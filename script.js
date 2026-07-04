(function () {
  const slides = Array.from(document.querySelectorAll(".deck-slide"));
  const dots = Array.from(document.querySelectorAll("[data-slide-target]"));
  const navLinks = Array.from(document.querySelectorAll("[data-slide-link]"));
  const progressFill = document.querySelector(".progress-fill");
  const loader = document.querySelector(".loader");
  const cursorGlow = document.querySelector(".cursor-glow");
  const heroGrid = document.querySelector(".hero-grid");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const compactViewport = window.matchMedia("(max-width: 991px)");
  let activeIndex = 0;
  let wheelLocked = false;
  let touchStartY = 0;

  const setRevealIndexes = () => {
    slides.forEach((slide) => {
      slide.querySelectorAll(".reveal-item").forEach((item, index) => {
        item.style.setProperty("--reveal-index", index);
      });
    });
  };

  const setActiveSlide = (index) => {
    activeIndex = Math.max(0, Math.min(index, slides.length - 1));
    slides.forEach((slide, slideIndex) => {
      slide.classList.toggle("active", slideIndex === activeIndex);
    });
    document.querySelectorAll(".dot").forEach((dot) => {
      dot.classList.toggle("is-active", Number(dot.dataset.slideTarget) === activeIndex);
    });
    navLinks.forEach((link) => {
      link.classList.toggle("active", Number(link.dataset.slideLink) === activeIndex);
    });
    if (progressFill) {
      const progress = slides.length > 1 ? (activeIndex / (slides.length - 1)) * 100 : 100;
      progressFill.style.width = `${progress}%`;
    }
  };

  const goToSlide = (index) => {
    const target = slides[index];
    if (!target) return;
    setActiveSlide(index);
    target.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "start" });
  };

  const initIntersectionObserver = () => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = slides.indexOf(entry.target);
            setActiveSlide(index);
          }
        });
      },
      { threshold: 0.58 }
    );

    slides.forEach((slide) => observer.observe(slide));

    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
          }
        });
      },
      { threshold: 0.2 }
    );

    document.querySelectorAll(".reveal-item").forEach((item) => revealObserver.observe(item));
  };

  const initNavigation = () => {
    dots.forEach((control) => {
      control.addEventListener("click", () => {
        const index = Number(control.dataset.slideTarget);
        goToSlide(index);
      });
    });

    navLinks.forEach((link) => {
      link.addEventListener("click", (event) => {
        event.preventDefault();
        const index = Number(link.dataset.slideLink);
        goToSlide(index);
        const openMenu = document.querySelector(".navbar-collapse.show");
        if (openMenu && window.bootstrap) {
          window.bootstrap.Collapse.getOrCreateInstance(openMenu).hide();
        }
      });
    });

    window.addEventListener(
      "wheel",
      (event) => {
        if (compactViewport.matches) return;
        if (Math.abs(event.deltaY) < 26 || wheelLocked) return;
        event.preventDefault();
        const direction = event.deltaY > 0 ? 1 : -1;
        goToSlide(activeIndex + direction);
        wheelLocked = true;
        window.setTimeout(() => {
          wheelLocked = false;
        }, 850);
      },
      { passive: false }
    );

    window.addEventListener("keydown", (event) => {
      const tag = document.activeElement ? document.activeElement.tagName.toLowerCase() : "";
      if (["input", "textarea", "select"].includes(tag)) return;
      if (event.key === "ArrowDown" || event.key === "PageDown") {
        event.preventDefault();
        goToSlide(activeIndex + 1);
      }
      if (event.key === "ArrowUp" || event.key === "PageUp") {
        event.preventDefault();
        goToSlide(activeIndex - 1);
      }
      if (event.key === "Home") {
        event.preventDefault();
        goToSlide(0);
      }
      if (event.key === "End") {
        event.preventDefault();
        goToSlide(slides.length - 1);
      }
    });

    window.addEventListener(
      "touchstart",
      (event) => {
        if (compactViewport.matches) return;
        touchStartY = event.changedTouches[0].clientY;
      },
      { passive: true }
    );

    window.addEventListener(
      "touchend",
      (event) => {
        if (compactViewport.matches) return;
        const touchEndY = event.changedTouches[0].clientY;
        const delta = touchStartY - touchEndY;
        if (Math.abs(delta) > 54) {
          goToSlide(activeIndex + (delta > 0 ? 1 : -1));
        }
      },
      { passive: true }
    );
  };

  const initTyping = () => {
    const target = document.querySelector(".typed-role");
    if (!target) return;
    const text = target.dataset.text || "";
    if (reducedMotion) {
      target.textContent = text;
      return;
    }
    let index = 0;
    const type = () => {
      target.textContent = text.slice(0, index);
      index += 1;
      if (index <= text.length) {
        window.setTimeout(type, 42);
      }
    };
    window.setTimeout(type, 850);
  };

  const initMotionInteractions = () => {
    if (reducedMotion) return;

    document.querySelectorAll(".magnetic-btn").forEach((button) => {
      button.addEventListener("mousemove", (event) => {
        const rect = button.getBoundingClientRect();
        const x = event.clientX - rect.left - rect.width / 2;
        const y = event.clientY - rect.top - rect.height / 2;
        button.style.transform = `translate3d(${x * 0.12}px, ${y * 0.18}px, 0)`;
      });
      button.addEventListener("mouseleave", () => {
        button.style.transform = "";
      });
    });

    document.querySelectorAll(".tilt-card").forEach((card) => {
      card.addEventListener("mousemove", (event) => {
        const rect = card.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        const rotateY = ((x / rect.width) - 0.5) * 7;
        const rotateX = ((y / rect.height) - 0.5) * -7;
        card.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-2px)`;
      });
      card.addEventListener("mouseleave", () => {
        card.style.transform = "";
      });
    });

    window.addEventListener("pointermove", (event) => {
      if (cursorGlow) {
        cursorGlow.classList.add("is-visible");
        cursorGlow.style.left = `${event.clientX}px`;
        cursorGlow.style.top = `${event.clientY}px`;
      }
      if (heroGrid) {
        const x = (event.clientX / window.innerWidth - 0.5) * 18;
        const y = (event.clientY / window.innerHeight - 0.5) * 18;
        heroGrid.style.setProperty("--grid-x", `${x}px`);
        heroGrid.style.setProperty("--grid-y", `${y}px`);
      }
    });
  };

  const initProjects = () => {
    if (!window.Swiper) return;
    new window.Swiper(".project-swiper", {
      slidesPerView: 1,
      spaceBetween: 18,
      loop: false,
      rewind: true,
      autoplay: {
        delay: 3200,
        disableOnInteraction: false,
        pauseOnMouseEnter: true
      },
      keyboard: {
        enabled: true,
        onlyInViewport: true
      },
      pagination: {
        el: ".swiper-pagination",
        clickable: true
      },
      navigation: {
        nextEl: ".project-next",
        prevEl: ".project-prev"
      },
      breakpoints: {
        768: {
          slidesPerView: 2
        },
        1200: {
          slidesPerView: 3
        }
      }
    });
  };

  const initContactForm = () => {
    const form = document.querySelector("#contactForm");
    if (!form) return;
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const data = new FormData(form);
      const name = data.get("name");
      const email = data.get("email");
      const message = data.get("message");
      const subject = encodeURIComponent(`Portfolio Inquiry from ${name}`);
      const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\n${message}`);
      window.location.href = `mailto:zainshabbir787878@gmail.com?subject=${subject}&body=${body}`;
    });
  };

  const initPlaceholderLinks = () => {
    document.querySelectorAll('.social-row a[href="#"]').forEach((link) => {
      link.addEventListener("click", (event) => event.preventDefault());
    });
  };

  const initLoader = () => {
    window.setTimeout(() => {
      if (loader) loader.classList.add("is-hidden");
    }, 650);
  };

  document.addEventListener("DOMContentLoaded", () => {
    setRevealIndexes();
    setActiveSlide(0);
    initNavigation();
    initIntersectionObserver();
    initTyping();
    initMotionInteractions();
    initProjects();
    initContactForm();
    initPlaceholderLinks();
    initLoader();
    if (window.lucide) {
      window.lucide.createIcons();
    }
  });
})();
