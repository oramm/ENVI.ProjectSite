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
var IssuesCollapsible = /** @class */ (function (_super) {
    __extends(IssuesCollapsible, _super);
    function IssuesCollapsible(id) {
        var _this_1 = _super.call(this, {
            id: id,
            hasFilter: true,
            isEditable: true,
            isAddable: true,
            isDeletable: true,
            hasArchiveSwitch: true,
            connectedRepository: IssuesSetup.issuesRepository,
        }) || this;
        _this_1.addNewModal = new IssueModalEngineer(id + '_newIssue', 'Zgłoś problem', _this_1, 'ADD_NEW');
        _this_1.editModal = new IssueModalEngineer(id + '_editIssue', 'Edytuj problem', _this_1, 'EDIT');
        _this_1.editModalContractor = new IssueModalContractor(id + '_editIssueIssueContractor', 'Edytuj problem W', _this_1, 'EDIT');
        _this_1.initialise(_this_1.makeCollapsibleItemsList());
        return _this_1;
    }
    /*
     * Przetwarza surowe dane z repozytorium na item gotowy dla Collapsible.buildRow()
     * @param {type} connectedRepository.items[i]
     * @returns {Collapsible.Item}
     */
    IssuesCollapsible.prototype.makeItem = function (dataItem) {
        var item = _super.prototype.makeItem.call(this, dataItem);
        item.name = collapsibleItemName = dataItem.name + '<br>Załatwić do: ' + dataItem.deadline;
        return item;
    };
    IssuesCollapsible.prototype.makeBody = function (dataItem) {
        var $panel = $('<div>')
            .attr('id', 'collapsibleBodyForIssue' + dataItem.id)
            .attr('issueid', dataItem.id)
            .attr('status', dataItem.status)
            .append('<b>Treść zgłoszenia:</b><br>' + dataItem.description + '<br>')
            .append('<b>Odpowiedź wykonawcy:</b><br>' + dataItem.contractorsDescription)
            .append(new Badge(dataItem.id, dataItem.status, 'light-blue').$dom);
        return {
            collection: undefined,
            $dom: $panel
        };
    };
    /*
     * Ustawia pryciski edycji wierszy,
     * musi być przeciążona bo mamy dwa różne modale edycji przypisane co Collapsilbe
     */
    IssuesCollapsible.prototype.addRowCrudButtons = function (row) {
        var $crudMenu = row.$dom.find('.collapsible-header > .crudButtons');
        if (row.dataItem._gdFolderUrl)
            $crudMenu.append(new ExternalResourcesIconLink('GD_ICON', row.dataItem._gdFolderUrl).$dom);
        if (this.isDeletable || this.isEditable) {
            var $currentRowEditIcon = this.$rowEditIcon();
            $crudMenu
                .append($currentRowEditIcon);
            //przepnij do właściwego modala
            if (row.dataItem.status.match(/W trakcie/i)) {
                row.$dom.attr('editModal', 'editModalContractor');
                $currentRowEditIcon.attr('data-target', this.editModalContractor.id);
            }
            if (this.isDeletable)
                $crudMenu.append(this.$rowDeleteIcon());
        }
    };
    /*
     * musi być przeciążona bo mamy dwa różne modale edycji przypisane co Collapsilbe
     */
    IssuesCollapsible.prototype.setEditAction11 = function () {
        this.$dom.find(".collapsibleItemEdit").off('click');
        var _this = this;
        this.$dom.find(".collapsibleItemEdit").click(function () {
            var condition = $(this).closest('.collapsible-item').attr('editModal');
            $(this).closest('.collapsible-item').trigger('click');
            _this.getProperModal(condition).triggerAction(_this);
        });
    };
    IssuesCollapsible.prototype.getProperModal = function (condition) {
        switch (condition) {
            case 'editModalContractor':
                return this.editModalContractor;
            default:
                return this.editModal;
        }
    };
    return IssuesCollapsible;
}(SimpleCollapsible));
