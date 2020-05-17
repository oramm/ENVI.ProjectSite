function getProcessInstancesList(initParamObject: any, externalConn: GoogleAppsScript.JDBC.JdbcConnection): any[] {
  var projectConditon = (initParamObject && initParamObject.projectId) ? 'Contracts.ProjectOurId="' + initParamObject.projectId + '"' : '1';
  var contractConditon = (initParamObject && initParamObject.contractId) ? 'Contracts.Id="' + initParamObject.contractId + '"' : '1';
  var milestoneConditon = (initParamObject && initParamObject.milestoneId) ? 'Milestones.Id="' + initParamObject.milestoneId + '"' : '1';
  var sql = 'SELECT  ProcessInstances.Id, \n \t' +
    'ProcessInstances.CaseId, \n \t' +
    'ProcessInstances.TaskId, \n \t' +
    'ProcessInstances.EditorId, \n \t' +
    'ProcessInstances.LastUpdated, \n \t' +
    'Processes.Id AS ProcessId, \n \t' +
    'Processes.Name AS ProcessName, \n \t' +
    'Processes.Description  AS ProcessDescription \n' +
    'FROM ProcessInstances \n' +
    'JOIN Processes ON ProcessInstances.ProcessId = Processes.Id \n' +
    'JOIN Cases ON Cases.Id = ProcessInstances.CaseId \n' +
    'JOIN Milestones ON Milestones.Id = Cases.MilestoneId \n' +
    'JOIN Contracts ON Milestones.ContractId = Contracts.Id \n' +
    'WHERE ' + milestoneConditon + ' AND ' + contractConditon + ' AND ' + projectConditon;

  return getProcessInstances(sql, initParamObject, externalConn);
}

function getProcessInstancesList_OLD(externalConn: GoogleAppsScript.JDBC.JdbcConnection): any[] {
  var sql = 'SELECT  ProcessInstances.Id, \n \t' +
    'ProcessInstances.CaseId, \n \t' +
    'ProcessInstances.TaskId, \n \t' +
    'ProcessInstances.EditorId, \n \t' +
    'ProcessInstances.LastUpdated, \n \t' +
    'Processes.Id AS ProcessId, \n \t' +
    'Processes.Name AS ProcessName, \n \t' +
    'Processes.Description  AS ProcessDescription \n' +
    'FROM ProcessInstances \n' +
    'JOIN Processes ON ProcessInstances.ProcessId = Processes.Id \n' +
    'JOIN Cases ON Cases.Id = ProcessInstances.CaseId \n' +
    'JOIN Milestones ON Milestones.Id = Cases.MilestoneId \n';
  return getProcessInstances(sql, undefined, externalConn);
}

function getProcessInstances(sql: string, parentDataObject, externalConn: GoogleAppsScript.JDBC.JdbcConnection): any[] {
  Logger.log(sql);
  try {
    var conn = (externalConn) ? externalConn : connectToSql();
    if (!conn.isValid(0)) throw new Error('getProcessInstances:: połączenie przerwane');
    var stmt = conn.createStatement();
    var result = [];
    var dbResults = stmt.executeQuery(sql);

    while (dbResults.next()) {
      var item = {
        id: dbResults.getLong('Id'),
        _case: {
          id: dbResults.getLong('CaseId')
        },
        _task: {
          id: dbResults.getLong('TaskId')
        },
        _editor: {
          id: dbResults.getLong('EditorId')
        },
        _lastUpdated: dbResults.getString('LastUpdated'),
        _process: {
          id: dbResults.getLong('ProcessId'),
          name: dbResults.getString('ProcessName'),
          description: dbResults.getString('ProcessDescription'),
        }
      }

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
/*
 * jest wywoływana w addNewCase()
 * tworzy instancję procesu i zadanie do scrumboarda na podstawie szablonu
 */
function addNewProcessInstancesForCaseInDb(caseItem, externalConn: GoogleAppsScript.JDBC.JdbcConnection) {
  if (caseItem._type._processes.length > 0) {
    try {
      var conn: GoogleAppsScript.JDBC.JdbcConnection = (externalConn) ? externalConn : connectToSql();
      conn.setAutoCommit(false);
      //typ sprawy może mieć wiele procesów - sprawa automatycznie też
      for (var i = 0; i < caseItem._type._processes.length; i++) {
        //dodaj zadanie ramowe z szablonu
        var processInstanceTask = new Task({ _parent: caseItem });
        processInstanceTask.addInDbFromTemplate(caseItem, caseItem._type._processes[i], conn, true);

        var item = new ProcessInstance({
          _process: caseItem._type._processes[i],
          _case: caseItem,
          _task: processInstanceTask
        });
        item.addInDb(conn, true);
      }
      if (!externalConn) conn.commit();
      Logger.log(' item Added ItemId: ' + item.id);
      return item;
    } catch (err) {
      Logger.log(JSON.stringify(err));
      if (!externalConn && conn.isValid(0)) conn.rollback();
      throw err;
    } finally {
      if (!externalConn && conn.isValid(0)) conn.close();
    }
  }
}
/*
 * jest wywoływana w editCase()
 * kasuje Instancje procesu i zadanie ramowe, potem tworzy je nanowo dla nowego typu sprawy
 */
function editProcessInstancesForCaseInDb(caseItem, externalConn: GoogleAppsScript.JDBC.JdbcConnection) {
  try {
    var conn = (externalConn) ? externalConn : connectToSql();
    conn.setAutoCommit(false);
    deleteProcessInstancesForCaseFromDb(caseItem, conn, true);
    addNewProcessInstancesForCaseInDb(caseItem, externalConn);

    if (!externalConn) conn.commit();
  } catch (err) {
    Logger.log(JSON.stringify(err));
    if (!externalConn && conn.isValid(0)) conn.rollback();
    throw err;
  } finally {
    if (!externalConn && conn.isValid(0)) conn.close();
  }
}

function deleteProcessInstancesForCaseFromDb(caseItem, externalConn: GoogleAppsScript.JDBC.JdbcConnection, isPartOfTransaction) {
  try {
    var conn = (externalConn) ? externalConn : connectToSql();
    conn.setAutoCommit(false);
    var stmt = conn.createStatement();
    stmt.addBatch('DELETE FROM ProcessInstances WHERE CaseId =' + caseItem.id);
    //stmt.addBatch('DELETE FROM Tasks WHERE CaseId =' + caseItem.id);
    var batch = stmt.executeBatch();
    if (!isPartOfTransaction) conn.commit()

    Logger.log('deleteProcessInstancesForCaseFromDb():: done');
  } catch (err) {
    Logger.log(JSON.stringify(err));
    if (!externalConn && conn.isValid(0)) conn.rollback();
    throw err;
  } finally {
    if (!externalConn && conn.isValid(0)) conn.close();
  }
}

function editProcessInstance(itemFromClient: string) {
  itemFromClient = JSON.parse(itemFromClient);
  var item = new ProcessInstance(itemFromClient);
  item.editInDb();
  Logger.log('item edited ItemId: ' + item.id);
}

function deleteProcessInstance(itemFromClient: string) {
  itemFromClient = JSON.parse(itemFromClient);
  var item = new ProcessInstance(itemFromClient);
  item.deleteFromDb();
}

/*
 * Po dodaniu nowych procesów trzeba przelecieć po sprawach podpiąc te procesy
 */
function refreshAllProcessInstances() {
  try {
    var conn = connectToSql();
    conn.setAutoCommit(false);
    var cases = getCasesListPerProject({ projectId: 'MOG.GWS.01.POIS' })//getCasesList();
    var processes = getProcessesList(undefined, undefined);
    for (var i = 0; i < cases.length; i++) {
      for (var j = 0; j < processes.length; j++) {
        if (processes[j]._caseType.id == cases[i]._type.id ||
          cases[i]._processesInstances.length > 0
          //&& !cases[i].hasProcessConnected(processes[j].id) //na razie nadpisuję wszystkie instancje puki procesy nie żyją
        ) {
          //Logger.log('Dodano Proces: ' + processes[j].name + ' do sprawy ' + cases[i].id + ' typu: ' + cases[i]._type.name)
          deleteProcessInstancesForCaseFromDb(cases[i], conn, true);
          addNewProcessInstancesForCaseInDb(cases[i], conn);
        }
      }
    }
    conn.commit();
    Logger.log('addprocessInstancesToCases() Succes');
  } catch (err) {
    Logger.log(JSON.stringify(err));
    if (conn.isValid(0)) conn.rollback();
    throw err;
  } finally {
    if (conn.isValid(0)) conn.close();
  }
}