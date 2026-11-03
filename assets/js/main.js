document.documentElement.classList.remove("no-js");

const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
const finePointer = matchMedia("(hover: hover) and (pointer: fine)").matches;

// ---------- 스프링 ----------
// 감쇠비 1(튕기지 않음), response는 목표에 닿는 데 걸리는 대략의 시간(초)
const springs = new Set();
let frame = 0;

function spring(value, response = 0.4, damping = 1) {
  const omega = (2 * Math.PI) / response;
  return { value, target: value, velocity: 0, omega, damping };
}

function animate(s) {
  springs.add(s);
  if (!frame) frame = requestAnimationFrame(tick);
}

let last = 0;
function tick(now) {
  const dt = Math.min((now - (last || now)) / 1000, 1 / 30);
  last = now;
  for (const s of springs) {
    // 안정적으로 적분하려고 작은 단계로 나눈다
    const steps = Math.ceil(dt / (1 / 240)) || 1;
    const h = dt / steps;
    for (let i = 0; i < steps; i++) {
      const force = -s.omega * s.omega * (s.value - s.target) - 2 * s.damping * s.omega * s.velocity;
      s.velocity += force * h;
      s.value += s.velocity * h;
    }
    s.onUpdate?.(s.value);
    if (Math.abs(s.value - s.target) < 0.001 && Math.abs(s.velocity) < 0.001) {
      s.value = s.target;
      s.onUpdate?.(s.value);
      springs.delete(s);
    }
  }
  if (springs.size) {
    frame = requestAnimationFrame(tick);
  } else {
    frame = 0;
    last = 0;
  }
}

// ---------- 시선 하이라이트: 포인터가 닿은 곳이 밝아진다 ----------
document.querySelectorAll(".hover").forEach((el) => {
  el.addEventListener("pointermove", (event) => {
    const rect = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${event.clientX - rect.left}px`);
    el.style.setProperty("--my", `${event.clientY - rect.top}px`);
  });
});

// ---------- 카드 기울이기: 떠 있는 창을 비스듬히 보는 느낌 ----------
if (finePointer && !reduceMotion) {
  document.querySelectorAll("[data-tilt]").forEach((el) => {
    const max = Number(el.dataset.tilt) || 4;
    const lift = Number(el.dataset.lift) || 1.02;
    const rx = spring(0);
    const ry = spring(0);
    const scale = spring(1, 0.35);
    rx.onUpdate = (v) => el.style.setProperty("--rx", `${v}deg`);
    ry.onUpdate = (v) => el.style.setProperty("--ry", `${v}deg`);
    scale.onUpdate = (v) => el.style.setProperty("--s", v);

    el.addEventListener("pointermove", (event) => {
      const rect = el.getBoundingClientRect();
      const nx = (event.clientX - rect.left) / rect.width - 0.5;
      const ny = (event.clientY - rect.top) / rect.height - 0.5;
      ry.target = nx * max * 2;
      rx.target = -ny * max * 2;
      scale.target = lift;
      animate(rx);
      animate(ry);
      animate(scale);
    });

    el.addEventListener("pointerleave", () => {
      rx.target = 0;
      ry.target = 0;
      scale.target = 1;
      animate(rx);
      animate(ry);
      animate(scale);
    });
  });
}

// ---------- 환경 시차: 고개를 돌리듯 방이 천천히 반대로 움직인다 ----------
const environment = document.querySelector(".environment");
if (environment && finePointer && !reduceMotion) {
  const px = spring(0, 1.2);
  const py = spring(0, 1.2);
  px.onUpdate = (v) => environment.style.setProperty("--px", `${v}px`);
  py.onUpdate = (v) => environment.style.setProperty("--py", `${v}px`);
  window.addEventListener("pointermove", (event) => {
    px.target = -(event.clientX / innerWidth - 0.5) * 28;
    py.target = -(event.clientY / innerHeight - 0.5) * 18;
    animate(px);
    animate(py);
  }, { passive: true });
}

// ---------- 화면에 들어오면 창이 떠오른다 ----------
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
    { rootMargin: "0px 0px -8% 0px", threshold: 0.1 }
  );
  reveals.forEach((el) => observer.observe(el));
} else {
  reveals.forEach((el) => el.classList.add("is-in"));
}

// ---------- 탭 오너먼트: 지금 보고 있는 구역을 표시한다 ----------
const tabLinks = [...document.querySelectorAll('.tab[href^="#"]')];
const sections = tabLinks.map((tab) => document.querySelector(tab.getAttribute("href"))).filter(Boolean);
if (sections.length && "IntersectionObserver" in window) {
  const spy = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        tabLinks.forEach((tab) => {
          if (tab.getAttribute("href") === `#${entry.target.id}`) tab.setAttribute("aria-current", "true");
          else tab.removeAttribute("aria-current");
        });
      }
    },
    { rootMargin: "-45% 0px -50% 0px" }
  );
  sections.forEach((section) => spy.observe(section));
}

// ---------- 사진 전환 ----------
document.querySelectorAll("[data-gallery]").forEach((gallery) => {
  const tabs = [...gallery.querySelectorAll('[role="tab"]')];
  const frames = [...gallery.querySelectorAll(".frames > img")];
  const thumb = gallery.querySelector(".segmented__thumb");
  const caption = gallery.querySelector(".caption");

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

  const current = () => Math.max(0, tabs.findIndex((t) => t.getAttribute("aria-selected") === "true"));
  select(current());
  document.fonts?.ready.then(() => moveThumb(tabs[current()]));
  window.addEventListener("resize", () => moveThumb(tabs[current()]));
});
