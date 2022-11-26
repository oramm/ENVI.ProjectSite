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
var ProcessStepsInstancesCollection = /** @class */ (function (_super) {
    __extends(ProcessStepsInstancesCollection, _super);
    /*
     * @param {type} id
     * @param {boolean} isPlane - czy lista ma być prosta czy z Avatarem
     * @param {boolean} hasFilter - czy ma być filtr
     * @param {boolean} isAddable - czy można dodować nowe elementy
     */
    function ProcessStepsInstancesCollection(initParamObject) {
        var _this = _super.call(this, {
            id: initParamObject.id,
            parentDataItem: initParamObject.parentDataItem,
            title: initParamObject.title,
            editModal: initParamObject.editModal,
            isPlain: true,
            hasFilter: true,
            isEditable: true,
            isAddable: false,
            isDeletable: false,
            connectedRepository: ProcessesInstancesSetup.processesStepsInstancesRepository
        }) || this;
        _this.status = initParamObject.status;
        _this.addNewOurLetterModal = initParamObject.addNewOurLetterModal;
        _this.editOurLetterModal = initParamObject.editOurLetterModal;
        _this.appendLetterAttachmentsModal = initParamObject.appendLetterAttachmentsModal;
        _this.initialise(_this.makeList());
        return _this;
    }
    /*
     * @param {dataItem} this.connectedRepository.items[i])
     */
    ProcessStepsInstancesCollection.prototype.makeItem = function (dataItem) {
        return {
            id: dataItem.id,
            icon: undefined,
            $title: this.makeTitle(dataItem),
            $description: this.makeDescription(dataItem),
            dataItem: dataItem
        };
    };
    /*
     * @param {dataItem} this.connectedRepository.items[i])
     */
    ProcessStepsInstancesCollection.prototype.makeTitle = function (dataItem) {
        return dataItem._processStep.name;
    };
    /*
     * @param {dataItem} this.connectedRepository.currentItem
     */
    ProcessStepsInstancesCollection.prototype.makeDescription = function (dataItem) {
        (dataItem.description) ? true : dataItem.description = "";
        var $collectionElementDescription = $('<span>');
        var descriptionAtomicEditLabel = new AtomicEditLabel(dataItem._processStep.description, dataItem, new InputTextField(this.id + '_' + dataItem.id + '_tmpEditDescription_TextField', 'Edytuj', undefined, true, 150), 'description', this);
        var deadlineAtomicEditLabel = new AtomicEditLabel(dataItem.deadline, dataItem, new DatePicker(this.id + '_' + dataItem.id + '_deadLinePickerField', 'Termin wykonania', true), 'deadline', this);
        (dataItem.status) ? true : dataItem.status = "";
        var personAutoCompleteTextField = new AutoCompleteTextField(this.id + 'personAutoCompleteTextField', 'Imię i nazwisko', 'person', false, 'Wybierz imię i nazwisko');
        personAutoCompleteTextField.initialise(MainSetup.personsPerProjectRepository, "_nameSurnameEmail", this.onOwnerChosen, this);
        var personAtomicEditLabel = new AtomicEditLabel(dataItem._nameSurnameEmail, dataItem, personAutoCompleteTextField, '_nameSurnameEmail', this);
        $collectionElementDescription
            .append(new Badge(dataItem.id, dataItem.status, 'light-blue').$dom)
            .append(descriptionAtomicEditLabel.$dom)
            .append(deadlineAtomicEditLabel.$dom)
            .append(personAtomicEditLabel.$dom);
        return $collectionElementDescription;
    };
    ProcessStepsInstancesCollection.prototype.makeList = function () {
        var _this = this;
        return _super.prototype.makeList.call(this).filter(function (item) { return item.dataItem._case.id == _this.parentDataItem.id; });
    };
    ProcessStepsInstancesCollection.prototype.selectTrigger = function (itemId) {
        _super.prototype.selectTrigger.call(this, itemId);
        //wybierz letter
        var currentLetter = {};
        if (this.connectedRepository.currentItem._ourLetter)
            currentLetter = Tools.search(parseInt(this.connectedRepository.currentItem._ourLetter.id), 'id', LettersSetup.lettersRepository.items);
        LettersSetup.lettersRepository.currentItem = currentLetter;
    };
    ProcessStepsInstancesCollection.prototype.addPlainRowCrudButtons = function (row) {
        _super.prototype.addPlainRowCrudButtons.call(this, row);
        if (row.dataItem._processStep._documentTemplate.gdId) {
            if (row.dataItem._ourLetter) {
                this.appendLetterAttachmentsModal.preppendTriggerButtonTo(row.$crudButtons, 'Dodaj załączniki', this);
                this.editOurLetterModal.preppendTriggerButtonTo(row.$crudButtons, 'Edytuj pismo', this);
                row.$crudButtons.append(new RaisedButton('Usuń pismo', this.deleteOurLetterAction, this).$dom);
            }
            else
                this.addNewOurLetterModal.preppendTriggerButtonTo(row.$crudButtons, 'Generuj pismo', this);
        }
    };
    ProcessStepsInstancesCollection.prototype.deleteOurLetterAction = function () {
        this.connectedRepository.currentItem._ourLetter = LettersSetup.lettersRepository.currentItem;
        this.connectedRepository.doChangeFunctionOnItem(this.connectedRepository.currentItem, 'deleteProcessStepInstanceOurLetter', this);
    };
    return ProcessStepsInstancesCollection;
}(SimpleCollection));
