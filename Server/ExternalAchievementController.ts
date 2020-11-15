function getExternalAchievementsList(personId) {
  try {
    var result = [];
    var conn = connectToSql();
    var stmt = conn.createStatement();
    var sql = 'SELECT  AchievementsExternal.Id,  \n \t' +
      'AchievementsExternal.RoleName,  \n \t' +
      'AchievementsExternal.Description,  \n \t' +
      'AchievementsExternal.WorksScope,  \n \t' +
      'AchievementsExternal.WorksValue,  \n \t' +
      'AchievementsExternal.ProjectValue,  \n \t' +
      'AchievementsExternal.StartDate,  \n \t' +
      'AchievementsExternal.EndDate,  \n \t' +
      'AchievementsExternal.Employer,  \n \t' +
      'Persons.Id AS OwnerId,  \n \t' +
      'Persons.Name AS OwnerName,  \n \t' +
      'Persons.Surname AS OwnerSurname,  \n \t' +
      'Persons.Email AS OwnerEmail \n' +
      'FROM AchievementsExternal \n' +
      'JOIN Persons ON AchievementsExternal.OwnerId = Persons.Id \n' +
      'ORDER BY AchievementsExternal.Id DESC';

    var dbResults = stmt.executeQuery(sql);

    Logger.log(sql);
    while (dbResults.next()) {
      var item = {
        id: dbResults.getLong('Id'),
        roleName: dbResults.getString('RoleName').trim(),
        description: stringToSql(dbResults.getString('Description')).trim(),
        worksScope: dbResults.getString('WorksScope').trim(),
        worksValue: dbResults.getString('WorksValue').trim(),
        projectValue: dbResults.getString('ProjectValue').trim(),
        startDate: dbResults.getString('StartDate'),
        endDate: dbResults.getString('EndDate'),
        employer: stringToSql(dbResults.getString('Employer')).trim(),
        _owner: {
          id: dbResults.getLong('OwnerId'),
          _nameSurnameEmail: dbResults.getString('OwnerName').trim() + ' ' + dbResults.getString('OwnerSurname').trim() + ': ' + dbResults.getString('OwnerEmail').trim()
        }
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

function addNewExternalAchievement(itemFromClient) {
  itemFromClient = JSON.parse(itemFromClient);
  var item = new ExternalAchievement(itemFromClient);

  item.addInDb();
  Logger.log(' item Added ItemId: ' + item.id);
  return item;
}

function test_addNewExternalAchievementInDb() {
  addNewExternalAchievement(
    '')

}

function editExternalAchievement(itemFromClient) {
  itemFromClient = JSON.parse(itemFromClient);
  var item = new ExternalAchievement(itemFromClient);
  item.editInDb();
  Logger.log('item edited ItemId: ' + item.id);
  return item;
}

function deleteExternalAchievement(itemFromClient) {
  itemFromClient = JSON.parse(itemFromClient);
  var item = new ExternalAchievement(undefined);
  item.id = itemFromClient.id;
  item.deleteFromDb();
}

// Write all Achievements to DB  in a single batch.
function writeAllexternalAchievementsInDb() {
  /*
  var externalAchievement;
  for (var i = ACHIEVEMENTS_EXTERNAL_FIRST_DATA_ROW - 1; i < ACHIEVEMENTS_EXTERNAL_DATA_VALUES.length; i++) {
    var row = ACHIEVEMENTS_EXTERNAL_DATA_VALUES[i];
    var x = row[ACHIEVEMENTS_EXTERNAL_COL_DB_STATUS] //ACHIEVEMENTS_EXTERNAL_RESPONSES_SHEET.getRange(i, ACHIEVEMENTS_EXTERNAL_COL_DB_STATUS+1).getValue()

    Logger.log(x + i);
    if (x == "") {
      externalAchievement = new externalAchievement(undefined, i + 1);
      externalAchievement.addInDb();
    }
  }
  */
}