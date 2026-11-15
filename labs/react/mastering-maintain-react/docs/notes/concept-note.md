# CONCEPT - Mastering Maintain React

### Refactoring

1. **이름 변경 (Rename):** 함수, 변수, 모듈, 클래스 이름을 도메인/비즈니스 용어에 맞게 명확하게 변경 (예: `abc`, `i`, `j` 같은 의미 없는 이름 교체).
2. **이동 (Move):** 필드나 함수를 적절한 클래스/파일/모듈로 이동 (예: 컴포넌트 내 유틸리티 함수를 별도 유틸 파일로 추출).
3. **변수/함수 추출 (Extract Variable / Extract Function):** 중복되는 표현식이나 로직을 변수나 별도 함수로 추출.
4. **인라인화 (Inline):** 불필요하게 추상화된 변수나 함수를 다시 원래 위치로 되돌림.
5. **특수 케이스 패턴 (Special Case Pattern):** `null`, `undefined` 체크 등으로 복잡해진 조건문을 단순화.
6. **컬렉션 API 활용:** 기본 `for` 루프 대신 `map`, `filter`, `reduce` 등 JavaScript 배열 API 활용.
7. **다형성 활용 (Polymorphism):** 복잡한 조건문(`if-else`, `switch`)을 클래스와 다형성을 이용해 대체.



### 실습 예시 : ROT13 알고리즘 개선

```typescript
export const convert = (str: string) => {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"

  return str
    .split("")
    .map(str: string) => {
      const index = letters.indexOf(str);
      return index !== -1 ? letters[(index + 13) % letters.length] : str;
    }
    .join("")
}

```

- convert 라는 명칭이 너무 일반적임
- 함수 내부 정의된 letters
- 13, "" 와 같은 magic number
- split 부터 시작하여 좀 더 복잡하게 작성된 함수
- map 내부 익명함수

```typescript
const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"

const separator = "";
const shift = 13;

const getIndex = (index: number) => (index + shift) % letters.length;

const transform = (str: string) => {
  const index = letters.indexOf(str);
  return index !== -1 ? letters[getIndex(index)] : str;
}

export const rot13 = (str: string) => str.split(separator).map(transform).join(separator)
```

- 연결된 고차함수 연결에는 확실하게 의도를 드러낼 수 있도록 처리
- 익명함수 대신 명확한 역할을 표현하는 함수 생성
- 매직넘버 삭제
- 함수 이름 명확하게


### 10가지 리팩토리 범주

리펙토링은 작은 단위부터 너무 추상적이지 않게 진행하도록 하고 거창하지 않아도 된다.

> 크게 Extract(추출) 과 Move(이동) 으로 범주를 나눌 수 있음

### 10가지 목록

1. Extract Variable (변수 추출): 긴 표현식이나 개념을 명확한 의미의 변수로 추출 (예: 매직 넘버/문자열을 의미 있는 상수로 정의).

2. Extract Function (함수 추출): 함수가 너무 길어지거나 복잡해질 때 로직 일부를 별도 함수로 추출하고 명확한 이름을 부여.

3. Extract Parameter (파라미터 추출): 함수 내부 상태를 외부에서 전달받도록 매개변수화하여 커플링 제거.

4. Extract Type Definition (타입 정의 추출): TypeScript 등에서 Props나 타입 목록이 길어질 때 별도 타입 선언으로 추출.

5. Slide Statements (문장 슬라이드): 관련 있는 코드끼리 가까이 위치하도록 줄 위치를 이동시켜 가독성 향상.

6. Change Function Declaration (함수 선언 변경): 함수 역할 변경 시 이름 및 서명을 변경하여 동작을 정확히 반영.

7. Change Variable (변수 변경): 모호하게 작성되었던 변수명을 명확하고 적절한 이름으로 교체.

8. Move Field (필드/로직 이동): 재사용성이 높거나 파일을 간결하게 만들기 위해 로직을 별도 파일로 분리.

9. Inline Variable (변수 인라인화): 불필요하게 추상화되었거나 한 번만 사용되는 표현식을 원위치로 되돌림.

10. Change Signature (서명 변경): 매개변수 순서 변경, 추가/삭제, 타입 변경 등의 종합적인 조합 적용.

이 외 boolean 파라미터를 전달하게 되면, 사용하는 쪽에서 인자로 false, true 를 전달해야 하기에 의미를 파악하기 어려워, boolean 기준에 따라 내부 동작이 달라지는것을 아예 역활이 명시된 두개의 함수로 분리한 다음, 내부 공통 로직을 기본 함수로 생성하여 재사용 하도록 하는 방식이 있음


### Testing

테스트 코드는 개발자에게 아주 좋은 가치를 전달한다.

### 테스트가 개발자가에 주는 이점


1. 그 자체로 훌륭한 문서 역할 (Living Documentation):

- 새로운 프로젝트에 온보딩할 때 테스트 코드를 먼저 읽으면 시스템의 예상 입력/출력값과 모듈 동작 방식을 쉽게 이해할 수 있다.

- 단위 테스트는 모듈 수준의 동작을, 통합/E2E 테스트는 전체 기능 및 사용자 관점의 가치를 보여준다.

2. 기존 코드 보호 (Safety Net):

- 코드를 수정할 때 다른 부분을 깨뜨리지 않도록 보호한다.

- 다른 사람이 내 코드를 변경하여 영향을 줄 때도 테스트 실패를 통해 빠르게 감지할 수 있다.

3. 디버깅 시간 단축:

- 문제 발생 시 조사 범위를 좁혀주어 원인 분석 및 결함(Defect) 수정을 훨씬 빠르고 쉽게 만들어 준다.

4. 코드베이스에 대한 확신과 리팩토링 가이드:

- 높은 테스트 커버리지는 코드 변경에 대한 확신을 준다.

- 리팩토링이나 신규 기능 추가 시 "기존 기능이 부서지지 않는다"는 안전망 역할을 하여 적극적으로 코드를 개선할 수 있게 돕는다.

5. 개발 프로세스의 원활한 흐름 (Automated Feedback):

- 자동화된 테스트(단위, 통합, E2E 등)가 즉각적인 피드백을 제공하여 개발 과정을 훨씬 매끄럽고 안정적으로 안내해 준다.


#### Jest 의 테스트 구조

테스트 코드 구조화의 필요성:

- 작성된 테스트가 많아질 때 Jest의 중첩된 describe 블록을 활용하면 계층 구조로 깔끔하게 정리되어 이해와 유지보수가 훨씬 쉬워진다.

```typescript
describe("calculators", () => {
  beforeEach(() => {})

  afterEach(() => {})

  descirbe("add", () => {
    beforeEach(() => {})

    afterEach(() => {})

    it("adds two positive numbers", () => {})
    it("adds two negative numbers", () => {})
    it("adds one positive number and one negative number", () => {})
  })

  describe.skip("subtract", () => {})

  describe("multiple", () => {})
})


```

- 계층적 구조화: 상위 describe("calculator") 안에 기능별로 describe("addition"), describe("subtraction") 등의 하위 블록을 선언하여 가독성 향상.
- beforeEach / afterEach: 공통 설정 및 정리를 위해 사용하며, 하위 describe 블록 내부에 작성 시 해당 구역 내에서만 격리되어 실행됨.
- 특정 버그를 수정할 때 전체 테스트를 실행하지 않고, describe.only 또는 it.only를 사용하여 원하는 테스트만 집중 실행 가능.
- skip 기능을 통해 불필요한 테스트 블록을 건너뛰어 디버깅 시간을 대폭 단축.


### Test Driven Development

* 유지보수하기 쉬운 코드(Maintainable Code)를 작성하기 위한 핵심 방법론이자, 개발 과정에서 선순환 피드백 루프(Good Feedback Loop)를 만들어 줌.
* 개발자가 사용자/고객에게 **가장 중요한 기능에 집중**하여 가치를 전달할 수 있도록 안내.

---

### 🔄 TDD의 3단계 프로세스 (Three Steps)

1. **테스트 작성 (Write the test):**
* 구현체(Implementation)가 없으므로 첫 테스트는 실패한다.
* 사용자 관점에서 **기대하는 동작과 필수 기능**을 명확히 기술하며 개발 방향을 설정.


2. **통과시키기 (Make it pass):**
* **최소한의 코드 작성**으로 빠르게 테스트를 통과시킨다. (필요하다면 하드코딩된 값을 반환해서라도 통과)
* 다양한 엣지 케이스(Edge cases)를 포함하는 테스트 그룹을 만들어 신뢰도를 높인다.


3. **정돈 및 리팩토링 (Clean up / Refactoring):**
* 테스트를 통과시킨 상태에서 변수명 변경, 함수 추출, 조건문 정리 등 다양한 리팩토링을 진행한다.
* 이미 튼튼한 안전망(테스트)이 구축되어 있으므로 안심하고 코드를 개선할 수 있다.

---

## 📐 Kent Beck의 단순한 디자인 4가지 규칙 (Four Rules of Simple Design)

> TDD의 3단계(리팩토링) 진행 시 코드를 어떻게 다듬어야 하는지에 대한 가이드라인.

1. **테스트를 통과할 것 (Passes the tests):** 시스템이 의도한 대로 동작함을 검증.
2. **의도를 명확히 드러낼 것 (Reveals intention):** 도메인 용어에 맞는 변수명, 클래스명, 파일명을 사용하여 가독성 확보.
3. **중복이 없을 것 (No duplications):** 단순 복사-붙여넣기 및 추상화 부족으로 발생한 중복 요소 제거.
4. **최소한의 요소만 유지할 것 (Fewest elements):** 과잉 설계(Over-engineering)를 방지하고, 필요 이상의 복잡성을 줄여 최소한의 구성 요소만 유지.
