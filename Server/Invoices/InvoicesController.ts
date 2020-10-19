function getInvoicesList(initParamObject?: any) {
  var projectCondition = (initParamObject && initParamObject.projectId) ? 'Contracts.ProjectOurId="' + initParamObject.projectId + '"' : '1';
  var contractCondition = (initParamObject && initParamObject.contractId) ? 'Milestones.ContractId=' + initParamObject.contractId : '1';
  initParamObject.endDate = (!initParamObject.endDate)? initParamObject.endDate = 'CURDATE()' : '"' + ToolsDate.dateDMYtoYMD(initParamObject.endDate) + '"';

  var dateCondition = (initParamObject && initParamObject.startDate) ? 'Invoices.IssueDate BETWEEN "' + ToolsDate.dateDMYtoYMD(initParamObject.startDate) + '" AND DATE_ADD(' + initParamObject.endDate + ', INTERVAL 1 DAY)' : '1';
  var sql = 'SELECT Invoices.Id, \n \t' +
    'Invoices.Number, \n \t' +
    'Invoices.Description, \n \t' +
    'Invoices.Status, \n \t' +
    'Invoices.CreationDate, \n \t' +
    'Invoices.IssueDate, \n \t' +
    'Invoices.SentDate, \n \t' +
    'Invoices.DaysToPay, \n \t' +
    'Invoices.PaymentDeadline, \n \t' +
    'Invoices.GdId, \n \t' +
    'Invoices.LastUpdated, \n \t' +
    'Invoices.ContractId, \n \t' +
    'Entities.Id AS EntityId, \n \t' +
    'Entities.Name AS EntityName, \n \t' +
    'Entities.Address AS EntityAddress, \n \t' +
    'Contracts.Number AS ContractNumber, \n \t' +
    'Contracts.Name AS ContractName, \n \t' +
    'Contracts.GdFolderId AS ContractGdFolderId, \n \t' +
    'OurContractsData.OurId AS ContractOurId, \n \t' +
    'ContractTypes.Id AS ContractTypeId, \n \t' +
    'ContractTypes.Name AS ContractTypeName, \n \t' +
    'ContractTypes.IsOur AS ContractTypeIsOur, \n \t' +
    'ContractTypes.Id AS ContractTypeDescription, \n \t' +
    'Projects.OurId AS ProjectOurId, \n \t' +
    'Projects.Name AS ProjectName, \n \t' +
    'Projects.GdFolderId AS ProjectGdFolderId, \n \t' +
    'Editors.Id AS EditorId, \n \t' +
    'Editors.Name AS EditorName, \n \t' +
    'Editors.Surname AS EditorSurname, \n \t' +
    'Editors.Email AS EditorEmail, \n \t' +
    'Owners.Id AS OwnerId, \n \t' +
    'Owners.Name AS OwnerName, \n \t' +
    'Owners.Surname AS OwnerSurname, \n \t' +
    'Owners.Email AS OwnerEmail \n' +
    'FROM Invoices \n' +
    'JOIN Entities ON Entities.Id=Invoices.EntityId \n' +
    'JOIN Contracts ON Contracts.Id=Invoices.ContractId \n' +
    'JOIN ContractTypes ON ContractTypes.Id = Contracts.TypeId \n' +
    'JOIN OurContractsData ON OurContractsData.Id = Contracts.Id \n' +
    'JOIN Projects ON Projects.OurId=Contracts.ProjectOurId \n' +
    'LEFT JOIN Persons AS Editors ON Editors.Id=Invoices.EditorId \n' +
    'LEFT JOIN Persons AS Owners ON Owners.Id=Invoices.OwnerId \n' +
    'WHERE ' + projectCondition + ' AND ' + contractCondition + ' AND ' + dateCondition + '\n' +
    'ORDER BY Invoices.IssueDate DESC';
  Logger.log(sql);
  return getInvoices(sql, initParamObject);
}
function test_getInvoicesList() {
  getInvoicesList({ startDate: '2018-01-01'})
}

function getInvoices(sql: string, initParamObject): Invoice[] {
  var result = [];
  var conn = connectToSql();
  var stmt = conn.createStatement();
  try {
    var dbResults = stmt.executeQuery(sql);

    while (dbResults.next()) {
      var item = new Invoice({
        id: dbResults.getLong('Id'),
        number: dbResults.getString('Number'),
        description: sqlToString(dbResults.getString('Description')),
        status: dbResults.getString('Status'),
        creationDate: dbResults.getString('CreationDate'),
        issueDate: dbResults.getString('IssueDate'),
        sentDate: dbResults.getString('SentDate'),
        daysToPay: dbResults.getString('DaysToPay'),
        paymentDeadline: dbResults.getString('PaymentDeadline'),
        gdId: dbResults.getString('GdId'),
        _lastUpdated: dbResults.getString('LastUpdated'),
        _entity: {
          id: dbResults.getLong('EntityId'),
          name: sqlToString(dbResults.getString('EntityName')),
          address: dbResults.getString('EntityAddress'),
        },
        _contract: {
          id: dbResults.getLong('ContractId'),
          number: dbResults.getString('ContractNumber'),
          name: sqlToString(dbResults.getString('ContractName')),
          gdFolderId: dbResults.getString('ContractGdFolderId'),
          ourId: dbResults.getString('ContractOurId'),
          _parent: {
            ourId: dbResults.getString('ProjectOurId'),
            name: dbResults.getString('ProjectName'),
            gdFolderId: dbResults.getString('ProjectGdFolderId')
          },
          _type: {
            id: dbResults.getInt('ContractTypeId'),
            name: dbResults.getString('ContractTypeName'),
            description: dbResults.getString('ContractTypeDescription'),
            isOur: dbResults.getBoolean('ContractTypeIsOur')
          }
        },
        //ostatni edytujący
        _editor: {
          id: dbResults.getLong('EditorId'),
          name: dbResults.getString('EditorName'),
          surname: dbResults.getString('EditorSurname'),
          email: dbResults.getString('EditorEmail')
        },
        //odpowiedzialny za kolejną akcję
        _owner: {
          id: dbResults.getLong('OwnerId'),
          name: dbResults.getString('OwnerName'),
          surname: dbResults.getString('OwnerSurname'),
          email: dbResults.getString('OwnerEmail')
        }
      });
      result.push(item);
    }
    dbResults.close();
    stmt.close();
    return result;
  } catch (e) {
    Logger.log(e);
    throw e;
  } finally {
    conn.close();
  }
}

//tworzy nowy wniosek i folder dla tego wniosku w folderze 07.01
function addNewInvoice(itemFormClient) {
  itemFormClient = JSON.parse(itemFormClient);

  try {
    var conn = connectToSql();
    conn.setAutoCommit(false);
    itemFormClient._editor.id = Person.getPersonDbId(itemFormClient._editor.systemEmail, conn);
    var item = new Invoice(itemFormClient);

    item.addInDb(conn);
    conn.commit();

    if (itemFormClient._blobEnviObjects)
      item.createFile(itemFormClient);
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

function test_editInvoice() {
  editInvoice('{"_owner":{"surname":"Brodziak","name":"Agnieszka","id":200,"_nameSurnameEmail":"Agnieszka Brodziak agnieszka.brodziak@envi.com.pl","email":"agnieszka.brodziak@envi.com.pl"},"_lastUpdated":"2020-09-28 07:47:33.0","description":"asdsssss","ownerId":200,"_entity":{"address":"ul. Waszczyka nr 2C, 65-664 Zielona Góra","name":"ADESI Sp. z o.o.","id":199},"number":"12/1212","id":4,"issueDate":"2020-09-28","editorId":125,"daysToPay":"12","entityId":199,"_contract":{"_contractors":[],"endDate":"2021-11-30","_gdFolderUrl":"https://drive.google.com/drive/folders/1IjsVjSwWP2ohC5ziR0ZJX91xCHTnv3ft","gdFolderId":"1IjsVjSwWP2ohC5ziR0ZJX91xCHTnv3ft","number":"1/2019","meetingProtocolsGdFolderId":"1iVJp7Xs2bYf02ESqXSmGuuQqqGoy4-i-","id":535,"_ourType":"IK","_ourIdName":"ZZT.IK.01 Pełnienie funkcji Inżyniera Kontraktu na Projekcie...","_manager":{"surname":"Kowalski","name":"Jan ","id":"336","_nameSurnameEmail":"Jan Kowalski: test@test.test","email":"test@test.test"},"name":"Pełnienie funkcji Inżyniera Kontraktu na Projekcie X","materialCardsGdFolderId":"1X44RdggVBitWRuKS_2ke9rsv0vZEGPtN","typeId":1,"projectId":"ZZTEST","startDate":"2019-03-05","status":"W trakcie","_ourIdOrNumber_Alias":"ZZT.IK.01 ZZT.IK.01","ourId":"ZZT.IK.01","alias":"ZZT.IK.01","value":"100000.00","_employers":[],"_type":{"name":"IK","description":"1","id":1,"isOur":true},"_engineers":[],"_ourIdOrNumber_Name":"ZZT.IK.01 Pełnienie funkcji Inżyniera Kontraktu na Projekcie...","_admin":{"surname":"Kowalski","name":"Jan ","id":"336","_nameSurnameEmail":"Jan Kowalski: test@test.test","email":"test@test.test"},"comment":""},"creationDate":"2020-09-28","_editor":{"surname":"Gazda","name":"Marek","id":125,"email":"marek@envi.com.pl"},"contractId":535,"status":"Na później","_blobEnviObjects":[{"blobBase64String":"ZHVwYSBqYXNpdQ==","name":"test PS.txt","mimeType":"text/plain"}]}');
}

function editInvoice(itemFormClient) {
  itemFormClient = JSON.parse(itemFormClient);

  try {
    var item = new Invoice(itemFormClient);
    var conn = connectToSql();
    conn.setAutoCommit(false);

    item.editInDb(conn, true);
    conn.commit();
    if (itemFormClient._blobEnviObjects)
      item.editInGd(itemFormClient._blobEnviObjects);
    Logger.log('item edited ItemId: ' + item.id);
    return item;
  } catch (err) {
    conn.rollback();
    throw err;
  } finally {
    conn.close();
  }
}

function deleteInvoice(itemFormClient) {
  itemFormClient = JSON.parse(itemFormClient);
  var item = new Invoice(itemFormClient);
  item.deleteFromDb();
  item.deleteFromGd();
}

function importInvoicesFromSheet() {
  var spreadsheet = SpreadsheetApp.openById('1KY9XhOCzoJubENUydp-R5eLISlLDe33-60lYxiUxDM8');
  var sheet = spreadsheet.getSheetByName('DataBase');
  var dataValues = sheet.getDataRange().getValues();
  var headerDataRow = dataValues[0];
  var conn = connectToSql();
  conn.setAutoCommit(false);
  for (const row of dataValues) {
    if (dataValues.indexOf(row) > 1 && row[headerDataRow.indexOf('status importu')] == '') {
      var invoice: Invoice = initInvoiceFromSheet(row, headerDataRow, conn);
      invoice.addInDb(conn);
      var firstRow = dataValues.indexOf(row);
      if (invoice.number)
        var lastRow = findLastInRange(invoice.number, dataValues, headerDataRow.indexOf('Nr FV'));
      else
        lastRow = firstRow;

      var rowsQuantity = lastRow - firstRow + 1;
      for (var i = 0; i < rowsQuantity; i++) {
        var invoiceItem = initInvoiceItemFromSheet(row, headerDataRow, invoice, invoice._owner.id);
        invoiceItem.addInDb(conn);
      }
      conn.commit();
      sheet.getRange(firstRow + 1, headerDataRow.indexOf('status importu') + 1, rowsQuantity)
        .setValue('FV: importowano pozycji:' + rowsQuantity);

    }
  }

  if (conn.isValid(0)) conn.close();
}

function initInvoiceFromSheet(row, headerDataRow: String[], conn: GoogleAppsScript.JDBC.JdbcConnection) {
  var contract = getContractByOurId({
    contractOurId: row[headerDataRow.indexOf('Oznaczenie zlecenia')],
    onlyKeyData: true
  }, conn);
  var personId = Person.getPersonDbId(row[headerDataRow.indexOf('Adres e-mail')], conn);
  var creationDate = Utilities.formatDate(row[headerDataRow.indexOf('Data sprzedaży')], "CET", "yyyy-MM-dd");

  var sentDate = (row[headerDataRow.indexOf('Data nadania')]) ? Utilities.formatDate(row[headerDataRow.indexOf('Data nadania')], "CET", "yyyy-MM-dd") : undefined;
  var paymentDeadline = (row[headerDataRow.indexOf('Termin zapłaty')]) ? Utilities.formatDate(row[headerDataRow.indexOf('Termin zapłaty')], "CET", "yyyy-MM-dd") : undefined;
  var issueDate = Utilities.formatDate(row[headerDataRow.indexOf('Data sprzedaży')], "CET", "yyyy-MM-dd");

  var invoice = new Invoice({
    number: row[headerDataRow.indexOf('Nr FV')],
    _entity: {
      id: row[headerDataRow.indexOf('ID Podmiotu')]
    },
    status: row[headerDataRow.indexOf('Status faktury')],
    creationDate: creationDate,
    issueDate: issueDate,
    sentDate: sentDate,
    daysToPay: row[headerDataRow.indexOf('Dni do zapłaty')],
    paymentDeadline: paymentDeadline,
    description: row[headerDataRow.indexOf('Uwagi')],
    _contract: contract,
    _editor: { id: personId },
    _owner: { id: personId },
    gdId: Gd.getIdFromUrl(row[headerDataRow.indexOf('Prześlij fakturę')])
  });
  return invoice;
}