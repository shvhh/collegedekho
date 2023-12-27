function traverseAndFlatten(currentNode, target, flattenedKey) {
  for (var key in currentNode) {
    if (currentNode.hasOwnProperty(key)) {
      var newKey;
      if (flattenedKey === undefined) {
        newKey = key;
      } else {
        newKey = flattenedKey + '.' + key;
      }

      var value = currentNode[key];
      if (typeof value === 'object') {
        traverseAndFlatten(value, target, newKey);
      } else {
        target[newKey] = value;
      }
    }
  }
}

 function flattenObj(obj) {
  var flattenedObject = {};
  traverseAndFlatten(obj, flattenedObject);
  return flattenedObject;
}

 function unflattenObj(obj) {
  var unflattenedObject = {};
  for (var key in obj) {
    if (obj.hasOwnProperty(key)) {
      var value = obj[key];
      var keys = key.split('.');
      var currentNode = unflattenedObject;
      for (var i = 0; i < keys.length - 1; i++) {
        var currentKey = keys[i];
        if (currentNode[currentKey] === undefined) {
          //   if (!isNaN(Number(currentKey))) {
          //     currentNode[currentKey] = [];
          //   } else {
          currentNode[currentKey] = {};
          //   }
        }
        currentNode = currentNode[currentKey];
      }
      if (!isNaN(Number(keys[keys.length - 1]))) {
        currentNode[keys[keys.length - 1]] = [];
      }
      currentNode[keys[keys.length - 1]] = value;
    }
  }
  return makeIntegerKeyToArray(unflattenedObject);
}

const makeIntegerKeyToArray = (obj) => {
  let target = [];
  if (isNaN(Number(Object.keys(obj)[0]))) {
    target = {};
  }

  for (let key in obj) {
    if (obj.hasOwnProperty(key)) {
      let value = obj[key];
      if (typeof value === 'object' && !(value instanceof Date)) {
        value = makeIntegerKeyToArray(value);
        target[key] = value;
      } else {
        target[key] = value;
      }
    }
  }
  return target;
};
module.exports = { flattenObj, unflattenObj };
