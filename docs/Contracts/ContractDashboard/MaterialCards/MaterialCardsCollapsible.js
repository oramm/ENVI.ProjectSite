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
var MaterialCardsCollapsible = /** @class */ (function (_super) {
    __extends(MaterialCardsCollapsible, _super);
    function MaterialCardsCollapsible(id) {
        var _this = _super.call(this, {
            id: id,
            hasFilter: true,
            isEditable: true,
            isAddable: true,
            isDeletable: true,
            hasArchiveSwitch: true,
            connectedRepository: MaterialCardsSetup.materialCardsRepository,
        }) || this;
        _this.addNewModal = new MaterialCardModalContractor(id + '_newMaterialCard', 'Złoż wniosek', _this, 'ADD_NEW');
        _this.editModal = new MaterialCardModalContractor(id + '_editMaterialCardMaterialCardContractor', 'Edytuj wniosek (Wykonawca)', _this, 'EDIT');
        _this.editModalEngineer = new MaterialCardModalEngineer(id + '_editMaterialCardEngineer', 'Sprawdź wniosek (Inżynier)', _this, 'EDIT');
        _this.editModalEmployer = new MaterialCardModalEmployer(id + '_editMaterialEmployer', 'Dodaj uwagi (Zamawiający)', _this, 'EDIT');
        _this.initialise(_this.makeCollapsibleItemsList());
        return _this;
    }
    /*
     * Przetwarza surowe dane z repozytorium na item gotowy dla Collapsible.buildRow()
     * @param {type} connectedRepository.items[i]
     * @returns {Collapsible.Item}
     */
    MaterialCardsCollapsible.prototype.makeItem = function (dataItem) {
        var item = _super.prototype.makeItem.call(this, dataItem);
        var collapsibleItemName = '<strong>' + dataItem.id + '</strong> ' + dataItem.name;
        if (dataItem.deadline)
            collapsibleItemName += '<br>Załatwić do: <strong>' + dataItem.deadline + '</strong>';
        if (dataItem._owner)
            collapsibleItemName += ', odpowiedzialny: <strong>' + dataItem._owner.name + ' ' + dataItem._owner.surname + '</strong>';
        var editModal;
        if (dataItem.status.match(/Robocze|Do poprawy/i)) //'Robocze','Do poprawy','Do akceptacji','Zakończone'
            editModal = this.editModal;
        else
            editModal = this.editModalEngineer;
        item.editModal = editModal;
        item.name = collapsibleItemName;
        return item;
    };
    MaterialCardsCollapsible.prototype.makeBody = function (dataItem) {
        var $actionButtons = $('<div class="row">');
        if (!dataItem.status.match(/'Robocze|Zakończone/i)) {
            this.editModalEmployer.preppendTriggerButtonTo($actionButtons, 'Dodaj uwagi Zamawiającego', this);
        }
        var $versionsUl = $('<ul class="collection">');
        this.createVersionsList(dataItem, $versionsUl);
        var timestamp = (dataItem._lastUpdated) ? Tools.timestampToString(dataItem._lastUpdated) : '[czas wyświetli po odświeżeniu]';
        var description = (dataItem.description) ? dataItem.description : '';
        var engineersComment = (dataItem.engineersComment) ? dataItem.engineersComment : 'brak';
        var employersComment = (dataItem.employersComment) ? dataItem.employersComment : 'brak';
        var $panel = $('<div>')
            .attr('id', 'collapsibleBodyForMaterialCard' + dataItem.id)
            .attr('materialCardid', dataItem.id)
            .attr('status', dataItem.status)
            .append($actionButtons)
            .append('<b>Opis:</b><br>' + description + '<br>')
            .append('<b>Uwagi Inżyniera:</b><br>' + engineersComment + '<br>')
            .append('<b>Uwagi Zamawiającego:</b><br>' + employersComment + '<br>')
            .append($('<br><span class="comment">Ostania zmiana danych: ' + timestamp + ' ' +
            'przez&nbsp;' + dataItem._editor.name + '&nbsp;' + dataItem._editor.surname + '</span>'))
            .append(new Badge(dataItem.id, dataItem.status, 'light-blue').$dom)
            .append($('<br><strong>Historia zmian:</stron>'))
            .append($versionsUl);
        return {
            collection: undefined,
            $dom: $panel
        };
    };
    MaterialCardsCollapsible.prototype.createVersionsList = function (dataItem, $casesUl) {
        for (var _i = 0, _a = dataItem._versions; _i < _a.length; _i++) {
            var version = _a[_i];
            var timestamp = (version._lastUpdated) ? Tools.timestampToString(version._lastUpdated) : '[czas wyświetli po odświeżeniu]';
            var $caseLi = $('<li class="collection-item comment">');
            var caseLabel = timestamp + ': ';
            caseLabel += version._editor.name + ' ' + version._editor.surname + ' ';
            caseLabel += 'zmienił status na ';
            caseLabel += version.status;
            $caseLi.html(caseLabel);
            $casesUl.append($caseLi);
        }
    };
    return MaterialCardsCollapsible;
}(SimpleCollapsible));
