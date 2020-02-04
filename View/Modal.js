/* 
 * http://materializecss.com/modals.html#!
 * na końcu ww. strony jedt przykład jak obsłużyć zamykanie okna
 * externalrepository - jeżeli edytujemy obiekt spoza listy - inne repo niż connectedResultsetComponent.connectedRepository
 */
class Modal {
    constructor(id, tittle, connectedResultsetComponent, mode, externalRepository) {
        this.id = id;
        this.tittle = tittle;
        this.connectedResultsetComponent = connectedResultsetComponent;
        this.externalRepository = (externalRepository) ? externalRepository : {};
        this.mode = mode;
        this.forceEditBehavior = false; //używać gdy chcemy symulować edycję wobec resultseta (Collection lub Collapsible)
        this.formElements = [];
        if (!mode && mode !== 'ADD_NEW' && mode !== 'EDIT') throw new SyntaxError('Zła wartość mode');
        this.dataObject;
        this.form;
        this.$dom;
        this.$title = $('<h4 class="modalTitle">');
    }

    initialise() {
        this.buildDom();
        Tools.hasFunction(this.submitTrigger);
    }

    buildDom() {
        this.form = new Form("form_" + this.id, "GET", this.formElements);
        this.$dom = $('<div id="' + this.id + '" class="modal modal-fixed-footer">');
        this.connectedResultsetComponent.$dom
            .append(this.$dom).children(':last-child')
            .append('<div class="modal-content">').children()
            .append(this.form.$dom);
        this.connectedResultsetComponent.$dom.children(':last-child')
            .append('<div class="modal-footer">').children(':last-child')
            .append('<button class="modal-action modal-close waves-effect waves-green btn-flat ">ZAMKNIJ</a>');
        this.$dom.children('.modal-content').prepend(this.$title);
        this.setTittle(this.tittle);
        this.setSubmitAction();
    }

    setTittle(tittle) {
        this.$title.text(tittle);
    }
    /*
     * Tworzy ikonę edycji lub dodania rekordu do listy
     * @param {Collection | Collapsible} resultsetComponent
     * @returns {Modal.createTriggerIcon.$icon}
     */
    createTriggerIcon() {
        var iconType = (this.mode === 'ADD_NEW') ? 'add' : 'edit';
        var $triggerIcon = $('<SPAN data-target="' + this.id + '" ><i class="material-icons">' + iconType + '</i></SPAN>');
        //var _this = this;
        $triggerIcon
            .addClass((this.mode === 'ADD_NEW') ? 'addNewItemIcon' : 'collectionItemEdit')
            .addClass('modal-trigger')
        return $triggerIcon;
    }
    /*
     * Akcja po włączeniu modala. 
     * Funkcja używana w connectedResultsetComponent.setEditAction() oraz connectedResultsetComponent.addNewAction()
     */
    triggerAction(connectedResultsetComponent) {
        $(connectedResultsetComponent.$dom.css('min-height', '300px'));
        this.connectWithResultsetComponent(connectedResultsetComponent);
        this.refreshDataSets();
        if (this.mode == 'EDIT')
            this.form.fillWithData(this.externalRepository.currentItem || this.connectedResultsetComponent.connectedRepository.currentItem);
        else
            this.initAddNewData();

        Materialize.updateTextFields();
    }
    /*
     * Aktualizuje dane np. w selectach. Jest uruchamiana w this.triggerAction();
     */
    refreshDataSets() {
        for (var i = 0; i < this.formElements.length; i++) {
            if (typeof this.formElements[i].refreshDataSet === 'function')
                this.formElements[i].refreshDataSet();
        }
    }
    /*
     * TODO do przeobienia anlogicznie jak z Icon. Do użycia tylko w Collapsible
     */
    preppendTriggerButtonTo($uiElelment, caption, connectedResultsetComponent) {
        var $button = $('<button data-target="' + this.id + '" class="btn modal-trigger">' + caption + '</button>');
        var _this = this;
        $button.click(function () {   //_this.connectWithResultsetComponent(connectedResultsetComponent);
            //_this.initAddNewData();
            _this.triggerAction(connectedResultsetComponent)
        });
        $uiElelment.prepend($button);
    }

    /*
     * wywoływana przed pokazaniem modala
     * @param {Collection | Collapsible} component
     * @returns {undefined}
     */
    connectWithResultsetComponent(component) {
        this.connectedResultsetComponent = component;
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
     * Używana przy Submit
     * @param {repositoryItem} currentEditedItem
     * @returns {undefined}
     */
    isDuplicate(currentEditedItem) {
        var duplicate = this.connectedResultsetComponent.connectedRepository.items.find(item => _.isEqual(item, currentEditedItem));
        return (duplicate) ? true : false;
    }

    /*
     * Krok 1 - po kliknięciu 'Submit' formularza dodawania
     * Proces: this.submitTrigger >> this.connectedResultsetComponent.connectedRepository.addNewPerson
     *                                  >> repository. addNewHandler >> personsRolesCollection.addNewHandler[PENDING]
     *                                  >> repository. addNewHandler >> personsRolesCollection.addNewHandler[DONE]
    */
    submitTrigger() {
        try {
            tinyMCE.triggerSave();
        } catch (e) { console.log('Modal.submitTrigger():: TinyMCE not defined') }

        var repository = this.connectedResultsetComponent.connectedRepository;
        //obiekt z bieżącej pozycji na liście connectedResultsetComponent do zapisania danych z formularza
        var tmpDataObject = Tools.cloneOfObject(repository.currentItem);
        //obiekt do zapisania spoza connectedResultsetComponent
        var extRepoDataObject;
        if (this.externalRepository) extRepoDataObject = Tools.cloneOfObject(this.externalRepository.currentItem);

        this.form.submitHandler(extRepoDataObject || tmpDataObject)
            .then(() => {
                //do serwera wysyłam edytowany obiekt z zewnerznego repozytorium - trzeba tam używać tej zmiennej
                tmpDataObject._extRepoTmpDataObject = extRepoDataObject;
                if (this.form.validate(extRepoDataObject || tmpDataObject)) {
                    if (this.mode === 'EDIT' || this.forceEditBehavior)
                        this.editSubmitTrigger(tmpDataObject, repository);
                    else
                        this.addNewSubmitTrigger(tmpDataObject, repository)
                    repository.currentItem = tmpDataObject;
                } else
                    alert('Formularz źle wypełniony')
                this.$dom.modal('close');
            })
    }

    editSubmitTrigger(dataObject, repository) {
        if (this.doChangeFunctionOnItemName)
            repository.doChangeFunctionOnItem(dataObject, this.doChangeFunctionOnItemName, this.connectedResultsetComponent)
                .then((editedItem) => {
                    if (this.externalRepository && editedItem._extRepoTmpDataObject) {
                        this.externalRepository.clientSideEditItemHandler(dataObject._extRepoTmpDataObject);
                    }
                });
        else
            repository.editItem(dataObject, this.connectedResultsetComponent);
    }

    addNewSubmitTrigger(dataObject, repository) {
        if (this.doAddNewFunctionOnItemName)
            repository.doAddNewFunctionOnItem(dataObject, this.doAddNewFunctionOnItemName, this.connectedResultsetComponent)
                .then((editedItem) => {
                    if (this.externalRepository && dataObject._extRepoTmpDataObject) {
                        this.externalRepository.clientSideAddNewItemHandler(editedItem._extRepoTmpDataObject);
                    }
                });
        else
            repository.addNewItem(dataObject, this.connectedResultsetComponent);
    }
} 