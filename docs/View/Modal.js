"use strict";
/*
 * http://materializecss.com/modals.html#!
 * na końcu ww. strony jedt przykład jak obsłużyć zamykanie okna
 * externalrepository - jeżeli edytujemy obiekt spoza listy - inne repo niż connectedResultsetComponent.connectedRepository
 */
var Modal = /** @class */ (function () {
    function Modal(id, title, connectedResultsetComponent, mode) {
        this.id = id;
        this.title = title;
        this.connectedResultsetComponent = connectedResultsetComponent;
        this.mode = mode;
        this.formElements = [];
        if (!mode && mode !== 'ADD_NEW' && mode !== 'EDIT')
            throw new SyntaxError('Zła wartość mode');
        this.dataObject;
        this.form;
        this.$dom;
        this.$title = $('<h4 class="modalTitle">');
    }
    Modal.prototype.initialise = function () {
        this.buildDom();
        Tools.hasFunction(this.submitTrigger);
    };
    Modal.prototype.buildDom = function () {
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
        this.setTitle(this.title);
        this.setSubmitAction();
    };
    Modal.prototype.setTitle = function (title) {
        this.$title.text(title);
    };
    /*
     * Tworzy ikonę edycji lub dodania rekordu do listy
     * @param {Collection | Collapsible} resultsetComponent
     * @returns {Modal.createTriggerIcon.$icon}
     */
    Modal.prototype.createTriggerIcon = function () {
        var iconType = (this.mode === 'ADD_NEW') ? 'add' : 'edit';
        var $triggerIcon = $('<SPAN data-target="' + this.id + '" ><i class="material-icons">' + iconType + '</i></SPAN>');
        //var _this = this;
        $triggerIcon
            .addClass((this.mode === 'ADD_NEW') ? 'addNewItemIcon' : 'collectionItemEdit')
            .addClass('modal-trigger');
        return $triggerIcon;
    };
    /** Akcja po włączeniu modala.
     * Funkcja używana w connectedResultsetComponent.setEditAction() oraz connectedResultsetComponent.addNewAction()
     */
    Modal.prototype.triggerAction = function (connectedResultsetComponent) {
        //ReachTextArea.reachTextAreaInit();
        if (Object.getPrototypeOf(connectedResultsetComponent).constructor.name !== 'RawPanel')
            $(connectedResultsetComponent.$dom.css('min-height', '300px'));
        this.connectWithResultsetComponent(connectedResultsetComponent);
        this.refreshDataSets();
        if (this.mode == 'EDIT') {
            if (typeof this.initEditData === 'function')
                this.initEditData();
            this.fillForm();
        }
        else
            this.initAddNewData();
        Materialize.updateTextFields();
    };
    Modal.prototype.fillForm = function () {
        this.form.fillWithData(this.connectedResultsetComponent.connectedRepository.currentItem);
    };
    /*
     * Aktualizuje dane np. w selectach. Jest uruchamiana w this.triggerAction();
     */
    Modal.prototype.refreshDataSets = function () {
        for (var _i = 0, _a = this.formElements; _i < _a.length; _i++) {
            var element = _a[_i];
            if (typeof element.refreshDataSet === 'function')
                element.refreshDataSet();
        }
    };
    /*
     * TODO do przeobienia anlogicznie jak z Icon. Do użycia tylko w Collapsible
     */
    Modal.prototype.preppendTriggerButtonTo = function ($uiElelment, caption, connectedResultsetComponent, buttonStyle) {
        var $button = $('<button data-target="' + this.id + '">' + caption + '</button>');
        $button
            .addClass((buttonStyle === 'FLAT') ? 'btn-flat' : 'btn')
            .addClass('modal-trigger');
        var _this = this;
        $button.click(function () {
            _this.triggerAction(connectedResultsetComponent);
        });
        $uiElelment.prepend($button);
    };
    /*
     * wywoływana przed pokazaniem modala
     * @param {Collection | Collapsible} component
     * @returns {undefined}
     */
    Modal.prototype.connectWithResultsetComponent = function (component) {
        this.connectedResultsetComponent = component;
    };
    /*
     * Funkcja musi być obsłużona w klasie pochodnej.
     * Klasa pochodna musi mieć metodę submitTrigger()
     */
    Modal.prototype.setSubmitAction = function () {
        var _this_1 = this;
        this.form.$dom.submit(function (event) {
            _this_1.submitTrigger();
            // prevent default posting of form
            event.preventDefault();
        });
    };
    /*
     * Używana przy Submit
     * @param {repositoryItem} currentEditedItem
     * @returns {undefined}
     */
    Modal.prototype.isDuplicate = function (currentEditedItem) {
        var duplicate = this.connectedResultsetComponent.connectedRepository.items.find(function (item) { return _.isEqual(item, currentEditedItem); });
        return (duplicate) ? true : false;
    };
    /*
     * Krok 1 - po kliknięciu 'Submit' formularza dodawania
     * Proces: this.submitTrigger >> this.connectedResultsetComponent.connectedRepository.addNewPerson
     *                                  >> repository. addNewHandler >> personsRolesCollection.addNewHandler[PENDING]
     *                                  >> repository. addNewHandler >> personsRolesCollection.addNewHandler[DONE]
    */
    Modal.prototype.submitTrigger = function () {
        var _this_1 = this;
        try {
            tinyMCE.triggerSave();
        }
        catch (e) {
            console.log('Modal.submitTrigger():: TinyMCE not defined');
        }
        //obiekt z bieżącej pozycji na liście connectedResultsetComponent do zapisania danych z formularza
        var tmpDataObject = Tools.cloneOfObject(this.connectedResultsetComponent.connectedRepository.currentItem);
        this.form.submitHandler(tmpDataObject)
            .then(function () {
            if (_this_1.form.validate(tmpDataObject)) {
                if (_this_1.mode === 'EDIT')
                    _this_1.editSubmitTrigger(tmpDataObject);
                else
                    _this_1.addNewSubmitTrigger(tmpDataObject);
                _this_1.connectedResultsetComponent.connectedRepository.currentItem = tmpDataObject;
            }
            else
                alert('Formularz źle wypełniony');
            _this_1.$dom.modal('close');
        });
    };
    Modal.prototype.editSubmitTrigger = function (dataObject) {
        if (!this.doChangeFunctionOnItemName && !this.doChangeOnItemRoute)
            this.connectedResultsetComponent.connectedRepository.editItem(dataObject, this.connectedResultsetComponent);
        else {
            var argument = (this.doChangeFunctionOnItemName) ? this.doChangeFunctionOnItemName : this.doChangeOnItemRoute;
            this.connectedResultsetComponent.connectedRepository.doChangeFunctionOnItem(dataObject, argument, this.connectedResultsetComponent);
        }
    };
    Modal.prototype.addNewSubmitTrigger = function (dataObject) {
        if (!this.doAddNewFunctionOnItemName && !this.doAddNewItemRoute)
            this.connectedResultsetComponent.connectedRepository.addNewItem(dataObject, this.connectedResultsetComponent);
        else {
            var argument = (this.doAddNewFunctionOnItemName) ? this.doAddNewFunctionOnItemName : this.doAddNewItemRoute;
            this.connectedResultsetComponent.connectedRepository.doAddNewFunctionOnItem(dataObject, argument, this.connectedResultsetComponent);
        }
    };
    return Modal;
}());
