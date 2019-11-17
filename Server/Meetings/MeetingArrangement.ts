function MeetingArrangement(initParamObject) {
  if(initParamObject){
    this.id = initParamObject.id;
    this.name = initParamObject.name;
    this.description = initParamObject.description;
    
    initParamObject.deadline = dateDMYtoYMD(initParamObject.deadline);
    this.deadline = (initParamObject.deadline)? Utilities.formatDate(new Date(initParamObject.deadline), "CET", "yyyy-MM-dd") : undefined;

    if(initParamObject._owner && initParamObject._owner.id){
      this._owner = initParamObject._owner;
      this.ownerId = initParamObject._owner.id;
      this._owner.nameSurnameEmail = this._owner.name + ' ' + this._owner.surname + ' ' + this._owner.email;
    }
    this._parent = initParamObject._parent;
    this.meetingId = initParamObject._parent.id;
    
    this._case = initParamObject._case;
    this.caseId = initParamObject._case.id;
    this._lastUpdated = initParamObject._lastUpdated;
  }
}

MeetingArrangement.prototype = {
  constructor: MeetingArrangement,
  //https://developers.google.com/apps-script/reference/document/named-range
  //https://developers.google.com/docs/api/how-tos/best-practices
  addInProtocol: function(){
    var document = DocumentApp.openById(this._parent.protocolGdId);
    var body = document.getBody();
      body.insertParagraph(0, document.getName())
      .setHeading(DocumentApp.ParagraphHeading.HEADING1);
      
  },
  
  addInDb: function(conn, isPartOfTransaction) {
     return addInDb('MeetingArrangements', this, conn, isPartOfTransaction);
  },
  
  editInDb: function(externalConn, isPartOfTransaction) {
    editInDb('MeetingArrangements', this, externalConn, isPartOfTransaction);
  },
  
  deleteFromDb: function (){
    deleteFromDb ('MeetingArrangements', this);
  }
}