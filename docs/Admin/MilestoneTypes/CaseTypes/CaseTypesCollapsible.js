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
var CaseTypesCollapsible = /** @class */ (function (_super) {
    __extends(CaseTypesCollapsible, _super);
    function CaseTypesCollapsible(id) {
        var _this = _super.call(this, {
            id: id,
            parentId: CaseTypesSetup.currentMilestoneType.id,
            hasFilter: true,
            isEditable: true,
            isAddable: true,
            isDeletable: true,
            connectedRepository: CaseTypesSetup.caseTypesRepository
            //subitemsCount: 12
        }) || this;
        _this.addNewModal = new CaseTypeModal(id + '_newCaseType', 'Dodaj typ sprawy', _this, 'ADD_NEW');
        _this.editModal = new CaseTypeModal(id + '_editCase', 'Edytuj typ sprawy', _this, 'EDIT');
        //modale dla Collection:
        _this.addNewCaseTemplateModal = new CaseTemplateModal(_this.id + '_newCaseTemplate', 'Dodaj szablon sprawy', _this, 'ADD_NEW');
        _this.editCaseTemplateModal = new CaseTemplateModal(_this.id + '_editCaseTemplate', 'Edytuj szablon sprawy', _this, 'EDIT');
        _this.initialise(_this.makeCollapsibleItemsList());
        return _this;
        //trzeba zainicjować dane parentów na wypadek dodania nowego obiektu
        //funkcja Modal.submitTrigger() bazuje na danych w this.connectedRepository.currentItem
        //this.connectedRepository.currentItem.milestoneId = this.connectedRepository.parentItemId;
    }
    /*
     * Przetwarza surowe dane z repozytorium na item gotowy dla Collapsible.buildRow()
     * @param {type} connectedRepository.items[i]
     * @returns {Collapsible.Item}
     */
    CaseTypesCollapsible.prototype.makeItem = function (dataItem) {
        var item = _super.prototype.makeItem.call(this, dataItem);
        var isUnique = (dataItem.isUniquePerMilestone) ? '[Unikalna]' : '';
        item.name = dataItem.folderNumber + ' ' + dataItem.name + ' ' + isUnique;
        return item;
    };
    CaseTypesCollapsible.prototype.makeBody = function (dataItem) {
        var subCollection = new CaseTemplatesCollection({
            id: 'CaseTemplatesCollection_' + dataItem.id,
            title: "",
            addNewModal: this.addNewCaseTemplateModal,
            editModal: this.editCaseTemplateModal,
            parentDataItem: dataItem
        });
        var $panel = $('<div>')
            .attr('id', 'caseTemplatesActionsMenuForCase' + dataItem.id)
            .attr('caseid', dataItem.id)
            .append(subCollection.$dom);
        return {
            collection: subCollection,
            $dom: $panel
        };
    };
    /*
     * Przeciążenie konieczne bo przy dodawaniu nowych elementów Collection muszą być ustawione
     * dane bieżącego kontraktu i projektu
     */
    CaseTypesCollapsible.prototype.selectTrigger = function (itemId) {
        _super.prototype.selectTrigger.call(this, itemId);
        //TasksSetup.tasksRepository.currentItem.caseId = this.connectedRepository.currentItem.id;
    };
    return CaseTypesCollapsible;
}(SimpleCollapsible));
