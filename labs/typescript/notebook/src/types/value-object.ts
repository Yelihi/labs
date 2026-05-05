// 정체성이 없는 값 = value object

// 이런 값들은 서로 교환이 가능하다.
// 값 객체의 같음을 typescript 에서 비교하려면 assert 라이브러리가 필요

import * as assert from 'assert';

export interface Equatable {
    equals(obj: unknown): boolean;
}

export abstract class ValueObject implements Equatable {
    equals(obj: unknown): boolean {
        try {
            assert.deepStrictEqual(this, obj)
            return true
        } catch {
            return false
        }
    }
}

// 실제로 비교해보기
class Class1 extends ValueObject {
    constructor(readonly v1: number, readonly v2: string) {
        super()
    }
}

const a = new Class1(1, 'hello')
const b = new Class1(1, 'hello')

a.equals(b) // true