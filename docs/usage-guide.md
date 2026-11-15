# Frontend Labs — 사용 가이드

실험 코드는 `labs/<category>/<slug>/`, 실행 환경은 `apps/`에서 관리합니다.

## 설치

저장소의 `packageManager`에 지정된 pnpm 10.33.0을 사용합니다.

```bash
pnpm install
pnpm exec playwright install chromium
```

`--core`로 테스트하려면 Firefox와 WebKit도 설치합니다.

```bash
pnpm exec playwright install firefox webkit
```

## 실험 생성

```bash
pnpm lab:create css container-query
pnpm lab:create browser dom-example --framework javascript
pnpm lab:create react server-example --framework next-app
pnpm lab:create cpp vector-basics
```

웹 실험은 다음 파일만 생성하고 앱의 라우트를 등록합니다.

```text
labs/<category>/<slug>/
├── README.md
├── lab.config.ts
├── src/<Name>Lab.<ext>
└── tests/<slug>.spec.ts
```

C/C++ 실험은 브라우저 테스트 대신 `Makefile`을 생성합니다.
`plan.md`, `notes/`, `results/`, 빈 components/styles 폴더는 만들지 않습니다.
질문·관찰·결론은 README에 작성하고 추가 문서는 필요할 때 만듭니다.
기존 실험의 문서와 폴더는 그대로 사용할 수 있습니다.

## 개발

```bash
pnpm dev:react                 # React / CSS 실험 :5173
pnpm dev:next                  # Next.js :5174
pnpm dev:javascript            # JavaScript :5175
pnpm dev:typescript            # TypeScript :5176
pnpm dev:python                # Python :8000 (별도 Python 환경 필요)
```

프로젝트 루트에서 해당 `pnpm dev:*` 명령을 실행합니다. 같은 실행 환경의 실험은 서버 하나를 공유합니다.
React는 `http://localhost:5173`의 목록에서 실험을 선택하거나 실험 README의 URL로 접속합니다.
새 실험의 README에는 실행 명령과 해당 실험의 URL이 함께 기록됩니다.
C/C++는 `make -C labs/<category>/<slug> run`으로 실행합니다.
실험 진입 파일이나 설정을 직접 변경한 경우 `pnpm lab:routes`로 등록을 갱신합니다.

## 테스트

```bash
pnpm lab:test css/container-query                  # Chromium
pnpm lab:test browser/dom-example --core           # Chromium, Firefox, WebKit
pnpm lab:test react/server-example --project=webkit
pnpm lab:test css/container-query --full            # Chrome, Edge도 포함
pnpm lab:test cpp/vector-basics                    # make build로 컴파일 확인
pnpm e2e:report                                    # 브라우저 테스트 보고서
```

`lab:test`는 실제 프로세스를 실행하고 실패 시 0이 아닌 종료 코드를 반환합니다.
웹 실험은 해당 framework의 서버를 자동으로 시작하거나 이미 실행 중인 서버를 사용합니다.
Python은 해당 서버의 가상환경과 라이브러리가 준비되어 있어야 합니다.
`--full`에는 로컬 Chrome과 Edge 설치가 필요합니다. C/C++ 검사는 실행 결과 검증이 아닌 컴파일 검사입니다.
Vue 실행 앱은 아직 없으므로 `lab:test`에서 지원하지 않습니다.

루트의 `pnpm e2e*` 명령은 기존 React 서버 설정을 사용합니다.
다른 실행 환경의 실험은 `pnpm lab:test <id>`로 실행합니다.
기본 웹 테스트는 제목과 `data-testid="lab-root"` 표시를 확인합니다.
실험별 동작 검증은 해당 테스트에 추가합니다.

## 기록과 내보내기

계획, 참고 자료, 관찰, 결론은 우선 README에 기록합니다.
자동화하지 않은 브라우저 결과나 성능 수치를 확인한 것으로 기록하지 않습니다.

기존 Obsidian 내보내기는 `notes/`의 아래 파일이 있을 때 사용할 수 있습니다.

- `lab-note.md`
- `concept-note.md`
- `source-note.md`
- `interview-note.md`

```bash
pnpm lab:export <id>          # 파일 존재 여부 미리보기
pnpm lab:export <id> --write  # 존재하는 노트만 내보내기
```

실제 내보내기는 `.env.local`의 `OBSIDIAN_VAULT_PATH` 설정이 필요합니다.
README는 내보내기 대상이 아닙니다. 필요한 노트만 직접 추가하면 됩니다.

## 기타

```bash
pnpm lab:list
pnpm typecheck
pnpm lint
```

`lab:report`는 아직 구현되지 않았습니다. 테스트 결과는 `pnpm e2e:report`로 확인합니다.
