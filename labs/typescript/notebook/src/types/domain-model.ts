import { Either, match, left, right } from "fp-ts/lib/Either";
import { Task } from "fp-ts/lib/Task";


declare const customerId: unique symbol;
class CustomId {
    [customerId]!: never; // 브랜드
    constructor(readonly value: number) { }
}

declare const orderId: unique symbol;
class OrderId {
    [orderId]!: never;
    constructor(readonly value: number) { }
}

declare const widgetCode: unique symbol;
class WidgetCode {
    [widgetCode]!: never;
    constructor(readonly value: string) { }
}

declare const unitQuantity: unique symbol;
class UnitQuantity {
    [unitQuantity]!: never;
    constructor(readonly value: number) { }
}

declare const kilogramQuantity: unique symbol;
class KilogramQuantity {
    [kilogramQuantity]!: never;
    constructor(readonly value: number) { }
}

// 예시
const cId = new CustomId(42);
const oId = new OrderId(42);
const wCode = new WidgetCode("w001");
const uQty = new UnitQuantity(42);
const kQty = new KilogramQuantity(42);

// 패턴 매칭
// 내부의 타입과 값을 추출한다.
const { value } = new CustomId(45); // value === 45

// @ts-expect-error
// This comparison appears to be unintentional because the types 'CustomId' and 'OrderId' have no overlap.
cId === oId;

// @ts-expect-error
// Property '[customerId]' is missing in type 'OrderId' but required in type 'CustomId'.
const temp: CustomId = new OrderId(33);

// 전부 다 단순 타입 적용 시 큰 배열을 순회하면 성능이 원시 타입보다 저하될 수 있다.
// 만일 unitQuantity 의 다수 배열을 unitQuantities 라고 도메인을 정의한다면 성능과 타입 추론을 잡을 수 있다.
declare const unitQuantities: unique symbol;
class UnitQuantities {
    [unitQuantities]!: never;
    constructor(readonly value: number[]) { }
}

const quantities = new UnitQuantities([100, 200, 300]);

// 배열 순회 성능은 원시 타입과 동일
for (const q of quantities.value) { }

/**
 * 복잡한 데이터 모델링
 */

// 아직 정해지지 않은 타입 
// 내부 타입을 무엇으로 할지 결정되지 않을 경우 사용할 수 있음.
type Undefined = never;

// 예시
// 실제 컴파일 실행 시 에러발생하여 미연에 실수 방지 가능
type CustomerInfo = Undefined

// 비즈니스 로직에 대한 함수 시그니쳐 처리
type UnvalidatedOrder = {
    customerId: CustomId;
    widgetCode: WidgetCode;
    unitQuantity: UnitQuantity;
    kilogramQuantity: KilogramQuantity;
}

type OrderPlaced = Undefined
type BillableOrderPlaced = Undefined

// 다중 and출력
class PlaceOrderEvents {
    constructor(
        readonly acknowledged: boolean,
        readonly orderPlaced: OrderPlaced,
        readonly billableOrderPlaced: BillableOrderPlaced,
    ) { }
}

// 함수 시그니쳐 내 Return 값 정의
type PlaceOrder = (i: UnvalidatedOrder) => PlaceOrderEvents;

// 선택 타입 output
declare const envelopeContents: unique symbol;
class EnvelopeContents {
    [envelopeContents]!: never;
    constructor(readonly value: string) { }
}

type QuoteForm = Undefined;
type OrderForm = Undefined;
type PriceOrder = Undefined;
type ProductCatalog = Undefined;

// Or 처리
type CategorizeMail = QuoteForm | OrderForm;
type CategorizeInboundMail = (e: EnvelopeContents) => CategorizeMail;

// 여러 입력값 처리

// 고차함수 (의존성 주입)
type CalculatePrices = (i: OrderForm) => (j: ProductCatalog) => PriceOrder;

// 새로운 레코드 생성
// 2개 인자 밀접 연관 시
class CalculatePricesInput {
    constructor(
        readonly orderForm: OrderForm,
        readonly productCatalog: ProductCatalog,
    ) { }
}

type CalculatePrices2 = (i: CalculatePricesInput) => PriceOrder;

/**
 * 함수 시그니쳐 에서 효과 문서화
 */

// 에러가 발생할 수 있음을 (효과) 표시
// task 를 통해 비동기 함수의 효과를 표시
type ValidateOrder = (i: UnvalidatedOrder) => Task<Either<Error, ValidateOrder>>



declare const unitQuantity1: unique symbol;
class UnitQuantity1 {
    [unitQuantity1]!: never;
    private constructor(readonly value: number) { }

    /**
     * 조건은 1 보다 크고 1000 보다 작아야 한다.
     */
    static create(i: number): Either<Error, UnitQuantity1> {
        if (i < 1) {
            return left(new Error('number is less than min'))
        }
        if (i > 1000) {
            return left(new Error('number is greater than max'))
        }
        return right(new UnitQuantity1(i));
    }
}

const a = UnitQuantity1.create(20);
match(a).with()