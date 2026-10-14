import isOdd from "is-odd";
export function oddCount(nums) {
  return nums.filter((n) => isOdd(n)).length;
}
