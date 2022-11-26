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
var ReactionsCollection = /** @class */ (function (_super) {
    __extends(ReactionsCollection, _super);
    /*
     * @param {type} id
     * @param {boolean} isPlane - czy lista ma być prosta czy z Avatarem
     * @param {boolean} hasFilter - czy ma być filtr
     * @param {boolean} isAddable - czy można dodować nowe elementy
     */
    function ReactionsCollection(initParamObject) {
        var _this = _super.call(this, {
            id: initParamObject.id,
            parentDataItem: initParamObject.parentDataItem,
            title: initParamObject.title,
            isPlain: true,
            hasFilter: false,
            isEditable: false,
            isAddable: initParamObject.isAddable,
            isDeletable: true,
            connectedRepository: ReactionsSetup.reactionsRepository
        }) || this;
        _this.status = initParamObject.status;
        if (_this.isAddable)
            _this.addNewModal = new ReactionModal(_this.id + '_newReaction', 'Dodaj zadanie', _this, 'ADD_NEW');
        //this.editModal = new ReactionModal(this.id + '_editReaction', 'Edytuj zadanie', this, 'EDIT');
        _this.initialise(_this.makeList());
        return _this;
    }
    /*
     * Dodano atrybut z riskId_Hidden, żeby szybciej filtorwać widok po stronie klienta zamiast przez SELECT z db
     * @param {dataItem} this.connectedRepository.items[i])
     */
    ReactionsCollection.prototype.makeItem = function (dataItem) {
        //potrzebne sprawdzenie i ew. podmiana na '', żeby nie wyświetlać takstu 'undefined'
        (dataItem._nameSurnameEmail) ? true : dataItem._nameSurnameEmail = "";
        var nameSurnameEmailLabel = (dataItem._nameSurnameEmail) ? (dataItem._nameSurnameEmail) + '<BR>' : "";
        return {
            id: dataItem.id,
            icon: undefined,
            $title: this.makeTitle(dataItem),
            $description: this.makeDescription(dataItem),
            riskId_Hidden: dataItem.riskId,
            status_Hidden: dataItem.status,
            dataItem: dataItem
        };
    };
    /*
     * @param {dataItem} this.connectedRepository.items[i])
     */
    ReactionsCollection.prototype.makeTitle = function (dataItem) {
        var titleAtomicEditLabel = new AtomicEditLabel(dataItem.name, dataItem, new InputTextField(this.id + '_' + dataItem.id + '_tmpNameEdit_TextField', 'Edytuj', undefined, true, 150), 'name', this);
        return titleAtomicEditLabel.$dom;
    };
    /*
     * @param {dataItem} this.connectedRepository.currentItem
     */
    ReactionsCollection.prototype.makeDescription = function (dataItem) {
        (dataItem.description) ? true : dataItem.description = "";
        var $collectionElementDescription = $('<span>');
        var descriptionAtomicEditLabel = new AtomicEditLabel(dataItem.description, dataItem, new InputTextField(this.id + '_' + dataItem.id + '_tmpEditDescription_TextField', 'Edytuj', undefined, true, 150), 'description', this);
        var deadlineAtomicEditLabel = new AtomicEditLabel(dataItem.deadline, dataItem, new DatePicker(this.id + '_' + dataItem.id + '_deadLinePickerField', 'Termin wykonania', true), 'deadline', this);
        (dataItem.status) ? true : dataItem.status = "";
        var personAutoCompleteTextField = new AutoCompleteTextField(this.id + 'personAutoCompleteTextField', 'Imię i nazwisko', 'person', false, 'Wybierz imię i nazwisko');
        personAutoCompleteTextField.initialise(MainSetup.personsEnviRepository, "_nameSurnameEmail", this.onOwnerChosen, this);
        var personAtomicEditLabel = new AtomicEditLabel(dataItem._nameSurnameEmail, dataItem, personAutoCompleteTextField, '_nameSurnameEmail', this);
        //var statusSelectField = new SelectField(this.id + '_' + dataItem.id + '_statusSelectField', 'Status', true);
        //statusSelectField.initialise(ReactionsSetup.statusNames);        
        //var statusAtomicEditLabel = new AtomicEditLabel(dataItem.status, 
        //                                                dataItem, 
        //                                               statusSelectField,
        //                                                'status',
        //                                                this);
        $collectionElementDescription
            .append(descriptionAtomicEditLabel.$dom)
            .append(deadlineAtomicEditLabel.$dom)
            .append(personAtomicEditLabel.$dom)
            .append('<span>' + dataItem.status + '<br></span>');
        return $collectionElementDescription;
    };
    ReactionsCollection.prototype.makeList = function () {
        var _this = this;
        return _super.prototype.makeList.call(this).filter(function (item) { return item.riskId_Hidden == _this.parentDataItem.id && item.status_Hidden == _this.status; });
    };
    ReactionsCollection.prototype.selectTrigger = function (itemId) {
        _super.prototype.selectTrigger.call(this, itemId);
        //$('#iframeRisks').attr('src','../Risks/RisksList.html?milestoneId=' + this.connectedRepository.currentItem.projectId  + '&contractId=' + this.connectedRepository.currentItem.contractId);
    };
    return ReactionsCollection;
}(SimpleCollection));
