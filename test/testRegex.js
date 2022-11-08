function test1() {
  const regex1 = /\[((x|y).(start|end)=(\d+),)*((x|y).(start|end)=(\d+))\]/g;
  const str1 = "[x.start=1,x.end=10,y.start=2,y.end=20][y.start=2,y.end=20]";
  const result = [...str1.matchAll(regex1)];
  console.log(result[0]);
  // console.log(result[1]);
  // console.log(result.length);
}


function test2(){
  const SHAPE_SEARCH_REGEX= /\[((x|y).(s|e)=(\d+),)*((x|y).(s|e)=(\d+))\]/g;
  const str = "[x.s=1,x.e=10,y.s=10,y.e=20]";
  const results = [...str.matchAll(SHAPE_SEARCH_REGEX)];
  console.log(results);
}

test2();