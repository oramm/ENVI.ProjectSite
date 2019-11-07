function getProcessStepsList(externalConn) {
    var sql = 'SELECT  ProcessesSteps.Id, \n \t' +
                      'ProcessesSteps.ProcessId, \n \t' +
                      'ProcessesSteps.Name, \n \t' +
                      'ProcessesSteps.Description, \n \t' +
                      'ProcessesSteps.DocumentTemplateId, \n \t' +
                      'ProcessesSteps.LastUpdated \n' +
              'FROM ProcessesSteps \n';
    
    return getProcessesSteps(sql, externalConn);
}

function getProcessesStepsListForProcess(processId, externalConn) {
    var sql = 'SELECT  ProcessesSteps.Id, \n \t' +
                      'ProcessesSteps.ProcessId, \n \t' +
                      'ProcessesSteps.Name, \n \t' +
                      'ProcessesSteps.Description, \n \t' +
                      'ProcessesSteps.DocumentTemplateId, \n \t' +
                      'ProcessesSteps.LastUpdated \n' +
              'FROM ProcessesSteps \n' +
              'WHERE ProcessesSteps.ProcessId=' + processId;
    
    return getProcessesSteps(sql, externalConn);
}

function getProcessesSteps(sql, externalConn){
  Logger.log(sql);
  try{
    var conn = (externalConn)? externalConn : connectToSql(); 
    if(!conn.isValid(0)) throw new Error ('getProcesses:: połączenie przerwane');
    var stmt = conn.createStatement();
    
    var result = [];
    var dbResults = stmt.executeQuery(sql);
    while (dbResults.next()) {
      var item = new ProcessStep({id: dbResults.getLong('Id'),
                                  name: dbResults.getString('Name'),
                                  description: dbResults.getString('Description'),
                                  documentTemplateId: dbResults.getString('DocumentTemplateId'),
                                  _parent: {id: dbResults.getLong('ProcessId')
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
    try{
      var conn = connectToSql();
      conn.setAutoCommit(false);
      item.addInDb(conn);
      conn.commit();
      
      Logger.log(' item Added ItemId: ' + item.id);
      
      return item;
    } catch (err) {
      if(conn.isValid(0)) conn.rollback();
      throw err;
    } finally {
      if(conn.isValid(0)) conn.close();
    } 
}

function test_editProcessStep(){
  editProcessStep('')
}


function editProcessStep(itemFormClient) {
  itemFormClient = JSON.parse(itemFormClient);
  var item = new ProcessStep(itemFormClient);
  
  try{ 
    var conn = connectToSql();
    item.editInDb(conn, true);
    conn.commit();
    Logger.log('item edited ItemId: ' + item.id);
    return item;
  } catch (err) {
    Logger.log(JSON.stringify(err));
    if(conn.isValid(0)) conn.rollback();
    throw err;
  } finally {
    if(conn.isValid(0)) conn.close();
  }
}

function deleteProcessStep(itemFormClient){
  itemFormClient = JSON.parse(itemFormClient);
  try{
    var item = new ProcessStep(itemFormClient);
    item.deleteFromDb();
  } catch(err){
      throw err;
  }
}