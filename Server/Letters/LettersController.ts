function getLettersListPerProject(initParamObject, externalConn?) {
  var projectConditon = (initParamObject && initParamObject.projectId) ? 'Projects.OurId="' + initParamObject.projectId + '"' : '1';

  var sql = 'SELECT  Letters.Id, \n \t' +
    'Letters.IsOur, \n \t' +
    'Letters.Number, \n \t' +
    'Letters.Description, \n \t' +
    'Letters.CreationDate, \n \t' +
    'Letters.RegistrationDate, \n \t' +
    'Letters.LetterGdId, \n \t' +
    'Letters.FolderGdId, \n \t' +
    'Letters.LetterFilesCount, \n \t' +
    'Letters.LastUpdated, \n \t' +
    'Projects.Id AS ProjectId, \n \t' +
    'Projects.OurId AS ProjectOurId, \n \t' +
    'Projects.GdFolderId AS ProjectGdFolderId, \n \t' +
    'Projects.LettersGdFolderId, \n \t' +
    'Persons.Id AS EditorId, \n \t' +
    'Persons.Name AS EditorName, \n \t' +
    'Persons.Surname AS EditorSurname \n' +
    'FROM Letters \n' +
    //'JOIN Letters_Cases ON Letters_Cases.LetterId=Letters.Id \n' +
    'JOIN Projects ON Letters.ProjectId=Projects.Id \n' +
    'JOIN Persons ON Letters.EditorId=Persons.Id \n' +
    'WHERE ' + projectConditon + '\n' +
    //'GROUP BY Letters.Id \n' +
    'ORDER BY Letters.RegistrationDate, Letters.CreationDate';
  return getLetters(sql, initParamObject, externalConn)
}

function test_getLettersListPerProject() {
  getLettersListPerProject({ projectId: 'KOB.GWS.01.WLASNE' });
}

function getLetters(sql, initParamObject, externalConn?) {
  try {
    Logger.log(sql);
    var result = [];
    var conn = (externalConn) ? externalConn : connectToSql();
    if (!conn.isValid(0)) throw new Error('getLetters:: połączenie przerwane');

    var stmt = conn.createStatement();
    var dbResults = stmt.executeQuery(sql);
    var _casesAssociationsPerProject = getLetterCaseAssociationsPerProjectList(initParamObject, conn);
    var _letterEntitiesPerProject = getLetterEntityAssociationsPerProjectList(initParamObject.projectId, conn);

    while (dbResults.next()) {
      var _casesAssociationsPerLetter = _casesAssociationsPerProject.filter(function (item) {
        return item.letterId == dbResults.getLong('Id')
      });
      var _letterEntitiesMainPerLetter = _letterEntitiesPerProject.filter(function (item) {
        return item.letterId == dbResults.getLong('Id') && item.letterRole == 'MAIN';
      });
      var _letterEntitiesCcPerLetter = _letterEntitiesPerProject.filter(function (item) {
        return item.letterId == dbResults.getLong('Id') && item.letterRole == 'Cc';
      });
      var initParam = {
        id: dbResults.getLong('Id'),
        isOur: dbResults.getBoolean('IsOur'),
        number: dbResults.getString('Number'),
        description: sqlToString(dbResults.getString('Description')),
        creationDate: dbResults.getString('CreationDate'),
        registrationDate: dbResults.getString('RegistrationDate'),
        letterGdId: dbResults.getString('LetterGdId'),
        folderGdId: dbResults.getString('FolderGdId'),
        letterFilesCount: dbResults.getInt('LetterFilesCount'),
        _lastUpdated: dbResults.getString('LastUpdated'),
        _project: {
          id: dbResults.getString('ProjectId'),
          ourId: dbResults.getString('ProjectOurId'),
          gdFolderId: dbResults.getString('ProjectGdFolderId'),
          lettersGdFolderId: dbResults.getString('LettersGdFolderId'),
        },
        _cases: _casesAssociationsPerLetter.map(function (item) {
          return item._case;
        }),
        _entitiesMain: _letterEntitiesMainPerLetter.map(function (item) {
          return item._entity;
        }),
        _entitiesCc: _letterEntitiesCcPerLetter.map(function (item) {
          return item._entity;
        }),
        _editor: {
          id: dbResults.getInt('EditorId'),
          name: dbResults.getString('EditorName'),
          surname: dbResults.getString('EditorSurname'),
        }
      }
      var item: IncomingLetter | OurLetter | OurOldTypeLetter;
      if (initParam.isOur) {
        if (initParam.id == initParam.number)
          item = new OurLetter(initParam);
        else
          item = new OurOldTypeLetter(initParam);
      }
      else
        item = new IncomingLetter(initParam);
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

function test_editLetter() {
  editLetter('{"_project":{"ourId":"KOB.GWS.01.WLASNE","lettersGdFolderId":"1QA8RuS5h6-qWyyxn--SgHnjjloFDacJi","id":"14","gdFolderId":"1dbiaItXJFmlTxc4c3z44Bd2gyTCpQOOy"},"letterGdId":"1LaSzDOhcqcrtOr1VCu3pSdoZ7633HCymUV2CVFpRbCk","_gdFolderUrl":"https://drive.google.com/drive/folders/1IOxiYPljDJ7WxjgRZzZ4fcaTlYlTmnVB","_lastUpdated":"2019-11-24 09:55:13.0","description":"opis","number":"195","_fileOrFolderOwnerEmail":"marek@envi.com.pl","registrationDate":"2019-11-24","id":195,"letterFilesCount":0,"_canUserChangeFileOrFolder":true,"_entitiesMain":[{"address":"ul. Waszczyka nr 2C, 65-664 Zielona Góra","phone":"","www":"","name":"ADESI Sp. z o.o.","taxNumber":"9291859529","id":199,"fax":"","email":"winturski@poczta.onet.pl"}],"creationDate":"2019-11-17","_editor":{"surname":"Gazda","name":"Marek","id":125},"folderGdId":"1IOxiYPljDJ7WxjgRZzZ4fcaTlYlTmnVB","_cases":[{"_gdFolderUrl":"https://drive.google.com/drive/folders/1h3mwR5AB6FtTyEGzYxpA1GJHEwkmIsER","milestoneId":784,"description":"","_typeFolderNumber_TypeName_Number_Name":"01 Umowa","gdFolderId":"1h3mwR5AB6FtTyEGzYxpA1GJHEwkmIsER","_parent":{"_parent":{"number":"K1"},"_type":{"_folderNumber":"00","name":"Administracja - umowa zewnętrzna","id":50},"id":784},"_displayNumber":"S00","id":1179,"_processesInstances":[],"_type":{"isDefault":true,"isUniquePerMilestone":true,"folderNumber":"01","name":"Umowa","id":75,"milestoneTypeId":50},"_folderName":"01 Umowa","typeId":75}],"projectId":"14","_documentOpenUrl":"https://drive.google.com/open?id=1LaSzDOhcqcrtOr1VCu3pSdoZ7633HCymUV2CVFpRbCk","isOur":true,"_entitiesCc":[],"_blobEnviObjects":[]}');
}

function test_addNewLetter() {
  addNewLetter('{"_cases":[{"_gdFolderUrl":"https://drive.google.com/drive/folders/1h3mwR5AB6FtTyEGzYxpA1GJHEwkmIsER","milestoneId":784,"description":"","_typeFolderNumber_TypeName_Number_Name":"01 Umowa","gdFolderId":"1h3mwR5AB6FtTyEGzYxpA1GJHEwkmIsER","number":0,"_parent":{"_parent":{"number":"K1"},"contractId":224,"_type":{"_folderNumber":"00","name":"Administracja - umowa zewnętrzna","id":50},"id":784,"gdFolderId":"162khYw80_4EvrTOv4IbRbhvfrK3H4zgb"},"_displayNumber":"S00","id":1179,"_processesInstances":[],"_type":{"isDefault":true,"isUniquePerMilestone":true,"folderNumber":"01","name":"Umowa","id":75,"milestoneTypeId":50,"_processes":[]},"_folderName":"01 Umowa","typeId":75}],"_entitiesMain":[{"address":"ul. Waszczyka nr 2C, 65-664 Zielona Góra","phone":"","www":"","name":"ADESI Sp. z o.o.","taxNumber":"9291859529","id":199,"fax":"","email":"winturski@poczta.onet.pl"}],"_entitiesCc":[],"_project":{"qualifiedValue":"53580874.00","endDate":"2020-11-23","_gdFolderUrl":"https://drive.google.com/drive/folders/1dbiaItXJFmlTxc4c3z44Bd2gyTCpQOOy","gdFolderId":"1dbiaItXJFmlTxc4c3z44Bd2gyTCpQOOy","googleCalendarId":"q1u012vcirureqkuov3epcmkf0@group.calendar.google.com","ourId":"KOB.GWS.01.WLASNE","alias":"Kanalizacja","id":14,"_ourId_Alias":"KOB.GWS.01.WLASNE Kanalizacja","totalValue":"69075000.00","_googleCalendarUrl":"https://calendar.google.com/calendar/embed?src=q1u012vcirureqkuov3epcmkf0@group.calendar.google.com&ctz=Europe%2FWarsaw","_employers":[{"name":"Gmina Kobierzyce","id":90}],"_engineers":[{"address":"ul. Jana Brzechwy 3, 49-305 Brzeg","phone":"","www":"","name":"ENVI","taxNumber":"747-156-40-59","id":1,"fax":"","email":""}],"lettersGdFolderId":"1QA8RuS5h6-qWyyxn--SgHnjjloFDacJi","name":"Budowa kanalizacji w gminie Kobierzyce","comment":"- kanały sanitarne grawitacyjne ok. 36 km<br />- rurociągi ciśnieniowe sieci kanalizacyjnej (z tranzytem pomiędzy miejscowościami) ok. 30 km,<br />- sieciowe przepompownie ściek&oacute;w ok. 29","startDate":"2017-10-31","status":"W trakcie","dotationValue":"13333300.00"},"_editor":{"name":"Marek Gazda","surname":"","systemEmail":"marek@envi.com.pl"},"_lastUpdated":"","isOur":true,"_template":{"caseTypeId":0,"gdId":"1hkBgKLNW56XzNnj7EwHfxd6givKjiawAPHs5wdsaAo4","name":"Papier firmowy","description":"czysty papier firmowy","id":1},"_contract":{"_contractors":[{"name":"ATA - TECHNIK","id":5}],"endDate":"2020-11-23","_gdFolderUrl":"https://drive.google.com/drive/folders/1FPN4FdM-RsdKTbdZwUK_mUq8M1VITlps","gdFolderId":"1FPN4FdM-RsdKTbdZwUK_mUq8M1VITlps","_ourContract":{"ourId":"KOB.IK.01","_gdFolderUrl":"https://drive.google.com/drive/folders/14EHaDImBAjMSmft3Y2YLYS2_eDt0jfIi","_ourIdName":"KOB.IK.01 Zarządzanie i nadzór nad budową kanalizacji w gmin...","name":"Zarządzanie i nadzór nad budową kanalizacji w gminie Kobierzyce","id":"114","gdFolderId":"14EHaDImBAjMSmft3Y2YLYS2_eDt0jfIi","_ourType":"IK"},"number":"K1","meetingProtocolsGdFolderId":"1LBE-aIhTWKBtvu_QMInmBSY-EXnHocb_","id":224,"_manager":{},"name":"„Budowa kanalizacji w gminie Kobierzyce” ","typeId":3,"projectId":"KOB.GWS.01.WLASNE","startDate":"2017-10-31","status":"W trakcie","_ourIdOrNumber_Alias":"K1 Kanalizacja","ourIdRelated":"KOB.IK.01","alias":"Kanalizacja","_employers":[{"name":"Gmina Kobierzyce","id":90}],"_type":{"name":"Żółty","description":"3","id":3,"isOur":false},"_numberName":"K1 „Budowa kanalizacji w gminie Kobierzyce” ...","_engineers":[{"address":"ul. Jana Brzechwy 3, 49-305 Brzeg","phone":"","www":"","name":"ENVI","taxNumber":"747-156-40-59","id":1,"fax":"","email":""}],"_ourIdOrNumber_Name":"K1 „Budowa kanalizacji w gminie Kobierzyce” ...","_admin":{},"comment":""},"_milestone":{"endDate":"2018-09-13","_gdFolderUrl":"https://drive.google.com/drive/folders/162khYw80_4EvrTOv4IbRbhvfrK3H4zgb","description":"","gdFolderId":"162khYw80_4EvrTOv4IbRbhvfrK3H4zgb","_parent":{"_contractors":[],"_ourContract":{"ourId":"KOB.IK.01","_ourType":"IK"},"number":"K1","id":224,"_manager":{"id":0},"typeId":3,"projectId":"KOB.GWS.01.WLASNE","_ourIdOrNumber_Alias":"K1","ourIdRelated":"KOB.IK.01","_employers":[],"_type":{"name":"Żółty","description":"Kontrakt na roboty - w trybie projketuj i buduj.<br />Nie musi to być FIDIC","id":3,"isOur":false},"_engineers":[],"_admin":{"id":0},"scrumSheet":{}},"_FolderNumber_TypeName_Name":"00 Administracja - umowa zewnętrzna | ","id":784,"_type":{"isUniquePerContract":true,"_folderNumber":"00","name":"Administracja - umowa zewnętrzna","id":50,"_isDefault":true},"name":"","_folderName":"00 Administracja - umowa zewnętrzna","contractId":224,"typeId":50,"startDate":"2017-10-18","status":"Zrobione"},"creationDate":"2019-11-17","registrationDate":"2019-11-24","description":"opis","_blobEnviObjects":[],"_tmpId":"28_pending","id":"28_pending"}');
}

function addNewLetter(itemFormClient): Letter {
  try {
    itemFormClient = JSON.parse(itemFormClient);
    //itemFormClient.letterFilesCount = itemFormClient._blobEnviObjects.length;
    if (!itemFormClient._blobEnviObjects)
      itemFormClient._blobEnviObjects = [];

    var item: OurLetter | OurOldTypeLetter | IncomingLetter;

    if (itemFormClient.isOur) {
      //nasze pismo po nowemu
      if (itemFormClient._template)
        item = new OurLetter(itemFormClient);
      //nasze pismo po staremu
      else
        item = new OurOldTypeLetter(itemFormClient);
    }
    //pismo przychodzące
    else {
      item = new IncomingLetter(itemFormClient);
    }
    var letterGdElement: GoogleAppsScript.Drive.File | GoogleAppsScript.Drive.Folder = item.createLetterGdElements(itemFormClient._blobEnviObjects);

    var conn = connectToSql();
    conn.setAutoCommit(false);
    item.addInDb(conn, false);
    conn.commit();
    //if (item.letterFilesCount > 1 || item.isOur && item._template)
    letterGdElement.setName(item.makeFolderName());
    Logger.log(' item Added ItemId: ' + item.id);

    return item;
  } catch (err) {
    if (conn && conn.isValid(0)) conn.rollback();
    item.deleteFromGd();
    Logger.log(JSON.stringify(err));
    throw err;
  } finally {
    if (conn && conn.isValid(0)) conn.close();
  }
}

function editLetter(itemFormClient) {
  itemFormClient = JSON.parse(itemFormClient);
  var conn: GoogleAppsScript.JDBC.JdbcConnection;
  try {
    var item: OurLetter | OurOldTypeLetter | IncomingLetter = createProperLetter(itemFormClient);
    var letterGdElement: GoogleAppsScript.Drive.File | GoogleAppsScript.Drive.Folder = item.editLetterGdElements(itemFormClient._blobEnviObjects)

    conn = connectToSql();
    item.editInDb(conn, true);
    conn.commit();
    //if (itemFormClient._blobEnviObjects.length > 0)
    letterGdElement.setName(item.makeFolderName());
    Logger.log('item edited ItemId: ' + item.id);
    return item;
  } catch (err) {
    console.error(JSON.stringify(err));
    Logger.log(JSON.stringify(err));
    if (conn && conn.isValid(0)) conn.rollback();
    throw err;
  } finally {
    if (conn && conn.isValid(0)) conn.close();
  }
}
function test_appendLetterAttachments() {
  appendLetterAttachments('');
}

function appendLetterAttachments(itemFormClientString:string): any {
  var itemFormClient = JSON.parse(itemFormClientString);
  var conn;
  if (itemFormClient._blobEnviObjects.length > 0)
    try {
      var item: OurLetter | OurOldTypeLetter | IncomingLetter = createProperLetter(itemFormClient);
      var letterFolder = item.appendAttachments(itemFormClient._blobEnviObjects);

      conn = connectToSql();
      item.editInDb(conn, true);
      conn.commit();
      letterFolder.setName(item.makeFolderName());
      Logger.log('item edited ItemId: ' + item.id);
      return item;
    } catch (err) {
      console.error(JSON.stringify(err));
      Logger.log(JSON.stringify(err));
      if (conn && conn.isValid(0)) conn.rollback();
      throw err;
    } finally {
      if (conn && conn.isValid(0)) conn.close();
    }
}

function deleteLetter(itemFormClient) {
  itemFormClient = JSON.parse(itemFormClient);
  try {
    var item: OurLetter | OurOldTypeLetter | IncomingLetter = createProperLetter(itemFormClient);
    item.deleteFromDb();
    var success = item.deleteFromGd();
    return {
      success: success,
      message: (success) ? undefined : 'Usunięto dane pisma z bazy, ale musisz ręcznie usunąć pliki z Drive. \n Dla ułatwienia do nazwy dodano dopisek "- USUŃ"',
      externalUrl: (success) ? undefined : Gd.createGdFolderUrl(item._project.lettersGdFolderId)
    }
  } catch (err) {
    Logger.log(err)
    throw err;
  }
}

function createProperLetter(itemFormClient: any) {
  var item: OurLetter | OurOldTypeLetter | IncomingLetter;
  if (itemFormClient.isOur) {
    if (itemFormClient.id == itemFormClient.number)
      item = new OurLetter(itemFormClient);
    else
      item = new OurOldTypeLetter(itemFormClient);
  }
  else
    item = new IncomingLetter(itemFormClient);
  return item;
}

/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * 
 * * * * * * * * * * *  Letters_Cases * * * * * * * * * * * * * * * * * * * * 
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * 
 */

function test_getLetterCaseAssociationsPerProjectList() {
  getLetterCaseAssociationsPerProjectList({ projectId: 'kob.gws.01.wlasne' });
}
function getLetterCaseAssociationsPerProjectList(initParamObject, externalConn?) {
  var projectConditon = (initParamObject && initParamObject.projectId) ? 'Contracts.ProjectOurId="' + initParamObject.projectId + '"' : '1';

  var sql = 'SELECT  Letters_Cases.LetterId, \n \t' +
    'Letters_Cases.CaseId, \n \t' +
    'Letters.Number, \n \t' +
    'Letters.Description, \n \t' +
    'Letters.CreationDate, \n \t' +
    'Letters.RegistrationDate, \n \t' +
    'Letters.LetterGdId, \n \t' +
    'Letters.FolderGdId, \n \t' +
    'Letters.LastUpdated, \n \t' +
    'Cases.Name AS CaseName, \n \t' +
    'Cases.Number AS CaseNumber, \n \t' +
    'Cases.Description AS CaseDescription, \n \t' +
    'Cases.GdFolderId AS CaseGdFolderId, \n \t' +
    'CaseTypes.Id AS CaseTypeId, \n \t' +
    'CaseTypes.Name AS CaseTypeName, \n \t' +
    'CaseTypes.IsDefault, \n \t' +
    'CaseTypes.IsUniquePerMilestone, \n \t' +
    'CaseTypes.MilestoneTypeId, \n \t' +
    'CaseTypes.FolderNumber AS CaseTypeFolderNumber, \n \t' +
    'Milestones.Id AS MilestoneId, \n \t' +
    'Milestones.Name AS MilestoneName, \n \t' +
    'MilestoneTypes.Id AS MilestoneTypeId, \n \t' +
    'MilestoneTypes.Name AS MilestoneTypeName, \n \t' +
    'MilestoneTypes_ContractTypes.FolderNumber AS MilestoneTypeFolderNumber, \n \t' +
    'OurContractsData.OurId AS ContractOurId, \n \t' +
    'Contracts.Number AS ContractNumber \n' +
    'FROM Letters_Cases \n' +
    'JOIN Letters ON Letters_Cases.LetterId = Letters.Id \n' +
    'JOIN Cases ON Letters_Cases.CaseId = Cases.Id \n' +
    'JOIN CaseTypes ON Cases.TypeId = CaseTypes.Id \n' +
    'JOIN Milestones ON Cases.MilestoneId=Milestones.Id \n' +
    'JOIN MilestoneTypes ON Milestones.TypeId=MilestoneTypes.Id \n' +
    'JOIN Contracts ON Milestones.ContractId=Contracts.Id \n' +
    'LEFT JOIN OurContractsData ON OurContractsData.Id=Contracts.Id \n' +
    'JOIN MilestoneTypes_ContractTypes ON MilestoneTypes_ContractTypes.MilestoneTypeId=Milestones.TypeId AND MilestoneTypes_ContractTypes.ContractTypeId=Contracts.TypeId \n' +
    'WHERE ' + projectConditon + ' \n' +
    'ORDER BY Letters_Cases.LetterId, Cases.Name';

  return getLetterCaseAssociations(sql, externalConn);
}

function getLetterCaseAssociations(sql, externalConn) {
  Logger.log(sql);
  try {
    var result = [];
    var conn = (externalConn) ? externalConn : connectToSql();
    var stmt = conn.createStatement();

    var dbResults = stmt.executeQuery(sql);

    while (dbResults.next()) {
      var item = new LetterCase({
        _letter: {
          id: dbResults.getLong('LetterId'),
          number: dbResults.getString('Number'),
          description: dbResults.getString('Description'),
          creationDate: dbResults.getString('CreationDate'),
          registrationDate: dbResults.getString('RegistrationDate'),
          letterGdId: dbResults.getString('LetterGdId'),
          folderGdId: dbResults.getString('FolderGdId')
        },
        _case: new Case({
          id: dbResults.getLong('CaseId'),
          name: dbResults.getString('CaseName'),
          number: dbResults.getString('CaseNumber'),
          description: dbResults.getString('CaseDescription'),
          gdFolderId: dbResults.getString('CaseGdFolderId'),
          _type: {
            id: dbResults.getInt('CaseTypeId'),
            name: dbResults.getString('CaseTypeName'),
            isDefault: dbResults.getBoolean('IsDefault'),
            isUniquePerMilestone: dbResults.getBoolean('isUniquePerMilestone'),
            milestoneTypeId: dbResults.getInt('MilestoneTypeId'),
            folderNumber: dbResults.getString('CaseTypeFolderNumber'),
          },
          _parent: {
            id: dbResults.getLong('MilestoneId'),
            _type: {
              id: dbResults.getLong('MilestoneTypeId'),
              name: dbResults.getString('MilestoneTypeName'),
              _folderNumber: dbResults.getString('MilestoneTypeFolderNumber'),
            },
            _parent: {
              ourId: dbResults.getString('ContractOurId'),
              number: dbResults.getString('ContractNumber')
            }
          },
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

function addNewLetterCaseAssociation(itemFormClient) {
  itemFormClient = JSON.parse(itemFormClient);
  var item = new LetterCase(itemFormClient);
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

function test_addNewLetterCaseAssociationInDb() {
  addNewLetterCaseAssociation(
    ''
  );

}

function deleteLetterCaseAssociation(item) {
  var item = JSON.parse(item);
  var conn = connectToSql();
  try {
    var stmt = conn.createStatement();
    stmt.executeUpdate('DELETE FROM Letters_Cases WHERE ' +
      'LetterId =' + prepareValueToSql(item._letter.id) + ' AND CaseId =' + prepareValueToSql(item._case.id));
  } catch (e) {
    Logger.log(e);
    throw e;
  } finally {
    conn.close();
  }
}

/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * 
 * * * * * * * * * * *  Letters_Entities * * * * * * * * * * * * * * * * * * * * 
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * 
 */
function test_getLetterEntityAssociationsPerProjectList() {
  getLetterEntityAssociationsPerProjectList('kob.gws.01.wlasne');
}
function getLetterEntityAssociationsList(initParamObject, externalConn) {
  var projectConditon = (initParamObject && initParamObject.projectId) ? 'Projects.OurId="' + initParamObject.projectId + '"' : '1';

  var sql = 'SELECT  Letters_Entities.LetterId, \n \t' +
    'Letters_Entities.EntityId, \n \t' +
    'Letters_Entities.LetterRole, \n \t' +
    'Entities.Name AS EntityName, \n \t' +
    'Entities.Address AS EntityAddress, \n \t' +
    'Entities.TaxNumber AS EntityTaxNumber, \n \t' +
    'Entities.Www AS EntityWww, \n \t' +
    'Entities.Email AS EntityEmail, \n \t' +
    'Entities.Phone AS EntityPhone, \n \t' +
    'Entities.Fax AS EntityFax \n' +
    'FROM Letters_Entities \n' +
    'JOIN Letters ON Letters_Entities.LetterId = Letters.Id \n' +
    'JOIN Projects ON Letters.ProjectId = Projects.Id \n' +
    'JOIN Entities ON Letters_Entities.EntityId=Entities.Id \n' +
    'WHERE ' + projectConditon + ' \n' +
    'ORDER BY Letters_Entities.LetterRole, EntityName';

  return getLetterEntityAssociations(sql, externalConn);
}
function getLetterEntityAssociationsPerProjectList(projectId, externalConn?) {
  return getLetterEntityAssociationsList({ projectId: projectId }, externalConn)
}

function getLetterEntityAssociations(sql, externalConn) {
  Logger.log(sql);
  try {
    var result = [];
    var conn = (externalConn) ? externalConn : connectToSql();
    var stmt = conn.createStatement();

    var dbResults = stmt.executeQuery(sql);

    while (dbResults.next()) {
      var item = new LetterEntity({
        letterRole: dbResults.getString('LetterRole'),
        _letter: {
          id: dbResults.getLong('LetterId')
        },
        _entity: new Entity({
          id: dbResults.getLong('EntityId'),
          name: dbResults.getString('EntityName'),
          address: dbResults.getString('EntityAddress'),
          taxNumber: dbResults.getString('EntityTaxNumber'),
          www: dbResults.getString('EntityWww'),
          email: dbResults.getString('EntityEmail'),
          phone: dbResults.getString('EntityPhone'),
          fax: dbResults.getString('EntityFax')
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

function addNewLetterEntityAssociation(itemFormClient) {
  itemFormClient = JSON.parse(itemFormClient);
  var item = new LetterEntity(itemFormClient);
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

function deleteLetterEntityAssociation(item) {
  var item = JSON.parse(item);
  var conn = connectToSql();
  try {
    var stmt = conn.createStatement();
    stmt.executeUpdate('DELETE FROM Letters_Entities WHERE ' +
      'LetterId =' + prepareValueToSql(item._letter.id) + ' AND EntityId =' + prepareValueToSql(item._entity.id));
  } catch (e) {
    Logger.log(e);
    throw e;
  } finally {
    conn.close();
  }
}
