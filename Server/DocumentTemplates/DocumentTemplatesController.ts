function getDocumentTemplatesList(externalConn) {
  var sql = 'SELECT  DocumentTemplates.Id, \n \t' +
    'DocumentTemplates.Name, \n \t' +
    'DocumentTemplates.Description, \n \t' +
    'DocumentTemplates.CaseTypeId, \n \t' +
    'DocumentTemplates.GdId \n \t, ' +
    'DocumentTemplatesContents.Contents \n' +
    'FROM DocumentTemplates \n' +
    'LEFT JOIN DocumentTemplatesContents ON DocumentTemplates.Id = DocumentTemplatesContents.TemplateId';

  return getDocumentTemplates(sql, externalConn);
}

function getDocumentTemplates(sql, externalConn) {
  Logger.log(sql);
  try {
    var result = [];
    var conn = (externalConn) ? externalConn : connectToSql();
    var stmt = conn.createStatement();
    var dbResults = stmt.executeQuery(sql);
    while (dbResults.next()) {

      var item = new DocumentTemplate({
        id: dbResults.getLong('Id'),
        name: dbResults.getString('Name'),
        description: dbResults.getString('Description'),
        caseTypeId: dbResults.getInt('CaseTypeId'),
        gdId: dbResults.getString('GdId'),
        contents: dbResults.getString('Contents'),
      });
      result.push(item);
    }

    dbResults.close();
    return result;
  } catch (e) {
    Logger.log(e);
    throw e;
  } finally {
    conn.close();
  }
}
function test_getDocumentTemplatesListPerMilestone() {
  getDocumentTemplatesList(587)
}

function addNewDocumentTemplate(itemFromClient) {
  try {
    itemFromClient = JSON.parse(itemFromClient);
    var item = new DocumentTemplate(itemFromClient);
    var conn = connectToSql();
    item.addInDb(conn);
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

function test_addNewDocumentTemplate() {
  addNewDocumentTemplate('')
}

function editDocumentTemplate(itemFromClient) {
  try {
    itemFromClient = JSON.parse(itemFromClient);
    var item = new DocumentTemplate(itemFromClient);
    var conn = connectToSql();

    item.editInDb(conn);
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

function deleteDocumentTemplate(itemFromClient) {
  itemFromClient = JSON.parse(itemFromClient);
  var item = new DocumentTemplate(undefined);
  item.id = itemFromClient.id;
  Logger.log(JSON.stringify(item));
  item.deleteFromDb();
}