// Verify source ranges after non-ASCII text: 枚举.
export enum TestEnum {
  A = 'foo',
  B = 100,
  // prettier-ignore
  C = (1 << 2),
  D = 3.15,
  E = TestEnum.C | 1,
  F = -2,
  'string-key' = 'value',
}
