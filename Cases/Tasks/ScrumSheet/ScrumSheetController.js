  //https://stackoverflow.com/questions/17341122/link-and-execute-external-javascript-file-hosted-on-github?noredirect=1&lq=1
  
  var milestones;
  var chosenMilestone;
  var newCaseName;
  var $loadingWheel = $('<article>Loading...</article>' +
                        '<div class="preloader-wrapper big active">' +
                          '<div class="spinner-layer spinner-green-only">' +
                            '<div class="circle-clipper left">' +
                              '<div class="circle"></div>' +
                            '</div>' +
                            '<div class="gap-patch">' +
                              '<div class="circle"></div>' +
                          '</div>' +
                          '<div class="circle-clipper right">' +
                            '<div class="circle"></div>' +
                          '</div>' +
                        '</div>' +
                         '</div>');
  
  /* https://developers.google.com/apps-script/guides/html/communication
   * pobierz z bazy listę Milestonów
   */    
   function initForm(milestonesFormDb){
     return new Promise((resolve, reject) => {
       console.log(milestonesFormDb)
       // -------------------pole wyboru kamieni milowych ----------------
       var $milestoneSelectField = $('#envi_milestoneSelect');
     
       for(var i=0; i<milestonesFormDb.length; i++){
       var $option = $('<option>');
       $option
         .val(milestonesFormDb[i].id)
         .html(milestonesFormDb[i].name)
       $milestoneSelectField.append($option);
       }
       $milestoneSelectField
         .change(function(){
                   var chosenId = this.value;
                   chosenMilestone = milestonesFormDb.filter(function(item){return item.id==chosenId;})[0]
                   $('#envi_submit_new_case').show();
                   $('#caseNameTextFieldRow').show();
                   console.log(chosenMilestone); 
                 })  
       // -------------------pole edycji nazwy sprawy ----------------
       var $newCaseNameTextField = $('#caseNameTextField');
       $newCaseNameTextField
         .change(function(){newCaseName = this.value;})  
       resolve('form initilized');
     })
   };
     
   //uruchamia się po zaciągnięciu danych z bazy
   function mainController(milestonesFormDb){
     console.log('data fetched from db');
     initForm(milestonesFormDb)
       .then(result=>{ console.log(result);
                       
                       $loadingWheel.hide();
                       $('.content').show();
                       resolve(result);                   
               }); 
     google.script.host
       .setHeight(400)
       .setWidth(400)
     Materialize.updateTextFields();
   }
      
   function submitHandler(){
     $('article')
       .html('Dodaję wiersz w arkuszu...');
     var $sufix = $('<span><br>poczekaj jeszcze kilka sekund aż okno zniknie...</span>');
     
     $loadingWheel.show();
     setTimeout(()=>$('article').append($sufix), 3000);
     setInterval(()=>$('article').append('<span> .</span>'), 300);
     $('.content').hide();
     google.script.run.withSuccessHandler(closePopup).addCaseRow(chosenMilestone,newCaseName);
   };
      
   function closePopup(){
     google.script.host.close();
     
   };
   
   //https://yagisanatode.com/2018/06/10/google-apps-script-getting-input-data-from-a-dialog-box-in-google-sheets/#dialogBox
   console.log('start');
   $('#envi_submit_new_case').hide();
   $('#caseNameTextFieldRow').hide();
   $('.content').hide();
   $('body').prepend($loadingWheel);
   google.script.run.withSuccessHandler(mainController)
         .getMilestonesListPerContract();
