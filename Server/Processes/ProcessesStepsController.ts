function getProcessStepsList(externalConn) {
  var sql = 'SELECT  ProcessesSteps.Id, \n \t' +
    'ProcessesSteps.Name, \n \t' +
    'ProcessesSteps.Description, \n \t' +
    'ProcessesSteps.LastUpdated, \n \t' +
    'Processes.Id AS ProcessId, \n \t' +
    'Processes.Name AS ProcessName, \n \t' +
    'Processes.CaseTypeId AS ProcessCaseTypeId, \n \t' +
    'DocumentTemplates.Id AS DocumentTemplateId, \n \t' +
    'DocumentTemplates.Name AS DocumentTemplateName, \n \t' +
    'DocumentTemplates.Description AS DocumentTemplateDescription, \n \t' +
    'DocumentTemplates.GdId AS DocumentTemplateGdId, \n \t' +
    'DocumentTemplatesContents.GdId AS ContentsGdId, \n \t' +
    'DocumentTemplatesContents.Alias AS ContentsAlias, \n \t' +
    'DocumentTemplatesContents.CaseTypeId AS ContentsCaseTypeId \n' +
    'FROM ProcessesSteps \n' +
    'JOIN Processes ON Processes.Id=ProcessesSteps.ProcessId \n' +
    'LEFT JOIN DocumentTemplatesContents ON DocumentTemplatesContents.Id = ProcessesSteps.DocumentTemplateContentsId \n' +
    'LEFT JOIN DocumentTemplates ON DocumentTemplates.Id=DocumentTemplatesContents.TemplateId';
  return getProcessesSteps(sql, externalConn);
}

function getProcessesStepsListForProcess(processId, externalConn) {
  var sql = 'SELECT  ProcessesSteps.Id, \n \t' +
    'ProcessesSteps.Name, \n \t' +
    'ProcessesSteps.Description, \n \t' +
    'ProcessesSteps.LastUpdated, \n \t' +
    'Processes.Id AS ProcessId, \n \t' +
    'Processes.Name AS ProcessName, \n \t' +
    'Processes.CaseTypeId AS ProcessCaseTypeId, \n \t' +
    'DocumentTemplates.Id AS DocumentTemplateId, \n \t' +
    'DocumentTemplates.Name AS DocumentTemplateName, \n \t' +
    'DocumentTemplates.Description AS DocumentTemplateDescription, \n \t' +
    'DocumentTemplates.GdId AS DocumentTemplateGdId, \n \t' +
    'DocumentTemplatesContents.GdId AS ContentsGdId, \n \t' +
    'DocumentTemplatesContents.Alias AS ContentsAlias, \n \t' +
    'DocumentTemplatesContents.CaseTypeId AS ContentsCaseTypeId \n' +
    'FROM ProcessesSteps \n' +
    'JOIN Processes ON Processes.Id=ProcessesSteps.ProcessId \n' +
    'LEFT JOIN DocumentTemplatesContents ON DocumentTemplatesContents.Id = ProcessesSteps.DocumentTemplateContentsId \n' +
    'LEFT JOIN DocumentTemplates ON DocumentTemplates.Id=DocumentTemplatesContents.TemplateId \n' +
    'WHERE ProcessesSteps.ProcessId=' + processId;

  return getProcessesSteps(sql, externalConn);
}

function getProcessesSteps(sql, externalConn) {
  Logger.log(sql);
  try {
    var conn = (externalConn) ? externalConn : connectToSql();
    if (!conn.isValid(0)) throw new Error('getProcesses:: połączenie przerwane');
    var stmt = conn.createStatement();

    var result = [];
    var dbResults = stmt.executeQuery(sql);
    while (dbResults.next()) {
      var item = new ProcessStep({
        id: dbResults.getLong('Id'),
        name: dbResults.getString('Name'),
        description: dbResults.getString('Description'),
        _documentTemplate: new DocumentTemplate({
          name: dbResults.getString('DocumentTemplateName'),
          description: dbResults.getString('DocumentTemplateDescription'),
          gdId: dbResults.getString('DocumentTemplateGdId'),
          _contents: {
            gdId: dbResults.getString('ContentsGdId'),
            alias: dbResults.getString('ContentsAlias'),
            caseTypeId: dbResults.getLong('ContentsCaseTypeId')
          }
        }),
        documentTemplateId: dbResults.getLong('DocumentTemplateId'),
        _parent: {
          id: dbResults.getLong('ProcessId'),
          name: dbResults.getString('ProcessName'),
          caseTypeId: dbResults.getLong('ProcessCaseTypeId'),
        },
        _lastUpdated: dbResults.getString('LastUpdated')
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

function addNewProcessStep(itemFormClient) {
  itemFormClient = JSON.parse(itemFormClient);
  var item = new ProcessStep(itemFormClient);
  try {
    var conn = connectToSql();
    conn.setAutoCommit(false);
    item.addInDb(conn);
    conn.commit();

    Logger.log(' item Added ItemId: ' + item.id);

    return item;
  } catch (err) {
    if (conn.isValid(0)) conn.rollback();
    throw err;
  } finally {
    if (conn.isValid(0)) conn.close();
  }
}

function test_editProcessStep() {
  editProcessStep('')
}


function editProcessStep(itemFormClient) {
  itemFormClient = JSON.parse(itemFormClient);
  var item = new ProcessStep(itemFormClient);

  try {
    var conn = connectToSql();
    item.editInDb(conn, true);
    conn.commit();
    Logger.log('item edited ItemId: ' + item.id);
    return item;
  } catch (err) {
    Logger.log(JSON.stringify(err));
    if (conn.isValid(0)) conn.rollback();
    throw err;
  } finally {
    if (conn.isValid(0)) conn.close();
  }
}

function deleteProcessStep(itemFormClient) {
  itemFormClient = JSON.parse(itemFormClient);
  try {
    var item = new ProcessStep(itemFormClient);
    item.deleteFromDb();
  } catch (err) {
    throw err;
  }
}