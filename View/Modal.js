/* 
 * http://materializecss.com/modals.html#!
 * na końcu ww. strony jedt przykład jak obsłużyć zamykanie okna
 */
class Modal {
    initialise(id, connectedResultsetComponent, connectedResultsetComponentAddNewHandler){
        this.id = id;
        this.connectedResultsetComponent = connectedResultsetComponent;
        this.connectedResultsetComponentAddNewHandler = connectedResultsetComponentAddNewHandler;
        this.tittle;
        this.buildDom();
    }
    
    
    buildDom(){
        $('body').append(' <div id="' + this.id + '" class="modal modal-fixed-footer"></div>');
        $('#' + this.id).append('<div class="modal-content">');
        $('#' + this.id + ' .modal-content').append(FormTools.createForm("foo", "GET"))
        $('#' + this.id).append('<div class="modal-footer">');
        $('#' + this.id + ' .modal-footer').append('<button class="modal-action modal-close waves-effect waves-green btn-flat ">OK</a>');
        this.setSubmitAction();

        $('#' + this.id).modal();
    }
    
    setTittle(tittle){
        this.tittle = tittle;
        $('#' + this.id + ' .modal-content' ).prepend('<h4>'+ tittle +'</h4>');
    }
    /*
     * @param {String} uiElement html Code for JQUERY Append.
     */
    appendUiElement(uiElelment){
        return new Promise((resolve, reject) => {
            $('#' + this.id + ' .modal-content form' ).append('<div class="row">' + uiElelment + '</div>');
            resolve(uiElelment + "appended prpoperly");
        })
     }
    
    preppendTriggerButtonTo(HTMLId,caption){
        $('#' + HTMLId).prepend('<button data-target="' + this.id + '" class="btn modal-trigger">'+ caption +'</button>');
    }
    
    /*
     * Funkcja musi być obsłużona w klasie pochodnej.
     * Klasa pochodna musi mieć metodę submitTrigger()
     */
    setSubmitAction() {
        $('#' + this.id + ' .modal-content form').submit((event) => {
            this.submitTrigger();
            // prevent default posting of form
            event.preventDefault();
        });
    }
} 