# BPA 360 소개 페이지

visionOS 혈흔 형태 분석 훈련 앱 BPA 360의 GitHub Pages 사이트입니다. 빌드 도구 없이 HTML·CSS·JS만 씁니다.

- visionOS 스타일: https://hoyeonpark1221.github.io/BPA360_web_page/
- 1차 디자인: https://hoyeonpark1221.github.io/BPA360_web_page/classic/

```
index.html, team.html   visionOS 스타일 (방 앞에 유리 창이 떠 있고, 탭은 왼쪽 오너먼트)
assets/css/style.css    visionOS 스타일 CSS
assets/js/main.js       스프링 기울기 · 시선 하이라이트 · 환경 시차 · 탭 표시 · 사진 전환
assets/img/             두 디자인이 같이 쓰는 이미지 (Figma Hi-Fi 2차에서 내보낸 WebP)
classic/                1차 디자인 (이미지는 ../assets/img를 쓴다)
```

## 로컬에서 보기

```bash
python3 -m http.server 8000
```

브라우저에서 http://localhost:8000 을 엽니다.

## 배포

`main` 브랜치에 푸시하면 GitHub Pages가 루트(`/`)를 그대로 배포합니다.

## 팀원 소개 고치기

`team.html`과 `classic/team.html`의 `<article class="member ...">` 블록에서 이름, 역할, 소개를 고칩니다.

## 사진 바꾸기

Figma 프레임을 1920px PNG로 내보낸 뒤 WebP로 바꿔 `assets/img/`의 같은 이름 파일을 덮어씁니다.

```bash
cwebp -q 82 input.png -o assets/img/observe.webp
```

| 파일 | Figma 노드 |
|---|---|
| env | 진입화면 배경 이미지 `2477:19599` |
| hero-scene | 현장 진입 `2478:20293` |
| hero-panel | 진입화면 `2477:19599` |
| observe | 현장진입flow_분석 step안내 `2564:8974` |
| sticker | 혈흔 방향성 스티커 flow `2511:13045` |
| group | 혈흔 유형 판단 flow `2511:10394` |
| classify | 혈흔 유형 판단 flow `2511:10784` |
| measure | 방향성 판단 flow - 장단축 측정 2 `2644:18582` |
| stringing | 방향성 판단 flow - 평면집중부위 `2737:20268` |
| origin | 방향성 판단 flow - 평면집중부위 `2737:20428` |
| pen | 방향성펜 flow `2511:15457` |
| memo | 메모 작성 flow `2511:16115` |
| capture | 전체 캡쳐 `2511:16901` |
