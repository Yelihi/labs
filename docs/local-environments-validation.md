# 로컬 환경 검증 기록

검증일: 2026-11-15 (Asia/Seoul)

## 실제 실행한 환경

- macOS / arm64
- Node.js 26.0.0, pnpm 10.33.0
- 기본 버전 Node.js 24.22.3에서도 Node 실험의 doctor/run/test 통과
- Python 3.14.4, 실험별 venv
- Apple Clang 21.0.0, GNU Make 3.81

## 결과

저장소의 생성 명령으로 `runtime-basics` 예제를 만든 뒤 아래 명령을 실제 실행했습니다.

| 실험 ID               | lab:doctor             | lab:run            | lab:test                  |
| --------------------- | ---------------------- | ------------------ | ------------------------- |
| node/runtime-basics   | 종료 0                 | 결과 5, 종료 0     | Node 내장 테스트 1개 통과 |
| python/runtime-basics | venv·pip check 통과    | 결과 5, 종료 0     | unittest 1개 통과         |
| c/runtime-basics      | C17 컴파일·실행 통과   | 프로그램 정상 종료 | 빌드·smoke script 종료 0  |
| cpp/runtime-basics    | C++20 컴파일·실행 통과 | 프로그램 정상 종료 | 빌드·smoke script 종료 0  |

실제 명령은 `npx --yes pnpm@10.33.0 lab:<doctor|run|test> <id>`입니다.
Python 가상환경은 `python3 -m venv labs/python/runtime-basics/.venv`로 생성했습니다.
C/C++ 진단은 버전 확인 외에 임시 디렉터리의 프로그램을 컴파일하고 실행합니다.

CLI/구조 회귀 테스트와 기존 payload 단위 테스트 33개가 통과했습니다.
의도적으로 실패하는 Node assertion을 임시 실험에 넣어 종료 코드 1이 전달되는 것도 확인했습니다.
컴파일러 없음·Python venv 없음에 대한 진단 메시지와 실패 코드는 모의 테스트로 검사했습니다.
실험 ID 경로 이탈과 빈 Node 테스트 디렉터리도 실패 처리합니다.
CLI 타입 검사와 변경 코드 린트, 스킬 형식 검증, frozen lockfile 설치가 통과했습니다.
기존 `browser/dom-events`의 Chromium 테스트도 1개 통과했습니다.

## 확인하지 않은 범위

- Ubuntu/Linux 및 Windows WSL2의 실제 실행은 아직 하지 않았습니다. 설치 가이드와 지원 대상으로만 명시합니다.
- 기존 Python 웹/GStreamer 실험은 별도 시스템 라이브러리와 등록 문제 때문에 이번 검증에서 제외했습니다.
- C/C++ 기본 smoke test는 정상 실행을 확인하며 알고리즘의 정답을 검증하지 않습니다.
- Node 26의 tsx 실행 중 module.register 관련 deprecation 경고가 있었으나 검증 명령은 성공했습니다.
