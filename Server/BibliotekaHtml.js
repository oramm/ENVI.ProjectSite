function ToolsHtml(){}

ToolsHtml.parseBrToText = function(html) {
  html = html.toString().replace(/<br>|<\/br>|<br \/>/gi, "\n");
  html = html.toString().replace(/&nbsp;/gi, " ");
  return html
}
  //https://stackoverflow.com/questions/19455158/what-is-the-best-way-to-parse-html-in-google-apps-script
ToolsHtml.parseHtmlToText = function(html) {
  var html = sqlToString(html);//pozbądź się znaków \'\"
  html = this.parseBrToText(html);
  if(html.substring(0,1)=='<'){
    var xml = XmlService.parse(html);
    var text = '';
    if(xml.hasRootElement())
      var children = xml.getAllContent();
    for(var i=0; i<children.length; i++){
      text += children[i].getText();
    }
  } else
    text = html;
  return text;
}

function test_parseHtmlToText(){
 ToolsHtml.parseHtmlToText('<span style=\"font-family: \'Open Sans\', Arial, sans-serif; text-align: justify;\">Lorem ipsum dolor sit amet, consconsequat. <br /><br />Duis aut.&nbsp;</span>'); 
}

//https://sites.google.com/site/scriptsexamples/learn-by-example/parsing-html
ToolsHtml.getElementById = function(element, idToFind) {  
  var descendants = element.getDescendants();  
  for(i in descendants) {
    var elt = descendants[i].asElement();
    if( elt !=null) {
      var id = elt.getAttribute('id');
      if( id !=null && id.getValue()== idToFind) return elt;    
    }
  }
}


ToolsHtml.getElementsByClassName = function(element, classToFind) {  
  var data = [];
  var descendants = element.getDescendants();
  descendants.push(element);  
  for(i in descendants) {
    var elt = descendants[i].asElement();
    if(elt != null) {
      var classes = elt.getAttribute('class');
      if(classes != null) {
        classes = classes.getValue();
        if(classes == classToFind) data.push(elt);
        else {
          classes = classes.split(' ');
          for(j in classes) {
            if(classes[j] == classToFind) {
              data.push(elt);
              break;
            }
          }
        }
      }
    }
  }
  return data;
}

ToolsHtml.getElementsByTagName = function(element, tagName) {  
  var data = [];
  var descendants = element.getDescendants();  
  for(i in descendants) {
    var elt = descendants[i].asElement();     
    if( elt !=null && elt.getName()== tagName) data.push(elt);      
  }
  return data;
}
