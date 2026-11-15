# React Components

## Lab ID

`react/react-components`

## Framework

`react-vite`

## Goal

TODO

## How to run

```bash
pnpm dev:react
```

## How to test

```bash
pnpm lab:test react/react-components
```

## Supporting material

Existing plans, notes, and results are preserved in [docs/](./docs/).

## Chromium 동작 검증

위 테스트 명령은 실제 검색 서비스(300ms debounce + 1초 지연)를 사용하여 다음을 확인합니다.

- 공백·대소문자 정규화, 검색 결과와 마우스 선택
- 방향키 이동, Escape로 목록 닫기, 포커스 복귀와 Enter 선택
- 요청 중 검색어 변경, 결과 없음, 짧은 입력과 입력 지우기

GitHub Actions의 Browser labs / react-vite 작업에서도 실행합니다.
