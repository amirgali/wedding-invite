const SITE_CONFIG = {
  formEndpoint: "",
  musicUrl: "assets/love-theme.mp3"
};

const audioElement = document.getElementById("weddingAudio");
const audioToggle = document.getElementById("audioToggle");
const rsvpForm = document.getElementById("rsvpForm");
const formStatus = document.getElementById("formStatus");

if (SITE_CONFIG.musicUrl) {
  audioElement.src = SITE_CONFIG.musicUrl;
} else {
  audioToggle.textContent = "Музыка скоро";
}

let attemptedAutoplay = false;

const startAudio = async () => {
  if (!SITE_CONFIG.musicUrl) {
    return;
  }

  try {
    await audioElement.play();
    audioToggle.textContent = "Выключить музыку";
  } catch (error) {
    audioToggle.textContent = "Включить музыку";
  }
};

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
      audioToggle.textContent = "Выключить музыку";
    } catch (error) {
      formStatus.textContent = "Браузер не дал включить музыку автоматически.";
      formStatus.className = "form-status is-error";
    }
    return;
  }

  audioElement.pause();
  audioToggle.textContent = "Включить музыку";
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

rsvpForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const submitButton = rsvpForm.querySelector("button[type='submit']");
  const name = document.getElementById("guestName").value.trim();
  const attendance = document.getElementById("guestResponse").value;

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

  const payload = {
    name,
    attendance,
    source: window.location.href,
    sentAt: new Date().toISOString()
  };

  submitButton.disabled = true;
  submitButton.textContent = "Отправляем...";
  formStatus.textContent = "Отправляем ваш ответ...";
  formStatus.className = "form-status";

  try {
    await fetch(SITE_CONFIG.formEndpoint, {
      method: "POST",
      mode: "cors",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    rsvpForm.reset();
    formStatus.textContent = "Спасибо, ваш ответ сохранен.";
    formStatus.className = "form-status is-success";
  } catch (error) {
    formStatus.textContent =
      "Не получилось отправить форму. Проверьте URL Google Apps Script и права доступа.";
    formStatus.className = "form-status is-error";
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = "Отправить ответ";
  }
});
