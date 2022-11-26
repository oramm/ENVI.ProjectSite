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
var TaskTemplatesCollection = /** @class */ (function (_super) {
    __extends(TaskTemplatesCollection, _super);
    /*
     * @param {type} id
     * @param {boolean} isPlane - czy lista ma być prosta czy z Avatarem
     * @param {boolean} hasFilter - czy ma być filtr
     * @param {boolean} isAddable - czy można dodować nowe elementy
     */
    function TaskTemplatesCollection(initParamObject) {
        var _this = _super.call(this, { id: initParamObject.id,
            parentDataItem: initParamObject.parentDataItem,
            title: initParamObject.title,
            addNewModal: initParamObject.addNewModal,
            editModal: initParamObject.editModal,
            isPlain: true,
            hasFilter: true,
            isEditable: true,
            isAddable: initParamObject.isAddable,
            isDeletable: true,
            connectedRepository: TaskTemplatesSetup.taskTemplatesRepository
        }) || this;
        _this.status = initParamObject.status;
        //nie ma nadrzędnego Collapsible więc definiuję modale tutaj
        _this.addNewModal = new TaskTemplateModal(_this.id + '_newTaskTemplate', 'Dodaj szablon zadania', _this, 'ADD_NEW');
        _this.editModal = new TaskTemplateModal(_this.id + '_editTaskTemplate', 'Edytuj szablon zadania', _this, 'EDIT');
        _this.initialise(_this.makeList());
        return _this;
    }
    /*
     * @param {dataItem} this.connectedRepository.items[i])
     */
    TaskTemplatesCollection.prototype.makeItem = function (dataItem) {
        //potrzebne sprawdzenie i ew. podmiana na '', żeby nie wyświetlać takstu 'undefined'
        (dataItem._nameSurnameEmail) ? true : dataItem._nameSurnameEmail = "";
        var nameSurnameEmailLabel = (dataItem._nameSurnameEmail) ? (dataItem._nameSurnameEmail) + '<BR>' : "";
        return { id: dataItem.id,
            icon: undefined,
            $title: this.makeTitle(dataItem),
            $description: this.makeDescription(dataItem),
            dataItem: dataItem
        };
    };
    /*
     * @param {dataItem} this.connectedRepository.items[i])
     */
    TaskTemplatesCollection.prototype.makeTitle = function (dataItem) {
        var titleAtomicEditLabel = new AtomicEditLabel(dataItem.name, dataItem, new InputTextField(this.id + '_' + dataItem.id + '_tmpNameEdit_TextField', 'Edytuj', undefined, true, 150), 'name', this);
        return titleAtomicEditLabel.$dom;
    };
    /*
     * @param {dataItem} this.connectedRepository.currentItem
     */
    TaskTemplatesCollection.prototype.makeDescription = function (dataItem) {
        (dataItem.description) ? true : dataItem.description = "";
        var $collectionElementDescription = $('<span>');
        var descriptionAtomicEditLabel = new AtomicEditLabel(dataItem.description, dataItem, new InputTextField(this.id + '_' + dataItem.id + '_tmpEditDescription_TextField', 'Edytuj', undefined, true, 150), 'description', this);
        (dataItem.status) ? true : dataItem.status = "";
        $collectionElementDescription
            .append(descriptionAtomicEditLabel.$dom)
            .append('<span>' + dataItem.deadlineRule + '<br></span>')
            .append('<span>' + dataItem.status + '<br></span>');
        return $collectionElementDescription;
    };
    //makeList(){
    //    return super.makeList().filter((item)=>item.dataItem.caseId==this.parentDataItem.id;
    //}
    TaskTemplatesCollection.prototype.selectTrigger = function (itemId) {
        _super.prototype.selectTrigger.call(this, itemId);
        //$('#contractDashboard').attr('src','../Cases/CasesList.html?milestoneId=' + this.connectedRepository.currentItem.projectId  + '&contractId=' + this.connectedRepository.currentItem.contractId);
    };
    return TaskTemplatesCollection;
}(SimpleCollection));
