/**
 * https://gist.github.com/LeeYeeze/46a30c8433d50e26916f
 * 注释部分有所修改： 
 */



function partition(arr, left, right, pivot) {
  var temp = arr[pivot];
  arr[pivot] = arr[right];
  arr[right] = temp;
  var track = left;
  for (var i = left; i < right; i++) {
      if (arr[i]<arr[right]) {
          var t = arr[i];
          arr[i] = arr[track];
          arr[track] = t;
          track++;
      }
  }
  temp = arr[track];
  arr[track] = arr[right];
  arr[right] = temp;
  return track;
}



function selectIdx(arr, left, right, k) {
  if (left == right) {
      // return arr[left];
      return left;
  }
  var dest = left + k;
  while (true) {
      var pivotIndex = right - left + 1 <=5?Math.floor(Math.random()*(right-left+1))+left: medianOfMedians(arr,left,right);
      pivotIndex = partition(arr, left, right, pivotIndex);
      if (pivotIndex == dest)
          return pivotIndex;
      else if (pivotIndex<dest) {
          left = pivotIndex + 1;
      } else {
          right =  pivotIndex -1;
      }
  }
}



function medianOfMedians(arr,left,right) {
  var numMedians = Math.ceil((right-left)/5);
  for (var i = 0 ; i < numMedians; i++) {
      var subLeft = left + i*5;
      var subRight = subLeft + 4;
      if (subRight > right)  {
          subRight = right;
      }
      var medianIdx = selectIdx(arr, subLeft, subRight, Math.floor((subRight-subLeft)/2));
      var temp = arr[medianIdx];
      arr[medianIdx] = arr[left+i];
      arr[left+i] = temp;
  }
  return selectIdx(arr, left, left + numMedians -1, Math.floor(numMedians/2));

}

/**
 * 
 * @param {number[]} arr 
 * @param {number} k 
 * @returns {number}
 */
export default function selectK(arr, k) {
  if (!Array.isArray(arr) || arr.length == 0 || arr.length-1 < k) {
      return;
  }
  var idx = selectIdx(arr,0,arr.length -1,k);
//   return arr[idx];
  return idx;

}

// const arr = [0, 1, 3, 2, 4, 8, 6, 7, 5 ];
// console.log(selectK(arr, Math.ceil(arr.length / 2)));