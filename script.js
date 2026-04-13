const SITE_CONFIG = {
  formEndpoint: "https://script.google.com/macros/s/AKfycbz2L32kQj6Z993D00galU43E-3Uio_iTI_wGd-Fk5kXaPBUhbyNfMxPShx3auBAPx0G/exec",
  musicUrl: "assets/love-theme.mp3"
};

const audioElement = document.getElementById("weddingAudio");
const audioToggle = document.getElementById("audioToggle");
const rsvpForm = document.getElementById("rsvpForm");
const formStatus = document.getElementById("formStatus");
const rsvpContent = document.getElementById("rsvpContent");
const rsvpSuccess = document.getElementById("rsvpSuccess");
const rsvpSuccessText = document.getElementById("rsvpSuccessText");
const formStartedAtField = document.getElementById("formStartedAt");
const honeypotField = document.getElementById("guestWebsite");
const MIN_FORM_COMPLETION_MS = 2500;
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

if (formStartedAtField) {
  formStartedAtField.value = String(Date.now());
}

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const setupRevealAnimations = () => {
  const revealTargets = [
    ...document.querySelectorAll("main > .card"),
    ...document.querySelectorAll(".grid-two > .card"),
    ...document.querySelectorAll(".timeline__item"),
    ...document.querySelectorAll(".rsvp__meta-card"),
    ...document.querySelectorAll(".choice-card"),
    ...document.querySelectorAll(".hero__content > *")
  ];

  const uniqueTargets = [...new Set(revealTargets)];

  uniqueTargets.forEach((element, index) => {
    element.classList.add("reveal-scroll");
    element.style.setProperty("--reveal-delay", `${(index % 4) * 70}ms`);
  });

  if (prefersReducedMotion.matches) {
    uniqueTargets.forEach((element) => {
      element.classList.add("is-visible");
    });
    return;
  }

  if (!("IntersectionObserver" in window)) {
    uniqueTargets.forEach((element) => {
      element.classList.add("is-visible");
    });
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    {
      threshold: 0.16,
      rootMargin: "0px 0px -8% 0px"
    }
  );

  uniqueTargets.forEach((element) => {
    observer.observe(element);
  });
};

const setupScrollEffects = () => {
  if (prefersReducedMotion.matches) {
    return;
  }

  const hero = document.querySelector(".hero");
  const heroSun = document.querySelector(".hero__sun");
  const heroPalmLeft = document.querySelector(".hero__palms--left");
  const heroPalmRight = document.querySelector(".hero__palms--right");
  const heroWave = document.querySelector(".hero__wave");
  const photoCards = [...document.querySelectorAll(".card--photo")];
  const rsvpSection = document.querySelector(".rsvp");

  const updateScrollEffects = () => {
    const viewportHeight = window.innerHeight || 1;
    const viewportCenter = viewportHeight / 2;

    if (hero && heroSun && heroPalmLeft && heroPalmRight && heroWave) {
      const heroRect = hero.getBoundingClientRect();
      const heroProgress = clamp((viewportCenter - (heroRect.top + heroRect.height / 2)) / viewportHeight, -1, 1);
      const heroProximity = 1 - Math.abs(heroProgress);

      heroSun.style.setProperty("--hero-sun-shift", `${heroProgress * -30}px`);
      heroSun.style.setProperty("--hero-sun-scale", (1 + heroProximity * 0.1).toFixed(3));
      heroPalmLeft.style.setProperty("--hero-left-shift", `${heroProgress * 26}px`);
      heroPalmLeft.style.setProperty("--hero-left-scale", (1 + heroProximity * 0.05).toFixed(3));
      heroPalmRight.style.setProperty("--hero-right-shift", `${heroProgress * -22}px`);
      heroPalmRight.style.setProperty("--hero-right-scale", (1 + heroProximity * 0.04).toFixed(3));
      heroWave.style.setProperty("--hero-wave-shift", `${heroProgress * 16}px`);
    }

    photoCards.forEach((card) => {
      const rect = card.getBoundingClientRect();

      if (rect.bottom < -80 || rect.top > viewportHeight + 80) {
        return;
      }

      const progress = clamp((viewportCenter - (rect.top + rect.height / 2)) / viewportHeight, -1, 1);
      const proximity = 1 - Math.abs(progress);
      card.style.setProperty("--card-shift", `${progress * 24}px`);
      card.style.setProperty("--card-scale", (1.03 + proximity * 0.05).toFixed(3));
    });

    if (rsvpSection) {
      const rect = rsvpSection.getBoundingClientRect();
      const progress = clamp((viewportCenter - (rect.top + rect.height / 2)) / viewportHeight, -1, 1);
      const proximity = 1 - Math.abs(progress);
      rsvpSection.style.setProperty("--rsvp-shift", `${progress * 20}px`);
      rsvpSection.style.setProperty("--rsvp-scale", (1.02 + proximity * 0.035).toFixed(3));
    }
  };

  let ticking = false;

  const requestUpdate = () => {
    if (ticking) {
      return;
    }

    ticking = true;
    window.requestAnimationFrame(() => {
      updateScrollEffects();
      ticking = false;
    });
  };

  updateScrollEffects();
  window.addEventListener("scroll", requestUpdate, { passive: true });
  window.addEventListener("resize", requestUpdate);
};

if (SITE_CONFIG.musicUrl) {
  audioElement.src = SITE_CONFIG.musicUrl;
  audioElement.autoplay = true;
} else {
  audioToggle.setAttribute("aria-label", "Музыка скоро будет доступна");
}

let attemptedAutoplay = false;

const startAudio = async () => {
  if (!SITE_CONFIG.musicUrl) {
    return;
  }

  try {
    await audioElement.play();
    audioToggle.classList.add("is-playing");
    audioToggle.setAttribute("aria-label", "Выключить музыку");
  } catch (error) {
    audioToggle.classList.remove("is-playing");
    audioToggle.setAttribute("aria-label", "Включить музыку");
  }
};

window.addEventListener("DOMContentLoaded", async () => {
  setupRevealAnimations();
  setupScrollEffects();
  await startAudio();
});

window.addEventListener("load", async () => {
  if (!audioElement.paused) {
    return;
  }

  await startAudio();
});

audioElement.addEventListener("canplay", async () => {
  if (!audioElement.paused) {
    return;
  }

  await startAudio();
});

audioToggle.addEventListener("click", async () => {
  if (!SITE_CONFIG.musicUrl) {
    formStatus.textContent =
      "Для музыки осталось добавить ссылку на mp3-файл в script.js.";
    formStatus.className = "form-status";
    return;
  }

  if (audioElement.paused) {
    try {
      await audioElement.play();
      audioToggle.classList.add("is-playing");
      audioToggle.setAttribute("aria-label", "Выключить музыку");
    } catch (error) {
      formStatus.textContent = "Браузер не дал включить музыку автоматически.";
      formStatus.className = "form-status is-error";
    }
    return;
  }

  audioElement.pause();
  audioToggle.classList.remove("is-playing");
  audioToggle.setAttribute("aria-label", "Включить музыку");
});

["click", "touchstart", "scroll"].forEach((eventName) => {
  window.addEventListener(
    eventName,
    async () => {
      if (attemptedAutoplay || !audioElement.paused) {
        return;
      }

      attemptedAutoplay = true;
      await startAudio();
    },
    { once: true }
  );
});

audioElement.addEventListener("play", () => {
  audioToggle.classList.add("is-playing");
  audioToggle.setAttribute("aria-label", "Выключить музыку");
});

audioElement.addEventListener("pause", () => {
  audioToggle.classList.remove("is-playing");
  audioToggle.setAttribute("aria-label", "Включить музыку");
});

rsvpForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const submitButton = rsvpForm.querySelector("button[type='submit']");
  const name = document.getElementById("guestName").value.trim();
  const selectedAttendance = rsvpForm.querySelector("input[name='attendance']:checked");
  const attendance = selectedAttendance ? selectedAttendance.value : "";
  const requestId = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  const formStartedAt = Number(formStartedAtField?.value || 0);
  const fillDuration = formStartedAt ? Date.now() - formStartedAt : 0;

  if (honeypotField?.value.trim()) {
    formStatus.textContent = "Не удалось отправить ответ. Попробуйте еще раз чуть позже.";
    formStatus.className = "form-status is-error";
    return;
  }

  if (fillDuration > 0 && fillDuration < MIN_FORM_COMPLETION_MS) {
    formStatus.textContent = "Пожалуйста, попробуйте отправить форму еще раз через пару секунд.";
    formStatus.className = "form-status is-error";
    return;
  }

  if (!name || !attendance) {
    formStatus.textContent = "Пожалуйста, заполните имя и выберите вариант ответа.";
    formStatus.className = "form-status is-error";
    return;
  }

  if (!SITE_CONFIG.formEndpoint) {
    formStatus.textContent =
      "Форма готова. Чтобы ответы улетали в Google Sheets, добавим URL Google Apps Script в script.js.";
    formStatus.className = "form-status";
    return;
  }

  const payload = new URLSearchParams({
    name,
    attendance,
    referer: window.location.href,
    formid: "samui-rsvp-form",
    sent: new Date().toISOString(),
    requestid: requestId
  });

  submitButton.disabled = true;
  submitButton.textContent = "Отправляем...";
  formStatus.textContent = "Отправляем ваш ответ...";
  formStatus.className = "form-status";

  try {
    await fetch(SITE_CONFIG.formEndpoint, {
      method: "POST",
      mode: "no-cors",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8"
      },
      body: payload.toString()
    });

    rsvpForm.reset();
    rsvpContent.classList.add("is-hidden");
    rsvpSuccess.hidden = false;

    if (attendance === "Приду") {
      rsvpSuccessText.textContent =
        "Мы получили ваш ответ и будем очень рады разделить этот день вместе с вами.";
    } else if (attendance === "Приду с парой") {
      rsvpSuccessText.textContent =
        "Мы получили ваш ответ и будем счастливы видеть вас на нашем празднике вместе с парой.";
    } else {
      rsvpSuccessText.textContent =
        "Мы получили ваш ответ. Нам будет вас не хватать, но спасибо, что дали знать заранее.";
    }

    formStatus.textContent = "";
    formStatus.className = "form-status";
  } catch (error) {
    formStatus.textContent =
      "Не получилось отправить форму. Проверьте URL Google Apps Script и доступ к веб-приложению.";
    formStatus.className = "form-status is-error";
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = "Отправить ответ";

    if (formStartedAtField) {
      formStartedAtField.value = String(Date.now());
    }
  }
});
