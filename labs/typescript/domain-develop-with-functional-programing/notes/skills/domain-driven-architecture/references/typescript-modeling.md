# TypeScript Modeling Reference

Source basis: `modeling-to-typescript.md`.

## Mapping Rules

Translate the domain document after the domain language and workflow are coherent.

Core patterns:

- Simple value
- Value composition
- Choice
- Workflow
- Entity
- Value object
- Aggregate
- State machine

Recommended libraries from the notes:

- `fp-ts` for `Either`, `Option`, `Task`, and functional composition.
- `ts-pattern` for exhaustive pattern matching.
- `immer` for immutable aggregate updates.
- Node `assert` or equivalent deep equality for value object equality checks.

## Simple Values

Do not treat primitive-compatible values as interchangeable just because their runtime type is the same.

Use branded types or small classes:

```typescript
declare const customerId: unique symbol;

class CustomerId {
  [customerId]!: never;

  constructor(readonly value: number) {}
}
```

Use factories when values have constraints:

```typescript
import { Either, left, right } from "fp-ts/lib/Either";

declare const unitQuantity: unique symbol;

class UnitQuantity {
  [unitQuantity]!: never;

  private constructor(readonly value: number) {}

  static create(i: number): Either<Error, UnitQuantity> {
    if (i < 1) return left(new Error("UnitQuantity is below minimum"));
    if (i > 999) return left(new Error("UnitQuantity is above maximum"));
    return right(new UnitQuantity(i));
  }
}
```

Use branded numeric units for measurement:

```typescript
declare const kilogramBrand: unique symbol;
type Kilogram = number & { readonly [kilogramBrand]: never };

function kilogram(i: number): Kilogram {
  return i as Kilogram;
}
```

## AND, OR, Unknown

Model `AND` as records/classes:

```typescript
class Order {
  constructor(
    readonly customerInfo: CustomerInfo,
    readonly shippingAddress: ShippingAddress,
    readonly billingAddress: BillingAddress,
    readonly orderLines: ReadonlyArray<OrderLine>,
    readonly amountToBill: AmountToBill,
  ) {}
}
```

Model `OR` as union types:

```typescript
type ProductCode = WidgetCode | GizmoCode;
type OrderQuantity = UnitQuantity | KilogramQuantity;
```

Model unresolved domain concepts so they fail loudly:

```typescript
type Undefined = never;
type CustomerInfo = Undefined;
```

## Workflows

Model workflows as function signatures first:

```typescript
import { Either } from "fp-ts/lib/Either";
import { Task } from "fp-ts/lib/Task";

type ValidateOrder = (
  input: UnvalidatedOrder,
) => Either<ValidationError, ValidatedOrder>;

type PlaceOrder = (
  input: UnvalidatedOrder,
) => Task<Either<ValidationError, PlaceOrderEvents>>;
```

Use a result record/class when success has multiple outputs:

```typescript
class PlaceOrderEvents {
  constructor(
    readonly acknowledgment: OrderAcknowledgement,
    readonly orderPlaced: OrderPlaced,
    readonly billableOrderPlaced: BillableOrderPlaced,
  ) {}
}
```

Use a union when the domain output is an OR:

```typescript
type CategorizedMail = QuoteForm | OrderForm;
type CategorizeInboundMail = (input: EnvelopeContents) => CategorizedMail;
```

For multiple inputs:

- Use curried parameters when values are dependencies or capabilities.
- Use an input record/class when values are one coherent business input.

```typescript
type CalculatePrices = (
  getProductPrice: GetProductPrice,
) => (input: OrderForm) => PricedOrder;

class CalculatePricesInput {
  constructor(
    readonly orderForm: OrderForm,
    readonly productCatalog: ProductCatalog,
  ) {}
}
```

## Entity And Value Object

Use a value object when equality is structural:

```typescript
import * as assert from "assert";

interface Equatable {
  equals(obj: unknown): boolean;
}

abstract class ValueObject implements Equatable {
  equals(obj: unknown): boolean {
    try {
      assert.deepStrictEqual(this, obj);
      return true;
    } catch {
      return false;
    }
  }
}
```

Use an entity when identity remains the same while values change. Compare entities by id only:

```typescript
type RawId = string | number | bigint;

abstract class Entity<ID extends RawId | ValueObject> implements Equatable {
  abstract readonly id: ID;
  protected abstract isSameClass(obj: unknown): obj is Entity<ID>;

  equals(obj: unknown): boolean {
    if (!this.isSameClass(obj)) return false;
    return this.id instanceof ValueObject ? this.id.equals(obj.id) : this.id === obj.id;
  }
}
```

## Aggregates

Use aggregate roots as consistency, persistence, transaction, and transfer boundaries.

Rules:

- Modify aggregate internals through the aggregate root.
- Keep all aggregate data consistent in one update.
- Reference other aggregates by id instead of embedding the full entity.
- Treat a transaction-like business concept as its own aggregate when that keeps one aggregate modified per transaction.

## Data Integrity

Avoid boolean flags when the state affects available data or valid operations.

Prefer explicit state types:

```typescript
class UnvalidatedOrder {}
class ValidatedOrder {}
class PricedOrder {}

type Order = UnvalidatedOrder | ValidatedOrder | PricedOrder;
```

Represent finite valid combinations explicitly instead of optional-property bags:

```typescript
class BothContactMethods {
  constructor(
    readonly email: EmailContactInfo,
    readonly address: AddressContactInfo,
  ) {}
}

type ContactInfo = EmailContactInfo | AddressContactInfo | BothContactMethods;
```

Use state machines for lifecycle transitions:

```typescript
type Cart = EmptyCart | ActiveCart | PaidCart;

type AddItem = (item: Item) => (cart: Cart) => Cart;
type MakePayment = (payment: Payment) => (cart: Cart) => Cart;
```

## Dependencies

Model internal workflow dependencies explicitly:

```typescript
type ValidateOrder = (
  checkProductCodeExists: CheckProductCodeExists,
  checkAddressExists: CheckAddressExists,
) => (input: UnvalidatedOrder) => TaskEither<ValidationError, ValidatedOrder>;
```

Hide dependency wiring from public APIs when callers should not know the internal workflow dependencies.
