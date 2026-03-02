// 單位轉換函式：千元 → 百萬元
export function convertToMillions(valueInThousands) {
  if (valueInThousands === null || valueInThousands === undefined) {
    return 0;
  }
  const numValue = typeof valueInThousands === 'string'
    ? parseFloat(valueInThousands)
    : valueInThousands;
  return numValue / 1000;
}
