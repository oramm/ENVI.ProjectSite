function GDocsTools() { }

GDocsTools.paragraphFooterStyle = function () {
  var style = {};
  style[DocumentApp.Attribute.FOREGROUND_COLOR] = '#339933';
  return style;
}

GDocsTools.paragraphEmphasisStyle = function (isBold: boolean) {
  var style = {};
  style[DocumentApp.Attribute.BOLD] = isBold;
  style[DocumentApp.Attribute.FONT_SIZE] = 12;
  return style;
}

//https://stackoverflow.com/questions/19455158/what-is-the-best-way-to-parse-html-in-google-apps-script
GDocsTools.fillPlaceHolder = function (documentGdId: string, tag: string, text: string) {
  var document = DocumentApp.openById(documentGdId);
  document.getBody().replaceText(tag, ToolsHtml.parseHtmlToText(text));
}