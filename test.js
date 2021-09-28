let testBucket = {
  left: {
    '-1.5--1': { avg: 0, freq: 0 },
    '-1--0.5': { avg: 0, freq: 0 },
    '-0.5-0': { avg: 0, freq: 0 },
    '0-0.5': { avg: 0, freq: 0 },
    '0.5-1': { avg: 0, freq: 0 },
    '1-1.5': { avg: 0, freq: 0 },
    '1.5-2': { avg: 0, freq: 0 },
    '2-2.5': { avg: 0, freq: 0 },
    '2.5-3': { avg: 0, freq: 0 },
    '3-3.5': { avg: 0, freq: 0 },
    '3.5-4': { avg: 0, freq: 0 },
  },
  right: {
    '-1.5--1': { avg: 0, freq: 0 },
    '-1--0.5': { avg: 0, freq: 0 },
    '-0.5-0': { avg: 0, freq: 0 },
    '0-0.5': { avg: 0, freq: 0 },
    '0.5-1': { avg: 0, freq: 0 },
    '1-1.5': { avg: 0, freq: 0 },
    '1.5-2': { avg: 0, freq: 0 },
    '2-2.5': { avg: 0, freq: 0 },
    '2.5-3': { avg: 0, freq: 0 },
    '3-3.5': { avg: 0, freq: 0 },
    '3.5-4': { avg: 0, freq: 0 },
  },
};

export function getTestBucket() {
  return testBucket;
}
function getModifiedBucket(dir, val, dy) {
  return {
    avg:
      (dy + testBucket[dir][val]['freq'] * testBucket[dir][val]['avg']) /
      (testBucket[dir][val]['freq'] + 1),
    freq: testBucket[dir][val]['freq'] + 1,
  };
}
export function populateTestBucket(dir, dy, irisZ) {
  if (irisZ > 0 && irisZ <= 0.5) {
    testBucket[dir]['0-0.5'] = getModifiedBucket(dir, '0-0.5', dy);
  } else if (irisZ > 0.5 && irisZ <= 1) {
    testBucket[dir]['0.5-1'] = getModifiedBucket(dir, '0.5-1', dy);
  } else if (irisZ > 1 && irisZ <= 1.5) {
    testBucket[dir]['1-1.5'] = getModifiedBucket(dir, '1-1.5', dy);
  } else if (irisZ > 1.5 && irisZ <= 2) {
    testBucket[dir]['1.5-2'] = getModifiedBucket(dir, '1.5-2', dy);
  } else if (irisZ > 2 && irisZ <= 2.5) {
    testBucket[dir]['2-2.5'] = getModifiedBucket(dir, '2-2.5', dy);
  } else if (irisZ > 2.5 && irisZ <= 3) {
    testBucket[dir]['2.5-3'] = getModifiedBucket(dir, '2.5-3', dy);
  } else if (irisZ > 3 && irisZ <= 3.5) {
    testBucket[dir]['3-3.5'] = getModifiedBucket(dir, '3-3.5', dy);
  } else if (irisZ > 3.5 && irisZ <= 4) {
    testBucket[dir]['3.5-4'] = getModifiedBucket(dir, '3.5-4', dy);
  } else if (irisZ > -0.5 && irisZ <= 0) {
    testBucket[dir]['-0.5-0'] = getModifiedBucket(dir, '-0.5-0', dy);
  } else if (irisZ > -1 && irisZ <= -0.5) {
    testBucket[dir]['-1--0.5'] = getModifiedBucket(dir, '-1--0.5', dy);
  } else if (irisZ > -1.5 && irisZ <= -1) {
    testBucket[dir]['-1.5--1'] = getModifiedBucket(dir, '-1.5--1', dy);
  }
}

// populateTestBucket('left', leftDy, leftIrisZ);
// populateTestBucket('right', rightDy, rightIrisZ);
