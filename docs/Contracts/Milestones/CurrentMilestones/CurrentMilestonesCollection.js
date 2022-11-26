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
var CurrentMilestonesCollection = /** @class */ (function (_super) {
    __extends(CurrentMilestonesCollection, _super);
    function CurrentMilestonesCollection(initParamObject) {
        var _this = _super.call(this, { id: initParamObject.id,
            parentDataItem: initParamObject.parentDataItem,
            title: initParamObject.title,
            isPlain: true,
            hasFilter: true,
            isEditable: true,
            isAddable: false,
            isDeletable: true,
            connectedRepository: milestonesRepository
        }) || this;
        //this.addNewModal = new NewMilestoneModal(this.id + '_newMilestone', 'Dodaj kamień', this);
        _this.editModal = new CurrentMilestoneModal(_this.id + '_editMilestone', 'Edytuj kamień milowy', _this, 'EDIT');
        _this.initialise(_this.makeList());
        return _this;
    }
    /*
     * Dodano atrybut z ContractId, żeby szybciej filtorwac widok po stronie klienta zamiast przez SELECT z db
     * @dataItem connectedRepository.items[i]
     */
    CurrentMilestonesCollection.prototype.makeItem = function (dataItem) {
        (dataItem.description) ? true : dataItem.description = "";
        return { id: dataItem.id,
            //icon:   'info',
            $title: this.makeTitle(dataItem),
            $description: this.makeDescription(dataItem),
            editUrl: dataItem.editUrl,
            contractId_Hidden: dataItem.contractId,
            dataItem: dataItem
        };
    };
    /*
     * @param {dataItem} this.connectedRepository.items[i])
     */
    CurrentMilestonesCollection.prototype.makeTitle = function (dataItem) {
        var typeName = (dataItem._type.name) ? dataItem._type.name + ' ' : '';
        var titleAtomicEditLabel = new AtomicEditLabel(typeName + dataItem.name, dataItem, { input: new InputTextField(this.id + '_' + dataItem.id + '_tmpNameEdit_TextField', 'Edytuj', undefined, true, 150),
            dataItemKeyName: 'name'
        }, 'name', this);
        return titleAtomicEditLabel.$dom;
    };
    /*
     * @param {dataItem} this.connectedRepository.currentItem
     */
    CurrentMilestonesCollection.prototype.makeDescription = function (dataItem) {
        (dataItem.description) ? true : dataItem.description = "";
        var $collectionElementDescription = $('<span>');
        //TODO: kiedyś dodać edyzcję dat
        var deadlineAtomicEditLabel = new AtomicEditLabel(dataItem.deadline, dataItem, new DatePicker(this.id + '_' + dataItem.id + '_deadLinePickerField', 'Termin wykonania', true), 'deadline', this);
        (dataItem.status) ? true : dataItem.status = "";
        $collectionElementDescription
            .append('<span>Projekt: ' + dataItem.projectId + ' => </span>')
            .append('<span>Kontrakt: <strong>' + dataItem._parent.ourId + '</strong><br></span>')
            .append('<span>' + dataItem.description + '<br></span>')
            .append('<span>' + dataItem._parent._manager._nameSurnameEmail + '<br></span>')
            .append('<span>Termin zakończenia: <b>' + dataItem.endDate + '</b><BR></span>')
            //.append(deadlineAtomicEditLabel.$dom)
            .append('<span>' + dataItem.status + '<br></span>');
        return $collectionElementDescription;
    };
    CurrentMilestonesCollection.prototype.makeList = function () {
        return _super.prototype.makeList.call(this);
    };
    CurrentMilestonesCollection.prototype.selectTrigger = function (itemId) {
        if (itemId !== undefined) {
            _super.prototype.selectTrigger.call(this, itemId);
            //$('#contractDashboard').attr('src','../Cases/CasesList.html?parentItemId=' + this.connectedRepository.currentItem.id  + '&contractId=' + this.connectedRepository.currentItem.contractId);
        }
    };
    return CurrentMilestonesCollection;
}(SimpleCollection));
