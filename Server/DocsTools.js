function DocsTools() {
  this.createGdFolderUrl()
}

DocsTools.setNamedRange = function(){
  var doc = DocumentApp.openById(DOCS_PROTOCOL_TEMPLATE_ID);
  var rangeBuilder = doc.newRange();
  var tables = doc.getBody().getTables();
    rangeBuilder.addElement(tables[i]);
  doc.addNamedRange('myUniquePrefix-tables', rangeBuilder.build());
}