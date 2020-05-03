function getEntitiesList(initParamObject, externalConn) {
  var projectConditon = (initParamObject && initParamObject.projectId) ? 'Contracts.ProjectOurId="' + initParamObject.projectId + '"' : '1';

  var sql = 'SELECT  Entities.Id, \n \t' +
    'Entities.Name, \n \t' +
    'Entities.Address, \n \t' +
    'Entities.TaxNumber, \n \t' +
    'Entities.Www, \n \t' +
    'Entities.Email, \n \t' +
    'Entities.Phone, \n \t' +
    'Entities.Fax \n' +
    'FROM Entities \n' +
    'WHERE ' + projectConditon + '\n' +
    'ORDER BY Entities.Name';
  return getEntities(sql, initParamObject, externalConn)
}

function getEntities(sql, initParamObject, externalConn) {
  try {
    Logger.log(sql);
    var result = [];
    var conn = (externalConn) ? externalConn : connectToSql();
    if (!conn.isValid(0)) throw new Error('getLetters:: połączenie przerwane');

    var stmt = conn.createStatement();
    var dbResults = stmt.executeQuery(sql);

    while (dbResults.next()) {
      var item = new Entity({
        id: dbResults.getLong('Id'),
        name: dbResults.getString('Name'),
        address: dbResults.getString('Address'),
        taxNumber: dbResults.getString('TaxNumber'),
        www: dbResults.getString('Www'),
        email: dbResults.getString('Email'),
        phone: dbResults.getString('Phone'),
        fax: dbResults.getString('Fax')
      });
      result.push(item);
    }

    return result;
  } catch (e) {
    Logger.log(e);
    throw e;
  } finally {
    if (!externalConn && conn.isValid(0)) conn.close();
  }
}

function addNewEntityInDb(itemFormClient) {
  itemFormClient = JSON.parse(itemFormClient);
  var item = new Entity(itemFormClient);
  item.addInDb();
  Logger.log(' item Added ItemId: ' + item.id);
  return item;
}

function editEntityInDb(itemFormClient) {
  itemFormClient = JSON.parse(itemFormClient);
  var item = new Entity(itemFormClient);
  item.editInDb();
  Logger.log('item edited ItemId: ' + item.id);
  return item;
}

function deleteEntity(itemFormClient) {
  itemFormClient = JSON.parse(itemFormClient);
  var item = new Entity(itemFormClient);
  item.deleteFromDb();
}