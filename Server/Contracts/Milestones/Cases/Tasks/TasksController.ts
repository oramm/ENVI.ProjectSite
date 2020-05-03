function getTasksListPerMilestone(milestoneId) {
  try {
    var result = [];
    var conn = connectToSql();
    var stmt = conn.createStatement();
    if(!milestoneId) milestoneId = '"%"'
    var sql = 'SELECT  Tasks.Id, \n \t' +
                        'Tasks.CaseId, \n \t' +
                        'Tasks.Name, \n \t' +
                        'Tasks.Description, \n \t ' +
                        'Tasks.Deadline, \n \t' +
                        'Tasks.Status, \n \t' +
                        'Tasks.OwnerId, \n \t' +
                        'Persons.Name, \n \t' +
                        'Persons.Surname, \n \t' +
                        'Persons.Email \n' +
                'FROM Tasks \n' +
                'JOIN Cases ON Cases.MilestoneId='+ milestoneId +' AND Cases.Id=Tasks.CaseId \n' +
                'LEFT JOIN Persons ON Persons.Id = Tasks.OwnerId';
    var dbResults = stmt.executeQuery(sql);
    
    Logger.log(sql);
    while (dbResults.next()) {
      
      var item = new Task({id: dbResults.getLong(1),
                           name: dbResults.getString(3),
                           description: dbResults.getString(4),
                           deadline: dbResults.getString(5),
                           status: dbResults.getString(6),
                           _owner: {id: (dbResults.getLong(7))? dbResults.getLong(7) : undefined,
                                    name: (dbResults.getString(8))? dbResults.getString(8): '',
                                    surname: (dbResults.getString(9))? dbResults.getString(9): ''
                                   },
                           _parent: {id: dbResults.getLong(2)}
                         });
      Logger.log(item._owner);
      item.milestoneId = milestoneId/1;
      if(item._owner.id){
        //var name = (dbResults.getString(8))? dbResults.getString(8): '';
        //var surname = (dbResults.getString(9))? dbResults.getString(9): '';
        var email = (dbResults.getString(10))? dbResults.getString(10): '';
        item._owner._nameSurnameEmail = item._owner.name.trim() + ' ' + item._owner.surname.trim() + ': ' + email.trim();
      }
      result.push(item);
    }

    return result;
  } catch (e) {
    Logger.log(e);
    throw e;
  } finally {
    conn.close();
  }
}

function test_getTasksListPerMilestone(){
  getTasksListPerMilestone(247);
}

function test_getTaskParents(){
  try{
    var item = new Task({caseId:108});
    var conn = connectToSql();
    var t = item.getParents(conn);
    Logger.log(t);
  } catch (e) {
    throw e;
  } finally {
    conn.close();
  }
}

function addNewTask(itemFormClient) {
    itemFormClient = JSON.parse(itemFormClient);
    var item = new Task(itemFormClient);
    try{
      var conn = connectToSql();
      var newId = item.addInDb(conn);
      item.addInScrum(conn);
      Logger.log(' item Added ItemId: ' + item.id);
      return item;
    } catch (err) {
      throw err;
    } finally {
      if(conn && conn.isValid(0)) conn.close();
    }
}
//TODO przetestować
function test_editTask(){
  editTask('')
}

function editTask(itemFormClient) {
  itemFormClient = JSON.parse(itemFormClient);
  var item = new Task(itemFormClient);
  item.editInDb();
  item.editInScrum();
  Logger.log('item edited ItemId: ' + item.id);
  return item;
}

function deleteTask(itemFormClient){
  itemFormClient = JSON.parse(itemFormClient);
  var item = new Task(undefined);
  item.id = itemFormClient.id;
  item.deleteFromDb();
  item.deleteFromScrum();
}

function test_deleteTask(){
  deleteTask('{"milestoneId":"103","description":"ddddd","ownerId":2,"_nameSurnameEmail":"Aleksandra Zdybicka: aleksandra.zdybicka@ekowodrol.pl","caseId":6,"name":"zadaneczko","id":11,"deadline":"2018-08-26","status":"Nie rozpoczęty"}')
}