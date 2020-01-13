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
        _ourletter: {
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
          id: dbResults.getLong(3)
        },
        _editor: {
          id: dbResults.getLong(7)
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
  var x = getProcessesStepsInstancesListPerMilestone(511, undefined);
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

function test_addNewProcessInstance() {
}

function addNewProcessStepInstanceOurLetter(itemFromClient) {
  return itemFromClient._processStepInstance;
  var letter = addNewLetter(itemFromClient);
  var stepInstance = new ProcessStepInstance(itemFromClient._processStepInstance);
  stepInstance.editInDb();
  return stepInstance;
}

function editProcessStepInstance(itemFromClient) {
  itemFromClient = JSON.parse(itemFromClient);
  var item = new ProcessStepInstance(itemFromClient);
  item.editInDb();
  Logger.log('item edited ItemId: ' + item.id);
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