function InventoryEvent(initParamObject) {
  if(initParamObject){
    this.id = initParamObject.id;
    this.name = initParamObject.name;
    this.description = initParamObject.description;
    
    initParamObject.date = dateDMYtoYMD(initParamObject.date);
    this.date = (initParamObject.date)? Utilities.formatDate(new Date(initParamObject.date), "CET", "yyyy-MM-dd") : undefined;
    initParamObject.expiryDate = dateDMYtoYMD(initParamObject.expiryDate);
    this.expiryDate = (initParamObject.expiryDate)? Utilities.formatDate(new Date(initParamObject.expiryDate), "CET", "yyyy-MM-dd") : undefined;
    
    this.type = initParamObject.type;
    this.inventoryItemId = initParamObject.inventoryItemId;
    this.ownerId = initParamObject._owner.id;
    this.status = initParamObject.status;
    this._owner = initParamObject._owner;
  }
}


InventoryEvent.prototype = {
  constructor: InventoryEvent,
  
  addInDb: function(conn, isPartOfTransaction) {
     return addInDb('InventoryEvents', this, conn, isPartOfTransaction);
  },

  addInScrum: function(conn, skipMakeTimesSummary, format){
    //TODO: wstrzkiwania zadania gdy kończy się ExpiryDate - sprawdzć analogię w Milestone
    var task = new Task({name: 'odnowić: '+ this.name
                        })
  },
  
  editInDb: function(externalConn, isPartOfTransaction) {
    editInDb('InventoryEvents', this, externalConn, isPartOfTransaction);
  },
  
  deleteFromDb: function (){
    deleteFromDb ('InventoryEvents', this);
  },
}

  

