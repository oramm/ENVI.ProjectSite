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
var CasesCollapsible = /** @class */ (function (_super) {
    __extends(CasesCollapsible, _super);
    function CasesCollapsible(id) {
        var _this = _super.call(this, {
            id: id,
            parentId: CasesSetup.currentMilestone.id,
            hasFilter: true,
            isEditable: true,
            isAddable: true,
            isDeletable: true,
            connectedRepository: CasesSetup.casesRepository
            //subitemsCount: 12
        }) || this;
        _this.addNewModal = new CaseModal(id + '_newCase', 'Dodaj sprawę', _this, 'ADD_NEW');
        _this.editModal = new CaseModal(id + '_editCase', 'Edytuj sprawę', _this, 'EDIT');
        //modale dla TasksCollection:
        _this.addNewTaskModal = new TaskModal(_this.id + '_newTask', 'Dodaj zadanie', _this, 'ADD_NEW');
        _this.editTaskModal = new TaskModal(_this.id + '_editTask', 'Edytuj zadanie', _this, 'EDIT');
        _this.editProcessStepInstanceModal = new ProcessStepsInstancesModal(_this.id + '_editProcessStepInstance', 'Edytuj krok w procesie', _this, 'EDIT');
        _this.addNewOurLetterModal = new ProcessOurLetterModal(id + '_newOurLetterModal', 'Rejestruj pismo wychodzące', _this, 'ADD_NEW');
        _this.editOurLetterModal = new ProcessOurLetterModal(id + '_editOurLetterModal', 'Edytuj dane pisma wychodzącego', _this, 'EDIT');
        _this.appendLetterAttachmentsModal = new ProcessAppendLetterAttachmentsModal(id + '_appendLetterAttachmentsModal', 'Dodaj załączniki', _this, 'EDIT');
        _this.initialise(_this.makeCollapsibleItemsList());
        //trzeba zainicjować dane parentów na wypadek dodania nowego obiektu
        //funkcja Modal.submitTrigger() bazuje na danych w this.connectedRepository.currentItem
        _this.connectedRepository.currentItem.milestoneId = _this.connectedRepository.parentItemId;
        return _this;
    }
    /*
     * Przetwarza surowe dane z repozytorium na item gotowy dla Collapsible.buildRow()
     * @param {type} connectedRepository.items[i]
     * @returns {Collapsible.Item}
     */
    CasesCollapsible.prototype.makeItem = function (dataItem) {
        var item = _super.prototype.makeItem.call(this, dataItem);
        var folderNumber = (dataItem._type.folderNumber) ? dataItem._type.folderNumber : ' ';
        var typeName = (dataItem._type.name) ? dataItem._type.name : '[Nie przypisano typu]';
        var name = (dataItem.name) ? dataItem.name : ' ';
        var caseNumber = (dataItem._displayNumber) ? ' ' + dataItem._displayNumber + ' ' : '';
        var riskLabel = (dataItem._risk.id) ? '<strong> [Poziom ryzyka: ' + dataItem._risk._rate + ']</strong> ' : '';
        item.name = folderNumber + ' ' + typeName + ' | ' + caseNumber + name + riskLabel;
        item.subitemsCount = TasksSetup.tasksRepository.items.filter(function (item) { return item.caseId == dataItem.id; }).length;
        return item;
    };
    CasesCollapsible.prototype.makeBody = function (dataItem) {
        var $body = this.makeTabs(dataItem).$dom;
        var $panel = $('<div>')
            .attr('id', 'tasksActionsMenuForCase' + dataItem.id)
            .attr('caseid', dataItem.id)
            //.append('<div class="row">Zarządzaj zadaniami</div>')
            .append($body);
        return {
            collection: undefined,
            $dom: $panel
        };
    };
    CasesCollapsible.prototype.makeTabs = function (dataItem) {
        var parentItemId = Tools.getUrlVars()['parentItemId'];
        var tabsData = [{
                name: 'Zadania - Scrumboard',
                panel: this.makeScrumBoardTab(dataItem).$dom
            },
            {
                name: 'Wydarzenia',
                panel: this.makeEventsTab(dataItem)
            }
        ];
        if (dataItem._processesInstances.length > 0)
            tabsData.push({
                name: 'Proces',
                panel: this.makeProcessTab(dataItem)
            });
        return new Tabs({
            id: 'caseTabs-' + dataItem.id,
            parentId: parentItemId,
            tabsData: tabsData,
            swipeable: true
        });
    };
    CasesCollapsible.prototype.makeScrumBoardTab = function (dataItem) {
        var statusesCollections = [];
        var backlogCollection = new TasksCollection({
            id: 'backlogCollection_' + dataItem.id + '_status' + 0,
            parentDataItem: dataItem,
            addNewModal: this.addNewTaskModal,
            editModal: this.editTaskModal,
            title: TasksSetup.statusNames[0],
            status: TasksSetup.statusNames[0],
            isAddable: true
        });
        backlogCollection.$dom.children('.collection').attr("status", TasksSetup.statusNames[0]);
        statusesCollections.push(backlogCollection);
        for (var i = 1; i < TasksSetup.statusNames.length; i++) {
            var tasksCollection = new TasksCollection({
                id: 'tasksListCollection_' + dataItem.id + '_status' + i,
                parentDataItem: dataItem,
                editModal: this.editTaskModal,
                title: TasksSetup.statusNames[i],
                status: TasksSetup.statusNames[i],
                isAddable: false
            });
            tasksCollection.$dom.children('.collection').attr("status", TasksSetup.statusNames[i]);
            statusesCollections.push(tasksCollection);
        }
        return new ScrumBoard(statusesCollections);
    };
    CasesCollapsible.prototype.makeProcessTab = function (dataItem) {
        if (dataItem._processesInstances.length > 1)
            throw new Error('Ten widok nie  obsługuje jeszcze wielu procesów dla jednej sprawy!');
        var $processDataPanel = $('<div>');
        var stepsCollection = new ProcessStepsInstancesCollection({
            id: 'processStepsCollection_' + dataItem.id,
            title: "",
            editModal: this.editProcessStepInstanceModal,
            addNewOurLetterModal: this.addNewOurLetterModal,
            editOurLetterModal: this.editOurLetterModal,
            appendLetterAttachmentsModal: this.appendLetterAttachmentsModal,
            parentDataItem: dataItem
        });
        $processDataPanel
            .append(dataItem._processesInstances[0]._process.name + '<BR>')
            .append(dataItem._processesInstances[0]._process.descripton)
            .append(stepsCollection.$dom);
        return $processDataPanel;
    };
    CasesCollapsible.prototype.makeEventsTab = function (dataItem) {
        var $processDataPanel = $('<div>');
        var eventsCollection = new EventsCollection({
            id: 'eventsCollection_' + dataItem.id,
            title: "",
            parentDataItem: dataItem
        });
        $processDataPanel
            .append(eventsCollection.$dom);
        return $processDataPanel;
    };
    /*
     * Przeciążenie konieczne bo przy dodawaniu nowych elementów Collection muszą być ustawione
     * dane bieżącego kontraktu i projektu
     */
    CasesCollapsible.prototype.selectTrigger = function (itemId) {
        _super.prototype.selectTrigger.call(this, itemId);
        TasksSetup.tasksRepository.currentItem.caseId = this.connectedRepository.currentItem.id;
    };
    return CasesCollapsible;
}(SimpleCollapsible));
