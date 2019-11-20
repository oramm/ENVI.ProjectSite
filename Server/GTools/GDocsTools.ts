class GDocsTools {

  static paragraphFooterStyle() {
    var style = {};
    style[DocumentApp.Attribute.FOREGROUND_COLOR] = '#339933';
    return style;
  }

  static paragraphEmphasisStyle(isBold: boolean) {
    var style = {};
    style[DocumentApp.Attribute.BOLD] = isBold;
    style[DocumentApp.Attribute.FONT_SIZE] = 12;
    return style;
  }

  //https://stackoverflow.com/questions/19455158/what-is-the-best-way-to-parse-html-in-google-apps-script
  static fillPlaceHolder(documentGdId: string, tag: string, text: string) {
    var document = DocumentApp.openById(documentGdId);
    document.getBody().replaceText(tag, ToolsHtml.parseHtmlToText(text));
  }

  static fillNamedRange(documentGdId: string, rangeId: string, text: string){
    var document = DocumentApp.openById(documentGdId);
    var namedRange = document.getNamedRangeById(rangeId);
    namedRange.getRange().getRangeElements()[0].getElement().asText().setText(text);
  }

  static clearNamedRanges(documentGdId: string){
    var document = DocumentApp.openById(documentGdId);
    for(var range of document.getNamedRanges())
      range.remove();
  }
  static logNamedRanges(document: GoogleAppsScript.Document.Document){
    var ranges: GoogleAppsScript.Document.NamedRange[] = document.getNamedRanges();
      for(var i=0; i<ranges.length; i++)
        Logger.log(ranges[i].getName() + ' ' + ranges[i].getId());
  }

  //https://stackoverflow.com/questions/30654389/how-to-add-named-ranges-to-sub-paragraph-elements-in-google-apps-script
  static createNamedRangesByTags(documentGdId: string, tags: string[]) {
    var document = DocumentApp.openById(documentGdId);
    this.clearNamedRanges(documentGdId);
    for (var i = 0; i < tags.length; i++) {
      let element = document.getBody().findText(tags[i]);
      let range = document.newRange().addElement(element.getElement()).build();
      document.addNamedRange(tags[i], range);
      this.logNamedRanges(document);
    } 
    return document.getNamedRanges();
  }

  static getNameRangesTagsFromTemplate(documentGdId: string): string[]{
    var tags:string[];
    throw new Error('Nie zaimplementowaneo metody')
    return tags;
  }
}