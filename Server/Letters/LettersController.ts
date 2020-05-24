function getLettersListPerProject(initParamObject, externalConn?) {
  var projectConditon = (initParamObject && initParamObject.projectId) ? 'Projects.OurId="' + initParamObject.projectId + '"' : '1';
  var milestoneConditon = (initParamObject && initParamObject.milestoneId) ? 'Milestones.Id=' + initParamObject.milestoneId : '1';

  var sql = 'SELECT  Letters.Id, \n \t' +
    'Letters.IsOur, \n \t' +
    'Letters.Number, \n \t' +
    'Letters.Description, \n \t' +
    'Letters.CreationDate, \n \t' +
    'Letters.RegistrationDate, \n \t' +
    'Letters.DocumentGdId, \n \t' +
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
    'JOIN Contracts ON Contracts.ProjectOurId=Projects.OurId \n' +
    'JOIN Milestones ON Milestones.ContractId= Contracts.Id \n' +
    'JOIN Persons ON Letters.EditorId=Persons.Id \n' +
    'WHERE ' + projectConditon + ' AND ' + milestoneConditon + '\n' +
    'GROUP BY Letters.Id \n' +
    'ORDER BY Letters.RegistrationDate, Letters.CreationDate';
  return getLetters(sql, initParamObject, externalConn)
}

function test_getLettersListPerProject() {
  getLettersListPerProject({ projectId: 'KOB.GWS.01.WLASNE' });
}

function getLetters(sql, initParamObject, externalConn?) {
  try {
    var start = new Date();
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
        documentGdId: dbResults.getString('DocumentGdId'),
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
    var end = new Date();
    Logger.log('Time elapsed: %sms', end.getTime() - start.getTime());
    return result;
  } catch (e) {
    Logger.log(e);
    throw e;
  } finally {
    if (!externalConn && conn.isValid(0)) conn.close();
  }
}

function test_addNewLetter() {
  addNewLetter('{"_cases":[{"_gdFolderUrl":"https://drive.google.com/drive/folders/1ze0Jf2xyubqAkrCp7XbFVLTIfuH8AdLH","milestoneId":412,"description":"","_typeFolderNumber_TypeName_Number_Name":"00 Umowa  i zmiany | S01 null","gdFolderId":"1ze0Jf2xyubqAkrCp7XbFVLTIfuH8AdLH","number":1,"_parent":{"_parent":{"number":"JRP/1/1093096/3/2018","ourId":"OLE.IK.01","alias":"KS, OŚ"},"contractId":100,"_type":{"_folderNumber":"01","name":"Administracja","id":1},"id":412,"gdFolderId":"1GRRl1DJbOb0J66ReUKBXCJ3iD8Qnllyb"},"_displayNumber":"S01","id":1785,"_processesInstances":[],"_risk":{"overallImpact":0,"probability":0,"_contract":{},"_rate":"M","_parent":{},"_smallRateLimit":4,"id":0,"_bigRateLimit":12},"_type":{"isDefault":true,"isUniquePerMilestone":false,"folderNumber":"00","name":"Umowa  i zmiany","id":85,"milestoneTypeId":1,"_processes":[]},"_folderName":"S01","typeId":85}],"_entitiesMain":[{"address":"Lubliniecka 3a, 46-300 Olesno","phone":"34 358 24 84","www":"http://oleskiewodociagi.pl/33/strona-glowna.html","name":"Oleskie Przedsiębiorstwo Wodociągów i Kanalizacji Sp. z o.o.","taxNumber":"5761580396","id":210,"fax":"","email":"biuro@oleskiewodociagi.pl"}],"_entitiesCc":[],"_project":{"qualifiedValue":"10449316.50","endDate":"2020-12-31","_gdFolderUrl":"https://drive.google.com/drive/folders/1J76VBiOmjv7yVJlj0xa_gJlH1OKFwOvi","gdFolderId":"1J76VBiOmjv7yVJlj0xa_gJlH1OKFwOvi","ourId":"OLE.GWS.01.POIS","id":20,"_ourId_Alias":"OLE.GWS.01.POIS","totalValue":"17030293.70","_employers":[],"_engineers":[{"address":"ul. Jana Brzechwy 3, 49-305 Brzeg","name":"ENVI","taxNumber":"747-156-40-59","id":1}],"lettersGdFolderId":"1DrcTipAku3gnd6T2dO--v4j2yRxeImEN","name":"Rozbudowa i modernizacja oczyszczalni ścieków w Oleśnie oraz rozbudowa i modernizacja sieci kanalizacyjnej i wodociągowej na terenie aglomeracji Olesno","comment":"Projekt obejmuje 16 zadań wod-kan oraz budowę oczyszczalni (zad. 17)","startDate":"2018-01-29","status":"W trakcie","dotationValue":"8881919.02"},"_editor":{"name":"Marek Gazda","surname":"","systemEmail":"marek@envi.com.pl"},"_lastUpdated":"","isOur":true,"_contract":{"_contractors":[],"endDate":"2020-12-31","_gdFolderUrl":"https://drive.google.com/drive/folders/1LKVaECdfPgg0C-o1cNrjEaLR5TObhJ1w","gdFolderId":"1LKVaECdfPgg0C-o1cNrjEaLR5TObhJ1w","number":"JRP/1/1093096/3/2018","meetingProtocolsGdFolderId":"1PDR_H0DTBCK_Jmp9kL_t5TeoWMmjTJ5V","contractUrl":"https://drive.google.com/drive/folders/1QP9w62wwBt6Dgj--yzN9ykvcLmbjBG7Z","id":100,"_ourType":"IK","_ourIdName":"OLE.IK.01 Inżynier i Pomoc Techniczna...","_manager":{"surname":"Tymczyszyn","name":"Monika","id":"152","_nameSurnameEmail":"Monika Tymczyszyn: monika.tymczyszyn@envi.com.pl","email":"monika.tymczyszyn@envi.com.pl"},"name":"Inżynier i Pomoc Techniczna","materialCardsGdFolderId":"1fpe_hD4iFohprxHmDOSeXBxyUyhqaNUD","typeId":1,"projectId":"OLE.GWS.01.POIS","startDate":"2018-03-28","status":"W trakcie","_ourIdOrNumber_Alias":"JRP/1/1093096/3/2018 KS, OŚ","ourId":"OLE.IK.01","alias":"KS, OŚ","value":"460000.00","_employers":[],"_type":{"name":"IK","description":"1","id":1,"isOur":true},"_engineers":[],"_ourIdOrNumber_Name":"JRP/1/1093096/3/2018 Inżynier i Pomoc Techniczna...","_admin":{"surname":"Tymczyszyn","name":"Monika","id":"152","_nameSurnameEmail":"Monika Tymczyszyn: monika.tymczyszyn@envi.com.pl","email":"monika.tymczyszyn@envi.com.pl"},"comment":"Inżynier i pomoc techniczna"},"_milestone":{"endDate":"2020-12-31","_gdFolderUrl":"https://drive.google.com/drive/folders/1GRRl1DJbOb0J66ReUKBXCJ3iD8Qnllyb","description":"","gdFolderId":"1GRRl1DJbOb0J66ReUKBXCJ3iD8Qnllyb","_parent":{"_contractors":[],"number":"JRP/1/1093096/3/2018","id":100,"_ourType":"IK","_manager":{"id":152},"typeId":1,"projectId":"OLE.GWS.01.POIS","_ourIdOrNumber_Alias":"JRP/1/1093096/3/2018","ourId":"OLE.IK.01","_employers":[],"_type":{"name":"IK","description":"Inżynier","id":1,"isOur":true},"_engineers":[],"_admin":{"id":152},"scrumSheet":{}},"_FolderNumber_TypeName_Name":"01 Administracja | ","id":412,"_type":{"isUniquePerContract":true,"_folderNumber":"01","name":"Administracja","id":1,"_isDefault":true},"name":"","_folderName":"01 Administracja","contractId":100,"typeId":1,"startDate":"2018-03-28","status":"W trakcie"},"_template":{"gdId":"1hkBgKLNW56XzNnj7EwHfxd6givKjiawAPHs5wdsaAo4","name":"Papier firmowy","_nameConentsAlias":"Papier firmowy","description":"czysty papier firmowy","id":1,"_contents":{"caseTypeId":0,"alias":""}},"creationDate":"2020-05-24","registrationDate":"2020-05-24","description":"roszczenie IK","_blobEnviObjects":[],"_tmpId":"1_pending","id":"1_pending"}');
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
    letterGdElement.setName(item.makeFolderName());
    if (itemFormClient.isOur && itemFormClient._template) {
      GDocsTools.fillNamedRange(item.documentGdId, 'number', item.number.toString());
      DriveApp.getFileById(item.documentGdId).setName(item.makeFolderName());
    }
    Logger.log(' item Added ItemId: ' + item.id);

    return item;
  } catch (err) {
    if (conn && conn.isValid(0)) conn.rollback();
    if (item) item.deleteFromGd();
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

    letterGdElement.setName(item.makeFolderName());
    if (item.isOur && item.documentGdId && item.id == item.number)
      DriveApp.getFileById(item.documentGdId).setName(item.makeFolderName());
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

function appendLetterAttachments(itemFormClientString: string): any {
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
      message: (success) ? undefined : 'Usunięto dane pisma z bazy, ale pliki nadal są na Drive. \n Dla ułatwienia do nazwy dodano dopisek "- USUŃ"',
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
    'Letters.DocumentGdId, \n \t' +
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
    'Contracts.Number AS ContractNumber, \n \t' +
    'Contracts.Name AS ContractName \n' +
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
          documentGdId: dbResults.getString('DocumentGdId'),
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
              number: dbResults.getString('ContractNumber'),
              name: dbResults.getString('ContractName')
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
