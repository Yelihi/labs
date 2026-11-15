# 로컬 실습 환경

Docker 없이 필요한 런타임만 설치합니다. 공통 CLI에는 Node.js와 pnpm이 필요합니다.
지원 대상으로 정한 환경은 macOS, Linux(Ubuntu 기준), Windows의 WSL2입니다.
Windows 네이티브 PowerShell/CMD는 Make·POSIX 경로 때문에 지원 대상에서 제외합니다.
OS별 실행 검증 현황은 아래 검증 기록을 확인하세요. 설치 가이드 제공이 해당 OS에서의 실측을 뜻하지는 않습니다.

## 공통 준비

Node.js 24.x를 기본으로 사용합니다(`.nvmrc`). 최소 버전은 22.12이고 pnpm은 10.33.0입니다.
[Node.js 공식 다운로드](https://nodejs.org/en/download)에서 24.x를 선택하거나 이미 사용하는 버전 관리자로 설치합니다.
NVM이 설치되어 있다면 저장소 루트에서 `nvm install` 및 `nvm use`를 실행합니다.

```bash
node --version
npx --yes pnpm@10.33.0 install --frozen-lockfile
```

이 문서의 `pnpm` 명령은 pnpm 10.33.0을 전제로 합니다. 전역 설치를 원하지 않으면
모든 `pnpm ...`을 `npx --yes pnpm@10.33.0 ...`으로 실행할 수 있습니다.
다른 컴퓨터에서는 `node_modules`, `.venv`, `build`를 복사하지 말고 다시 만듭니다.

## 운영체제별 추가 도구

### macOS

C/C++ 실습은 [Apple Command Line Tools](https://developer.apple.com/documentation/xcode/installing-the-command-line-tools)가 필요합니다.

```bash
xcode-select --install
cc --version
c++ --version
make --version
```

Python은 [Python 공식 다운로드](https://www.python.org/downloads/macos/)에서 3.11 이상을 설치합니다.
Homebrew를 이미 사용한다면 `brew install python`도 가능합니다. OS가 사용하는 Python을 변경하지 않습니다.

### Ubuntu / WSL2 Ubuntu

필요한 실습의 도구만 설치합니다.

```bash
# C / C++
sudo apt update
sudo apt install build-essential

# Python (배포판 제공 버전이 3.11 이상인지 확인)
sudo apt install python3 python3-venv python3-pip
python3 --version
```

배포판 Python이 너무 낮으면 지원 버전을 제공하는 Ubuntu 릴리스를 사용하거나 별도 사용자 Python을 설치합니다.
Node.js는 OS 패키지의 오래된 버전 대신 위 공식 다운로드/버전 관리자를 사용합니다.

Windows에서는 [Microsoft WSL 설치 안내](https://learn.microsoft.com/en-us/windows/wsl/install)에 따라
PowerShell에서 `wsl --install` 후 Ubuntu 터미널 안에서 위 설치를 진행합니다.
저장소도 WSL의 홈 디렉터리에 복제하고 Node.js·Python·Make 모두 WSL 내부의 도구를 사용합니다.

## 런타임 선택

| 실습                               | framework      | 진입점         | 테스트                                  |
| ---------------------------------- | -------------- | -------------- | --------------------------------------- |
| Node.js 파일·비동기·서버 내부 로직 | `node`         | `src/main.mjs` | `tests/**/*.test.mjs`, Node 내장 테스트 |
| 독립 Python 스크립트               | `python-cli`   | `src/main.py`  | `tests/test_*.py`, unittest             |
| C                                  | `c`            | Makefile의 SRC | `make test`                             |
| C++                                | `cpp`          | Makefile의 SRC | `make test`                             |
| React / 브라우저 JS / TS           | 기존 framework | 기존 앱 라우트 | Playwright                              |
| 기존 FastAPI / GStreamer           | `python`       | Python 웹 서버 | 별도 시스템 의존성 필요                 |

`python-cli`는 일반 Python 실습, `python`은 기존 웹 실험입니다. 서로 자동 변환하지 않습니다.
CLI 실습은 브라우저 앱에 등록하지 않으므로 하나를 추가해도 웹 서버에 영향을 주지 않습니다.

## 생성 → 진단 → 실행 → 테스트

### Node.js

```bash
pnpm lab:create node file-reading --framework node
pnpm lab:doctor node/file-reading
pnpm lab:run node/file-reading
pnpm lab:test node/file-reading
```

기본 예제는 덧셈 함수의 결과를 출력하고 양수·음수 입력을 테스트합니다.
브라우저 DOM이 없는 Node.js 프로세스입니다. `.mjs`를 사용해 ESM 모드를 명시합니다.
추가 패키지가 필요하면 해당 실험에 `package.json`을 만들고 의존성을 선언합니다.
테스트는 [Node.js 내장 테스트 러너](https://nodejs.org/api/test.html)를 사용합니다.

### Python

```bash
pnpm lab:create python text-processing --framework python-cli
python3 -m venv labs/python/text-processing/.venv
labs/python/text-processing/.venv/bin/python -m pip install -r labs/python/text-processing/requirements.txt
pnpm lab:doctor python/text-processing
pnpm lab:run python/text-processing
pnpm lab:test python/text-processing
```

CLI는 실험의 `.venv/bin/python`을 직접 사용하므로 activate는 필요 없습니다.
추가 라이브러리는 `requirements.txt`에 검증한 버전으로 고정합니다. 표준 라이브러리 실습은 외부 패키지가 없습니다.
[venv](https://docs.python.org/3/library/venv.html)는 새 PC에서 다시 생성하고,
테스트는 [unittest](https://docs.python.org/3/library/unittest.html)를 사용합니다.
테스트를 하위 폴더로 나누면 해당 폴더에 `__init__.py`를 두어 unittest가 발견하도록 합니다.

### C / C++

```bash
pnpm lab:create c pointers --framework c
pnpm lab:doctor c/pointers
pnpm lab:run c/pointers
pnpm lab:test c/pointers

pnpm lab:create cpp containers --framework cpp
pnpm lab:doctor cpp/containers
pnpm lab:run cpp/containers
pnpm lab:test cpp/containers
```

생성된 Makefile은 C17 / C++20을 사용합니다. `make run`은 빌드 후 실행하며,
`make test`는 빌드 후 `tests/smoke.sh`를 실행합니다. 기본 테스트는 정상 종료를 확인하는 smoke test이므로
실제 실험에서는 출력 비교나 assertion을 추가합니다. 종료 코드가 0이 아니면 CLI도 실패합니다.
새로 생성하는 Makefile은 `CC`, `CXX`를 지원합니다(예: `CC=clang pnpm lab:test c/pointers`).
기존 실험의 Makefile은 자체 컴파일 설정을 가질 수 있습니다.

## 진단이 확인하는 것

`lab:doctor <id>`는 공통 Node.js·pnpm·의존성·플랫폼을 확인한 뒤 선택한 런타임만 검사합니다.
Node는 내장 테스트 모듈을 확인합니다. Python은 3.11 이상, 격리된 venv와 `pip check`를 확인합니다.
C/C++는 버전 출력만 보지 않고 임시 디렉터리에서 작은 프로그램을 컴파일하고 실행합니다.
진단 실패는 종료 코드 1이며 도구를 자동 설치하지 않습니다.

진단 통과는 실험 코드의 정확성을 보장하지 않습니다. Python의 `pip check`는 설치된 패키지 간 일관성을 확인하며,
소스의 모든 import나 requirements의 설치 여부를 보장하지 않습니다. 반드시 `lab:test`도 실행합니다.

## 기존 영상 처리 실험

기존 `framework: python` 실험에는 FastAPI, OpenCV, NumPy, GStreamer, PyGObject가 필요합니다.
기존 파일에는 특정 macOS GStreamer SDK 경로와 Python 웹 등록 파일의 누락된 진입점이 있습니다.
새 일반 Python 환경을 설치해도 이 문제는 해결되지 않습니다.
이 경로는 `lab:doctor`에서 별도 준비가 필요한 상태로 실패를 보고하며, 이번 로컬 런타임 지원의 검증 대상에서 제외합니다.
`apps/python-server/requirements.txt`를 일반 Python 실험에 일괄 설치하지 마세요.

## 구조와 AI 사용

실험의 소스는 `src/`, 테스트는 `tests/`, 기록은 README와 선택적 `docs/`에 둡니다.
`.venv`, `build`, Python 캐시는 Git에서 제외합니다.

```bash
pnpm --filter @frontend-labs/lab-cli test
```

저장소의 [.agents/skills/local-labs/SKILL.md](../.agents/skills/local-labs/SKILL.md)를 AI에 제공하거나
이 저장소에서 `$local-labs`를 호출해 환경 진단과 실험 추가를 요청할 수 있습니다.
AI는 실제 실행 결과와 미검증 환경을 구분해 기록해야 합니다.

## 검증 기록

실행 결과는 [local-environments-validation.md](./local-environments-validation.md)에 기록합니다.

## GitHub Actions

[Local runtimes](https://github.com/Yelihi/labs/actions/workflows/local-runtimes.yml)는
`main` 푸시, PR, 수동 실행 시 Ubuntu 24.04와 macOS 15에서 각각 검사합니다.
Node.js 버전은 `.nvmrc`, pnpm 버전은 `package.json`을 따르며 Python은 3.12입니다.
호스팅 러너의 C/C++ 컴파일러와 Make를 사용하고 `lab:doctor`가 실제 컴파일·실행으로 확인합니다.

각 OS에서 네 `runtime-basics` 실험의 `lab:doctor` → `lab:run` → `lab:test`를 실행합니다.
Python 가상환경은 매번 새로 만들며, pnpm 저장소 캐시만 재사용합니다.
CLI 타입 검사와 구조·회귀 테스트도 실행합니다. 어느 명령이든 실패하면 해당 job도 실패합니다.

전체 실험의 정답 검증이나 GStreamer·브라우저 테스트를 포함하는 워크플로는 아닙니다.
Windows/WSL2는 이 매트릭스에 포함되지 않습니다. 실제 통과 여부는 Actions의 실행별 결과를 확인합니다.
