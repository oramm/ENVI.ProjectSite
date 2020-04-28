function getRolesPerProjectList(initParamObject) {
  var projectCondition = (initParamObject && initParamObject.projectOurId) ? 'Roles.ProjectOurId="' + initParamObject.projectOurId + '"' : '1';

  var sql = 'SELECT \n \t' +
    'Roles.Id, \n \t' +
    'Roles.ProjectOurId, \n \t' +
    'Roles.ContractId, \n \t' +
    'Roles.Name, \n \t' +
    'Roles.Description, \n \t' +
    'Roles.GroupName, \n \t' +
    'Roles.ManagerId, \n \t' +
    'Persons.Id AS PersonId, \n \t' +
    'Persons.Name AS PersonName, \n \t' +
    'Persons.Surname AS PersonSurName, \n \t' +
    'Persons.Email AS PersonEmail, \n \t' +
    'Persons.Cellphone AS PersonCellphone, \n \t' +
    'Persons.Phone AS PersonPhone, \n \t' +
    'Entities.Name as EntityName, \n \t' +
    'SystemRoles.Name AS SystemRoleName\n' +
    'FROM Roles \n' +
    'JOIN Persons ON Persons.Id=Roles.PersonId \n' +
    'JOIN Entities ON Entities.Id=Persons.EntityId \n' +
    'JOIN SystemRoles ON SystemRoles.Id=Persons.SystemRoleId \n' +
    'WHERE ' + projectCondition + ' \n' +
    'ORDER BY Roles.Name';

  return getRoles(sql, initParamObject);
}

function getRoles(sql: string, parentDataObject: any) {
  Logger.log(sql);
  var result = [];
  var conn = connectToSql();
  var stmt = conn.createStatement();
  try {
    var dbResults = stmt.executeQuery(sql);
    while (dbResults.next()) {
      var item = new Role({
        id: dbResults.getLong('Id'),
        projectOurId: dbResults.getString('ProjectOurId'),
        contractId: dbResults.getLong('ContractId'),
        name: dbResults.getString('Name'),
        description: dbResults.getString('Description'),
        _person: new Person({
          id: dbResults.getLong('PersonId'),
          name: dbResults.getString('PersonName').trim(),
          surname: dbResults.getString('PersonSurName').trim(),
          email: dbResults.getString('PersonEmail').trim(),
          cellphone: dbResults.getString('PersonCellphone'),
          phone: dbResults.getString('PersonPhone'),
          entityName: (dbResults.getString('SystemRoleName') == 'ENVI_COOPERATOR') ? 'ENVI' : dbResults.getString('EntityName').trim()
        }),
        _group: {
          id: dbResults.getString('GroupName'),
          name: dbResults.getString('GroupName')
        },
        managerId: dbResults.getLong('ManagerId')
      })
      result.push(item);
    }
    dbResults.close();
    stmt.close();
    return result;
  } catch (e) {
    Logger.log(JSON.stringify(e));
    throw e;
  } finally {
    if (conn && conn.isValid(0)) conn.close();
  }
}

function addNewRole(itemFromClient) {
  itemFromClient = JSON.parse(itemFromClient);
  var item = new Role(itemFromClient);

  item.addInDb();
  Logger.log(' item Added ItemId: ' + item.id);
  return item;
}

function editRole(itemFromClient) {
  itemFromClient = JSON.parse(itemFromClient);
  var item = new Role(itemFromClient);
  item.editInDb();
  Logger.log('item edited ItemId: ' + item.id);
  return item;
}

function deleteRole(itemFromClient) {
  itemFromClient = JSON.parse(itemFromClient);
  var item = new Role(undefined);
  item.id = itemFromClient.id;
  item.deleteFromDb();
}

function getPersonRoleAssociationsPerProject(initParamObject) {
  var projectCondition = (initParamObject && initParamObject.projectOurId) ? 'Roles.ProjectOurId="' + initParamObject.projectOurId + '"' : '1';
  try {
    var result = [];
    var conn = connectToSql();
    var stmt = conn.createStatement();
    var query = 'SELECT  \n \t' +
      'Persons_Roles.PersonId, \n \t' +
      'Persons_Roles.RoleId, \n \t' +
      'Persons.Name AS PersonName, \n \t' +
      'Persons.Surname AS PersonSurName, \n \t' +
      'Persons.Email AS PersonEmail, \n \t' +
      'Persons.Cellphone AS PersonCellphone, \n \t' +
      'Persons.Phone AS PersonPhone, \n \t' +
      'Roles.ProjectOurId AS RoleProjectOurId, \n \t' +
      'Roles.ContractId AS RoleContractId, \n \t' +
      'Roles.Description AS RoleDescription, \n \t' +
      'Roles.GroupName AS RoleGroupName, \n \t' +
      'Roles.ManagerId AS RoleManagerId,\n \t' +
      'Entities.Name as EntityName, \n \t' +
      'SystemRoles.Name AS SystemRoleName\n' +
      'FROM Persons_Roles \n' +
      'JOIN Roles ON Persons_Roles.RoleId = Roles.Id AND ' + projectCondition + '\n' +
      'JOIN Persons ON Persons.Id = Persons_Roles.PersonId \n' +
      'JOIN Entities ON Entities.Id=Persons.EntityId \n' +
      'JOIN SystemRoles ON SystemRoles.Id=Persons.SystemRoleId \n' +
      'GROUP BY Persons_Roles.PersonId, Persons_Roles.RoleId;'
    Logger.log(query);
    var dbResults = stmt.executeQuery(query);

    while (dbResults.next()) {
      var item = {
        id: parseInt('' + dbResults.getLong('PersonId') + dbResults.getLong('RoleId')),
        _person: new Person({
          id: dbResults.getLong('PersonId'),
          name: dbResults.getString('PersonName'),
          surname: dbResults.getString('PersonSurName'),
          email: dbResults.getString('PersonEmail'),
          cellphone: dbResults.getString('PersonCellphone'),
          phone: dbResults.getString('PersonPhone'),
          entityName: (dbResults.getString('SystemRoleName') == 'ENVI_COOPERATOR') ? 'ENVI' : dbResults.getString('EntityName')
        }),
        _role: new Role({
          id: dbResults.getLong('RoleId'),
          name: dbResults.getString('RoleName'),
          description: dbResults.getString('RoleDescription'),
          _group: {
            id: dbResults.getString('RoleGroupName'),
            name: dbResults.getString('RoleGroupName')
          },
        })
      };
      result.push(item);
    }
    return result;
  } catch (e) {
    Logger.log(e);
    throw e;
  } finally {
    conn.close();
    return result;
  }
}

function getPersonRoleAssociationsPerProject_test(projectId) {
  var x = getPersonRoleAssociationsPerProject("SKW.GWS.01.POIS");
  return x;
}

function addNewPersonRoleAssociationInDb_OLD(itemFormClient) {
  itemFormClient = JSON.parse(itemFormClient);
  var item = new PersonRole(itemFormClient);

  item.addInDb();
  return item;
}

function addNewPersonRoleAssociation(itemFormClient) {
  itemFormClient = JSON.parse(itemFormClient);
  var item = new PersonRole(itemFormClient);
  item.addInDb();
  return item;
}

function test_addNewPersonRoleAssociation() {
  addNewPersonRoleAssociation('');
}

function deletePersonRoleAssociation(item) {
  var item = JSON.parse(item);
  var conn = connectToSql();

  //var i=0;
  try {
    var stmt = conn.prepareStatement('DELETE FROM Persons_Roles WHERE ' +
      'PersonID =' + item._person.id + ' AND RoleID =' + item._role.id);

    stmt.addBatch();

    var batch = stmt.executeBatch();
  } catch (e) {
    Logger.log(e);
    throw e;
  } finally {
    conn.close();
  }
}