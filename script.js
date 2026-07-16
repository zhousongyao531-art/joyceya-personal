const video = document.querySelector(".hero-video");
const header = document.querySelector("[data-header]");
const menuToggle = document.querySelector("[data-menu-toggle]");
const navMenu = document.querySelector("[data-nav-menu]");
const revealItems = document.querySelectorAll(".reveal");
const languageSwitchers = document.querySelectorAll("[data-language-switcher]");
const photoGalleries = document.querySelectorAll("[data-photo-gallery]");
const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

if (video) {
  const fadeDuration = 0.5;
  let rafId = null;

  const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

  const setOpacityForFrame = () => {
    if (!video.duration || Number.isNaN(video.duration)) {
      video.style.opacity = "0";
      rafId = requestAnimationFrame(setOpacityForFrame);
      return;
    }

    const current = video.currentTime;
    const remaining = video.duration - current;
    const fadeIn = clamp(current / fadeDuration, 0, 1);
    const fadeOut = clamp(remaining / fadeDuration, 0, 1);
    video.style.opacity = String(Math.min(fadeIn, fadeOut));

    if (!video.paused && !video.ended) {
      rafId = requestAnimationFrame(setOpacityForFrame);
    }
  };

  const playFromStart = () => {
    video.currentTime = 0;
    video.style.opacity = "0";
    const playPromise = video.play();

    if (playPromise) {
      playPromise
        .then(() => {
          cancelAnimationFrame(rafId);
          rafId = requestAnimationFrame(setOpacityForFrame);
        })
        .catch(() => {
          video.style.opacity = "0";
        });
    }
  };

  video.addEventListener("loadedmetadata", playFromStart, { once: true });

  video.addEventListener("play", () => {
    cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(setOpacityForFrame);
  });

  video.addEventListener("ended", () => {
    cancelAnimationFrame(rafId);
    video.style.opacity = "0";
    window.setTimeout(playFromStart, 100);
  });

  if (video.readyState >= 1) {
    playFromStart();
  }
}

const syncHeaderState = () => {
  if (!header) return;
  header.classList.toggle("is-scrolled", window.scrollY > 12);
};

syncHeaderState();
window.addEventListener("scroll", syncHeaderState, { passive: true });

const closeMenu = () => {
  if (!menuToggle || !navMenu) return;
  menuToggle.setAttribute("aria-expanded", "false");
  menuToggle.setAttribute("aria-label", "Open navigation menu");
  navMenu.classList.remove("is-open");
  document.body.classList.remove("menu-open");
};

if (menuToggle && navMenu) {
  menuToggle.addEventListener("click", () => {
    const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
    menuToggle.setAttribute("aria-expanded", String(!isOpen));
    menuToggle.setAttribute("aria-label", isOpen ? "Open navigation menu" : "Close navigation menu");
    navMenu.classList.toggle("is-open", !isOpen);
    document.body.classList.toggle("menu-open", !isOpen);
  });

  navMenu.addEventListener("click", (event) => {
    const target = event.target;
    if (target instanceof HTMLAnchorElement) {
      closeMenu();
    }
  });

  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeMenu();
    }
  });
}

languageSwitchers.forEach((switcher) => {
  const buttons = switcher.querySelectorAll("[data-language-button]");
  const panels = switcher.querySelectorAll("[data-language-panel]");

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      const language = button.getAttribute("data-language-button");

      buttons.forEach((item) => {
        item.classList.toggle("is-active", item === button);
      });

      panels.forEach((panel) => {
        panel.hidden = panel.getAttribute("data-language-panel") !== language;
      });
    });
  });
});

photoGalleries.forEach((gallery) => {
  const mainImage = gallery.querySelector("[data-photo-main]");
  const title = gallery.querySelector("[data-photo-title]");
  const caption = gallery.querySelector("[data-photo-caption]");
  const counter = gallery.querySelector("[data-photo-counter]");
  const items = Array.from(gallery.querySelectorAll("[data-photo-src]"));
  const orbitSlots = {
    "-2": { x: "-400px", y: "150px", r: "-14deg", s: "0.74" },
    "-1": { x: "-210px", y: "52px", r: "-7deg", s: "0.86" },
    "0": { x: "0px", y: "10px", r: "0deg", s: "0.96" },
    "1": { x: "210px", y: "52px", r: "7deg", s: "0.86" },
    "2": { x: "400px", y: "150px", r: "14deg", s: "0.74" },
  };

  if (!mainImage || !title || !caption || !counter) return;

  const setOrbitPosition = (activeIndex) => {
    const midpoint = Math.floor(items.length / 2);

    items.forEach((item, index) => {
      let offset = index - activeIndex;

      if (offset > midpoint) offset -= items.length;
      if (offset < -midpoint) offset += items.length;

      const slot = orbitSlots[String(offset)] || orbitSlots["0"];
      item.style.setProperty("--x", slot.x);
      item.style.setProperty("--y", slot.y);
      item.style.setProperty("--r", slot.r);
      item.style.setProperty("--s", slot.s);
    });
  };

  const setActivePhoto = (item, activeIndex) => {
    mainImage.setAttribute("src", item.getAttribute("data-photo-src"));
    mainImage.setAttribute("alt", item.getAttribute("data-photo-alt"));
    title.textContent = item.getAttribute("data-photo-title");
    caption.textContent = item.getAttribute("data-photo-caption");
    counter.textContent = item.getAttribute("data-photo-counter");
    setOrbitPosition(activeIndex);

    items.forEach((button) => {
      button.classList.toggle("is-active", button === item);
    });
  };

  items.forEach((item, index) => {
    item.addEventListener("click", () => {
      setActivePhoto(item, index);
    });
  });

  setOrbitPosition(0);
});

if (reducedMotionQuery.matches) {
  revealItems.forEach((item) => item.classList.add("is-visible"));
} else if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    {
      rootMargin: "0px 0px -12% 0px",
      threshold: 0.14,
    }
  );

  revealItems.forEach((item) => observer.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add("is-visible"));
}
