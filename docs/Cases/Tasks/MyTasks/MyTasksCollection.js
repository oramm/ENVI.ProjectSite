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
var MyTasksCollection = /** @class */ (function (_super) {
    __extends(MyTasksCollection, _super);
    function MyTasksCollection(id) {
        var _this = _super.call(this, {
            id: id,
            isPlain: true,
            isEditable: true,
            isAddable: true,
            isDeletable: true,
            connectedRepository: tasksRepository
        }) || this;
        _this.addNewModal = new TaskModal(_this.id + '_newTask', 'Dodaj zadanie', _this, 'ADD_NEW');
        _this.editModal = new TaskModal(_this.id + '_editTask', 'Edytuj zadanie', _this, 'EDIT');
        _this.initialise(_this.makeList());
        return _this;
    }
    MyTasksCollection.prototype.makeItem = function (dataItem) {
        (dataItem._owner._nameSurnameEmail) ? true : dataItem._nameSurnameEmail = "";
        var nameSurnameEmailLabel = (dataItem._owner._nameSurnameEmail) ? (dataItem._owner._nameSurnameEmail) + '<BR>' : "";
        (dataItem.description) ? true : dataItem.description = "";
        var descriptionLabel = (dataItem.description) ? (dataItem.description) + '<BR>' : "";
        (dataItem.status) ? true : dataItem.status = "";
        var statusLabel = (dataItem.status) ? (dataItem.status) + '<BR>' : "";
        //(dataItem.description)? true : dataItem.description="";
        return {
            id: dataItem.id,
            $title: this.makeTitle(dataItem),
            $description: this.makeDescription(dataItem),
            dataItem: dataItem
        };
    };
    /*
     * @param {dataItem} this.connectedRepository.items[i])
     */
    MyTasksCollection.prototype.makeTitle = function (dataItem) {
        var label = '<strong>' + dataItem._parent._parent._parent.ourId + '</strong> ';
        label += dataItem._parent._typeFolderNumber_TypeName_Number_Name + ', ' + dataItem.name;
        return label;
    };
    /*
     * @param {dataItem} this.connectedRepository.currentItem
     */
    MyTasksCollection.prototype.makeDescription = function (dataItem) {
        (dataItem.description) ? true : dataItem.description = "";
        var $collectionElementDescription = $('<span>');
        var descriptionAtomicEditLabel = new AtomicEditLabel(dataItem.description, dataItem, {
            input: new InputTextField(this.id + '_' + dataItem.id + '_tmpEditDescription_TextField', 'Edytuj', undefined, true, 150),
            dataItemKeyName: 'description'
        }, 'description', this);
        var deadlineAtomicEditLabel = new AtomicEditLabel(dataItem.deadline, dataItem, {
            input: new DatePicker(this.id + '_' + dataItem.id + '_deadLinePickerField', 'Termin wykonania', true),
            dataItemKeyName: 'deadline'
        }, 'deadline', this);
        (dataItem.status) ? true : dataItem.status = "";
        $collectionElementDescription
            .append(descriptionAtomicEditLabel.$dom)
            .append(deadlineAtomicEditLabel.$dom)
            .append('<span>' + dataItem.status + '<br></span>');
        return $collectionElementDescription;
    };
    MyTasksCollection.prototype.makeList = function () {
        return _super.prototype.makeList.call(this).filter(function (item) { return item.dataItem._owner._nameSurnameEmail && item.dataItem._owner._nameSurnameEmail.includes(MainSetup.currentUser.systemEmail); });
    };
    MyTasksCollection.prototype.selectTrigger = function (itemId) {
        _super.prototype.selectTrigger.call(this, itemId);
        //$('#contractDashboard').attr('src','../Cases/CasesList.html?milestoneId=' + this.connectedRepository.currentItem.projectId  + '&contractId=' + this.connectedRepository.currentItem.contractId);
    };
    return MyTasksCollection;
}(SimpleCollection));
