function getInvoiceItemsList(initParamObject: any, externalConnection?: GoogleAppsScript.JDBC.JdbcConnection): InvoiceItem[] {
  var invoiceCondition = (initParamObject && initParamObject.invoiceId) ? 'InvoiceItems.ParentId="' + initParamObject.invoiceId + '"' : '1';
  initParamObject.endDate = (!initParamObject.endDate) ? initParamObject.endDate = 'CURDATE()' : '"' + ToolsDate.dateDMYtoYMD(initParamObject.endDate) + '"';

  var dateCondition = (initParamObject && initParamObject.startDate) ? 'Invoices.IssueDate BETWEEN "' + ToolsDate.dateDMYtoYMD(initParamObject.startDate) + '" AND DATE_ADD(' + initParamObject.endDate + ', INTERVAL 1 DAY)' : '1';

  var sql = 'SELECT InvoiceItems.Id, \n \t' +
    'InvoiceItems.ParentId, \n \t' +
    'InvoiceItems.Description, \n \t' +
    'InvoiceItems.Quantity, \n \t' +
    'InvoiceItems.UnitPrice, \n \t' +
    'InvoiceItems.VatTax, \n \t' +
    'InvoiceItems.LastUpdated, \n \t' +
    'Editors.Id AS EditorId, \n \t' +
    'Editors.Name AS EditorName, \n \t' +
    'Editors.Surname AS EditorSurname, \n \t' +
    'Editors.Email AS EditorEmail \n' +
    'FROM InvoiceItems \n' +
    'JOIN Invoices ON Invoices.Id=InvoiceItems.ParentId \n' +
    'JOIN Persons AS Editors ON Editors.Id=InvoiceItems.EditorId \n' +
    'WHERE ' + invoiceCondition + ' AND ' + dateCondition + '\n' +
    'ORDER BY InvoiceItems.Id DESC';
  Logger.log(sql);
  return getInvoiceItems(sql, externalConnection);
}
function test_getInvoiceItemsList() {
  getInvoiceItemsList({ contractId: 361 })
}

function getInvoiceItems(sql, externalConnection): InvoiceItem[] {
  var result = [];
  var conn = (externalConnection) ? externalConnection : connectToSql();
  var stmt = conn.createStatement();
  try {

    var dbResults = stmt.executeQuery(sql);
    while (dbResults.next()) {
      var item = new InvoiceItem({
        id: dbResults.getLong('Id'),
        _parent: {
          id: dbResults.getLong('ParentId'),
        },
        description: sqlToString(dbResults.getString('Description')),
        quantity: dbResults.getString('Quantity'),
        unitPrice: dbResults.getString('UnitPrice'),
        vatTax: dbResults.getString('VatTax'),
        _lastUpdated: dbResults.getString('LastUpdated'),

        //ostatni edytujący
        _editor: {
          id: dbResults.getLong('EditorId'),
          name: dbResults.getString('EditorName'),
          surname: dbResults.getString('EditorSurname'),
          email: dbResults.getString('EditorEmail')
        },
      });
      result.push(item);
    }
    dbResults.close();
    stmt.close();
    return result;
  } catch (e) {
    throw e;
  } finally {
    conn.close();
  }
}

function addNewInvoiceItem(itemFormClient) {
  itemFormClient = JSON.parse(itemFormClient);

  try {
    var conn = connectToSql();
    conn.setAutoCommit(false);
    itemFormClient._editor.id = Person.getPersonDbId(itemFormClient._editor.systemEmail, conn);
    var item = new InvoiceItem(itemFormClient);
    item.addInDb(conn);
    conn.commit();

    Logger.log(' item Added ItemId: ' + item.id);

    return item;
  } catch (err) {
    if (conn && conn.isValid(0)) conn.rollback();
    Logger.log(JSON.stringify(err));
    throw err;
  } finally {
    if (conn && conn.isValid(0)) conn.close();
  }
}

function editInvoiceItem(itemFormClient) {
  itemFormClient = JSON.parse(itemFormClient);
  try {
    var item = new InvoiceItem(itemFormClient);
    var conn = connectToSql();
    conn.setAutoCommit(false);

    item.editInDb(conn, true);
    conn.commit();
    Logger.log('item edited ItemId: ' + item.id);
    return item;
  } catch (err) {
    conn.rollback();
    Logger.log(err);
    throw err;
  } finally {
    conn.close();
  }
}

function deleteInvoiceItem(itemFormClient) {
  itemFormClient = JSON.parse(itemFormClient);
  var item = new InvoiceItem(itemFormClient);
  item.deleteFromDb();
}

function initInvoiceItemFromSheet(row, headerDataRow: String[], parent: Invoice, personId: number) {

  var item = new InvoiceItem({
    _parent: parent,
    description: row[headerDataRow.indexOf('FV opis')],
    quantity: 1,
    unitPrice: row[headerDataRow.indexOf('Wartość netto')],
    vatTax: 23,
    _editor: { id: personId },
  });
  return item;
}