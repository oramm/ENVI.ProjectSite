function getContract(contractId): Contract {
  return getContractsList({ contractId: contractId })[0];
}

function getContractByOurId(initParamObject, conn?: GoogleAppsScript.JDBC.JdbcConnection): Contract {
  return getContractsList(initParamObject, conn)[0];
}

function test_getContractsList() {
  getContractsList({ projectId: 'KOB.GWS.01.WLASNE' });
}

function getContractsList(initParamObject, conn?: GoogleAppsScript.JDBC.JdbcConnection): Contract[] {
  var projectCondition = (initParamObject && initParamObject.projectId) ? 'mainContracts.ProjectOurId="' + initParamObject.projectId + '"' : '1';
  var contractCondition = (initParamObject && initParamObject.contractId) ? 'mainContracts.Id=' + initParamObject.contractId : '1';
  var contractOurIdCondition = (initParamObject && initParamObject.contractOurId) ? 'OurContractsData.OurId="' + initParamObject.contractOurId + '"' : '1';

  var onlyOurContractsCondition = (initParamObject && initParamObject.onlyOur) ? 'OurContractsData.OurId IS NOT NULL' : '1';

  var sql = 'SELECT mainContracts.Id, \n \t' +
    'mainContracts.Alias, \n \t' +
    'mainContracts.Number, \n \t' +
    'mainContracts.Name, \n \t' +
    'mainContracts.ourIdRelated, \n \t' +
    'mainContracts.ProjectOurId, \n \t ' +
    'mainContracts.StartDate, \n \t' +
    'mainContracts.EndDate, \n \t' +
    'mainContracts.Value, \n \t' +
    'mainContracts.Comment, \n \t' +
    'mainContracts.Status, \n \t' +
    'mainContracts.GdFolderId, \n \t' +
    'mainContracts.MeetingProtocolsGdFolderId, \n \t' +
    'mainContracts.MaterialCardsGdFolderId, \n \t' +
    'OurContractsData.OurId, \n \t' +
    'OurContractsData.ManagerId, \n \t' +
    'OurContractsData.AdminId, \n \t' +
    'OurContractsData.ContractURL, \n \t' +
    'Admins.Name AS AdminName, \n \t' +
    'Admins.Surname AS AdminSurname, \n \t' +
    'Admins.Email AS AdminEmail, \n \t' +
    'Managers.Name AS ManagerName, \n \t' +
    'Managers.Surname AS ManagerSurname, \n \t' +
    'Managers.Email AS ManagerEmail, \n \t' +
    'relatedContracts.Id AS RelatedId, \n \t' +
    'relatedContracts.Name AS RelatedName, \n \t' +
    'relatedContracts.GdFolderId AS RelatedGdFolderId, \n \t' +
    'ContractTypes.Id AS TypeId, \n \t' +
    'ContractTypes.Name AS TypeName, \n \t' +
    'ContractTypes.IsOur AS TypeIsOur, \n \t' +
    'ContractTypes.Description AS TypeDescription \n' +
    'FROM Contracts AS mainContracts \n' +
    'LEFT JOIN OurContractsData ON OurContractsData.Id=mainContracts.id \n' +
    'LEFT JOIN Contracts AS relatedContracts ON relatedContracts.Id=(SELECT OurContractsData.Id FROM OurContractsData WHERE OurId=mainContracts.OurIdRelated) \n' +
    'LEFT JOIN ContractTypes ON ContractTypes.Id = mainContracts.TypeId \n' +
    'LEFT JOIN Persons AS Admins ON OurContractsData.AdminId = Admins.Id \n' +
    'LEFT JOIN Persons AS Managers ON OurContractsData.ManagerId = Managers.Id \n' +
    'WHERE ' + projectCondition + ' AND ' + contractCondition + ' AND ' + onlyOurContractsCondition + ' AND ' + contractOurIdCondition + '\n' +
    'ORDER BY OurContractsData.OurId DESC, mainContracts.Number';

  return (initParamObject.onlyKeyData) ? getContractsKeyData(sql, initParamObject) : getContracts(sql, initParamObject, conn);
}

function getContracts(sql: string, initParamObject: any, conn?: GoogleAppsScript.JDBC.JdbcConnection): Contract[] {
  Logger.log(sql);
  var result: Contract[] = [];
  if (!conn) conn = connectToSql();
  var stmt = conn.createStatement();
  try {
    var dbResults = stmt.executeQuery(sql);

    var entitiesPerProject = (initParamObject.projectId) ? getContractEntityAssociationsPerProjectList(initParamObject.projectId, conn) : [];
    while (dbResults.next()) {
      var contractors = entitiesPerProject.filter(function (item) {
        return item.contractId == dbResults.getLong('Id') && item.contractRole == 'CONTRACTOR';
      });
      var engineers = entitiesPerProject.filter(function (item) {
        return item.contractId == dbResults.getLong('Id') && item.contractRole == 'ENGINEER';
      });
      var employers = entitiesPerProject.filter(function (item) {
        return item.contractId == dbResults.getLong('Id') && item.contractRole == 'EMPLOYER';
      });
      var item = new Contract({
        id: dbResults.getLong('Id'),
        alias: dbResults.getString('Alias'),
        number: dbResults.getString('Number'),
        name: sqlToString(dbResults.getString('Name')),
        //kontrakt powiązany z kontraktem na roboty
        _ourContract: {
          ourId: dbResults.getString('OurIdRelated'),
          id: dbResults.getString('RelatedId'),
          name: sqlToString(dbResults.getString('RelatedName')),
          gdFolderId: dbResults.getString('RelatedGdFolderId')
        },
        projectId: dbResults.getString('ProjectOurId'),
        startDate: dbResults.getString('StartDate'),
        endDate: dbResults.getString('EndDate'),
        value: dbResults.getString('Value'),
        comment: sqlToString(dbResults.getString('Comment')),
        status: dbResults.getString('Status'),
        gdFolderId: dbResults.getString('GdFolderId'),
        meetingProtocolsGdFolderId: dbResults.getString('MeetingProtocolsGdFolderId'),
        materialCardsGdFolderId: dbResults.getString('MaterialCardsGdFolderId'),
        ourId: dbResults.getString('OurId'),
        _manager: {
          id: dbResults.getString('ManagerId'),
          name: dbResults.getString('ManagerName'),
          surname: dbResults.getString('ManagerSurname'),
          email: dbResults.getString('ManagerEmail')
        },
        _admin: {
          id: dbResults.getString('AdminId'),
          name: dbResults.getString('AdminName'),
          surname: dbResults.getString('AdminSurname'),
          email: dbResults.getString('AdminEmail')
        },
        contractUrl: dbResults.getString('ContractURL'),
        _type: {
          id: dbResults.getInt('TypeId'),
          name: dbResults.getString('TypeName'),
          description: dbResults.getString('TypeDescription'),
          isOur: dbResults.getBoolean('TypeIsOur')
        },
        _contractors: contractors.map(function (item) {
          return item._entity;
        }),
        _engineers: engineers.map(function (item) {
          return item._entity;
        }),
        _employers: employers.map(function (item) {
          return item._entity;
        })
      });

      //ustaw inżyniera i zamawiaącego z projektu jeśli nie ma przypisanych
      if (item._engineers.length === 0 || item._employers.length === 0)
        item.setEntitiesFromParent(conn);
      //sprawdzenie konieczne tylko ze względu na historyczne kontrakty
      if (item._admin.id)
        item._admin._nameSurnameEmail = item._admin.name.trim() + ' ' + item._admin.surname.trim() + ': ' + item._admin.email.trim();
      //sprawdzenie konieczne tylko ze względu na historyczne kontrakty
      if (item._manager.id)
        item._manager._nameSurnameEmail = item._manager.name.trim() + ' ' + item._manager.surname.trim() + ': ' + item._manager.email.trim();

      delete item.scrumSheet;
      result.push(item);
    }
    conn.close();
    return result;
  } catch (err) {
    Logger.log(err);
    throw err;
  } finally {
    if (conn && conn.isValid(0)) conn.close();
  }
}

function getContractsKeyData(sql: string, initParamObject: any): Contract[] {
  Logger.log(sql);
  var result: Contract[] = [];
  var conn = connectToSql();
  var stmt = conn.createStatement();
  try {
    var dbResults = stmt.executeQuery(sql);
    while (dbResults.next()) {
      var item = new Contract({
        id: dbResults.getLong('Id'),
        alias: dbResults.getString('Alias'),
        number: dbResults.getString('Number'),
        name: sqlToString(dbResults.getString('Name')),
        //kontrakt powiązany z kontraktem na roboty
        _ourContract: {
          ourId: dbResults.getString('OurIdRelated'),
          id: dbResults.getString('RelatedId'),
          name: sqlToString(dbResults.getString('RelatedName')),
          gdFolderId: dbResults.getString('RelatedGdFolderId')
        },
        projectId: dbResults.getString('ProjectOurId'),
        startDate: dbResults.getString('StartDate'),
        endDate: dbResults.getString('EndDate'),
        value: dbResults.getString('Value'),
        comment: sqlToString(dbResults.getString('Comment')),
        status: dbResults.getString('Status'),
        gdFolderId: dbResults.getString('GdFolderId'),
        meetingProtocolsGdFolderId: dbResults.getString('MeetingProtocolsGdFolderId'),
        materialCardsGdFolderId: dbResults.getString('MaterialCardsGdFolderId'),
        ourId: dbResults.getString('OurId'),
        _manager: {
          id: dbResults.getString('ManagerId'),
          name: dbResults.getString('ManagerName'),
          surname: dbResults.getString('ManagerSurname'),
          email: dbResults.getString('ManagerEmail')
        },
        _admin: {
          id: dbResults.getString('AdminId'),
          name: dbResults.getString('AdminName'),
          surname: dbResults.getString('AdminSurname'),
          email: dbResults.getString('AdminEmail')
        },
        contractUrl: dbResults.getString('ContractURL'),
        _type: {
          id: dbResults.getInt('TypeId'),
          name: dbResults.getString('TypeName'),
          description: dbResults.getString('TypeDescription'),
          isOur: dbResults.getBoolean('TypeIsOur')
        },
      });

      //sprawdzenie konieczne tylko ze względu na historyczne kontrakty
      if (item._admin.id)
        item._admin._nameSurnameEmail = item._admin.name.trim() + ' ' + item._admin.surname.trim() + ': ' + item._admin.email.trim();
      //sprawdzenie konieczne tylko ze względu na historyczne kontrakty
      if (item._manager.id)
        item._manager._nameSurnameEmail = item._manager.name.trim() + ' ' + item._manager.surname.trim() + ': ' + item._manager.email.trim();

      delete item.scrumSheet;
      result.push(item);
    }
    conn.close();
    return result;
  } catch (err) {
    Logger.log(err);
    throw err;
  } finally {
    if (conn && conn.isValid(0)) conn.close();
  }
}

function test_addNewContract() {
  addNewContract('{"projectId":"ROZNE.ENVI.00","_type":{"name":"INNE","description":"Umowy niepasujące do pozostałych typ&oacute;w.","id":6,"status":"ACTIVE","isOur":true},"number":"brak","name":"test nazwa","alias":"test","startDate":"2020-01-13","endDate":"2020-01-14","value":"234242","status":"Nie rozpoczęty","comment":"sdfddd","ourId":"TEST.IK.22","_manager":{"_nameSurnameEmail":"Gabriel Benisz: biuro@unimark.pl","phone":"33 823 42 89","surname":"Benisz","name":"Gabriel","cellphone":"605470720","comment":"","id":258,"position":"Kierownik Budowy","email":"biuro@unimark.pl"},"_admin":{"_nameSurnameEmail":"Gabriel Benisz: biuro@unimark.pl","phone":"33 823 42 89","surname":"Benisz","name":"Gabriel","cellphone":"605470720","comment":"","id":258,"position":"Kierownik Budowy","email":"biuro@unimark.pl"},"_tmpId":"39_pending","id":"39_pending"}');
}

function addNewContract(itemFromClient) {
  itemFromClient = JSON.parse(itemFromClient);
  if (!itemFromClient.startDate) throw new Error('Podaj datę podpisania umowy');
  if (!itemFromClient.endDate) throw new Error('Podaj datę zakończenia umowy');
  var item = new Contract(itemFromClient);

  try {

    //utwórz foldery na GD
    var gd = new Gd(item);
    //zmiena potrzebna do przpyisania Id do folderów po utworzeniu kamieni, spraw i zadan w Db
    var contractFoldersData = gd.createContractFolders();
    item.gdFolderId = gd.contractFolder.getId();
    item._gdFolderUrl = Gd.createGdFolderUrl(item.gdFolderId);
    item.createStaticGdFolders();
    Logger.log('Utworzono foldery');
    var conn = connectToSql();
    conn.setAutoCommit(false);

    item.addInDb(conn, true);
    Logger.log('Zapisano kontrakt w db');

    //dodaj tylko jeżeli jeszcze nie ma takiego wpisu w bazie potrzene do czasu uporządkowania scruma
    if ((item.isOur() || item.ourIdRelated) && !findFirstInRange(item.id, SCRUM_DATA_VALUES, SCRUM_COL_CONTRACT_DB_ID)) {
      var defaultItems = item.createDefaultTasksInDb(contractFoldersData, conn, true);
      //item.setContractFoldersIdsFromFoldersData(defaultItems,contractFoldersData, conn);
      conn.commit();
      Logger.log('Utworzono w Db domyśle kamienie, sprawy i zadania');
      if (conn.isValid(0)) conn.close();

      item.addInScrum(defaultItems);
      Logger.log('Zapisano w scrumboardzie domyśle kamienie, sprawy i zadania ');
    }
    else {
      conn.commit();
      if (conn.isValid(0)) conn.close();
    }
    Logger.log(' item Added ItemId: ' + item.id);

    return item;
  } catch (err) {
    Logger.log(JSON.stringify(err));
    if (typeof item.id === 'number') item.deleteFromDb();
    item.deleteFromScrum();

    throw err;
  } finally {
    if (conn && conn.isValid(0)) conn.close();
  }
}

function editContract(itemFromClient) {
  itemFromClient = JSON.parse(itemFromClient);
  try {

    var item = new Contract(itemFromClient);
    //edytuj tylko jeżeli już jest  wpis bazie 
    var firstRowInScrum = findFirstInRange(item.id, SCRUM_DATA_VALUES, SCRUM_COL_CONTRACT_DB_ID);
    if (item.ourId) {
      if (firstRowInScrum) {
        (item.status != 'Archiwalny') ? item.editOurContractInScrum() : item.deleteFromScrum();
      } else
        if (item.status != 'Archiwalny' && item.shouldBeInScrum()) {
          let tasks: Task[] = getTasksList({ contractId: item.id });
          let cases: Case[] = [];
          for (var i = 0; i < tasks.length; i++) {
            if (i == 0 || tasks[i]._parent.id !== tasks[i - 1]._parent.id)
              cases.push(new Case(tasks[i]._parent))
          }
          item.addInScrum({ caseItems: cases, tasks: tasks });
        }
      //kontrakt na roboty lub dostawy
    } else {
      item.editWorksContractInScrum();
    }
    var conn = connectToSql();
    conn.setAutoCommit(false);

    item.editInDb(conn);
    item.deleteEntitiesAssociationsFromDb(conn);
    item.addEntitiesAssociationsInDb(conn);
    conn.commit();

    var gd = new Gd(item);
    gd.editContractFolder();
    Logger.log('Contract edited ItemId: ' + item.id);
    return item;
  } catch (err) {
    Logger.log(JSON.stringify(err));
    if (conn && conn.isValid(0)) conn.rollback();
    throw err;
  } finally {
    if (conn && conn.isValid(0)) conn.close();
  }
}
function test_editContract() {
  editContract('');
}

function deleteContract(itemFromClient) {
  itemFromClient = JSON.parse(itemFromClient);
  var item = new Contract(itemFromClient);
  //item.id = itemFromClient.id;
  Logger.log(JSON.stringify(item));

  item.deleteFromDb();
  item.deleteFromScrum();
  //var folder = DriveApp.getFolderById(item.gdFolderId);
  //folder.setTrashed(true);
}

function test_deleteContract() {
  deleteContract('')
}

function contractForlderIterate(argFunction: Function) {
  var contracts = getContractsList({});
  try {
    var conn = connectToSql();
    for (var contract of contracts)
      argFunction(conn, contract);
  } catch (err) {
    Logger.log(JSON.stringify(err));
    throw err;
  } finally {
    if (conn && conn.isValid(0)) conn.close();
  }
}

function createStaticFolderInContracts() {
  contractForlderIterate((externalConn, contract: Contract) => {
    if (!contract.ourId && !contract.materialCardsGdFolderId && contract.status !== 'Archiwalny') {
      contract.createStaticGdFolders();
      contract.editInDb(externalConn);
    }
  })
}

function deleteStaticFolderInContracts() {
  contractForlderIterate((externalConn, contract: Contract) => {
    if (contract.ourId && contract.materialCardsGdFolderId) {
      DriveApp.getFolderById(contract.materialCardsGdFolderId).setTrashed(true);
      contract.materialCardsGdFolderId = undefined;
      contract.editInDb(externalConn);
      Logger.log(Contract.name + ' ' + Contract)
    }
  })
}

/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * 
 * * * * * * * * * * *  Contracts_Entities * * * * * * * * * * * * * * * * * * * * 
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * 
 */

function test_getContractEntityAssociationsPerProjectList(): void {
  getContractEntityAssociationsPerProjectList('kob.gws.01.wlasne', undefined);
}
function getContractEntityAssociationsList(initParamObject, externalConn) {
  var projectConditon = (initParamObject && initParamObject.projectId) ? 'Contracts.ProjectOurId="' + initParamObject.projectId + '"' : '1';
  var contractConditon = (initParamObject && initParamObject.contractId) ? 'Contracts.Id="' + initParamObject.contractId + '"' : '1';

  var sql = 'SELECT  Contracts_Entities.ContractId, \n \t' +
    'Contracts_Entities.EntityId, \n \t' +
    'Contracts_Entities.ContractRole, \n \t' +
    'Entities.Name, \n \t' +
    'Entities.Address, \n \t' +
    'Entities.TaxNumber, \n \t' +
    'Entities.Www, \n \t' +
    'Entities.Email, \n \t' +
    'Entities.Phone, \n \t' +
    'Entities.Fax \n' +
    'FROM Contracts_Entities \n' +
    'JOIN Contracts ON Contracts_Entities.ContractId = Contracts.Id \n' +
    'JOIN Entities ON Contracts_Entities.EntityId=Entities.Id \n' +
    'LEFT JOIN OurContractsData ON OurContractsData.Id=Contracts.Id \n' +
    'WHERE ' + projectConditon + ' \n' +
    'ORDER BY Contracts_Entities.ContractRole, Entities.Name';

  return getContractEntityAssociations(sql, externalConn);
}
function getContractEntityAssociationsPerProjectList(projectId: string, externalConn: GoogleAppsScript.JDBC.JdbcConnection) {
  return getContractEntityAssociationsList({ projectId: projectId }, externalConn)
}

function getContractEntityAssociations(sql: string, externalConn?): any[] {
  Logger.log(sql);
  try {
    var result = [];
    var conn = (externalConn) ? externalConn : connectToSql();
    var stmt = conn.createStatement();

    var dbResults = stmt.executeQuery(sql);

    while (dbResults.next()) {
      var item = new ContractEntity({
        contractRole: dbResults.getString('ContractRole'),
        _contract: {
          id: dbResults.getLong('ContractId')
        },
        _entity: new Entity({
          id: dbResults.getLong('EntityId'),
          name: dbResults.getString('Name'),
          address: dbResults.getString('Address'),
          taxNumber: dbResults.getString('TaxNumber'),
          www: dbResults.getString('Www'),
          email: dbResults.getString('Email'),
          phone: dbResults.getString('Phone'),
          fax: dbResults.getString('Fax')
        })
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



function addNewContractEntityAssociation(itemFormClient) {
  itemFormClient = JSON.parse(itemFormClient);
  var item = new ContractEntity(itemFormClient);
  try {
    var conn = connectToSql();
    conn.setAutoCommit(false);
    item.addInDb(conn);
    conn.commit();

    Logger.log(' association added ItemId: ' + item._associationId);

    return item;
  } catch (err) {
    if (conn.isValid(0)) conn.rollback();
    Logger.log(JSON.stringify(err));
    throw err;
  } finally {
    if (conn.isValid(0)) conn.close();
  }
}

function test_addNewContractEntityAssociationInDb() {
  addNewContractEntityAssociation(
    ''
  );

}

function deleteContractEntityAssociation(item) {
  var item = JSON.parse(item);
  var conn = connectToSql();
  try {
    var stmt = conn.createStatement();
    stmt.executeUpdate('DELETE FROM Contracts_Entities WHERE ' +
      'ContractId =' + prepareValueToSql(item._contract.id) + ' AND EntityId =' + prepareValueToSql(item._entity.id));
  } catch (e) {
    Logger.log(e);
    throw e;
  } finally {
    conn.close();
  }
}