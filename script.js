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
  }
});
