// 엔티티는 식별 가능한 정체성을 지닌 객체
// 그렇기에 엔티티의 비교는 오로지 식별자를 통해 진행해야 한다.
type RawId = string | number | bigint;

interface Equatable {
    equals(obj: unknown): boolean;
}

abstract class ValueObject implements Equatable {
    abstract equals(obj: unknown): boolean;
}

abstract class Entity<ID extends RawId | ValueObject> implements Equatable {
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

class ContactId extends ValueObject {
    constructor(readonly value: number) {
        super();
    }

    equals(obj: unknown): boolean {
        return obj instanceof ContactId && this.value === obj.value;
    }
}

class PhoneNumber extends ValueObject {
    constructor(readonly value: string) {
        super();
    }

    equals(obj: unknown): boolean {
        return obj instanceof PhoneNumber && this.value === obj.value;
    }
}

class EmailAddress extends ValueObject {
    constructor(readonly value: string) {
        super();
    }

    equals(obj: unknown): boolean {
        return obj instanceof EmailAddress && this.value === obj.value;
    }
}

class Contact extends Entity<ContactId> {
    constructor(
        readonly contactId: ContactId,
        readonly phoneNumber: PhoneNumber,
        readonly emailAddress: EmailAddress
    ) {
        super();
    }

    get id(): ContactId {
        return this.contactId;
    }

    protected isSameClass(obj: unknown): obj is Contact {
        return obj instanceof Contact;
    }
}

// 집합체 (aggregate) 와 그 root

// 예를 들어 order 와 orderline 의 경우 모두 정체성을 가진 엔티티라고 할 수 있다.
// 다만 order 내부에는 orderline 이 포함된다. orderline[]
// 만일 orderline 이 변경되었다고 하면, 함수형 프로그램에서 불변성을 유지하기 위해 새로운 orderline 을 생성해야한다.
// 그런데 새로운 orderline 이 생성되면, 이를 품은 order 역시 변경이 되어야 하는데, 불변성에 의해 변경이 아니라 order 가 새롭게 생성이 되어야 한다.
// 즉 어떠한 변경 함수 시그니쳐의 행동단위는 orderline 을 변경한다고 할 때, 반드시 order 기준으로 작동을 해야한다. 
// 최종적으로 order 가 새롭게 생성되어 데이터의 일관성을 유지해야한다.

// 이렇게 엔티티의 집합을 집합체라고 하며 최상위 엔티티를 root aggregate 라 한다.
// 이러한 집합체는 데이터의 최소 단위이자, 트랜잭션의 단위다.
// 즉 내부 속성을 임의로 변경해버리면 데이터 일관성이 부셔질 수 있기에 반드시 집합체는 그 집합체 단위로 변경되어야 한다

// 그렇기에 엔티티에 대한 작업(behavior) 의 경우 최상위 엔티티를 인자로 받아 반환 역시 엔티티가 되어야 한다.

