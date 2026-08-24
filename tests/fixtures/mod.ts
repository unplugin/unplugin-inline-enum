// Verify source ranges after non-ASCII text: 枚举.
export const enum TestEnum {
  A = 'foo',
  B = 100,
  // prettier-ignore
  C = (1 << 2),
}

export const values = [TestEnum.A, TestEnum.B, TestEnum.C]
