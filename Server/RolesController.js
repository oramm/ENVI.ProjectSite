function getRolesPerProjectList(projectId) {
  var result = [];
  var conn = connectToSql();
  var stmt = conn.createStatement();
  var dbResults = stmt.executeQuery('SELECT * FROM Roles WHERE ProjectId ="'+ projectId + '";'
                                 );
  while (dbResults.next()) {
    var item = { id: dbResults.getLong(1),
                    projectId: dbResults.getString(2),
                    name: dbResults.getString(3),
                    description: dbResults.getString(4)
               };
    
    result.push(item);
  }
  conn.close();
  return result;
}


function addNewRoleInDb(item) {
    item = JSON.parse(item);
    var role = new Role(item);
    
    role.addInDb();
    Logger.log(' item Added ItemId: ' + role.id);
    return item.id;
}

function editRoleInDb(itemFromClient) {
    itemFromClient = JSON.parse(itemFromClient);
    var item = new Role(itemFromClient);
    item.editInDb();
    Logger.log('item edited ItemId: ' + item.id);
}

function deleteRole(itemFromClient){
  itemFromClient = JSON.parse(itemFromClient);
  var item = new Role();
  item.id = itemFromClient.id;
  item.deleteFromDb();
}

function getPersonRoleAssociationsPerProject(projectId) {
  try {
    var result = [];
    var conn = connectToSql();
    var stmt = conn.createStatement();
    var query = 'SELECT  \n \t' +
                    'Persons_Roles.PersonId, \n \t' +
                    'Persons_Roles.RoleId, \n \t' +
                    'Persons.Name, \n \t' +
                    'Persons.Surname, \n \t' +
                    'Persons.Email, \n \t' +
                    'Persons.Cellphone, \n \t' +
                    'Persons.Phone, \n \t' +
                    'Roles.Name, \n \t' +
                    'Roles.Description, \n \t' +
                    'Entities.Name as Entity, \n \t' +
                    'SystemRoles.Name \n' +
                'FROM Persons_Roles \n' +
                'JOIN Roles ON Persons_Roles.RoleId = Roles.Id AND Roles.ProjectId="'+ projectId +'" \n' +
                'JOIN Persons ON Persons.Id = Persons_Roles.PersonId \n' +
                'JOIN Entities ON Entities.Id=Persons.EntityId \n' +
                'JOIN SystemRoles ON SystemRoles.Id=Persons.SystemRoleId \n' +
                'GROUP BY Persons_Roles.PersonId, Persons_Roles.RoleId;'
    Logger.log(query);
    var dbResults = stmt.executeQuery(query);
    
    while (dbResults.next()) {
      var item = { id: parseInt(''+ dbResults.getLong(1) + dbResults.getLong(2)),
                   _person: { id: dbResults.getLong(1), 
                              name: dbResults.getString(3),
                              surname: dbResults.getString(4),
                              email: dbResults.getString(5),
                              cellphone: dbResults.getString(6),
                              phone: dbResults.getString(7),
                              entityName: (dbResults.getString(11)== 'ENVI_COOPERATOR')? 'ENVI' : dbResults.getString(10)
                            },
                   _role: { id: dbResults.getLong(2),
                            name: dbResults.getString(8),
                            description: dbResults.getString(9)
                          }
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
  var x= getPersonRoleAssociationsPerProject("SKW.GWS.01.POIS");
  return x;
}

function addNewPersonRoleAssociationInDb(itemFormClient){
  itemFormClient = JSON.parse(itemFormClient);
  var item = new PersonRole(itemFormClient);

  item.addInDb();
  Logger.log('association added ItemId: ' + item._associationId/1);
  return item;
}

function test_addNewPersonRoleAssociationInDb(){
  addNewPersonRoleAssociationInDb('');
}

function deletePersonRoleAssociation(item){
  var item = JSON.parse(item);
  var conn = connectToSql();
  
  //var i=0;
  try {
    var stmt = conn.prepareStatement('DELETE FROM Persons_Roles WHERE ' +
                                          'PersonID =' + item._person.id +' AND RoleID =' + item._role.id);
    
    stmt.addBatch();
     
    var batch = stmt.executeBatch();
  } catch (e) {
    Logger.log(e);
    throw e;
  } finally {
    conn.close();
  }
}