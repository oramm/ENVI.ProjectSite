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

  static copyDoc(sourceGdocument: GoogleAppsScript.Document.Document, targetGdocument: GoogleAppsScript.Document.Document, targetRange: GoogleAppsScript.Document.NamedRange) {
    var sourceGdocumentBody = sourceGdocument.getBody();
    var totalElements = sourceGdocumentBody.getNumChildren();
    var startElement = targetRange.getRange().getRangeElements()[0].getElement();
    Logger.log(startElement.asText().getText());
    var startElementIndex = targetGdocument.getBody().getChildIndex(startElement.getParent());//zignorować błąd - tak ma być
    startElement.removeFromParent();
    for (var j = 0; j < totalElements; ++j) {
      var body = targetGdocument.getBody();
      var targetElement = sourceGdocumentBody.getChild(j).copy();
      var type = targetElement.getType();
      if (type == DocumentApp.ElementType.PARAGRAPH) {
        Logger.log(targetElement.asParagraph().getText())
        body.insertParagraph(startElementIndex + j, targetElement.asParagraph());
      }
      else if (type == DocumentApp.ElementType.TABLE) {
        body.appendTable(targetElement.asTable());
      }
      else if (type == DocumentApp.ElementType.LIST_ITEM) {
        body.appendListItem(targetElement.asListItem());
      }
    }
    targetGdocument.saveAndClose();
    var x;
  }
  //https://stackoverflow.com/questions/19455158/what-is-the-best-way-to-parse-html-in-google-apps-script
  static fillPlaceHolder(documentGdId: string, tag: string, text: string) {
    var document = DocumentApp.openById(documentGdId);
    document.getBody().replaceText(tag, ToolsHtml.parseHtmlToText(text));
  }

  static fillNamedRange(documentGdId: string, rangeName: string, text: string) {
    if (ToolsDate.isStringAYMDDate(text))
      text = ToolsDate.dateYMDtoDMY(text)
    var document = DocumentApp.openById(documentGdId);
    var namedRange = this.getNamedRangeByName(document, rangeName);
    var element = namedRange.getRange().getRangeElements()[0];

    element.getElement().asText().setText(ToolsHtml.parseHtmlToText(text));
    namedRange.remove();
    var range = document.newRange().addElement(element.getElement()).build();

    Logger.log('fillNamedRange: ' + namedRange.getName());
    document.addNamedRange(rangeName, range);
    //this.logNamedRanges(document);
  }

  static clearNamedRanges(documentGdId: string) {
    var document = DocumentApp.openById(documentGdId);
    for (var range of document.getNamedRanges())
      range.remove();

    Logger.log('wyczyszczono zakresy w pliku')
  }

  static logNamedRanges(document: GoogleAppsScript.Document.Document) {
    var ranges: GoogleAppsScript.Document.NamedRange[] = document.getNamedRanges();
    for (var i = 0; i < ranges.length; i++)
      Logger.log(ranges[i].getName() + ' ' + ranges[i].getId());
  }



  //https://stackoverflow.com/questions/30654389/how-to-add-named-ranges-to-sub-paragraph-elements-in-google-apps-script
  static createNamedRangesByTags(documentGdId: string, tags: string[]) {
    var document = DocumentApp.openById(documentGdId);
    this.clearNamedRanges(documentGdId);

    for (var i = 0; i < tags.length; i++) {
      let element = document.getBody().findText(tags[i]);
      let range = document.newRange().addElement(element.getElement()).build();
      document.addNamedRange(this.templateTagToTangeName(tags[i]), range);
      this.logNamedRanges(document);
    }
    return document.getNamedRanges();
  }

  private static templateTagToTangeName(tag: string): string {
    return (tag.indexOf('#ENVI#') === 0) ? tag.substring(6, tag.length - 1) : tag;
  }

  static getNamedRangeByName(document: GoogleAppsScript.Document.Document, name: string): GoogleAppsScript.Document.NamedRange {
    var namedRanges = document.getNamedRanges();
    return namedRanges.filter(item => {
      var rangeName = item.getName().toLocaleUpperCase();
      Logger.log(rangeName + ' === ' + name.toLocaleUpperCase());
      return rangeName === name.toLocaleUpperCase();
    })[0]
  }

  static getNameRangesTagsFromTemplate(templateGdId: string): string[] {
    var tags: string[] = [];
    var document = DocumentApp.openById(templateGdId);
    var body = document.getBody();
    var foundElement = body.findText('#ENVI#[aA-zZ|\s]+#');
    while (foundElement != null) {
      var tag: string = foundElement.getElement().asText().getText();
      tags.push(tag);
      foundElement = body.findText('#ENVI#[aA-zZ|\s]+#', foundElement);
    }
    Logger.log(tags);
    return tags;
  }

  static highlightText(documentGdId: string, text: string): void {
    var body = DocumentApp.getActiveDocument().getBody();
    var foundElement = body.findText(text);

    while (foundElement != null) {
      // Get the text object from the element
      var foundText = foundElement.getElement().asText();

      // Where in the Element is the found text?
      var start = foundElement.getStartOffset();
      var end = foundElement.getEndOffsetInclusive();

      // Change the background color to yellow
      foundText.setBackgroundColor(start, end, "#FCFC00");

      // Find the next match
      foundElement = body.findText(text, foundElement);
    }
  }
}
function test_copyDocs() {
  var contentsGdoc = DocumentApp.openById('1IFDP6uCs-Nvr95W77Iz6x_7H2kiAPkFRrh15QbtPQKw');
  var targetGdoc = DocumentApp.openById('1jsmt_m-Br0yXAJ2-l4-d_-rwDwqeeeEIi8WIifjQbwc');
  GDocsTools.createNamedRangesByTags(
    '1jsmt_m-Br0yXAJ2-l4-d_-rwDwqeeeEIi8WIifjQbwc',
    GDocsTools.getNameRangesTagsFromTemplate('1hkBgKLNW56XzNnj7EwHfxd6givKjiawAPHs5wdsaAo4')
  );
  var namedRange = GDocsTools.getNamedRangeByName(targetGdoc, 'contents');
  Logger.log(namedRange.getName());
  GDocsTools.copyDoc(contentsGdoc, targetGdoc, namedRange);
}

function test_createNamedRanges() {
  var item = new OurLetterGdFile({
    _template: new DocumentTemplate({ id: 1, gdId: '', name:'', caseTypeId: 1, _contents: {alias:'', gdId:''} }),
    document: new OurLetter({
      creationDate: '22dsfsfsf sdf2',
      documentGdId: '1IdRiwPxFLoSohJ4-JJwhbNYSwk65WWhGWRFFgmxTLiU'
    })
  });
  //GDocsTools.createNamedRangesByTags('1IdRiwPxFLoSohJ4-JJwhbNYSwk65WWhGWRFFgmxTLiU', GDocsTools.getNameRangesTagsFromTemplate('1hkBgKLNW56XzNnj7EwHfxd6givKjiawAPHs5wdsaAo4'));
  //return 
  var letterDocument = DocumentApp.openById('1IdRiwPxFLoSohJ4-JJwhbNYSwk65WWhGWRFFgmxTLiU');
  GDocsTools.logNamedRanges(letterDocument);

  item.fillNamedRanges();
  GDocsTools.logNamedRanges(letterDocument);
  var x; //= GDocsTools.getNameRangesTagsFromTemplate('1IdRiwPxFLoSohJ4-JJwhbNYSwk65WWhGWRFFgmxTLiU');
  return x;
}