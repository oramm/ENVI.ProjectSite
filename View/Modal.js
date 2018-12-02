/* 
 * http://materializecss.com/modals.html#!
 * na końcu ww. strony jedt przykład jak obsłużyć zamykanie okna
 */
class Modal {
    constructor(id, tittle, connectedResultsetComponent, mode){
        this.id = id;
        this.tittle = tittle;
        this.connectedResultsetComponent = connectedResultsetComponent;
        this.mode=mode;
        if (!mode && mode !== 'ADD_NEW' && mode !== 'EDIT') throw new SyntaxError('Zła wartość mode');
        this.dataObject;
        this.form;
        this.$dom;
    }
    initialise(){
        this.buildDom();
        Tools.hasFunction(this.submitTrigger);
        
    }
    
    buildDom(){
        this.form = new Form("form_"+ this.id, "GET", this.formElements);
        this.$dom = $('<div id="' + this.id + '" class="modal modal-fixed-footer">');
        this.connectedResultsetComponent.$dom
            .append(this.$dom).children(':last-child')
                .append('<div class="modal-content">').children()
                    .append(this.form.$dom);
        this.connectedResultsetComponent.$dom.children(':last-child')
                .append('<div class="modal-footer">').children(':last-child')
                    .append('<button class="modal-action modal-close waves-effect waves-green btn-flat ">ZAMKNIJ</a>');
        this.setTittle(this.tittle);
        this.setSubmitAction();
    }
    
    setTittle(tittle){
        this.$dom.children('.modal-content').prepend('<h4>'+ tittle +'</h4>');
    }
       
    preppendTriggerButtonTo($uiElelment,caption){
        var $button = $('<button data-target="' + this.id + '" class="btn modal-trigger">'+ caption +'</button>');
        var _this = this;
        $button.click(    function(){if(_this.fillWithInitData) _this.fillWithInitData() //funkcja dokładana w SpecificNewModal
                                  });
        $uiElelment.prepend($button);
    }
    
    preppendTriggerIconTo($uiElelment,caption){
        var $icon = $('<a data-target="' + this.id + '" class="collectionItemAddNew modal-trigger"><i class="material-icons">add</i></a>');
        var _this = this;
        $icon.click(    function(){if(_this.mode=='EDIT') 
                                        _this.fillWithData();
                                   else 
                                        _this.initAddNewData(); //implementowana w specificModal
                                  });
        $uiElelment.prepend($icon);                         
    }
    
    /*
     * Funkcja musi być obsłużona w klasie pochodnej.
     * Klasa pochodna musi mieć metodę submitTrigger()
     */
    setSubmitAction() {
        this.form.$dom.submit((event) => {
            this.submitTrigger();
            // prevent default posting of form
            event.preventDefault();
        });
    }
    /*
     * Używana przy włączaniu MOdala do edycji
     * @returns {undefined}
     */
    fillWithData(){
        this.form.fillWithData(this.connectedResultsetComponent.connectedRepository.currentItem);
    }
    
    /*
     * Używana przy Submit
     * @param {repositoryItem} currentEditedItem
     * @returns {undefined}
     */
    isDuplicate(currentEditedItem){
        var duplicate = this.connectedResultsetComponent.connectedRepository.items.find(item => _.isEqual(item, currentEditedItem));
        return (duplicate)? true : false;
    }
    
    /*
     * Krok 1 - po kliknięciu 'Submit' formularza dodawania
     * Proces: this.submitTrigger >> this.connectedResultsetComponent.connectedRepository.addNewPerson
     *                                  >> repository. addNewHandler >> personsRolesCollection.addNewHandler[PENDING]
     *                                  >> repository. addNewHandler >> personsRolesCollection.addNewHandler[DONE]
    */
    submitTrigger(){
        if (tinyMCE) tinyMCE.triggerSave();
        var repository = this.connectedResultsetComponent.connectedRepository;
        //obiekt do zapisania danych z formularza
        var tmpDataObject = Tools.cloneOfObject(repository.currentItem);
        
        this.form.submitHandler(tmpDataObject);
        if (this.form.validate(tmpDataObject)){
            // usatawić tutaj dodatkowe pola jrśli potrzebne
            
                
            //if(!this.isDuplicate(tmpDataObject)){
                repository.setCurrentItem(tmpDataObject);
                if(this.mode==='EDIT')
                    repository.editItem(repository.currentItem, this.connectedResultsetComponent);
                else
                   repository.addNewItem(repository.currentItem, this.connectedResultsetComponent); 
            //} else {
            //    alert("Taki wpis już jest w bazie!");
            //}
        }
    }
} 