
class Tools {

  //http://javascriptissexy.com/oop-in-javascript-what-you-need-to-know/#Inheritance_in_JavaScript
  static inheritPrototype(childObject, parentObject) {
    // As discussed above, we use the Crockford’s method to copy the properties and methods from the parentObject onto the childObject​
    // So the copyOfParent object now has everything the parentObject has ​
    var copyOfParent = Object.create(parentObject.prototype);

    //Then we set the constructor of this new object to point to the childObject.​
    // Why do we manually set the copyOfParent constructor here, see the explanation immediately following this code block.​
    copyOfParent.constructor = childObject;

    // Then we set the childObject prototype to copyOfParent, so that the childObject can in turn inherit everything from copyOfParent (from parentObject)​
    childObject.prototype = copyOfParent;
  }

  static cloneOfObject(object) {
    return JSON.parse(JSON.stringify(object));
  }

  /*
   * Obiekt _blobEnviObject:
   * { blobBase64String: base64data,
   *   name: blob.name,
   *   mimeType: blob.mimeType
   * }
   */
  static _blobEnviObjectToBlob(_blobEnviObject: _blobEnviObject) {
    return this.b64ToBlob(_blobEnviObject.blobBase64String, _blobEnviObject.mimeType, _blobEnviObject.name);
  }

  //https://stackoverflow.com/questions/35236232/create-image-file-base64-to-blob-using-google-appscript?rq=1
  static b64ToBlob(base64: string, contentType: string, name: string): GoogleAppsScript.Base.Blob {
    if (!contentType) contentType = '';
    //var base64 = "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";
    //var base64 = "iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg=="
    var decoded = Utilities.base64Decode(base64);
    return Utilities.newBlob(decoded, contentType, name);
  }

  static enumFieldsToArray(enumToParse): { key: string, value: any }[] {
    let array: { key: string, value: any }[] = [];

    for (var n in enumToParse) {
      if (typeof enumToParse[n] === 'number') {
        array.push({ key: n, value: <any>enumToParse[n] });
      }
    }
    return array;
  }

  static makeIdsListString(objectList: any[]): any[] {
    return objectList.map(function (item) {
      var idString = '' + item.id;
      if (objectList.indexOf(item) < objectList.length)
        idString += ', ';

    });
  }

  static createZip(obj, parentFolderGdId: string) {
    var blobs = obj.map(function (e) {
      return Utilities.newBlob(Utilities.base64Decode(e.data), e.mimeType, e.fileName);
    });
    var zip = Utilities.zip(blobs, "filename.zip");
    return DriveApp.getFolderById(parentFolderGdId).createFile(zip).getId();
  }

  static isInteger(x): boolean {
    return (typeof x === "number") && Math.floor(x) === x
  }

  static isBoolean(x): boolean {
    return (typeof x === "boolean")
  }
}

function roundToCurrency(x) {
  var number = Math.round(x * 100) / 100;
  return parseFloat('' + number).toFixed(2);
}


function numberWithThousandsSeparators(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

function stringToJSONValue(string) {
  var sqlString = '';
  sqlString = string.replace(/\'/gi, "\\'");
  sqlString = sqlString.replace(/\"/gi, '\\"');
  sqlString = sqlString.replace(/\//gi, '\\/');
  sqlString = sqlString.replace(/\\/gi, '\\\\');
  return sqlString;
}

function stringToJSON(string) {
  var values = string.match(/(:)(.*?)(","|"})/gm);
  for (var i = 0; i < values.length - 1; i++) {
    values[i] = values[i].substring(2, values[i].length - 3);
    var escapedvalue = stringToJSONValue(values[i]);
    string.replace(escapedvalue, values[i]);
  }
  values[i] = values[i].substring(2, values[i].length - 2);

  return string;
}

function testStringToJSON(string) {
  string = stringToJSON('{"comment":"/n<div>- sieciowe</div>"}')
  var x = JSON.parse(string);
  return string;
}

//finds an alament in Array by its value
function search(nameKey, property, myArray) {
  for (var i = 0; i < myArray.length; i++) {
    if (myArray[i][property] === nameKey) {
      return myArray[i];
    }
  }
}

//returns row Number in scheet by DbId of en alement
function getRowByDbId(value, dataRange, column) {
  for (var i = 1; i < dataRange.length; i++) {
    var test = dataRange[i][column];
    if (dataRange[i][column] == value) {
      return i + 1;
    }
  }
}
/*
 * szuka danych w kolumnie wybranego arkusza
 */
function findFirstInRange(valueToFind, dataValues, column) {
  for (var i = 0; i < dataValues.length; i++) {
    var test = dataValues[i][column];
    if (dataValues[i][column] == valueToFind) {
      return i;
    }
  }
}

/*
 * szuka danych w kolumnie wybranego arkusza
 */
function findLastInRange(valueToFind, dataValues, column) {
  var lastRow;
  for (var i = 0; i < dataValues.length; i++) {
    if (dataValues[i][column] == valueToFind) {
      lastRow = i;
    }
  }
  return lastRow;
}

/*
 * get column
 */
function getColumnArray(dataValues, colIndex) {
  var column = [];
  for (var i = 0; i < dataValues.length; i++) {
    column.push(dataValues[i][colIndex]);
  }
  return column;
}

function createStaticFolderInContracts() {
  var name = 'Wnioski materiałowe';
  var contracts = getContractsListPerProject({});
  for (var item of contracts) {
    if (!item.materialCardsGdFolderId) {
      var gdId: string = Gd.setFolder(DriveApp.getFolderById(item.gdFolderId), name).getId();
      item.materialCardsGdFolderId = gdId;
      item.editInDb();
    }
  }
}