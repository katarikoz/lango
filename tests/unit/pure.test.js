import { describe, it, expect } from "vitest";
import { parseNumericAnswer } from "../../src/pure.js";

describe("parseNumericAnswer", () => {
  it("разбирает целые числа", () => {
    expect(parseNumericAnswer("3")).toBe(3);
    expect(parseNumericAnswer(" 12 ")).toBe(12);
    expect(parseNumericAnswer("0")).toBe(0);
  });

  it("разбирает десятичные с точкой и запятой", () => {
    expect(parseNumericAnswer("0.25")).toBe(0.25);
    expect(parseNumericAnswer("0,75")).toBe(0.75);
  });

  it("разбирает простые дроби (это и был баг: parseFloat('3/8') === 3)", () => {
    expect(parseNumericAnswer("3/8")).toBe(0.375);
    expect(parseNumericAnswer("3/8")).not.toBe(3);
  });

  it("считает эквивалентные дроби равными по значению", () => {
    expect(parseNumericAnswer("6/16")).toBe(parseNumericAnswer("3/8"));
    expect(parseNumericAnswer("16/2")).toBe(8);
  });

  it("терпит пробелы вокруг слэша", () => {
    expect(parseNumericAnswer("3 / 8")).toBe(0.375);
  });

  it("разбирает смешанные числа", () => {
    expect(parseNumericAnswer("1 3/4")).toBe(1.75);
    expect(parseNumericAnswer("2 1/2")).toBe(2.5);
  });

  it("возвращает NaN на мусоре, пустом и делении на ноль", () => {
    for (const bad of ["abc", "", "   ", "/8", "3/", "5/0", "1/2/3"]) {
      expect(Number.isNaN(parseNumericAnswer(bad))).toBe(true);
    }
  });

  it("безопасен на null/undefined", () => {
    expect(Number.isNaN(parseNumericAnswer(null))).toBe(true);
    expect(Number.isNaN(parseNumericAnswer(undefined))).toBe(true);
  });
});
