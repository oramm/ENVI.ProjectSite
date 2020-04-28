function getPersonsList(systemRoleName) {
  try {
    var result = [];
    var conn = connectToSql();
    var stmt = conn.createStatement();
    var condition = (systemRoleName) ? ' AND SystemRoles.Name REGEXP "' + systemRoleName + '"' : ''
    var query = 'SELECT  Persons.Id,  \n \t' +
      'Persons.EntityId,  \n \t' +
      'Persons.Name,  \n \t' +
      'Persons.Surname,  \n \t' +
      'Persons.Position,  \n \t' +
      'Persons.Email,  \n \t' +
      'Persons.Cellphone,  \n \t' +
      'Persons.Phone,  \n \t' +
      'Persons.Comment,  \n \t' +
      'SystemRoles.Name,  \n \t' +
      'Entities.Name  \n' +
      'FROM Persons \n' +
      'JOIN Entities ON Persons.EntityId=Entities.Id \n' +
      'JOIN SystemRoles ON Persons.SystemRoleId=SystemRoles.Id' + condition + '\n' +
      'ORDER BY Persons.Surname, Persons.Name';
    Logger.log(query);
    var dbResults = stmt.executeQuery(query);

    while (dbResults.next()) {
      var item;
      //init: function(id, entityId, name, surname, position, email, cellphone,  phone, comment){
      item = new Person({
        id: dbResults.getLong(1),
        name: dbResults.getString(3).trim(),
        surname: dbResults.getString(4).trim(),
        position: dbResults.getString(5).trim(),
        email: dbResults.getString(6).trim(),
        cellphone: dbResults.getString(7).trim(),
        phone: dbResults.getString(8).trim(),
        comment: dbResults.getString(9).trim(),
        systemRoleName: dbResults.getString(10).trim(),
        _entity: {
          id: dbResults.getString(2).trim(),
          name: dbResults.getString(11).trim()
        }
      });
      result.push(item);
    }

    //dbResults.close();
    return result;
  } catch (e) {
    Logger.log(e);
    throw e;
  } finally {
    conn.close();
  }
}

function getPersonsNameSurnameEmailList(initParamObject, externalConn) {
  var roleCondition = (initParamObject && initParamObject.systemRoleName) ? 'SystemRoles.Name REGEXP "' + initParamObject.systemRoleName + '"' : '1';

  var sql = 'SELECT  Persons.Id,  \n \t' +
    'Persons.Name,  \n \t' +
    'Persons.Surname,  \n \t' +
    'Persons.Position,  \n \t' +
    'Persons.Email,  \n \t' +
    'Persons.Cellphone,  \n \t' +
    'Persons.Phone,  \n \t' +
    'Persons.Comment  \n' +
    'FROM Persons \n' +
    'JOIN SystemRoles ON SystemRoles.Id=Persons.SystemRoleId \n' +
    'JOIN Entities ON Persons.EntityId=Entities.Id \n' +
    'WHERE ' + roleCondition + ' \n' +
    'ORDER BY Surname';
  return getPersonsNameSurnameEmail(sql, initParamObject, externalConn)
}

function getPersonsNameSurnameEmailListPerSystemRole(systemRoleName, externalConn) {
  return getPersonsNameSurnameEmailList({ systemRoleName: systemRoleName }, externalConn);
}

function test_getPersonsNameSurnameEmailList() {
  getPersonsNameSurnameEmailListPerContract(224, undefined);
}

function getPersonsNameSurnameEmailListPerContract(contractId, externalConn) {
  var contractConditon = (contractId) ? 'Roles.ProjectId=(SELECT ProjectOurId FROM Contracts WHERE Contracts.Id=' + contractId + ')' : '1';

  var sql = 'SELECT  \n \t' +
    'Persons_Roles.PersonId, \n \t' +
    'Persons_Roles.RoleId, \n \t' +
    'Persons.Id, \n \t' +
    'Persons.Name, \n \t' +
    'Persons.Surname,  \n \t' +
    'Persons.Position,  \n \t' +
    'Persons.Email,  \n \t' +
    'Persons.Cellphone,  \n \t' +
    'Persons.Phone,  \n \t' +
    'Persons.Comment, \n \t' +
    'Roles.Name, \n \t' +
    'Roles.Description, \n \t' +
    'SystemRoles.Name \n' +
    'FROM Persons_Roles \n' +
    'JOIN Roles ON Persons_Roles.RoleId = Roles.Id \n' +
    'JOIN Persons ON Persons.Id = Persons_Roles.PersonId \n' +
    'JOIN SystemRoles ON SystemRoles.Id=Persons.SystemRoleId \n' +
    'WHERE ' + contractConditon + ' \n' +
    'GROUP BY Persons_Roles.PersonId, Persons_Roles.RoleId \n' +
    'ORDER BY Surname';
  return getPersonsNameSurnameEmail(sql, undefined, externalConn)
}

function getPersonsNameSurnameEmail(sql, initParamObject, externalConn) {
  try {
    Logger.log(sql);
    var result = [];
    var conn = (externalConn) ? externalConn : connectToSql();
    if (!conn.isValid(0)) throw new Error('getPersonsNameSurnameEmail:: połączenie przerwane');

    var stmt = conn.createStatement();
    var dbResults = stmt.executeQuery(sql);

    while (dbResults.next()) {
      var item = {
        id: dbResults.getLong('Id'),
        name: dbResults.getString('Name').trim(),
        surname: dbResults.getString('Surname').trim(),
        nameSurnameEmail: dbResults.getString('Name').trim() + ' ' + dbResults.getString('Surname').trim() + ': ' + dbResults.getString('Email').trim(),
        position: dbResults.getString('Position').trim(),
        email: dbResults.getString('Email').trim(),
        cellphone: dbResults.getString('Cellphone').trim(),
        phone: dbResults.getString('Phone').trim(),
        comment: dbResults.getString('Comment').trim()
      };
      result.push(item);
    }

    dbResults.close();
    return result;
  } catch (e) {
    Logger.log(e);
    throw e;
  } finally {
    if (!externalConn && conn.isValid(0)) conn.close();
  }
}

function addNewPersonInDb(itemFromClient) {
  itemFromClient = JSON.parse(itemFromClient);
  var person = new Person(itemFromClient);
  delete person.systemRoleId;
  delete person.systemEmail;

  var newId = person.addInDb();
  Logger.log(' item Added ItemId: ' + person.id);
  return newId;
}

function editPersonInDb(itemFromClient) {
  itemFromClient = JSON.parse(itemFromClient);
  var person = new Person(itemFromClient);
  delete person.systemRoleId;
  delete person.systemEmail;
  person.editInDb();
  Logger.log(' item edited ItemId: ' + person.id);
}

function deletePerson(itemFromClient) {
  itemFromClient = JSON.parse(itemFromClient);
  var item = new Person(undefined);
  item.id = itemFromClient.id;
  Logger.log(JSON.stringify(item));
  item.deleteFromDb();
}