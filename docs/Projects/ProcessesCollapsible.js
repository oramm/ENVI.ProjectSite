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
var ProcessesCollapsible = /** @class */ (function (_super) {
    __extends(ProcessesCollapsible, _super);
    function ProcessesCollapsible(id) {
        var _this = _super.call(this, {
            id: id,
            hasFilter: true,
            isEditable: false,
            isAddable: false,
            isDeletable: false,
            hasArchiveSwitch: false,
            connectedRepository: CasesSetup.casesRepository,
            connectedRepositoryGetRoute: "cases/?projectId=" + MainSetup.currentProject.ourId,
            title: 'Aktualne procesy'
            //subitemsCount: 12
        }) || this;
        _this.editProcessStepInstanceModal = new ProcessStepsInstancesModal(_this.id + '_editProcessStepInstance', 'Edytuj krok w procesie', _this, 'EDIT');
        _this.addNewOurLetterModal = new ProcessOurLetterModal(id + '_newOurLetterModal', 'Rejestruj pismo wychodzące', _this, 'ADD_NEW');
        _this.editOurLetterModal = new ProcessOurLetterModal(id + '_editOurLetterModal', 'Edytuj dane pisma wychodzącego', _this, 'EDIT');
        _this.appendLetterAttachmentsModal = new ProcessAppendLetterAttachmentsModal(id + '_appendLetterAttachmentsModal', 'Dodaj załączniki', _this, 'EDIT');
        var filterElements = [
            {
                serverSideReload: true,
                inputType: 'FilterSwitchInput',
                colSpan: 6,
                onLabel: 'Z Procesem',
                offLabel: 'Bez procesu',
                attributeToCheck: 'hasProcesses'
            }
        ];
        _this.initialise(_this.makeCollapsibleItemsList(), filterElements);
        return _this;
    }
    /*
     * Przetwarza surowe dane z repozytorium na item gotowy dla Collapsible.buildRow()
     * @param {type} connectedRepository.items[i]
     * @returns {Collapsible.Item}
     */
    ProcessesCollapsible.prototype.makeItem = function (dataItem) {
        var item = _super.prototype.makeItem.call(this, dataItem);
        dataItem.hasProcesses = dataItem._processesInstances.length > 0;
        var contractNumber = (dataItem._parent._parent.ourId) ? dataItem._parent._parent.ourId : dataItem._parent._parent.number;
        var contractAlias = (dataItem._parent._parent.alias) ? dataItem._parent._parent.alias : '';
        item.name = '<strong>' + contractNumber + '</strong> ' + contractAlias + ' >> ' + dataItem._typeFolderNumber_TypeName_Number_Name;
        return item;
    };
    ProcessesCollapsible.prototype.makeBody = function (dataItem) {
        var $descriptionLabel = $((dataItem.description) ? '<BR>' + dataItem.description : '');
        var subCollection = new ProcessStepsInstancesCollection({
            id: 'processStepsCollection_' + dataItem.id,
            title: "",
            editModal: this.editProcessStepInstanceModal,
            addNewOurLetterModal: this.addNewOurLetterModal,
            editOurLetterModal: this.editOurLetterModal,
            appendLetterAttachmentsModal: this.appendLetterAttachmentsModal,
            parentDataItem: dataItem,
            connectedResultsetComponent: this
        });
        var $panel = $('<div>')
            .attr('id', 'collapsibleBodyForProcess' + dataItem.id)
            .attr('processId', dataItem.id)
            .append($descriptionLabel)
            .append(new Badge(dataItem.id, dataItem.status, 'light-blue').$dom)
            .append(subCollection.$dom);
        return {
            collection: subCollection,
            $dom: $panel
        };
    };
    ProcessesCollapsible.prototype.makeList = function () {
        var _this = this;
        return _super.prototype.makeList.call(this).filter(function (item) { return item.dataItem.caseId == _this.parentDataItem.id && item.dataItem.status == _this.status; });
    };
    return ProcessesCollapsible;
}(SimpleCollapsible));
