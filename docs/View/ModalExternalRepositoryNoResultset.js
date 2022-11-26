"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var ModalExternalRepositoryNoResultset = /** @class */ (function (_super) {
    __extends(ModalExternalRepositoryNoResultset, _super);
    function ModalExternalRepositoryNoResultset(id, title, mode, repository) {
        var _this = _super.call(this, id, title, undefined, mode) || this;
        _this.repository = (repository) ? repository : {};
        return _this;
    }
    /*
     * Krok 1 - po kliknięciu 'Submit' formularza dodawania
     * Proces: this.submitTrigger >> this.connectedResultsetComponent.connectedRepository.addNewPerson
     *                                  >> repository. addNewHandler >> personsRolesCollection.addNewHandler[PENDING]
     *                                  >> repository. addNewHandler >> personsRolesCollection.addNewHandler[DONE]
    */
    ModalExternalRepositoryNoResultset.prototype.submitTrigger = function () {
        var _this = this;
        try {
            tinyMCE.triggerSave();
        }
        catch (e) {
            console.log('Modal.submitTrigger():: TinyMCE not defined');
        }
        //obiekt z bieżącej pozycji na liście connectedResultsetComponent do zapisania danych z formularza
        var tmpDataObject = Tools.cloneOfObject(this.repository.currentItem);
        this.form.submitHandler(tmpDataObject)
            .then(function () {
            if (_this.form.validate(tmpDataObject)) {
                if (_this.mode === 'EDIT')
                    _this.editSubmitTrigger(tmpDataObject);
                else
                    _this.addNewSubmitTrigger(tmpDataObject);
                _this.repository.currentItem = tmpDataObject;
            }
            else
                alert('Formularz źle wypełniony');
            _this.$dom.modal('close');
        });
    };
    ModalExternalRepositoryNoResultset.prototype.editSubmitTrigger = function (dataObject) {
        if (!this.doChangeFunctionOnItemName && !this.doChangeOnItemRoute)
            this.repository.editItem(dataObject, this.connectedResultsetComponent);
        else {
            var argument = (this.doChangeFunctionOnItemName) ? this.doChangeFunctionOnItemName : this.doChangeOnItemRoute;
            this.repository.doChangeFunctionOnItem(dataObject, argument, this.connectedResultsetComponent);
        }
    };
    ModalExternalRepositoryNoResultset.prototype.addNewSubmitTrigger = function (dataObject) {
        if (!this.doAddNewFunctionOnItemName && !this.doAddNewItemRoute)
            this.repository.addNewItem(dataObject, this.connectedResultsetComponent);
        else {
            var argument = (this.doAddNewFunctionOnItemName) ? this.doAddNewFunctionOnItemName : this.doAddNewItemRoute;
            this.repository.doAddNewFunctionOnItem(dataObject, argument, this.connectedResultsetComponent);
        }
    };
    /*
     * używana w this.triggerAction() - po właczeniu modala do edycji
     */
    ModalExternalRepositoryNoResultset.prototype.fillForm = function () {
        this.form.fillWithData(this.repository.currentItem);
    };
    return ModalExternalRepositoryNoResultset;
}(Modal));
