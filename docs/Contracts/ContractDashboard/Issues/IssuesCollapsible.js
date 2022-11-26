"use strict";
class IssuesCollapsible extends SimpleCollapsible {
    constructor(id) {
        super({
            id: id,
            hasFilter: true,
            isEditable: true,
            isAddable: true,
            isDeletable: true,
            hasArchiveSwitch: true,
            connectedRepository: IssuesSetup.issuesRepository,
        });
        this.addNewModal = new IssueModalEngineer(id + '_newIssue', 'Zgłoś problem', this, 'ADD_NEW');
        this.editModal = new IssueModalEngineer(id + '_editIssue', 'Edytuj problem', this, 'EDIT');
        this.editModalContractor = new IssueModalContractor(id + '_editIssueIssueContractor', 'Edytuj problem W', this, 'EDIT');
        this.initialise(this.makeCollapsibleItemsList());
    }
    /*
     * Przetwarza surowe dane z repozytorium na item gotowy dla Collapsible.buildRow()
     * @param {type} connectedRepository.items[i]
     * @returns {Collapsible.Item}
     */
    makeItem(dataItem) {
        let item = super.makeItem(dataItem);
        item.name = collapsibleItemName = dataItem.name + '<br>Załatwić do: ' + dataItem.deadline;
        return item;
    }
    makeBody(dataItem) {
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
    }
    /*
     * Ustawia pryciski edycji wierszy,
     * musi być przeciążona bo mamy dwa różne modale edycji przypisane co Collapsilbe
     */
    addRowCrudButtons(row) {
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
    }
    /*
     * musi być przeciążona bo mamy dwa różne modale edycji przypisane co Collapsilbe
     */
    setEditAction11() {
        this.$dom.find(".collapsibleItemEdit").off('click');
        var _this = this;
        this.$dom.find(".collapsibleItemEdit").click(function () {
            var condition = $(this).closest('.collapsible-item').attr('editModal');
            $(this).closest('.collapsible-item').trigger('click');
            _this.getProperModal(condition).triggerAction(_this);
        });
    }
    getProperModal(condition) {
        switch (condition) {
            case 'editModalContractor':
                return this.editModalContractor;
            default:
                return this.editModal;
        }
    }
}
