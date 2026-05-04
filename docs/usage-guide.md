# Frontend Labs — 사용 가이드

## 이 시스템이 하는 일

프론트엔드 기술을 실험하고, 결과를 체계적으로 기록하고, Obsidian으로 지식화하는 시스템입니다.

```
실험 주제 정하기
    → Lab 생성 (pnpm lab:create)
    → 계획 작성 (plan.md)
    → 코드 구현 (브라우저에서 확인)
    → 브라우저 테스트 (Playwright)
    → 결과 기록 (notes/)
    → Obsidian 내보내기 (pnpm lab:export --write)
```

---

## 최초 1회 설정

```bash
cd ~/Desktop/lab
pnpm install
pnpm exec playwright install --with-deps chromium firefox webkit
```

`.env.local` 에 Obsidian vault 경로가 설정되어 있는지 확인합니다.

```
OBSIDIAN_VAULT_PATH=/Users/yelihe/Desktop/obsidian
```

---

## 전체 워크플로우

### Step 1 — 실험 주제와 Framework 결정

어떤 것을 실험할지, 어떤 환경이 필요한지 먼저 정합니다.

| 내가 실험하려는 것 | Framework |
|---|---|
| CSS, React, 브라우저 API, 성능 | `react-vite` (기본값) |
| Next.js SSR, App Router, Server Component | `next-app` |
| 순수 DOM API, Web API (프레임워크 없이) | `javascript` |
| TypeScript 타입, 제네릭, 순수 TS 로직 | `typescript` |

---

### Step 2 — Lab 생성

```bash
# 기본 (react-vite)
pnpm lab:create css container-query
pnpm lab:create react use-transition
pnpm lab:create performance layout-thrashing

# Framework 지정
pnpm lab:create browser intersection-observer --framework javascript
pnpm lab:create react server-component --framework next-app
pnpm lab:create browser fetch-streams --framework typescript
```

실행하면:
- `labs/<카테고리>/<슬러그>/` 폴더 전체 생성
- 해당 framework 앱의 라우트 자동 등록

> `pnpm lab:routes`는 별도로 실행할 필요 없습니다. create가 자동으로 처리합니다.

---

### Step 3 — 계획 먼저 작성

코드를 작성하기 전, `labs/<카테고리>/<슬러그>/plan.md`를 열어 작성합니다.

```markdown
## Experiment Question
Container Query가 Media Query를 대체할 수 있는가?

## Hypothesis
container-type: inline-size를 설정하면 부모 요소 기준으로 스타일을 분기할 수 있다.

## Implementation Plan
1. 기본 컨테이너 설정 확인
2. @container 규칙 적용 테스트
3. 중첩 컨테이너 동작 확인
```

계획 없이 바로 코드를 작성하면 나중에 "무엇을 검증했는지"가 불분명해집니다.

---

### Step 4 — 개발 서버 실행 + 코드 구현

framework에 맞는 개발 서버를 켭니다.

```bash
pnpm dev:react       # react-vite  → http://localhost:5173
pnpm dev:next        # next-app    → http://localhost:5174
pnpm dev:javascript  # javascript  → http://localhost:5175
pnpm dev:typescript  # typescript  → http://localhost:5176
```

어느 URL로 접속해야 할지 모를 때:

```bash
pnpm lab:dev css/container-query
# → Framework: react-vite
# → Run: pnpm dev:react
# → URL: http://localhost:5173/labs/css/container-query
```

구현 파일은 `labs/<카테고리>/<슬러그>/src/` 안에 있습니다. 수정하면 브라우저에 즉시 반영됩니다.

**주의:** `<h1>` 제목과 `data-testid="lab-root"` 는 Playwright 테스트가 의존하므로 삭제하지 않습니다.

---

### Step 5 — 브라우저 테스트

```bash
# 특정 Lab, Chromium 하나
pnpm exec playwright test labs/css/container-query --project=chromium

# 핵심 3 브라우저 (Chromium + Firefox + WebKit)
pnpm e2e:core -- labs/css/container-query

# UI 모드 (시각적으로 확인하기 가장 편함)
pnpm e2e:ui

# 결과 리포트
pnpm e2e:report
```

자동화 테스트 후 Safari / Edge는 직접 열어서 확인하고
`labs/<카테고리>/<슬러그>/results/manual-check.md` 에 결과를 기록합니다.

---

### Step 6 — Notes 작성

실험이 끝나면 `notes/` 폴더의 파일을 채웁니다. 순서는 자유롭지만 아래 흐름이 자연스럽습니다.

**`source-note.md`** — 실험 중간중간 참고한 자료 링크와 스펙 요약

```markdown
## 공식 문서
- MDN Container Queries: https://...
- W3C Spec: https://...

## 브라우저 지원
- Can I Use: https://caniuse.com/css-container-queries
  Chrome 105+, Firefox 110+, Safari 16+
```

**`concept-note.md`** — 이해한 원리를 나만의 말로 정리

```markdown
## 핵심 개념
Media Query는 뷰포트 기준, Container Query는 부모 요소 기준.
container-type을 설정한 요소가 "컨테이너"가 된다.
```

**`lab-note.md`** ⭐ — 실험 결과의 핵심. Obsidian 내보내기의 메인 파일

```markdown
## Experiment Question
Container Query가 Media Query를 대체할 수 있는가?

## Hypothesis
가능하다.

## Test Result
- Chromium ✅
- Firefox  ✅
- WebKit   ✅

## Conclusion
2023년부터 모든 주요 브라우저 지원. 실사용 가능.

## Practical Judgment
컴포넌트 단위 반응형이 필요할 때 Media Query보다 유리하다.
```

**`interview-note.md`** — 면접에서 바로 꺼낼 수 있는 한 줄 요약

```markdown
## 한 줄 정의
부모 컨테이너 크기 기준으로 스타일을 변경하는 CSS 기능

## Media Query와 차이
뷰포트 기준 → 컨테이너 기준 (컴포넌트 재사용성 향상)
```

---

### Step 7 — lab.config.ts 상태 변경

실험 완료 시 `lab.config.ts`를 열어 `status`를 변경합니다.

```ts
status: 'done',   // 'idea' | 'active' | 'done' | 'archived'
```

---

### Step 8 — Obsidian 내보내기

```bash
# 미리보기 (어떤 파일이 내보내질지 확인)
pnpm lab:export css/container-query

# 실제 내보내기
pnpm lab:export css/container-query --write
```

`08_Labs/css/container-query/` 폴더에 4개 파일이 생성됩니다.
`lab-note.md`에는 Obsidian frontmatter(태그, 날짜, 상태 등)가 자동으로 추가됩니다.
이후 Obsidian Git 플러그인이 자동으로 GitHub에 sync합니다.

---

## 명령어 치트시트

```bash
# Lab 관리
pnpm lab:create <카테고리> <슬러그>                   # Lab 생성 (react-vite 기본)
pnpm lab:create <카테고리> <슬러그> --framework <fw>  # Framework 지정
pnpm lab:list                                          # 전체 Lab 목록
pnpm lab:dev <카테고리/슬러그>                         # 개발 서버 안내

# 개발 서버
pnpm dev:react        # react-vite  → :5173
pnpm dev:next         # next-app    → :5174
pnpm dev:javascript   # javascript  → :5175
pnpm dev:typescript   # typescript  → :5176

# 테스트
pnpm e2e:core         # Chromium + Firefox + WebKit
pnpm e2e:ui           # UI 모드 (권장)
pnpm e2e:report       # 결과 리포트

# 정적 검사
pnpm typecheck        # 전체 TypeScript 검사
pnpm lint             # ESLint
pnpm format           # Prettier 자동 포맷

# Obsidian
pnpm lab:export <id>           # 미리보기
pnpm lab:export <id> --write   # 실제 내보내기
```

---

## 카테고리 선택 기준

| 카테고리 | 주제 예시 |
|---|---|
| `css` | Container Query, Grid, Custom Properties, 애니메이션 |
| `react` | useTransition, Suspense, Server Component, 렌더링 최적화 |
| `browser` | IntersectionObserver, ResizeObserver, Web Worker, IndexedDB |
| `network` | Fetch 캐싱, WebSocket, Service Worker, HTTP/2 Push |
| `security` | XSS, CSP, CORS, Cookie 보안 속성 |
| `performance` | Layout Thrashing, CLS, LCP 측정, 메모리 |

---

## AI (Claude Code) 활용

Claude Code와 함께 작업할 때 맡기기 좋은 것:

- Lab scaffold 생성 후 컴포넌트 초안 작성 요청
- `plan.md` / `README.md` 초안 작성
- Playwright 테스트 케이스 추가
- 실험 코드 리팩토링
- `lab-note.md` 결과 정리 보조

**직접 판단해야 하는 것 (AI에게 맡기면 안 됨):**

- 브라우저 호환성 결과 (반드시 실제 테스트 후 기록)
- 성능 수치 (반드시 실제 측정 후 기록)
- `status: 'done'` 변경 (직접 확인 후 변경)
- `manual-check.md` 의 수동 확인 결과

---

## 흔한 실수

**`pnpm lab:routes` 를 따로 실행할 필요 없습니다.**
`pnpm lab:create` 가 자동으로 처리합니다.

**개발 서버를 잘못 켰을 때.**
`pnpm lab:dev <id>` 로 어느 서버를 켜야 하는지 확인하세요.

**Obsidian에서 파일이 안 보일 때.**
Obsidian 앱에서 `Cmd + R` (vault reload) 또는 앱을 재시작하면 새 파일이 인식됩니다.

**`--write` 없이 export 했을 때.**
`--write` 플래그가 없으면 dry run (미리보기만) 입니다. 파일이 실제로 쓰이지 않습니다.
