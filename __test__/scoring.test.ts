import { gaussian, gaussian2D } from "../helpers/query/algorithms/scoring";


test("test gaussian", () => {
  const result = gaussian(0);
  const result2 = gaussian(1);
  const result3 = gaussian(-1);
  expect(result).toBe(1);
  expect(result2).toBe(result3);
  expect(result2 < result && result2 > 0).toBe(true);
});


test("test gaussian2d", () => {
  const result = gaussian2D(0, 0);
  const result2 = gaussian(1, 0);
  const result3 = gaussian(0, 1);
  expect(result).toBe(1);
  expect(result2).toBe(result3);
  expect(result2 < result && result2 > 0).toBe(true);
});