function getPersonsList(initParamObject: { systemRoleName?: string, systemEmail?: string, id?: number }, externalConn?) {
  try {
    var result = [];
    var conn = (externalConn) ? externalConn : connectToSql();
    var stmt = conn.createStatement();
    var systemRolecondition = (initParamObject && initParamObject.systemRoleName) ? 'SystemRoles.Name REGEXP "' + initParamObject.systemRoleName + '"' : '1'
    var systemEmailCondition = (initParamObject && initParamObject.systemEmail) ? 'Persons.systemEmail="' + initParamObject.systemEmail + '"' : '1';
    var idCondition = (initParamObject && initParamObject.id) ? 'Persons.Id=' + initParamObject.id : '1';

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
      'JOIN SystemRoles ON Persons.SystemRoleId=SystemRoles.Id \n' +
      'WHERE ' + systemRolecondition + ' AND ' + idCondition + ' AND ' + systemEmailCondition + '\n' +
      'ORDER BY Persons.Surname, Persons.Name';
    Logger.log(query);
    var dbResults = stmt.executeQuery(query);

    while (dbResults.next()) {
      var item = new Person({
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
    if (!externalConn && conn && conn.isValid(0)) conn.close();
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
function getPersonsNameSurnameEmailListEnvi(externalConn) {
  return getPersonsNameSurnameEmailList({ systemRoleName: 'ENVI_EMPLOYEE|ENVI_MANAGER' }, externalConn);
}

function getPersonsNameSurnameEmailListPerSystemRole(systemRoleName, externalConn) {
  return getPersonsNameSurnameEmailList({ systemRoleName: systemRoleName }, externalConn);
}

function test_getPersonsNameSurnameEmailList() {
  getPersonsNameSurnameEmailListPerProject({ projectOurId: 'KOB.GWS.01.POIS' }, undefined);
}

function getPersonsNameSurnameEmailListPerProject(initParamObject: any, externalConn) {
  var projectConditon = (initParamObject && initParamObject.projectOurId) ? 'Roles.ProjectOurId="' + initParamObject.projectOurId + '"' : '1';
  var contractConditon;
  if (initParamObject && initParamObject.contractId)
    contractConditon =
      '(Roles.ContractId=(SELECT ProjectOurId FROM Contracts WHERE Contracts.Id=' + initParamObject.contractId + ') OR Roles.ContractId IS NULL)'
  else
    contractConditon = '1';

  var sql = 'SELECT  \n \t' +
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
    'FROM Persons \n' +
    'JOIN Roles ON Roles.PersonId = Persons.Id \n' +
    'JOIN SystemRoles ON SystemRoles.Id=Persons.SystemRoleId \n' +
    'WHERE ' + projectConditon + ' AND ' + contractConditon + ' \n' +
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
        _nameSurnameEmail: dbResults.getString('Name').trim() + ' ' + dbResults.getString('Surname').trim() + ': ' + dbResults.getString('Email').trim(),
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
  return person;
}

function editPersonInDb(itemFromClient) {
  itemFromClient = JSON.parse(itemFromClient);
  var person = new Person(itemFromClient);
  delete person.systemRoleId;
  delete person.systemEmail;
  person.editInDb();
  Logger.log(' item edited ItemId: ' + person.id);
  return person;
}

function deletePerson(itemFromClient) {
  itemFromClient = JSON.parse(itemFromClient);
  var item = new Person(undefined);
  item.id = itemFromClient.id;
  Logger.log(JSON.stringify(item));
  item.deleteFromDb();
}