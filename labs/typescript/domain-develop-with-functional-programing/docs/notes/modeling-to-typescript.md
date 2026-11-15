## typescript 로의 모델링 과정

도메인 전문과와의 설계를 통해 문서를 완성시켰을 경우, 해당 문서에 대한 typescript modeling 을 통해 설정해야 추후 해당 모델에 맞게 구현이 가능해진다.

아래는 문서에 대한 typescript 변환 과정의 요약이다.

그리고 이렇게 model 을 전환하는 것 자체가 모든 협력관계 내 사람들이 공용어로서 인지할 수 있도록 해야한다.
도메인 문서를 잘 정의해놓았다면 충분히 가능하다.

> 참고로 함수형 프로그래밍이기 때문에 라이브러리인 asserts, fp-ts, immer, ts-pattern 을 사용한다.

### 도메인 모델 속 패턴

- 단순값
- 값의 조합
- 선택
- 작업흐름

### 단순값

OrderId 와 ProductId 가 원시 type 인 string 이 같다고 같은 id 로 치환되서는 안된다.

```typescript
declare const customerId: unique symbol;
class CustomerId {
    [customerId]!: never; // branding
    constructor(readonly value: number) {}
}

const customerId = new CustomerId(1);

// 패턴 매칭
const { value } = new CustomerId(1); // value === 1

// 상황에 따라서는 큰 배열을 단순값으로 지정할 필요가 있음
declare const unitQuantities: unique symbol;
class UnitQuantities {
    [unitQuantities]!: never;
    constructor(readonly value: number[]) {}
}
```

다만 이런 단순값들은 제약 조건이 들어갈 수 있다. 이러한 무결성을 지키는 방법은 다음과 같다.

```typescript
import { Either, left, right, isLeft, isRight } from "fp-ts/lib/Either";
import { match, P } from 'ts-pattern';

declare const unitQuantity: unique symbol;
class UnitQuantity {
    [unitQuantity]!: never;
    private constructor(readonly value: number) {
        super()
    }

    /**
     * 조건은 1 보다 크고 1000 보다 작아야 한다.
     */
    static create(i: number): Either<Error, UnitQuantity> {
        if(i < 1){
            return left(new ErrorNumberLessThanMin(i))
        }
        if(i > 1000){
            return left(new ErrorNumberGreaterThanMax(i))
        }
        return right(new UnitQuantity(i));
    }
}

const quantityUnit = UnitQuantity.create(10);
match(quantityUnit)
    .with(P.when(isLeft), () => 실패일경우 실행할 함수)
    .with(P.when(isRight), () => 성공일경우 실행할 함수)
    .exhaustive(); // 타입스크립트 컴파일러가 즉시 빨간줄을(에러) 띄어 개발자의 실수를 막아줌

```

> 여기서 내부 UnitQuantity 내 실패 로직을 함수인자로 받아 처리할수도 있는데, 현재 코드는 문제가 없지만 자칫 콜백 지옥에 걸릴 가능성이 있다. 즉, 실패와 성공시에 대한 행동을 인자로 전달하게 되면, 성공시 전달된 행동 역시 에러가 발생할 수 있고.. 이런식으로 계속 콜백지옥이 발생하니 Either 를 통해 Left, Right 객체를 반환하게 된다.

> 또한 행위를 인자로 넘기는 것은 순수함수 내 법칙 위반인데, 순수함수는 동일 입력 동일 '값'을 반환하는것이다. 그러니깐 에러 상황에서 에러 '행동'을 실행하는것이 아니다. 왜냐하면 이러한 '행동'으로의 결과 값이 호출마다 다를 수 있다.

측정 단위를 설정할 때는 아래와 같이 처리한다

```typescript
declare const _kilogram: unique symbol;
type Kilogram = number & { [_kilogram]!: never };
function kilogram(i: number): Kilogram { return i as Kilogram; }

declare const _meter: unique symbol;
type Meter = number & { [_meter]!: never };
function meter(i: number): Meter { return i as Meter; }

let fivekilos = kilogram(5);
let fivemeters = meter(5);

// 할당 할 수 없다.
fiveKilos = fivemeters; // error: Type 'Meter' is not assignable to type 'Kilogram'.

// 도메인 내 킬로그램을 보장
class KilogramQuantity {
    constructor(readonly value: Kilogram){}
}
```

### 복잡한 데이터 모델링

#### 레코드 모델링

```
data Order = 
    CustomerInfo
    AND ShippingAddress
    AND BillingAddress
    AND list of OrderLines
    AND AmountToBill
```

위 도메인 형식은 아래처럼 모델링 가능

```typescript
class Order {
    constructor(
        readonly customerInfo: CustomerInfo,
        readonly shippingAddress: ShippingAddress,
        readonly billingAddress: BillingAddress,
        readonly orderLines: List<OrderLine>,
        readonly amountToBill: AmountToBill,
    ) {}
}
```

#### 잘 모르겠는 타입 모델링

간단하게 처리해줍시다.

```typescript
type Undefined = never;

type CustomerInfo = Undefined
```

이렇게 기존 undefined 대신 Undefined 를 never 로 따로 정의하여 타입 할당을 하는 이유는 컴파일 과정에서 분명하게 에러를 발생시키기 위함이다. 

#### 선택 타입 모델링

```
data ProductCode = 
    WidgetCode
    OR GizmoCode

data OrderQuantity = 
    UnitQuantity
    OR KilogramQuantity

```

변환하면

```typescript
type ProductCode = WidgetCode | GizmoCode;
type OrderQuantity = UnitQuantity | KilogramQuantity;
```

### 작업 프로세스 모델링

무엇에 대한 모델링이 앞선 설명이었고, 작업에 대한 모델링은 기본적으로 '함수 시그니처' 를 통해 정의한다.

```typescript
// 오류가 발생할 수 있음을 나타내준다.
type ValidateOrder = (i: UnvalidateOrder) => Either<ValidationError, ValidatedOrder>;
```

#### 복잡한 입력 및 출력 처리

여러 입력과 출력을 가지는 작업에 대한 모델링

```
workflow 'Place Order' = 
    input : UnvalidatedOrder
    output (on success) :
        OrderAcknowledgement
        AND OrderPlaced (to send to shipping)
        AND BillableOrderPlaced (to send to billing)
    output (on error) :
        ValidationError

    // step 1
    do ValidateOrder
    If order is invalid then:
        return with ValidationError

    // step 2
    do PriceOrder

    // step 3
    do SendAcknowledgmentToCustomer

    // step 4
    return OrderPlaced event (if no errors)
```

여기서 PlaceOrder 의 경우 여러 출력값을 가짐

```typescript
class PlaceOrderEvents {
    constructor(
        readonly acknowledgment: OrderAcknowledgement,
        readonly orderPlaced: OrderPlaced,
        readonly billableOrderPlaced: BillableOrderPlaced,
    ){}
}

type PlaceOrder = (input: UnvalidatedOrder) => Either<ValidationError, PlaceOrderEvents>;

// 만일 위 PlaceOrder 함수가 비동기라면 fp-ts 내 Task 를 통해 해당 결과는 비동기라는 것을 명시해준다.
type PlaceOrder = (input: UnvalidatedOrder) => Task<Either<ValidationError, PlaceOrderEvents>>;
```

OR 관계라면

```
workflow 'Categorize Inbound Mail' =
    input : Envelope contents
    output:
        QuoteForm (put on appropriate pile)
        OR OrderForm (put on appropriate pile)

```

```typescript
type CategorizedMail = QuoteForm | OrderForm;
type CategorizeInboundMain = (input: EnvelopeContents) => CategorizedMail

```

입력이 여러가지라면, 2가지 접근 방식이 있다.

고차함수 형식으로 매개변수를 전달받는 방식과, 한번에 여러 인자를 전달받는 방식이 있다.

```typescript
// 고차함수 형식
type CalculatePrices = (i: OrderForm) => (j: ProductCatelog) => PricedOrder;

// 한번에 여러 인자 전달받기
class CalculatePricesInput {
    constructor(
        readonly orderForm: OrderForm,
        readonly productCatelog: ProductCatelog,
    ) {}
}

type CalculatePrices = (input: CalculatePricesInput) => PricedOrder;

```

상황에 따라 접근 방식이 차이가 난다

- 실제 입력이 아니라 의존성이라면 별도의 매개변수(고차함수) 로 전달하는것이 좋다.
- 여러 입력이 밀접하게 관련이 되어있다면 레코드로 전달하는것이 좋다.

### 정체성 (Entity, Value Object)

- 엔티티 : 값이 변해도 정체성을 유지하는 데이터, 즉 값이 바뀌어도 여전히 동일 대상으로 여겨지는 데이터
- 값 객체 : 정체성이 없는 데이터로 서로 교환이 가능하다

값 객체가 동일한지 판단하는 함수는 다음과 같다. 

```typescript
import * as assert from 'assert';

interface Equatable {
    equals(obj: unknown): boolean;
}

abstract class ValueObject implements Equatable {
    equals(obj: unknown): boolean {
        try{
            assert.deepStrictEqual(this, obj);
            return true;
        } catch (e) {
            return false;
        }
    }
}
```

엔티티의 단위는 보통 데이터베이스 트랜잭션의 최소 단위라고 할 수 있다. 
엔티티는 id 를 기반으로 구별된다. 엔티티의 같은 여부를 비교할 때는 오로지 id 만 비교해야한다.

이를 위한 Entity 의 추상 클래스를 살펴보면

```typescript
type RawId = string | number | bigint;

interface Equatable {
    equals(obj: unknown): boolean;
}

export abstract class Entity<ID extends RawId | ValueObject> implements Equatable {
    abstract readonly id: ID;

    protected abstract isSameClass(obj: unknown): obj is Entity<ID>;

    equals(obj: unknown): boolean {
        if (!this.isSameClass(obj)) return false;

        const otherId = obj.id;

        return this.id instanceof ValueObject
            ? this.id.equals(otherId)
            : this.id === otherId;
    }
}

type PhoneNumber = string;
type EmailAddress = string;

class Contact extends Entity<ContactId> {
    contactId: ContactId;
    phoneNumber: PhoneNumber;
    emailAddress: EmailAddress;

    get id(): ContactId {
        return this.contactId;
    }

    isSameClass(obj: unknown): obj is Contact {
        return obj instanceof Contact;
    }
}

```

엔티티의 값을 수정할 때, 고유 id 를 그대로 유지한 채로 내부 값을 변경시키면 된다.
다만 함수형 프로그래밍에서는 원본을 변경하지 않는것을 원칙으로 하기에(불변성) 새로운 엔티티를 반환해주면 되는데,
이 엔티티가 기존의 엔티티의 id 를 가지고 있으면 된다. (보통 불변성 객체에 대한 수정을 immer 를 이용한다)

불변성의 특징을 활용하여

```typescript
type updateName = (person: Person) => (name: string) => Person;
```

위처럼 Person 을 반환한다고 명시적으로 표현이 가능하다.

만일 특정 값을 불변성으로 강제하기 위해서는 엔티티 선언시 조건을 달아주면 된다.

```typescript
import { NonEmptyArray } from "fp-ts/NonEmptyArray";
class Order {
    readonly orderLines: NonEmptyArray<OrderLine>;
}

```

#### 집합체 (Aggregate)

여러 엔티티들은 서로 연관되어있을 수 있는데, 이들은 서로 집합을 이루는데, 이때 엔티티에 수정이 발생하면 좀 주의해야함

예를 들어 Order 와 OrderLine 이 있고, Order 내부에 OrderLine 을 가지고 있는데, 둘 다 엔티티라고 하면 만일 OrderLine 이 수정이 발생하면 당연히 OrderLine 뿐 아니라 Order 역시 수정이 발생해야 한다. 

결국 최상위 레벨 엔티티만이 영속성을 가지게되는데, 이것을 Aggregate Root 라고 부른다.

변경하는 함수의 예시는 다음과 같다.

```typescript
import { produce } from 'immer';
import { pipe } from 'fp-ts/function';

const changeOrderLinePrice = (order: Order, orderLine: OrderLineId, newPrice: number) => {
    const orderLine = pipe(order.orderLines, findOrderLine(orderLineId));

    const newOrderLine = produce(orderLine, (draft) => { draft.price = newPrice; })

    const newOrderLines = pipe(order.orderLines, replaceOrderLine(orderLineId, newOrderLine));

    return produce(order, (draft) => { draft.orderLines = newOrderLines; })
}
```

위에서 보듯 결국 수정은 최상위 수준에서 이루어져야 한다. 
또한 만일 Order 가 여러 엔티티를 참조한다면, 엔티티 자체보다 Id 를 참조하도록 한다.

집합체를 정리해보면

- 집합체는 도메인 객체들의 모음으로 최상위 엔티티가 '루트'인 단일 구성 요소로 취급한다.
- 집합체 내 객체의 모든 변경 사항은 집합체 루트에 적용해야 하며, 집합체는 내부 데이터가 일관성을 유지하도록 동시에 업데이트한다
- 집합체는 데이터 저장, 데이터베이스 트랜잭션, 데이터 전송의 원자적 단위

### 데이터 무결성을 위한 모델링 팁

무결성을 위한 몇가지 팁이 존재한다.

- 함부로 하나의 도메인 내 여러 플래그를 추가하지 않는다.

위 팁의 예제는 다음과 같다.

```typescript

// 이메일이 인증된 이메일과 그렇지 않은 이메일이 있다고 가정할 때, 이를 내부 flag 로 표현하게 되면 편하지만
// 1. 도메인 자체만으로 해당 메일이 인증된 것인지 아닌지 명확하게 드러나지 않는다. 정확히는 어떠한 조건으로 해당 메일이 인증이 된것인지 아닌지 결정하는 로직이 드러나지 않는다. 
// 2. 사용자의 실수가 유발될 수 있다. 인증되지 않은 이메일을 인증된 상태로 전달할수도 있기 때문이다.
class CustomerEmail {
    constructor(
        readonly emailAddress: EmailAddress,
        readonly isVerified: boolean
    ){}
}

// 인증된 메일과 그렇지 않은 메일의 타입을 명확하게 분리하면 된다.
type CustomerEmailAddress = EmailAddress | VerifiedEmailAddress;

class CustomerEmail {
    constructor(
        readonly emailAddress: CustomerEmailAddress
    ){}
}

// 명확히 분리된 타입은 추후 다른곳에서 잘 활용된다
type SendPasswardResetEmail = (input: VerifiedEmailAddress) => ...

```

다른 예시로 '고객은 이메일 또는 주소를 가지고 있어야 한다' 라는 도메인 조건이 있다.

위 경우는 3가지 경우만 존재한다. 
1. 이메일만 있는 경우
2. 주소만 있는 경우
3. 이메일과 주소 둘 다 있는 경우

이것을 타입으로 표현하게되면 다음과 같다.

```typescript
class BothContactMethods {
    constructor(
        readonly email: EmailContactInfo,
        readonly address: AddressContactInfo,
    ){}
}

type ContactInfo =
    | EmailContactInfo
    | AddressContactInfo
    | BothContactMethods

```

억지로 하나의 ContactInfo 내 email, address 를 모두 가지면서 3가지 경우를 표현하는것을 생성하는것보다 명확하게 나누는 것이 좋다.

### 일관성을 위한 팁

- 집합체 루트가 변경의 경계가 되어야 하고, 이러한 집합체는 단일 트랜잭션에서 삽입 혹은 수정한다
- 계산 내 다른 집합체들과의 관계가 있을 경우, id 를 참조하는 것이 좋다.
- 트랜잭션 자체가 도메인이라 생각하면 좋다. 이를 통해 한 집합체를 꼭 여러 곳에 활용할 필요가 없다

마지막 팁에 대한 예제는 다음과 같다.

일반적으로 특정 계좌 A 에서의 일부 돈을 계좌 B 에 이동시킨다고 가정해본다.
트랜잭션 시작 -> 계좌 A 에서 금액 차감 -> 계좌 B 에서 금액 추가 -> 트랜잭션 커밋

한번의 트랜잭션에서 A 와 B 를 모두 따로 처리를 해야하는가?
즉, A 에서는 금액 차감 트랜잭션, B 에서는 금액 추가 트랜잭션을 처리해야하는가?

차라리 트랜잭션 이벤트는 역시나 고유함을 가지며 id 값을 가질 수 있으니 애초에 MoneyTransfer 를 엔티티로 처리하면 된다.

```typescript
class MoneyTransfer {
    constructor(
        readonly moneyTransferId: MoneyTransferId,
        readonly fromAccountId: AccountId,
        readonly toAccountId: AccountId,
        readonly amount: Money,
    ){}
}

```

이렇게 처리하게 되면 트랜잭션 하나당 하나의 집합체를 수정한다는 원칙도 지키며, 변경되는 계좌 내부에서 금액의 차감, 추가에 대한 책임을 지지 않아도 된다. 이는 한 집합체를 꼭 여러 곳에 활용할 필요가 없다는 것을 보여준다.

### 공통 구조 일반화하기

```typescript
type Command<D> = {
    readonly data: D;
    readonly id: CommandId;
    readonly createdAt: Date;
}

class PlaceOrder implements Command<UnvalidatedOrder> {
    constructor(
        readonly data: UnvalidatedOrder,
        readonly id: CommandId,
        readonly createdAt: Date,
    ){}
}
```

### 상태를 표현할 때 최대한 내부 flag 는 지양하기

주문서의 종료가 아래와 같다

- 검증 전 주문서
- 검증 후 주문서
- 가격 책정 주문서

```typescript
// 편하게 설정하려면 flag 를 두면 되는데
// flag 가 많이 쌓일수록 문제가 많아진다
type Order = {
    OrderId : OrderId
    ...
    IsValidated: boolean
    IsPriced: boolean
}
```

위 처럼 표현하게 되면

- 상태가 타입에 드러나지 않고, 이를 다루기 위한 많은 조건문이 필요하다
- 특정 상태에 필요한 데이터들 (예를 들어 검증 주문서와 가격 책정 주문서에 필요한 property 가 다르다면) 이 한데 모여있으면 디자인이 복잡해진다
- 하위 데이터와 플래그 간의 연관성이 명확하지 않다. 예를 들어 IsPriced 를 설정하면 AmountToBill 도 같이 설정해주어야 하는데 이를 디자인상에서 강제할 수 없다. (주석 달아야 함)

아래처럼 나누는게 좋다

```typescript
class UnvalidatedOrder {}
class ValidatedOrder {}
class PricedOrder {}

type Order = UnvalidatedOrder | ValidatedOrder | PricedOrder

```
#### 상태 기계 설계

상황에 따른 각각의 상태를 정의하고, 함수 비즈니스에서 분기에 따른 상태처리를 해주기

```typescript
class Item {}
class ActiveCart { unpaidItems: Item[] }
class PaidCart { paidItems: Item[], payment: number }
class EmptyCart {}

type Cart = ActiveCart | PaidCart | EmptyCart

// cart 에 아이템 추가하기 
// 결과는 새로운 shoppingCart
const addItem = (item: Item) => (cart: Cart) => 
    match(cart)
        .with(P.instanceOf(EmptyCart), _ => new ActiveCart([item]))
        .with(P.instanceOf(ActiveCart), (ac) => new ActiveCart([...ac.unpaidItems, item]))
        .with(P.instanceOf(PaidCart), i => i ) // 무시
        .exhaustive();

// 카드 결제하기
const makePayment = (payment: Payment) => (cart: Cart) =>
    match(cart)
        .with(P.instanceOf(ActiveCart), ({ unpaidItems: existingItems }) => new PaidCart(existingItems, payment))
        .otherWise( i => i ) // 무시
```



### 함수형 프로그래밍 내 의존성 처리

문서 예시를 먼저 보면

```
substep 'ValidateOrder' = 
    input: UnvalidatedOrder
    output: ValidatedOrder OR ValidationError
    dependencies: CheckProductCodeExists, CheckAddressExists
```

의존성을 타입으로 모델링 하기

```typescript
type ValidateOrder = (d1: CheckProductCodeExists, d2: CheckAddressExists) => (input: UnvalidatedOrder) => Either<ValidationError, ValidatedOrder>
```

주문 확인 메일을 작성하고 고객에게 발송한다고 한다면

```typescript
class HtmlString {} // 메일

// 보내지었는지 아닌지 확인하는 boolean
enum SendResult {
    Sent = 'Sent',
    NotSent = 'NotSent',
}
type CreateOrderAcknowledgmentLetter = (i: PricedOrder) => HtmlString;
type SendOrderAcknowledgment = (i: OrderAcknowledgment) => SendResult;

class OrderAcknowledgmentSent {
    constructor(
        readonly emailAddress : EmailAddress,
        readonly orderId: OrderId,
    ){}
}

// 확인 메일이 발송되지 않을 수 있어서 Option 사용
type AcknowledgeOrder = (d1: CreateOrderAcknowledgmentLetter, d2: SendOrderAcknowledgment) => (input: PricedOrder) => Option<OrderAcknowledgmentSent>
```

도메인 내부가 아닌 원격 서비스를 호출할 경우 비동기 호출이기에 이를 표현해주면 좋다.

```typescript
type TaskEither<E, T> = Task<Either<E, T>>

type ValidateOrder = 
    (d1: CheckProductCodeExists, d2: CheckAddressExists)
    => (input: UnvalidatedOrder)
    => TaskEither<ValidationError, ValidatedOrder> // 출력
```

이렇게 의존성을 표현해도 좋을 때와 아닐때가 있음

- 공개 API에 노출되는 함수의 경우, 호출자에게 의존 정보는 숨기자
- 내부적으로 사용되는 함수의 경우, 의존을 명시하자

예를 들어 지금까지의 주문 처리과정의 전체 처리과정이 하나의 API 로 묶여 있다면, 내부에서 처리하는 로직을 외부 사용자가 알 필요가 없다.

```typescript
type PlaceOrderWorkflow = (input: PlaceOrder) => TaskEither<PlaceOrderError, PlaceOrderEvent[]>
```

## 모델링에서 조금은 유연한 접근을 위해

만약 당신이 설계를 한다면 위 예시는 조금 극단적일 수 있다.

- 타입이 너무 많을 수 있지만, 도메인을 잘 반영한 코드를 만드는것이 최우선! 별도 문서 작성을 피하기 위함
- 그 외 줄여도 되는 부분은 (예를 들면 단순값들을 원시값으로 표현) 상황에 맞게 줄이면 됨 