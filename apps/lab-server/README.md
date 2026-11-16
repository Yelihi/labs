# Local lab server

Node.js 표준 HTTP 모듈로 실행하는 실습용 서버입니다. 루트의 `.nvmrc`와 pnpm 버전을 사용하며 추가 런타임·DB·Docker는 필요하지 않습니다.

## 실행

저장소 루트의 별도 터미널 두 개에서 실행합니다.

```bash
pnpm dev:server
pnpm dev:react
```

서버는 `127.0.0.1:3001`에 바인딩합니다. 포트를 다른 프로세스가 사용하면 시작에 실패합니다.
React 개발 서버는 `/api`를 이 서버로 프록시합니다. 브라우저 코드는 상대 URL을 사용하므로 CORS 설정이 필요하지 않습니다.

`http://localhost:5173/labs/react/web-worker` → **Network + Worker** → **로컬 HTTP API**를 선택하세요.
모의 API는 서버 없이 사용할 수 있습니다. API를 전환하면 진행 중인 요청과 Worker를 종료하고 결과를 초기화합니다.

## API

| 요청                                         | 동작                 |
| -------------------------------------------- | -------------------- |
| `GET /health`                                | `{ "status": "ok" }` |
| `GET /api/search?q=react&delayMs=500&fail=0` | `{ list, delayMs }`  |

검색 API는 검색어를 포함하는 20만 개 문자열을 생성하는 실습용 데이터 소스입니다. DB 검색은 아닙니다.
`q`는 최대 100자, `delayMs`는 정수 0–5000(기본 500), `fail`은 0 또는 1입니다.
`fail=1`은 지정한 지연 후 HTTP 503을 반환합니다. 잘못된 인자는 400, 없는 경로는 404, GET 이외 메서드는 405입니다.

```bash
curl http://127.0.0.1:3001/health
curl 'http://127.0.0.1:3001/api/search?q=react&delayMs=100&fail=1'
```

취소 버튼이나 API 전환으로 fetch를 중단하면 Vite가 upstream 요청도 중단합니다.
응답 대기 중 연결이 끊기면 서버는 타이머를 해제하고 `search canceled`를 출력합니다.
이미 생성·전송된 응답은 되돌리지 않으며, 늦게 도착한 결과는 브라우저가 요청 ID로 무시합니다.

## 검증

```bash
pnpm --filter @frontend-labs/lab-server test
pnpm exec eslint apps/lab-server labs/react/web-worker --max-warnings=0
pnpm lab:test react/web-worker
```

HTTP 테스트는 임시 포트에서 실제 요청을 보냅니다. GitHub Actions의 Local runtimes 작업에서 Ubuntu와 macOS 모두 실행합니다.
React Playwright 테스트는 React 개발 서버와 이 서버를 자동으로 시작하고 종료합니다. CI에서는 기존 서버를 재사용하지 않습니다.
Browser labs 작업은 실제 프록시·HTTP 응답·503 복구·요청 취소와 Worker 처리를 검증합니다.

공통 HTTP 실행·라우팅은 `src/server.mjs`, 실행 진입점은 `src/main.mjs`에 있습니다.
실습별 서버 기능이 커지면 해당 실습의 `src/server/`에 구현하고 여기서 라우트를 연결합니다. 빈 폴더를 미리 만들 필요는 없습니다.
