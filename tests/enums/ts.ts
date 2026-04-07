import { TestEnum2 } from './tsx'

export enum TestEnum {
  A = 'foo',
  B = 100,
  C = 1 << 2,
  D = 3.14,
  E = -1,
  F = ~0,
}

// nested BinaryExpression, self-referencing compound members, MemberExpression initializer
export enum Flags {
  None = 0x00,
  A = 0x01,
  B = 0x02,
  C = 0x04,
  D = 0x08,
  E = 0x10,
  AB = Flags.A | Flags.B,
  ABC = Flags.AB | Flags.C,
  ABCD = Flags.AB | Flags.C | Flags.D,
  All = Flags.ABCD,
  NotAll = ~Flags.ABCD,
}

// bare Identifier referencing sibling enum member, duplicate numeric values
export enum Items {
  First,
  Second,
  Third,
  Last = Third,
  Next,
}

export enum CrossFileRef {
  X = TestEnum2.B,
}
