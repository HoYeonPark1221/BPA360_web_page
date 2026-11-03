document.documentElement.classList.remove("no-js");

// 스크롤하면 내비게이션 아래로 반투명 막을 깐다
const nav = document.querySelector(".nav");
if (nav) {
  const update = () => nav.classList.toggle("is-scrolled", window.scrollY > 8);
  update();
  window.addEventListener("scroll", update, { passive: true });
}

// 화면에 들어올 때 한 번만 떠오르게 한다
const reveals = document.querySelectorAll(".reveal");
if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add("is-in");
        observer.unobserve(entry.target);
      }
    },
    { rootMargin: "0px 0px -10% 0px", threshold: 0.12 }
  );
  reveals.forEach((el) => observer.observe(el));
} else {
  reveals.forEach((el) => el.classList.add("is-in"));
}

// 사진 전환: 세그먼트 버튼을 누르면 해당 사진으로 교차 전환한다
document.querySelectorAll("[data-gallery]").forEach((gallery) => {
  const tabs = [...gallery.querySelectorAll('[role="tab"]')];
  const frames = [...gallery.querySelectorAll(".gallery__frames > img")];
  const thumb = gallery.querySelector(".segmented__thumb");
  const caption = gallery.querySelector(".gallery__caption");

  const moveThumb = (tab) => {
    if (!thumb) return;
    thumb.style.setProperty("--x", `${tab.offsetLeft}px`);
    thumb.style.setProperty("--w", `${tab.offsetWidth}px`);
  };

  const select = (index, focus = false) => {
    tabs.forEach((tab, i) => {
      const on = i === index;
      tab.setAttribute("aria-selected", String(on));
      tab.tabIndex = on ? 0 : -1;
      frames[i]?.classList.toggle("is-active", on);
    });
    moveThumb(tabs[index]);
    if (caption) caption.textContent = tabs[index].dataset.caption ?? "";
    if (focus) tabs[index].focus();
  };

  tabs.forEach((tab, i) => {
    tab.addEventListener("click", () => select(i));
    tab.addEventListener("keydown", (event) => {
      const step = { ArrowRight: 1, ArrowLeft: -1 }[event.key];
      if (!step) return;
      event.preventDefault();
      select((i + step + tabs.length) % tabs.length, true);
    });
  });

  // 폰트가 늦게 로드되면 버튼 너비가 바뀌므로 다시 맞춘다
  const current = () => tabs.findIndex((t) => t.getAttribute("aria-selected") === "true");
  select(Math.max(0, current()));
  document.fonts?.ready.then(() => moveThumb(tabs[Math.max(0, current())]));
  window.addEventListener("resize", () => moveThumb(tabs[Math.max(0, current())]));
});
