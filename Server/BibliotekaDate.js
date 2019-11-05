function ToolsDate(){}

ToolsDate.isStringAYMDDate = function(string){
  var x = string.length;
  if(string && string.length==10){
      var parts = string.split("-")
      if (parts[0].length==4 && parts[1].length==2 && parts[2].length==2)
        return true;
  } else
    return false;
}

ToolsDate.isStringADMYDate = function(string){
  if(string && string.lenght==10){
      var parts = string.split("-")
      if (parts[0].length==2 && parts[1].length==2 && parts[2].length==4)
        return true;
  } else
    return false;
}

ToolsDate.isStringADate = function(string){
  if(ToolsDate.isStringADMYDate(string) || ToolsDate.isStringAYMDDate(string))
    return true;
  else
    return false;
}
//date może być {String || Date}
ToolsDate.addDays = function(date, days) {
  if (this.isStringADate(date)){ 
    date = new Date(date);
  }
  if (this.isValidDate(date))
    date.setDate(date.getDate() + days);
  return date;
}

function test_addDate(){
  var date = ToolsDate.addDays('2011-01-01',3);
  Logger.log(date)
}

ToolsDate.getNextFridayDate = function(){
  var curr = new Date; // get current date
  var first = curr.getDate() - curr.getDay()+1; // First day is the day of the month - the day of the week
  var last = first + 4; // last day is the first day + 6
  
  //var firstday = new Date(curr.setDate(first));
  return lastday = new Date(curr.setDate(last));
}

ToolsDate.getMaxDate = function(dates){
  return new Date(Math.max.apply(null, dates));
}

ToolsDate.isValidDate = function(date) {
  return date instanceof Date && !isNaN(date);
}

function dateJsToSql(jsDate){
  if(jsDate !=='null') {
    var sqlDate = new Date(jsDate).toISOString().slice(0,10);
    return sqlDate;
  }
  return jsDate;
}

function dateDMYtoYMD(inputDate) {   
  if(inputDate){
    var parts = inputDate.split("-")
    if (parts[2].length==4)
      return parts[2] + '-' + parts[1] + '-' + parts[0];
    else
      return inputDate;
  }
}

function test_dateDMYtoYMD(){
  Logger.log(dateYMDtoDMY("02-08-2014"));
}

function dateDiff(first, second) {
    return Math.round((second-first)/(1000*60*60*24));
}