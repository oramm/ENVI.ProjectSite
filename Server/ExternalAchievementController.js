function getExternalAchievementsList(personId) {
  try {
    var result = [];
    var conn = connectToSql();
    var stmt = conn.createStatement();
    var query = 'SELECT  AchievementsExternal.Id,  \n \t' +
                        'AchievementsExternal.RoleName,  \n \t' +
                        'AchievementsExternal.Description,  \n \t' +
                        'AchievementsExternal.WorksScope,  \n \t' +
                        'AchievementsExternal.WorksValue,  \n \t' +
                        'AchievementsExternal.ProjectValue,  \n \t' +
                        'AchievementsExternal.StartDate,  \n \t' +
                        'AchievementsExternal.EndDate,  \n \t' +
                        'AchievementsExternal.Employer,  \n \t' +
                        'AchievementsExternal.OwnerId,  \n \t' +
                        'Persons.Name,  \n \t' +
                        'Persons.Surname,  \n \t' +
                        'Persons.Email  \n' +
                'FROM AchievementsExternal \n' +
                'JOIN Persons ON AchievementsExternal.OwnerId = Persons.Id \n' +
                'ORDER BY AchievementsExternal.Id DESC';
              //  'GROUP BY Tasks.Id;'
    var dbResults = stmt.executeQuery(query);
    
    Logger.log(query);
    var numCols = dbResults.getMetaData().getColumnCount();
    while (dbResults.next()) {
      var item = {  id: dbResults.getLong(1),
                    roleName: dbResults.getString(2).trim(),
                    description: dbResults.getString(3).trim(),
                    worksScope:  dbResults.getString(4).trim(),
                    worksValue: dbResults.getString(5).trim(),
                    projectValue: dbResults.getString(6).trim(),
                    startDate: dbResults.getString(7).trim(),
                    endDate: dbResults.getString(8).trim(),
                    employer: dbResults.getString(9).trim(),
                    _owner: { id: dbResults.getLong(10)
                            }
                  }
      //init: function(id, roleName, description, worksScope, worksValue, projectValue,  startDate, endDate, employer, ownerId)

      item._owner.nameSurnameEmail = dbResults.getString(11).trim() + ' ' + dbResults.getString(12).trim() + ': ' + dbResults.getString(13).trim();
      

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

function addNewExternalAchievementInDb(itemFromClient) {
    itemFromClient = JSON.parse(itemFromClient);
    var externalAchievement = new ExternalAchievement(itemFromClient);
    //init: function(id, roleName, description, worksScope, worksValue, projectValue,  startDate, endDate, employer, ownerId){
    
    externalAchievement.addInDb();
    Logger.log(' item Added ItemId: ' + externalAchievement.id);
    return externalAchievement.id;
}

function test_addNewExternalAchievementInDb(){
  addNewExternalAchievementInDb(
'{"id":258,"ownerId":1,"ownerNameSurnameEmail":"Marta Listwan: mlistwan@ugk.pl","roleName":"Inspektor Nadzoru - Sanitarny","description":"opis doświadczxenie","worksScope":"zakres robót","worksValue":"11111","projectValue":"22222","startDate":"12-06-2018","endDate":"12-08-2019","employer":"PWoK testowe","tmpId":"258_pending"}')

}

function editExternalAchievementInDb(itemFromClient) {
    itemFromClient = JSON.parse(itemFromClient);
    var externalAchievement = new ExternalAchievement(itemFromClient);
    externalAchievement.editInDb();
    Logger.log('item edited ItemId: ' + externalAchievement.id);
}

function deleteExternalAchievement(itemFromClient){
  itemFromClient = JSON.parse(itemFromClient);
  var item = new ExternalAchievement();
  item.id = itemFromClient.id;
  item.deleteFromDb();
}

// Write all Achievements to DB  in a single batch.
function writeAllexternalAchievementsInDb() {
  
  var ExternalAchievement;
  for (var i = ACHIEVEMENTS_EXTERNAL_FIRST_DATA_ROW-1; i < ACHIEVEMENTS_EXTERNAL_DATA_VALUES.length; i++) {
    var row = ACHIEVEMENTS_EXTERNAL_DATA_VALUES[i];
    var x = row[ACHIEVEMENTS_EXTERNAL_COL_DB_STATUS] //ACHIEVEMENTS_EXTERNAL_RESPONSES_SHEET.getRange(i, ACHIEVEMENTS_EXTERNAL_COL_DB_STATUS+1).getValue()
    
    Logger.log(x + i);
    if(x==""){
      ExternalAchievement = new ExternalAchievement(undefined,i+1);
      ExternalAchievement.addInDb();
    }
  }
}