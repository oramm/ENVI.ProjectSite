function getProcessesStepsInstancesListPerMilestone(milestoneId, externalConn) {
  var sql = 'SELECT  ProcessesStepsInstances.Id, \n \t' +
    'ProcessesStepsInstances.ProcessInstanceId, \n \t' +
    'ProcessInstances.CaseId, \n \t' +
    'ProcessesStepsInstances.Status, \n \t' +
    'ProcessesStepsInstances.Deadline, \n \t' +
    'ProcessesStepsInstances.OurLetterId, \n \t' +
    'ProcessesStepsInstances.LastUpdated, \n \t' +
    'ProcessesStepsInstances.EditorId \n \t,' +
    'ProcessesSteps.Id AS ProcessStepId, \n \t' +
    'ProcessesSteps.Name AS ProcessStepName, \n \t' +
    'ProcessesSteps.Description AS ProcessStepDescription, \n \t' +
    'Letters.DocumentGdId AS OurLetterDocumentGdId, \n \t' +
    'Letters.FolderGdId AS OurLetterFolderGdId, \n \t' +
    'DocumentTemplates.Name AS DocumentTemplateName, \n \t' +
    'DocumentTemplates.GdId AS DocumentTemplateGdId \n' +
    'FROM ProcessesStepsInstances \n' +
    'JOIN ProcessInstances ON ProcessesStepsInstances.ProcessInstanceId = ProcessInstances.Id \n' +
    'JOIN ProcessesSteps ON ProcessesStepsInstances.ProcessStepId = ProcessesSteps.Id \n' +
    'LEFT JOIN DocumentTemplates ON DocumentTemplates.Id=ProcessesSteps.DocumentTemplateId \n' +
    'LEFT JOIN Letters ON Letters.Id=ProcessesStepsInstances.OurLetterId \n' +
    'JOIN Processes ON ProcessInstances.ProcessId = Processes.Id \n' +
    'JOIN Cases ON Cases.Id = ProcessInstances.CaseId \n' +
    'JOIN Milestones ON Milestones.Id = Cases.MilestoneId \n' +
    'WHERE Milestones.Id = ' + milestoneId;
  return getProcessesStepsInstances(sql, { milestoneId: milestoneId }, externalConn);
}

function getProcessesStepsInstancesListPerContract(contractId, externalConn) {
  var sql = 'SELECT  ProcessesStepsInstances.Id, \n \t' +
    'ProcessesStepsInstances.ProcessInstanceId, \n \t' +
    'ProcessInstances.CaseId, \n \t' +
    'ProcessesStepsInstances.Status, \n \t' +
    'ProcessesStepsInstances.Deadline, \n \t' +
    'ProcessesStepsInstances.OurLetterId, \n \t' +
    'ProcessesStepsInstances.LastUpdated, \n \t' +
    'ProcessesStepsInstances.EditorId \n \t,' +
    'ProcessesSteps.Id AS ProcessStepId, \n \t' +
    'ProcessesSteps.Name AS ProcessStepName, \n \t' +
    'ProcessesSteps.Description AS ProcessStepDescription, \n \t' +
    'Letters.DocumentGdId AS OurLetterDocumentGdId, \n \t' +
    'Letters.FolderGdId AS OurLetterFolderGdId, \n \t' +
    'DocumentTemplates.Name AS DocumentTemplateName, \n \t' +
    'DocumentTemplates.GdId AS DocumentTemplateGdId \n' +
    'FROM ProcessesStepsInstances \n' +
    'JOIN ProcessInstances ON ProcessesStepsInstances.ProcessInstanceId = ProcessInstances.Id \n' +
    'JOIN ProcessesSteps ON ProcessesStepsInstances.ProcessStepId = ProcessesSteps.Id \n' +
    'LEFT JOIN DocumentTemplates ON DocumentTemplates.Id=ProcessesSteps.DocumentTemplateId \n' +
    'LEFT JOIN Letters ON Letters.Id=ProcessesStepsInstances.OurLetterId \n' +
    'JOIN Processes ON ProcessInstances.ProcessId = Processes.Id \n' +
    'JOIN Cases ON Cases.Id = ProcessInstances.CaseId \n' +
    'JOIN Milestones ON Milestones.Id = Cases.MilestoneId \n' +
    'JOIN Contracts ON Contracts.Id = Milestones.ContractId \n' +
    'WHERE Contracts.Id = ' + contractId;
  return getProcessesStepsInstances(sql, { contractId: contractId }, externalConn);
}

function getProcessesStepsInstances(sql, parentDataObject, externalConn) {
  Logger.log(sql);
  try {
    var conn = (externalConn) ? externalConn : connectToSql();
    var stmt = conn.createStatement();
    var result = [];
    var dbResults = stmt.executeQuery(sql);

    while (dbResults.next()) {
      var item = new ProcessStepInstance({
        id: dbResults.getLong('Id'),
        processInstanceId: dbResults.getLong('ProcessInstanceId'),
        processStepId: dbResults.getLong('ProcessStepId'),
        status: dbResults.getString('Status'),
        deadline: dbResults.getString('Deadline'),
        _ourLetter: {
          id: dbResults.getLong('OurLetterId'),
          documentGdId: dbResults.getString('OurLetterDocumentGdId'),
          folderGdId: dbResults.getString('OurLetterFolderGdId'),
        },
        _lastUpdated: dbResults.getString('LastUpdated'),
        _processStep: {
          id: dbResults.getLong('ProcessStepId'),
          name: dbResults.getString('ProcessStepName'),
          description: dbResults.getString('ProcessStepDescription'),
          _documentTemplate: {
            name: dbResults.getString('DocumentTemplateName'),
            gdId: dbResults.getString('DocumentTemplateGdId'),
          },
        },
        _case: {
          id: dbResults.getLong('CaseId')
        },
        _editor: {
          id: dbResults.getLong('EditorId')
        },

      });

      result.push(item);
    }

    dbResults.close();
    return result;
  } catch (e) {
    Logger.log(e);
    throw e;
  } finally {
    if (!externalConn) conn.close();
  }

}


function getProcessesStepsInstancesListPerMilestone_Test() {
  var x = getProcessesStepsInstancesListPerMilestone(609, undefined);
}

function addNewProcessStepInstance(itemFromClient) {
  try {
    itemFromClient = JSON.parse(itemFromClient);
    var item = new ProcessStepInstance(itemFromClient);
    var conn = connectToSql();
    conn.setAutoCommit(false);
    item.addInDb(conn);
    conn.commit();
    Logger.log(' item Added ItemId: ' + item.id);
    return item;
  } catch (err) {
    Logger.log(JSON.stringify(err));
    if (conn.isValid(0)) conn.rollback();
    throw err;
  } finally {
    if (conn.isValid(0)) conn.close();
  }
}

function test_addNewProcessStepInstanceOurLetter() {
  addNewProcessStepInstanceOurLetter(ToolsHtml.parseHtmlToText(''));
}

function addNewProcessStepInstanceOurLetter(itemFromClient) {
  itemFromClient = JSON.parse(itemFromClient);
  //itemFromClient._extRepoTmpDataObject to standardowy obiekt dla zewnętrznego repozytorium z Modal.submitTrigger()
  itemFromClient._ourLetter = addNewLetter(JSON.stringify(itemFromClient._extRepoTmpDataObject));
  var stepInstance = new ProcessStepInstance(itemFromClient);
  stepInstance.editInDb();
  stepInstance._extRepoTmpDataObject = itemFromClient._ourLetter;
  return stepInstance;
}

function editProcessStepInstance(itemFromClient) {
  itemFromClient = JSON.parse(itemFromClient);
  var item = new ProcessStepInstance(itemFromClient);
  item.editInDb();
  Logger.log('item edited ItemId: ' + item.id);
  return item;
}

function editProcessStepInstanceOurLetter(itemFromClient) {
  itemFromClient = JSON.parse(itemFromClient);
  //itemFromClient._extRepoTmpDataObject to standardowy obiekt dla zewnętrznego repozytorium z Modal.submitTrigger()
  itemFromClient._ourLetter = editLetter(JSON.stringify(itemFromClient._extRepoTmpDataObject));
  var stepInstance = new ProcessStepInstance(itemFromClient);
  stepInstance.editInDb();
  stepInstance._extRepoTmpDataObject = itemFromClient._ourLetter;
  return stepInstance;
}

function appendProcessStepInstanceOurLetterAttachments(itemFromClient) {
  itemFromClient = JSON.parse(itemFromClient);
  var stepInstance = new ProcessStepInstance(itemFromClient);
  stepInstance._extRepoTmpDataObject = appendLetterAttachments(JSON.stringify(itemFromClient._extRepoTmpDataObject));
  stepInstance._ourLetter = itemFromClient._extRepoTmpDataObject;
  return stepInstance;
}
function test_appendProcessStepInstanceOurLetterAttachments() {
  appendProcessStepInstanceOurLetterAttachments('{"_ourLetter":{"folderGdId":"1MuOe8rPIjp3cLoXc_6WWber2ZcGq0DnH","documentGdId":"1hoyhYnveKg7OG_j68dZanEfydelULVphKA032o1dZaA","id":293},"processInstanceId":198,"_processStep":{"_documentTemplate":{"name":"Polecenie rozpoczęcia robót","gdId":"1po_Byx5xmKuW5Z-yOAqmUEr2F_WyWTqfyPzDGBf9Urw"},"name":"Wyznaczenie Daty Rozpoczęcia Robót","description":"Wyznaczenie w formie pisemnej Daty Rozpoczęcia Rob&oacute;t - jeżeli wymaga tego umowa o roboty i przekazanie pisma Stronom","id":6},"_case":{"id":840},"_lastUpdated":"2020-02-22 08:54:00.0","ourLetterId":293,"processStepId":6,"id":1457,"_documentOpenUrl":"https://drive.google.com/open?id=1hoyhYnveKg7OG_j68dZanEfydelULVphKA032o1dZaA","status":"Nie rozpoczęte","description":"","_extRepoTmpDataObject":{"_project":{"ourId":"KOB.GWS.01.WLASNE","lettersGdFolderId":"1QA8RuS5h6-qWyyxn--SgHnjjloFDacJi","id":"14","gdFolderId":"1dbiaItXJFmlTxc4c3z44Bd2gyTCpQOOy"},"_gdFolderUrl":"https://drive.google.com/drive/folders/1MuOe8rPIjp3cLoXc_6WWber2ZcGq0DnH","_lastUpdated":"2020-02-16 10:12:04.0","description":"wer","number":"293","registrationDate":"2020-01-19","id":293,"letterFilesCount":1,"_entitiesMain":[{"address":"ul. Waszczyka nr 2C, 65-664 Zielona Góra","phone":"","www":"","name":"ADESI Sp. z o.o.","taxNumber":"9291859529","id":199,"fax":"","email":"winturski@poczta.onet.pl"},{"name":"DSDiK Wrocław","id":17}],"creationDate":"2020-01-19","_editor":{"surname":"Gazda","name":"Marek","id":125},"folderGdId":"1MuOe8rPIjp3cLoXc_6WWber2ZcGq0DnH","_cases":[{"_gdFolderUrl":"https://drive.google.com/drive/folders/1oFOAMw_VVWSWGVQlt4LlaSXaPl8YssCc","milestoneId":609,"description":"","_typeFolderNumber_TypeName_Number_Name":"01 Rozpoczęcie robót","gdFolderId":"1oFOAMw_VVWSWGVQlt4LlaSXaPl8YssCc","_parent":{"_parent":{"number":"K1"},"_type":{"_folderNumber":"03","name":"Roboty - nadzór","id":7},"id":609},"_displayNumber":"S00","id":840,"_processesInstances":[],"_type":{"isDefault":true,"isUniquePerMilestone":true,"folderNumber":"01","name":"Rozpoczęcie robót","id":11,"milestoneTypeId":7},"_folderName":"01 Rozpoczęcie robót","typeId":11}],"documentGdId":"1hoyhYnveKg7OG_j68dZanEfydelULVphKA032o1dZaA","projectId":"14","_documentOpenUrl":"https://drive.google.com/open?id=1hoyhYnveKg7OG_j68dZanEfydelULVphKA032o1dZaA","isOur":true,"_entitiesCc":[],"_blobEnviObjects":[{"blobBase64String":"ZHVwYSBqYXNpdQ==","name":"test PS.txt","mimeType":"text/plain"}]}}');
}
function test_editProcessStepInstance() {
  editProcessStepInstance(
    '')
}

function deleteProcessStepInstance(itemFromClient) {
  itemFromClient = JSON.parse(itemFromClient);
  var item = new ProcessStepInstance(itemFromClient);
  item.deleteFromDb();
}

function deleteProcessStepInstanceOurLetter(itemFormClient) {
  itemFormClient = JSON.parse(itemFormClient);
  try {
    var item: OurLetter = new OurLetter(itemFormClient._ourLetter);
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