import { isTargetDateAgo } from "@libs/utils";

test("isTargetDateAgo 対象の日付が前にいる場合かどうか", () => {
  // targetが current(現在時刻と仮定) より指定時間が経過していない場合
  expect(
    isTargetDateAgo({
      target: "2022-02-02",
      current: "2022-02-03",
      num: 5,
      ago: "days",
    }),
  ).toBe(false);

  // targetが current(現在時刻と仮定) より指定時間が経過している場合
  expect(
    isTargetDateAgo({
      target: "2022-02-02",
      current: "2022-02-10",
      num: 1,
      ago: "days",
    }),
  ).toBe(true);
});
