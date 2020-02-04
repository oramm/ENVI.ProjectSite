//dodaje do bazy obiekt
function addInDb(tableName: string, object, externalConn: GoogleAppsScript.JDBC.JdbcConnection, isPartOfTransaction?: boolean) {
  var conn = (externalConn) ? externalConn : connectToSql();
  conn.setAutoCommit(false);

  var start: any = new Date();
  try {
    delete object.id;
    var stmt = createPreparedStmtSql(conn, tableName, object, 'ADD_NEW');

    stmt.addBatch();
    var batch = stmt.executeBatch();
    //https://docs.oracle.com/javase/6/docs/api/java/sql/Connection.html#createStatement()
    var newIdresult = stmt.getGeneratedKeys();
    if (newIdresult.next()) {
      newIdresult.last();
      object.id = newIdresult.getLong(1);
    }
    if (!isPartOfTransaction) conn.commit();
    var end: any = new Date();
    Logger.log('Time elapsed: %sms for %s rows.', end - start, batch.length);

    return object.id;
  } catch (e) {
    Logger.log('addInDb: error');
    throw e;
  } finally {
    if (!externalConn) conn.close();
  }
}
//edytuje obiekt w bazie
function editInDb(tableName: string, object, externalConn?: GoogleAppsScript.JDBC.JdbcConnection, isPartOfTransaction?: boolean) {
  var conn: GoogleAppsScript.JDBC.JdbcConnection = (externalConn) ? externalConn : connectToSql();
  conn.setAutoCommit(false);

  var start: any = new Date();
  try {
    var stmt = createPreparedStmtSql(conn, tableName, object, 'UPDATE');
    stmt.addBatch();
    var batch = stmt.executeBatch();

    if (!isPartOfTransaction) conn.commit();
    var end: any = new Date();
    Logger.log('Time elapsed: %sms for %s rows.', end - start, batch.length);
  } catch (e) {
    Logger.log('editInDb:: error');
    throw e;
  } finally {
    if (!externalConn) conn.close();
  }
}

function deleteFromDb(tableName: string, object, externalConn?, isPartOfTransaction?: boolean) {
  var conn = (externalConn) ? externalConn : connectToSql();
  conn.setAutoCommit(false);

  var start: any = new Date();
  try {
    var stmt = conn.prepareStatement('DELETE FROM ' + tableName + ' WHERE Id =' + object.id);

    stmt.addBatch();

    var batch = stmt.executeBatch();
    if (!isPartOfTransaction) conn.commit()
    var end: any = new Date();
    Logger.log(tableName + '.deleteFromDb() :: Time elapsed: %sms for %s rows.', end - start, batch.length);
  } catch (e) {
    Logger.log(e);
    throw e;
  } finally {
    if (!externalConn) conn.close()
  }
}


/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * * * * * * * * Prepared Statement
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

//tworzy String prepared Statement na podstawie atrybutuów objektu
function dynamicUpdatePreparedStmtString(tableName: string, object) {
  if (Object.getOwnPropertyNames(object)[0] !== 'id')
    throw new Error('Edytowany obiekt musi mieć atrybut Id jako pierwszy w konstruktorze!');
  var preparedStmt = 'UPDATE ' + tableName + ' SET ';
  var keys = Object.keys(object);
  for (var i = 0; i < keys.length; i++) {
    // jeśli nie chcę aby zmienna była zmieniana w DB trzeba dodać znak '_' albo skasować parametr z obiektu: 'delete parametr'
    if ((keys[i] === 'id' && typeof object[keys[i]] !== 'number') || keys[i].indexOf('_') < 0) {
      preparedStmt += capitalizeFirstLetter(keys[i]) + '=?, ';
    }
  }
  //obetnij ostatni przecinek
  preparedStmt = preparedStmt.substring(0, preparedStmt.length - 2);

  preparedStmt += ' WHERE Id = ?'
  Logger.log(preparedStmt)

  return preparedStmt;
}

function dynamicInsertPreparedStmtString(tableName: string, object) {
  //INSERT INTO Cases (Name, Description, MilestoneId) values (?, ?, ?)
  var preparedStmt = 'INSERT INTO ' + tableName + ' (';
  var keys = Object.keys(object);
  var questionMarks = '';
  for (var i = 0; i < keys.length; i++) {
    // jeśli nie chcę aby zmienna była zmieniana w DB trzeba dodać znak '_' albo skasować parametr z obiektu: 'delete parametr'
    if ((keys[i] === 'id' && typeof object[keys[i]] !== 'number') || keys[i].indexOf('_') < 0) {
      preparedStmt += capitalizeFirstLetter(keys[i]) + ', ';
      questionMarks += '?, ';
    }
  }
  //obetnij ostatni przecinek
  preparedStmt = preparedStmt.substring(0, preparedStmt.length - 2);
  questionMarks = questionMarks.substring(0, questionMarks.length - 2);

  preparedStmt += ') VALUES (' + questionMarks + ')'
  Logger.log(preparedStmt);

  return preparedStmt;
}
//tworzy Prepared Statement ze stringu w zależności od typu zapytania - 'queryType'
function createPreparedStmtSql(conn, tableName, object, queryType: string) {
  if (queryType === 'UPDATE')
    var stmtString = dynamicUpdatePreparedStmtString(tableName, object);
  else
    var stmtString = dynamicInsertPreparedStmtString(tableName, object);
  var stmt = conn.prepareStatement(stmtString, Jdbc.Statement.RETURN_GENERATED_KEYS);
  var i = (queryType === 'UPDATE') ? 1 : 0;

  var keys = Object.keys(object);
  var j = 1;
  for (var i = 0; i < keys.length; i++) {
    // jeśli nie chcę aby zmienna była zmieniana w DB trzeba dodać znak '_' albo skasować parametr z obiektu: 'delete parametr'
    if (keys[i].indexOf('_') < 0) {
      var currentValue = object[keys[i]];
      Logger.log(j + ' ' + keys[i] + ' = ' + currentValue);
      if (Tools.isInteger(currentValue))
        stmt.setLong(j++, prepareValueToPreparedStmtSql(currentValue));
      else if (Tools.isBoolean(currentValue))
        stmt.setBoolean(j++, prepareValueToPreparedStmtSql(currentValue));
      else
        stmt.setString(j++, prepareValueToPreparedStmtSql(currentValue));
    }
  }
  if (queryType === 'UPDATE')
    stmt.setString(j++, object[keys[0]]);
  return stmt;
}




/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * * * * * * * * Pozostałe funkcje użytkowe
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

function connectToSql(): GoogleAppsScript.JDBC.JdbcConnection {
  //connecting with JDBC : https://developers.google.com/apps-script/guides/jdbc
  var dbUrl = 'jdbc:mysql://' + DB_ADDRESS + '/' + DN_NAME;
  return Jdbc.getConnection(dbUrl, DB_USER, DB_USER_PWD);
}

function prepareValueToSql(value) {
  if (value !== undefined && value !== null) {
    if (typeof value === 'number' || typeof value === 'boolean')
      return value;
    var date = value.split("-");
    if (value.length == 10 && date.length == 3 && date[2].length == 4) //czy mamy datę
      return '\'' + ToolsDate.dateJsToSql(value) + '\'';
    else
      return '\'' + stringToSql(value) + '\'';
  }
  else if (value === '')
    return '""';
  else
    return 'null';
}

function prepareValueToPreparedStmtSql(value) {
  //"startDate":"12-06-2018"
  if (value !== undefined && value !== null) {
    if (typeof value === 'number' || typeof value === 'boolean')
      return value;
    var date = value.split("-");
    if (value.length == 10 && date.length == 3 && date[2].length == 4) //czy mamy datę
      return ToolsDate.dateJsToSql(value);
    else
      return stringToSql(value);
  }
  else if (value === '')
    return '';
  else
    return null;
}

function stringToSql(string: string): string {
  var sqlString = '';
  if (string !== 'LAST_INSERT_ID()') {
    sqlString = string.replace(/\'/gi, "\\'");
    sqlString = sqlString.replace(/\"/gi, '\\"');
    sqlString = sqlString.replace(/\%/gi, '\\%');
    //sqlString = string.replace(/\_/gi, '\\_');
  }
  return sqlString;
}

function sqlToString(sqlString: string): string {
  var string = '';
  if (sqlString && string !== 'LAST_INSERT_ID()') {
    string = sqlString.replace(/\\'/gi, "\'");
    string = string.replace(/\\"/gi, '\"');
    string = string.replace(/\\%/gi, '\%');
    //string = sqlString.replace(/\\_/gi, '\_');
  }
  return string;
}

function test_sqlTostring() {
  var x = sqlToString('<span style=\"font-family: \'Open Sans\', Arial, sans-serif; text-align: justify;\">');
  Logger.log('sqlToString: ' + x)
  var y = stringToSql(x);
  Logger.log(y)

  x;
}