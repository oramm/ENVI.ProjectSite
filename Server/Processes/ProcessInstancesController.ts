function getProcessInstancesListPerMilestone(milestoneId, externalConn) {
    var sql = 'SELECT  ProcessInstances.Id, \n \t' +
                      'ProcessInstances.CaseId, \n \t' +
                      'ProcessInstances.TaskId, \n \t' +
                      'ProcessInstances.EditorId, \n \t' +
                      'ProcessInstances.LastUpdated, \n \t' +
                      'Processes.Id, \n \t' +
                      'Processes.Name, \n \t' +
                      'Processes.Description \n' + 
               'FROM ProcessInstances \n' +
               'JOIN Processes ON ProcessInstances.ProcessId = Processes.Id \n' +
               'JOIN Cases ON Cases.Id = ProcessInstances.CaseId \n' +
               'JOIN Milestones ON Milestones.Id = Cases.MilestoneId \n' +
               'WHERE Milestones.Id = ' + milestoneId;
    
    return getProcessInstances(sql, {milestoneId: milestoneId}, externalConn);
}

function getProcessInstancesListPerContract(contractId, externalConn) {
    var sql = 'SELECT  ProcessInstances.Id, \n \t' +
                      'ProcessInstances.CaseId, \n \t' +
                      'ProcessInstances.TaskId, \n \t' +
                      'ProcessInstances.EditorId, \n \t' +
                      'ProcessInstances.LastUpdated, \n \t' +
                      'Processes.Id, \n \t' +
                      'Processes.Name, \n \t' +
                      'Processes.Description \n' + 
               'FROM ProcessInstances \n' +
               'JOIN Processes ON ProcessInstances.ProcessId = Processes.Id \n' +
               'JOIN Cases ON Cases.Id = ProcessInstances.CaseId \n' +
               'JOIN Milestones ON Milestones.Id = Cases.MilestoneId \n' +
               'JOIN Contracts ON Milestones.ContractId = Contracts.Id \n' +
               'WHERE Contracts.Id = ' + contractId;
    
    return getProcessInstances(sql, {contractId: contractId}, externalConn);
}

function getProcessInstancesList(externalConn) {
    var sql = 'SELECT  ProcessInstances.Id, \n \t' +
                      'ProcessInstances.CaseId, \n \t' +
                      'ProcessInstances.TaskId, \n \t' +
                      'ProcessInstances.EditorId, \n \t' +
                      'ProcessInstances.LastUpdated, \n \t' +
                      'Processes.Id, \n \t' +
                      'Processes.Name, \n \t' +
                      'Processes.Description \n' + 
               'FROM ProcessInstances \n' +
               'JOIN Processes ON ProcessInstances.ProcessId = Processes.Id \n' +
               'JOIN Cases ON Cases.Id = ProcessInstances.CaseId \n' +
               'JOIN Milestones ON Milestones.Id = Cases.MilestoneId \n';
    return getProcessInstances(sql, undefined, externalConn);
}

function getProcessInstances(sql, parentDataObject, externalConn){
  Logger.log(sql);
  try{
    var conn = (externalConn)? externalConn : connectToSql(); 
    if(!conn.isValid(0)) throw new Error ('getProcessInstances:: połączenie przerwane');
    var stmt = conn.createStatement();
    var result = [];
    var dbResults = stmt.executeQuery(sql);
    
    var processesStepsInstances;
    if(!parentDataObject)
      processesStepsInstances = [];
    else if(parentDataObject.contractId)
      processesStepsInstances = getProcessesStepsInstancesListPerContract(parentDataObject.contractId, conn);
    else if(parentDataObject.milestoneId)
      processesStepsInstances = getProcessesStepsInstancesListPerMilestone(parentDataObject.milestoneId, conn);
    
    while (dbResults.next()) {
      var item = { id: dbResults.getLong(1),
                   _case: { id: dbResults.getLong(2)
                          },
                   _task: { id: dbResults.getLong(3)
                          },
                   _editor: { id: dbResults.getLong(4)
                          },
                   _lastUpdated: dbResults.getString(5),
                   _process: { id: dbResults.getLong(6),
                               name: dbResults.getString(7),
                               description: dbResults.getString(8),
                             },
                  _stepsInstances: processesStepsInstances.filter(function(item){return item._case.id==dbResults.getLong(2)})
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
function addNewProcessInstancesForCaseInDb(caseItem, externalConn) {
  if(caseItem._type._processes.length>0){
    try{
      var conn = (externalConn)? externalConn : connectToSql();
      conn.setAutoCommit(false);
      //typ sprawy może mieć wiele procesów - sprawa automatycznie też
      for (var i=0; i<caseItem._type._processes.length; i++){
        //dodaj zadanie ramowe z szablonu
        var processInstanceTask = new Task({_parent: caseItem});
        processInstanceTask.addInDbFromTemplate(caseItem, caseItem._type._processes[i], conn, true);
        
        var item = new ProcessInstance({_process: caseItem._type._processes[i],
                                        _case: caseItem,
                                        _task: processInstanceTask
                                       });
        item.addInDb(conn, true);
      }  
      if(!externalConn) conn.commit();
      Logger.log(' item Added ItemId: ' + item.id);
      return item;
    } catch (err) {
      Logger.log(JSON.stringify(err));
      if(!externalConn && conn.isValid(0)) conn.rollback();
      throw err;
    } finally {
      if(!externalConn && conn.isValid(0)) conn.close();
    }
  }
}
/*
 * jest wywoływana w editCase()
 * kasuje Instancje procesu i zadanie ramowe, potem tworzy je nanowo dla nowego typu sprawy
 */
function editProcessInstancesForCaseInDb(caseItem, externalConn){
  try{
    var conn = (externalConn)? externalConn : connectToSql();
    conn.setAutoCommit(false);
    deleteProcessInstancesForCaseFromDb(caseItem, conn, true);
    addNewProcessInstancesForCaseInDb(caseItem, externalConn);
    
    if(!externalConn) conn.commit();
  } catch (err) {
    Logger.log(JSON.stringify(err));
    if(!externalConn && conn.isValid(0)) conn.rollback();
    throw err;
  } finally {
    if(!externalConn && conn.isValid(0)) conn.close();
  }
}
  
function deleteProcessInstancesForCaseFromDb(caseItem, externalConn, isPartOfTransaction){
  try{
    var conn = (externalConn)? externalConn : connectToSql();
    conn.setAutoCommit(false);
    var stmt = conn.createStatement();
    stmt.addBatch('DELETE FROM ProcessInstances WHERE CaseId =' + caseItem.id);
    //stmt.addBatch('DELETE FROM Tasks WHERE CaseId =' + caseItem.id);
    var batch = stmt.executeBatch();
    if (!isPartOfTransaction) conn.commit()
    
    Logger.log('deleteProcessInstancesForCaseFromDb():: done');
  } catch (err) {
    Logger.log(JSON.stringify(err));
    if(!externalConn && conn.isValid(0)) conn.rollback();
    throw err;
  } finally {
    if(!externalConn && conn.isValid(0)) conn.close();
  }
}
  
function editProcessInstance(itemFromClient) {
    itemFromClient = JSON.parse(itemFromClient);
    var item = new ProcessInstance(itemFromClient);
    item.editInDb();
    Logger.log('item edited ItemId: ' + item.id);
}

function deleteProcessInstance(itemFromClient){
  itemFromClient = JSON.parse(itemFromClient);
  var item = new ProcessInstance(itemFromClient);
  item.deleteFromDb();
}

/*
 * Po dodaniu nowych procesów trzeba przelecieć po sprawach podpiąc te procesy
 */
function refreshAllProcessInstances(){
  try{
    var conn = connectToSql();
    conn.setAutoCommit(false);
    var cases = getCasesList();
    var processes = getProcessesList(undefined,undefined);
    for(var i=0; i<cases.length; i++){
      for(var j=0; j<processes.length; j++){
        if(processes[j]._caseType.id == cases[i]._type.id ||
           cases[i]._processesInstances.length>0
           //&& !cases[i].hasProcessConnected(processes[j].id) //na razie nadpisuję wszystkie instancje puki procesy nie żyją
          ){
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
    if(conn.isValid(0)) conn.rollback();
    throw err;
  } finally {
    if(conn.isValid(0)) conn.close();
  }
}