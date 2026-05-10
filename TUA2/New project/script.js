(function () {
  var gate = document.getElementById("accessGate");
  var input = document.getElementById("accessInput");
  var button = document.getElementById("accessButton");
  var error = document.getElementById("accessError");
  var bookApp = document.getElementById("bookApp");
  var viewport = document.querySelector(".book-viewport");
  var appShell = document.querySelector(".app-shell");
  var track = document.getElementById("bookTrack");
  var views = Array.prototype.slice.call(document.querySelectorAll("[data-view]"));
  var nextButtons = Array.prototype.slice.call(document.querySelectorAll("[data-next]"));
  var prevButtons = Array.prototype.slice.call(document.querySelectorAll("[data-prev]"));
  var homeButtons = Array.prototype.slice.call(document.querySelectorAll("[data-home]"));
  var spreadImages = Array.prototype.slice.call(document.querySelectorAll(".spread-photo img"));

  var currentIndex = 0;
  var maxIndex = views.length - 1;
  var isUnlocked = !gate;

  function normalizeAnswer(value) {
    return String(value || "")
      .trim()
      .toLowerCase();
  }

  function unlockBook() {
    isUnlocked = true;
    if (gate) {
      gate.hidden = true;
      gate.style.display = "none";
      gate.style.pointerEvents = "none";
      gate.style.visibility = "hidden";
      gate.style.opacity = "0";
    }
    if (bookApp) {
      bookApp.hidden = false;
      bookApp.style.display = "grid";
      bookApp.style.visibility = "visible";
      bookApp.style.opacity = "1";
      bookApp.style.pointerEvents = "auto";
      bookApp.removeAttribute("hidden");
    }
    render();
    updateViewportHeight();
  }

  function validateAccess() {
    var typed = normalizeAnswer(input && input.value);
    var expected = normalizeAnswer("Punta del Diablo");

    if (typed === expected) {
      if (error) error.textContent = "";
      unlockBook();
      return;
    }

    if (error) error.textContent = "Respuesta incorrecta.";
  }

  function clampIndex(index) {
    if (index < 0) return 0;
    if (index > maxIndex) return maxIndex;
    return index;
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function setPhotoRatio(img) {
    if (!img || !img.parentElement) return;
    if (!img.naturalWidth || !img.naturalHeight) return;

    var ratio = img.naturalWidth / img.naturalHeight;
    var safeRatio = clamp(ratio, 0.62, 1.5);
    img.parentElement.style.setProperty("--photo-ratio", safeRatio.toFixed(4));
  }

  function updateViewportHeight() {
    if (!viewport || !appShell || !views.length) return;

    var activeView = views[currentIndex];
    if (!activeView) return;

    var shellStyle = window.getComputedStyle(appShell);
    var shellPaddingTop = parseFloat(shellStyle.paddingTop) || 0;
    var shellPaddingBottom = parseFloat(shellStyle.paddingBottom) || 0;
    var chromeCompensation = 10;

    var maxHeight = Math.floor(window.innerHeight - shellPaddingTop - shellPaddingBottom - chromeCompensation);
    var minHeight = Math.min(760, maxHeight);
    var neededHeight = Math.ceil(activeView.scrollHeight);
    var targetHeight = clamp(neededHeight, minHeight, maxHeight);

    viewport.style.setProperty("--book-height", targetHeight + "px");
  }

  function render() {
    if (!isUnlocked) return;
    currentIndex = clampIndex(currentIndex);
    track.style.transform = "translateX(-" + currentIndex * 100 + "%)";

    for (var i = 0; i < views.length; i += 1) {
      var isActive = i === currentIndex;
      views[i].setAttribute("aria-hidden", isActive ? "false" : "true");
    }

    updateViewportHeight();
  }

  function goNext() {
    currentIndex += 1;
    render();
  }

  function goPrev() {
    currentIndex -= 1;
    render();
  }

  function goHome() {
    currentIndex = 0;
    render();
  }

  nextButtons.forEach(function (button) {
    button.addEventListener("click", goNext);
  });

  prevButtons.forEach(function (button) {
    button.addEventListener("click", goPrev);
  });

  homeButtons.forEach(function (button) {
    button.addEventListener("click", goHome);
  });

  document.addEventListener("keydown", function (event) {
    if (!isUnlocked && event.key === "Enter") {
      validateAccess();
      return;
    }

    if (!isUnlocked) return;

    if (event.key === "ArrowRight") {
      goNext();
    }

    if (event.key === "ArrowLeft") {
      goPrev();
    }
  });

  spreadImages.forEach(function (img) {
    if (img.complete) {
      setPhotoRatio(img);
    } else {
      img.addEventListener("load", function () {
        setPhotoRatio(img);
        updateViewportHeight();
      });
    }
  });

  window.addEventListener("resize", updateViewportHeight);

  if (button) {
    button.addEventListener("click", validateAccess);
  }

  if (input) {
    input.addEventListener("keydown", function (event) {
      if (event.key === "Enter") {
        validateAccess();
      }
    });
    input.focus();
  }

  if (isUnlocked) {
    render();
  }
})();
