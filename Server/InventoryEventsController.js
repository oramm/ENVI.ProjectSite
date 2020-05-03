function getInventoryEventsList() {
  try {
    var result = [];
    var conn = connectToSql();
    var stmt = conn.createStatement();
    
    var query = 'SELECT  InventoryEvents.Id, \n \t' +
                        'InventoryEvents.Name, \n \t' +
                        'InventoryEvents.Description, \n \t ' +
                        'InventoryEvents.Date, \n \t' +
                        'InventoryEvents.ExpiryDate, \n \t' +
                        'InventoryEvents.Type, \n \t' +
                        'InventoryEvents.InventoryItemId, \n \t' +
                        'InventoryEvents.OwnerId, \n \t' +
                        'InventoryEvents.Status, \n \t' +
                        'InventoryEvents.LastUpdated, \n \t' +
                        'Persons.Name, \n \t' +
                        'Persons.Surname, \n \t' +
                        'Persons.Email \n' +
                'FROM InventoryEvents \n' +
                'LEFT JOIN Persons ON Persons.Id = InventoryEvents.OwnerId';
    var dbResults = stmt.executeQuery(query);
    
    Logger.log(query);
    while (dbResults.next()) {
      var item = new InventoryEvent({id: dbResults.getLong(1),
                                      name: dbResults.getString(2),
                                      description: dbResults.getString(3),
                                      date: dbResults.getString(4),
                                      expiryDate: (dbResults.getString(5))? dbResults.getString(5) : undefined,
                                      type: dbResults.getString(6),
                                      inventoryItemId: dbResults.getLong(7),
                                      status: dbResults.getString(9),
                                      lastUpdated: dbResults.getString(10),
                                      _owner: {id: dbResults.getLong(8)}
                                     });
      //Id 	Name 	Description 	Date 	ExpiryDate 	Type 	InventoryEventId 	OwnerId 	Status 	LastUpdated 
     
      var name = (dbResults.getString(11))? dbResults.getString(11): '';
      var surname = (dbResults.getString(12))? dbResults.getString(12): '';
      var email = (dbResults.getString(13))? dbResults.getString(13): '';
      if (name)
        item._owner._nameSurnameEmail = name.trim() + ' ' + surname.trim() + ': ' + email.trim();
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

function addNewInventoryEvent(itemFromClient) {
    itemFromClient = JSON.parse(itemFromClient);
    var item = new InventoryEvent({name: itemFromClient.name,
                                   description: itemFromClient.description,
                                   date: itemFromClient.date,
                                   expiryDate: itemFromClient.expiryDate,
                                   type: itemFromClient.type,
                                   inventoryItemId: itemFromClient.inventoryItemId,
                                   _owner: {id: itemFromClient._owner.id},
                                   status: itemFromClient.status
                                  });    
    try{
      var conn = connectToSql();
      var newId = item.addInDb(conn);
      //item.addInScrum(conn);
      return newId;
    } catch (err) {
      throw err;
    } finally {
      conn.close();
    }    
    Logger.log(' item Added ItemId: ' + item.id);
    return newId;
}

function editInventoryEvent(itemFromClient) {
    itemFromClient = JSON.parse(itemFromClient);
    var item = new InventoryEvent({id: itemFromClient.id,
                                   name: itemFromClient.name,
                                   description: itemFromClient.description,
                                   date: itemFromClient.date,
                                   expiryDate: itemFromClient.expiryDate,
                                   type: itemFromClient.type,
                                   inventoryItemId: itemFromClient.inventoryItemId,
                                   _owner: {id: itemFromClient._owner.id},
                                   status: itemFromClient.status
                                  });
    item.editInDb();
    Logger.log('item edited ItemId: ' + item.id);
}

function deleteInventoryEvent(itemFromClient){
  itemFromClient = JSON.parse(itemFromClient);
  var item = new InventoryEvent();
  item.id = itemFromClient.id;
  item.deleteFromDb();
}