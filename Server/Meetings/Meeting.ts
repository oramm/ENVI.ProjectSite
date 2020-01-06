function Meeting(initParamObject) {
  if(initParamObject){
    this.id = initParamObject.id;
    this.name = initParamObject.name;
    this.description = initParamObject.description;
    
    initParamObject.date =ToolsDate.dateDMYtoYMD(initParamObject.date);
    this.date = (initParamObject.date)? Utilities.formatDate(new Date(initParamObject.date), "CET", "yyyy-MM-dd") : undefined;
    
    if(initParamObject.protocolGdId){
      this.protocolGdId = initParamObject.protocolGdId;
      this._documentEditUrl = Gd.createDocumentEditUrl(initParamObject.protocolGdId);
    }
    if(initParamObject._contract){
      this._contract = initParamObject._contract;
      this.contractId = initParamObject._contract.id;
    }
    this.location = initParamObject.location;
    this._protocolTemplateId = DOCS_PROTOCOL_TEMPLATE_ID;
  }
}

Meeting.prototype = {
  constructor: Meeting,
  
  createProtocol: function(){
    
    var protocolDocument = Gd.createDuplicateFile(this._protocolTemplateId, this._contract.meetingProtocolsGdFolderId, 'Notatka ze spotkania - ' + this.date);
    this.protocolGdId = protocolDocument.getId(); 
    this._documentEditUrl = protocolDocument.getUrl();
    GDocsTools.fillPlaceHolder(this.protocolGdId, '#MEETING_DESCRIPTION', ToolsHtml.parseHtmlToText(this.description));
    GDocsTools.fillPlaceHolder(this.protocolGdId, '#MEETING_NAME', ToolsHtml.parseHtmlToText(this.name));
    GDocsTools.fillPlaceHolder(this.protocolGdId, '#MEETING_DATE', ToolsHtml.parseHtmlToText(this.date));
    GDocsTools.fillPlaceHolder(this.protocolGdId, '#PROJECT_NAME', ToolsHtml.parseHtmlToText(this._contract._parent.name));
    GDocsTools.fillPlaceHolder(this.protocolGdId, '#CONTRACT_NAME', ToolsHtml.parseHtmlToText(this._contract.name));
    GDocsTools.fillPlaceHolder(this.protocolGdId, '#MEETING_LOCATION', ToolsHtml.parseHtmlToText(this.location));
    GDocsTools.fillPlaceHolder(this.protocolGdId, '#EMPLOYERS', ToolsHtml.parseHtmlToText(this.makeEntitiesDataLabel(this._contract._employers)));
    GDocsTools.fillPlaceHolder(this.protocolGdId, '#ENGINEERS', ToolsHtml.parseHtmlToText(this.makeEntitiesDataLabel(this._contract._engineers)));
    GDocsTools.fillPlaceHolder(this.protocolGdId, '#CONTRACTORS', ToolsHtml.parseHtmlToText(this.makeEntitiesDataLabel(this._contract._contractors)));
    this.setArrangementsInProtocol();
  },
  /*
   * tworzy etykietę z danymi podmiotów w protokole
   */
  makeEntitiesDataLabel: function(entities){
    var label = '';
    for (var i=0; i<entities.length; i++){
      label += entities[i].name
      if(entities[i].address)
        label += '\n' + entities[i].address;
      if(i<entities.length-1) 
        label += '\n'
    }
    return label;
  },
  
  setArrangementsInProtocol: function(){
    var document = DocumentApp.openById(this.protocolGdId);
    var arrangements = getMeetingArrangementsListPerMeeting(this.id);
    var body = document.getBody();
    //pos - pozycja paragrafu w dokumencie, przy każdej zmianie szablonu trzeba to zaktualizować
    for(var i=0, pos=4; i<arrangements.length; i++, pos+=3){
      var headerString = arrangements[i]._case._parent._parent.number + ' - ' + arrangements[i]._case._type.folderNumber + ' ' + arrangements[i]._case._type.name + ', ' + arrangements[i].name;
      var headerDocElement = body.insertParagraph(pos, headerString);
      headerDocElement.setHeading(DocumentApp.ParagraphHeading.HEADING3);
      body.insertParagraph(pos+1, ToolsHtml.parseHtmlToText(arrangements[i].description));
      if(arrangements[i].deadline || arrangements[i]._owner){
        var footerDocElement = body.insertParagraph(pos+2, '');
        
        if(arrangements[i].deadline){
          footerDocElement.setText('Wykonać do: ' + arrangements[i].deadline + '\t ');
          footerDocElement.setAttributes(GDocsTools.paragraphFooterStyle());
          footerDocElement.editAsText().setAttributes(12, 
                                                      footerDocElement.getText().length-1,
                                                      GDocsTools.paragraphEmphasisStyle(true)
                                                     );
        }
        if(arrangements[i]._owner){
          var x = footerDocElement.getText().length;
          var ownerLabel = 'Przypisane do: ' + arrangements[i]._owner.name + ' ' + arrangements[i]._owner.surname;
          Logger.log(JSON.stringify(arrangements[i]._owner));
          if(!arrangements[i].deadline){
            footerDocElement.setText(ownerLabel);
            footerDocElement.setAttributes(GDocsTools.paragraphFooterStyle());
          } else
            footerDocElement.appendText(ownerLabel);
          footerDocElement.editAsText().setAttributes(x,
                                                      x+14,
                                                      GDocsTools.paragraphEmphasisStyle(false)
                                                     );
        }
      }
    }
  },

  addInDb: function(conn, isPartOfTransaction) {
  return addInDb('Meetings', this, conn, isPartOfTransaction);
  },
  
  editInDb: function(externalConn, isPartOfTransaction) {
    editInDb('Meetings', this, externalConn, isPartOfTransaction);
  },
  
  deleteFromDb: function (){
    deleteFromDb ('Meetings', this);
  },
  
  deleteProtocolFromGd: function(){
    if(this.protocolGdId){
      var file = DriveApp.getFileById(this.protocolGdId);
      if(Gd.canUserDeleteFile(this.protocolGdId)){
        file.setTrashed(true);
        return true;
      }
      else{
        var rootFolder = DriveApp.getFolderById(this._contract.meetingProtocolsGdFolderId);
        rootFolder.removeFile(file);
        return false;
      }
    }
  }
}