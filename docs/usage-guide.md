# Frontend Labs — 사용 설명서

## 목차

1. [초기 설정](#1-초기-설정)
2. [새 Lab 만들기](#2-새-lab-만들기)
3. [Lab 디렉토리 구조 이해하기](#3-lab-디렉토리-구조-이해하기)
4. [개발 서버 실행](#4-개발-서버-실행)
5. [Lab 컴포넌트 작성](#5-lab-컴포넌트-작성)
6. [테스트 실행](#6-테스트-실행)
7. [Notes 작성](#7-notes-작성)
8. [Obsidian 내보내기](#8-obsidian-내보내기)
9. [전체 워크플로우 예시](#9-전체-워크플로우-예시)
10. [명령어 레퍼런스](#10-명령어-레퍼런스)
11. [카테고리 기준](#11-카테고리-기준)
12. [브라우저 테스트 레벨 기준](#12-브라우저-테스트-레벨-기준)

---

## 1. 초기 설정

### 의존성 설치

```bash
cd ~/Desktop/lab
pnpm install
```

### Playwright 브라우저 설치 (E2E 테스트 전 1회)

```bash
pnpm exec playwright install --with-deps chromium firefox webkit
```

### Obsidian vault 경로 확인

`.env.local` 파일에 vault 경로가 설정되어 있는지 확인합니다.

```
OBSIDIAN_VAULT_PATH=/Users/yelihe/Desktop/obsidian
```

---

## 2. 새 Lab 만들기

```bash
pnpm lab:create <카테고리> <슬러그>
```

**예시:**

```bash
pnpm lab:create css container-query
pnpm lab:create react use-transition
pnpm lab:create browser intersection-observer
pnpm lab:create performance layout-thrashing
```

실행하면 두 가지 일이 자동으로 일어납니다:

1. `labs/<카테고리>/<슬러그>/` 아래 전체 파일 구조 생성
2. `apps/react-vite/src/labs.generated.ts` 자동 업데이트 (라우트 등록)

> 별도로 `pnpm lab:routes`를 실행할 필요가 없습니다.

### 사용 가능한 카테고리

| 카테고리 | 대상 주제 |
|---------|---------|
| `css` | CSS 기능, 레이아웃, 애니메이션 |
| `react` | React 훅, 렌더링, 상태 관리 |
| `browser` | Web API, 브라우저 동작 |
| `network` | Fetch, 캐싱, WebSocket |
| `security` | XSS, CSP, CORS 등 |
| `performance` | 성능 측정, 최적화 |

---

## 3. Lab 디렉토리 구조 이해하기

`pnpm lab:create css container-query` 실행 후 생성되는 구조:

```
labs/css/container-query/
  lab.config.ts          ← Lab 메타데이터 (id, title, 목표, 브라우저 설정)
  README.md              ← Lab 개요 (실험 목적, 실행 방법)
  plan.md                ← 실험 계획 (가설, 구현 방법, 예상 결과)

  src/
    ContainerQueryLab.tsx  ← 실험 React 컴포넌트 (여기서 코드 작성)
    components/            ← 서브 컴포넌트 (필요 시 사용)
    styles/                ← CSS 파일 (필요 시 사용)

  tests/
    container-query.spec.ts  ← Playwright 자동화 테스트

  results/
    screenshots/           ← Playwright 실패 시 스크린샷 저장
    manual-check.md        ← 수동 브라우저 확인 결과 기록

  notes/
    source-note.md         ← 참고한 공식 문서, MDN, 스펙 링크
    concept-note.md        ← 개념 정리 (원리, 배경지식)
    lab-note.md            ← 실험 결과 정리 (Obsidian 내보내기 대상)
    interview-note.md      ← 면접 대비 핵심 요약
```

### 각 파일의 역할

**`lab.config.ts`** — 수정이 필요한 주요 필드:

```ts
goals: [
  '실제 실험 질문으로 교체하세요.',
  '예: Container Query가 Media Query를 완전히 대체할 수 있는가?',
],
```

**`plan.md`** — 코드를 작성하기 전에 여기에 실험 계획을 먼저 적습니다.

**`notes/lab-note.md`** — 실험이 끝난 후 결과를 정리하는 파일입니다. Obsidian으로 내보낼 때 이 파일이 메인 노트가 됩니다.

---

## 4. 개발 서버 실행

```bash
pnpm dev:react
```

실행 후 브라우저에서:

- `http://localhost:5173` — 전체 Lab 목록
- `http://localhost:5173/labs/css/container-query` — 특정 Lab 직접 접근

> URL 패턴: `http://localhost:5173/labs/<카테고리>/<슬러그>`

**개발 중 워크플로우:**

1. 터미널 1: `pnpm dev:react` (계속 실행)
2. 에디터: `labs/css/container-query/src/ContainerQueryLab.tsx` 편집
3. 브라우저에서 결과 확인 (Hot Reload 지원)

---

## 5. Lab 컴포넌트 작성

생성된 `src/ContainerQueryLab.tsx`를 수정해서 실험을 구현합니다.

### 기본 구조 유지

```tsx
export default function ContainerQueryLab() {
  return (
    <main style={{ padding: 24, fontFamily: 'system-ui, sans-serif' }}>
      <h1>Container Query</h1>           {/* ← 변경 금지: Playwright 테스트가 이 제목을 찾음 */}
      <p>Lab ID: css/container-query</p>

      <section data-testid="lab-root">  {/* ← 변경 금지: Playwright가 이 testid를 사용 */}
        {/* 여기서 실험 코드 작성 */}
      </section>
    </main>
  );
}
```

> `<h1>` 제목과 `data-testid="lab-root"` 는 Playwright 기본 테스트가 의존하므로 유지합니다.

### shared 패키지 활용

```tsx
import { Button, Card } from '@frontend-labs/ui';
import { getBrowserName } from '@frontend-labs/test-utils';
import { defineLab } from '@frontend-labs/lab-core';
```

---

## 6. 테스트 실행

### 특정 Lab 테스트

```bash
pnpm lab:test css/container-query
```

현재는 실행할 커맨드를 안내하는 placeholder입니다. 직접 실행:

```bash
# Chromium 단일
pnpm exec playwright test labs/css/container-query --project=chromium

# 핵심 3 브라우저 (Chromium, Firefox, WebKit)
pnpm e2e:core -- labs/css/container-query

# 전체 브라우저
pnpm e2e:full -- labs/css/container-query
```

### 전체 Lab 테스트

```bash
pnpm e2e:core      # Chromium + Firefox + WebKit
pnpm e2e:full      # Chrome, Edge 포함
```

### 테스트 결과 확인

```bash
pnpm e2e:report    # HTML 리포트 브라우저에서 열기
```

### 테스트 디버깅

```bash
pnpm e2e:headed    # 브라우저 화면을 보면서 실행
pnpm e2e:debug     # 단계별 디버거 실행
pnpm e2e:ui        # Playwright UI 모드 (가장 편리)
```

### 커스텀 Playwright 테스트 작성

`labs/css/container-query/tests/container-query.spec.ts` 에 추가:

```ts
import { test, expect } from '@playwright/test';

test.describe('css/container-query', () => {
  test('renders lab page', async ({ page }) => {
    await page.goto('/labs/css/container-query');
    await expect(page.getByRole('heading', { name: 'Container Query' })).toBeVisible();
    await expect(page.getByTestId('lab-root')).toBeVisible();
  });

  // 추가 테스트 작성
  test('layout changes at container width 400px', async ({ page }) => {
    await page.goto('/labs/css/container-query');
    await page.setViewportSize({ width: 600, height: 800 });
    // ...
  });
});
```

---

## 7. Notes 작성

각 note 파일의 목적과 작성 방법입니다.

### `notes/source-note.md` — 출처 노트

참고한 문서, 스펙, 블로그 링크를 정리합니다.

```markdown
# SOURCE - Container Query

## 공식 문서
- MDN: https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_containment/Container_queries
- W3C Spec: https://www.w3.org/TR/css-contain-3/

## 브라우저 지원
- Can I Use: https://caniuse.com/css-container-queries

## 참고 아티클
- ...
```

### `notes/concept-note.md` — 개념 노트

원리와 배경지식을 정리합니다.

```markdown
# CONCEPT - Container Query

## 핵심 원리
Container Query는 부모 요소의 크기를 기준으로 스타일을 적용한다.
Media Query와 달리 뷰포트가 아닌 컨테이너 크기에 반응한다.

## Media Query와 차이점
...
```

### `notes/lab-note.md` — 실험 노트 ⭐

실험 결과를 정리하는 메인 파일입니다. Obsidian으로 내보낼 때 이 파일이 사용됩니다.

```markdown
# LAB - Container Query

## Experiment Question
Container Query를 사용하면 컴포넌트 단위의 반응형 디자인이 가능한가?

## Hypothesis
가능하다. container-type: inline-size 설정 후 @container 규칙으로 스타일을 분기할 수 있다.

## Environment
- OS: macOS 25.4.0
- Browser: Chrome 125, Firefox 126, Safari 17
- Measurement: 수동 시각 확인

## Test Result
- Chromium ✅ 정상 동작
- Firefox ✅ 정상 동작
- WebKit ✅ 정상 동작

## Conclusion
Container Query는 2023년부터 주요 브라우저 모두 지원. 실사용 가능.

## Practical Judgment
Media Query 대신 컴포넌트 내부에서 사용하는 것이 재사용성 측면에서 유리하다.
```

### `notes/interview-note.md` — 면접 노트

면접에서 바로 쓸 수 있는 핵심 요약입니다.

```markdown
# INTERVIEW - Container Query

## 한 줄 정의
부모 컨테이너의 크기를 기준으로 스타일을 변경하는 CSS 기능

## Media Query와 차이
- Media Query: 뷰포트 기준
- Container Query: 부모 요소 기준 → 컴포넌트 재사용성 향상

## 사용 방법
```css
.container { container-type: inline-size; }
@container (min-width: 400px) { ... }
```

## 브라우저 지원
모든 주요 브라우저 지원 (Chrome 105+, Firefox 110+, Safari 16+)
```

---

## 8. Obsidian 내보내기

```bash
# 미리보기 (파일 작성 안 함)
pnpm lab:export css/container-query

# Obsidian vault에 실제 작성
pnpm lab:export css/container-query --write
```

> 현재 `--write` 기능은 TODO 상태입니다. `.env.local`의 `OBSIDIAN_VAULT_PATH`에 vault 경로가 설정되어 있으면, 이후 구현 시 자동으로 내보내집니다.

---

## 9. 전체 워크플로우 예시

CSS `container-query` 실험을 처음부터 끝까지 진행하는 흐름입니다.

```bash
# Step 1: Lab 생성 (routes 자동 등록)
pnpm lab:create css container-query

# Step 2: plan.md에 실험 계획 작성 (에디터에서)
# labs/css/container-query/plan.md 열어서 작성

# Step 3: 개발 서버 실행
pnpm dev:react
# → http://localhost:5173/labs/css/container-query 확인

# Step 4: ContainerQueryLab.tsx 구현
# labs/css/container-query/src/ContainerQueryLab.tsx 편집

# Step 5: Playwright 테스트 실행 (기본 렌더링 확인)
pnpm exec playwright test labs/css/container-query --project=chromium

# Step 6: 3 브라우저 테스트
pnpm e2e:core -- labs/css/container-query

# Step 7: 수동 확인
# labs/css/container-query/results/manual-check.md 에 Safari/Edge 결과 기록

# Step 8: Notes 작성
# labs/css/container-query/notes/lab-note.md 에 실험 결과 정리

# Step 9: lab.config.ts 상태 업데이트
# status: 'active' → 'done'

# Step 10: Obsidian 내보내기 (추후 구현)
pnpm lab:export css/container-query --write
```

---

## 10. 명령어 레퍼런스

### Lab 관리

| 명령어 | 설명 |
|--------|------|
| `pnpm lab:create <카테고리> <슬러그>` | 새 Lab 생성 + routes 자동 동기화 |
| `pnpm lab:list` | 현재 모든 Lab 목록 출력 |
| `pnpm lab:routes` | `labs.generated.ts` 수동 재생성 (보통 불필요) |
| `pnpm lab:dev <id>` | 특정 Lab의 URL 안내 출력 |

### 개발

| 명령어 | 설명 |
|--------|------|
| `pnpm dev:react` | Vite 개발 서버 시작 (port 5173) |
| `pnpm build` | 전체 빌드 |
| `pnpm typecheck` | TypeScript 타입 체크 |
| `pnpm lint` | ESLint 실행 |
| `pnpm format` | Prettier 자동 포맷 |
| `pnpm format:check` | Prettier 검사만 (수정 안 함) |

### 테스트

| 명령어 | 설명 |
|--------|------|
| `pnpm e2e:core` | Chromium + Firefox + WebKit |
| `pnpm e2e:full` | 전체 브라우저 (Chrome, Edge 포함) |
| `pnpm e2e:ui` | Playwright UI 모드 (시각적 디버깅) |
| `pnpm e2e:headed` | 브라우저 화면 보면서 실행 |
| `pnpm e2e:debug` | 단계별 디버거 |
| `pnpm e2e:report` | HTML 리포트 열기 |

### Notes & Export

| 명령어 | 설명 |
|--------|------|
| `pnpm lab:test <id>` | 특정 Lab 테스트 안내 |
| `pnpm lab:report <id>` | 리포트 생성 (TODO) |
| `pnpm lab:export <id>` | 내보내기 미리보기 |
| `pnpm lab:export <id> --write` | Obsidian vault에 실제 저장 |

---

## 11. 카테고리 기준

| 카테고리 | 언제 사용 |
|---------|---------|
| `css` | CSS Grid, Flexbox, Container Query, Custom Properties, 애니메이션 등 |
| `react` | React 훅 동작 원리, 렌더링 최적화, Concurrent Features 등 |
| `browser` | Web API (IntersectionObserver, ResizeObserver, WebWorker 등) |
| `network` | Fetch API, HTTP 캐싱, WebSocket, Service Worker 등 |
| `security` | XSS, CSP, CORS, HTTPS, Cookie 보안 속성 등 |
| `performance` | 렌더링 성능, 메모리 측정, Core Web Vitals 등 |

---

## 12. 브라우저 테스트 레벨 기준

자세한 내용은 [`docs/browser-test-policy.md`](./browser-test-policy.md)를 참고하세요.

| 레벨 | 기준 | 브라우저 |
|------|------|---------|
| Level 1 | 학습 확인용 | Chromium만 |
| Level 2 | 실무 적용 후보 | Chromium + Firefox + WebKit (Playwright 필수) |
| Level 3 | 프로덕션 후보 | Level 2 + Chrome stable + Edge + Safari 수동 확인 |

---

## AI Agent 활용

이 repo는 Claude Code와 함께 사용하도록 설계되어 있습니다.

AI에게 맡길 수 있는 것:
- Lab scaffold 생성 후 컴포넌트 초안 작성
- `plan.md` / `README.md` 초안 작성
- Playwright 테스트 케이스 추가
- 실험 결과 요약 및 `lab-note.md` 작성 보조

**AI에게 맡기면 안 되는 것:**
- 브라우저 호환성 결과를 추측으로 단정하기
- 성능 수치를 측정 없이 기재하기
- `manual-check.md`를 기존 내용 없이 덮어쓰기
- Lab 상태를 `done`으로 변경 (사람이 직접 확인 후 변경)

자세한 내용은 [`docs/ai-agent-guide.md`](./ai-agent-guide.md)를 참고하세요.
