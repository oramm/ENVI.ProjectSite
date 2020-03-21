function getProcessesList(initParamObject, externalConn) {
  var statusConditon = (initParamObject && initParamObject.status)? 'Processes.Status="' + initParamObject.status + '"' : '1';
  var sql = 'SELECT  Processes.Id, \n \t' +
                    'Processes.Name, \n \t' +
                    'Processes.Description, \n \t' +
                    'Processes.Status, \n \t' +
                    'Processes.LastUpdated, \n \t' +
                    'Processes.EditorId, \n \t' +
                    'Processes.CaseTypeId, \n \t' +
                    'CaseTypes.Name As CaseTypeName, \n \t' +
                    'CaseTypes.FolderNumber, \n \t' +
                    'TaskTemplatesForProcesses.Id AS TaskTemplateId, \n \t' +
                    'TaskTemplatesForProcesses.Name AS TaskTemplateName, \n \t' +
                    'TaskTemplatesForProcesses.Description AS TaskTemplateDescription \n' + 
               'FROM Processes \n' +
              'JOIN CaseTypes ON CaseTypes.Id=Processes.CaseTypeId \n' + 
              'LEFT JOIN TaskTemplatesForProcesses ON TaskTemplatesForProcesses.ProcessId = Processes.Id \n' +
              'WHERE '+ statusConditon;
  
    return getProcesses(sql, externalConn);
}

function getProcesses(sql, externalConn){
  Logger.log(sql);
  try{
    var conn = (externalConn)? externalConn : connectToSql(); 
    var stmt = conn.createStatement();
    
    var result = [];
    var dbResults = stmt.executeQuery(sql);
    while (dbResults.next()) {
      var item = new Process({ id: dbResults.getLong('Id'),
                              name: dbResults.getString('Name'),
                              description: dbResults.getString('Description'),
                              status: dbResults.getString('Status'),
                              _caseType: {id: dbResults.getLong('CaseTypeId'),
                                          name: dbResults.getString('CaseTypeName')
                                         },
                              _lastUpdated: dbResults.getString('LastUpdated'),
                              _editor: { id: dbResults.getLong('EditorId')
                                       },
                              _taskTemplate: { id: dbResults.getLong('TaskTemplateId'),
                                              name: dbResults.getString('TaskTemplateName'),
                                              description: dbResults.getString('TaskTemplateDescription')
                                             }
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

function addNewProcess(itemFormClient) {
    itemFormClient = JSON.parse(itemFormClient);
    var item = new Process(itemFormClient);
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

function test_editProcess(){
  editProcess('')
}


function editProcess(itemFormClient) {
  itemFormClient = JSON.parse(itemFormClient);
  var item = new Process(itemFormClient);
  
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

function deleteProcess(itemFormClient){
  itemFormClient = JSON.parse(itemFormClient);
  try{
    var item = new Process(itemFormClient);
    item.deleteFromDb();
  } catch(err){
      throw err;
  }
}