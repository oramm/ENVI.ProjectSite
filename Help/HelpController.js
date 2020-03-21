class HelpController {
    main(){
        // Hide auth UI, then load client library.
        var helpView = new HelpView();
        $("#authorize-div").hide();
        helpView.dataLoaded(true);
        //signoutButton.style.display = 'block';
        
        
        var promises = [];
        
        
        Promise.all(promises)
            .then(()=>  {   console.log("Repositories initialised");
                            helpView.initialise();
                        })            
            .then(  ()=>{   $('select').material_select();
                            $('.modal').modal();
                            $('.datepicker').pickadate({
                                selectMonths: true, // Creates a dropdown to control month
                                selectYears: 15, // Creates a dropdown of 15 years to control year,
                                today: 'Dzisiaj',
                                clear: 'Wyszyść',
                                close: 'Ok',
                                closeOnSelect: false, // Close upon selecting a date,
                                container: undefined, // ex. 'body' will append picker to body
                                format: 'dd-mm-yyyy'
                            });
                            ReachTextArea.reachTextAreaInit();
                            Materialize.updateTextFields();
                        }
            )
            .catch(err => {
                console.error(err);
            });
   
    }
}

