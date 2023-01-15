import parseShapeSearch from "../helpers/query/converters/parseShapeSearch"

const X_RANGE: [number, number] = [0, 1000];
const Y_RANGE: [number, number]= [0, 1000];
const S_RANGE: [number, number]= [0, 180];

test("test shape search 1", () => {
  const shapeSearchExpr = `
  [
    x.s=100,
    x.e=200,
    y.s=2,
    y.e=200,
    p=0.5
  ]
  [
    x.s=200,
    x.e=300,
    s.s=-30,
    s.e=30,
    p=0.6
  ]`;
  const expectedTasks = [
    {
      mode: 'timebox',
      constraint: { xStart: 100, xEnd: 200, yStart: 2, yEnd: 200, p: 0.5 }
    },
    {
      mode: 'angular',
      constraint: { xStart: 200, xEnd: 300, sStart: -30, sEnd: 30, p: 0.6 }
    }
  ];
  const tasks = parseShapeSearch(shapeSearchExpr, X_RANGE, Y_RANGE, S_RANGE);
  expect(tasks).toEqual(expectedTasks);
});

test("test shape search 2", () => {
  const shapeSearchExpr = `
  [
    x.s=100,
    x.e=200,
    y.s=2,
    y.e=200,
    p=0.5
  ]
  [
    x.s=200,
    x.e=300,
    s.s=-30,
    s.e=30
  ]
  [

  ]`;
  const expectedTasks = [
    {
      mode: 'timebox',
      constraint: { xStart: 100, xEnd: 200, yStart: 2, yEnd: 200, p: 0.5 }
    },
    {
      mode: 'angular',
      constraint: { xStart: 200, xEnd: 300, sStart: -30, sEnd: 30, p: 1 }
    },
    {
      mode: 'timebox',
      constraint: { xStart: X_RANGE[0], xEnd: X_RANGE[1], yStart: Y_RANGE[0], yEnd: Y_RANGE[1], p: 1 }
    },
  ];
  const tasks = parseShapeSearch(shapeSearchExpr, X_RANGE, Y_RANGE, S_RANGE);
  console.log(tasks);
  expect(tasks).toEqual(expectedTasks);
});