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
var LettersCollapsible = /** @class */ (function (_super) {
    __extends(LettersCollapsible, _super);
    function LettersCollapsible(id) {
        var _this = _super.call(this, {
            id: id,
            hasFilter: true,
            isEditable: true,
            isAddable: false,
            isDeletable: true,
            hasArchiveSwitch: false,
            connectedRepository: LettersSetup.lettersRepository
            //subitemsCount: 12
        }) || this;
        _this.addNewIncomingLetterModal = new IncomingLetterModal(id + '_newIncomingLetterModal', 'Rejestruj pismo przychodzące', _this, 'ADD_NEW');
        _this.editIncomingLetterModal = new IncomingLetterModal(id + '_editIncomingLetterModal', 'Edytuj dane pisma przychodzącego', _this, 'EDIT');
        _this.addNewOurLetterModal = new OurLetterModal(id + '_newOurLetterModal', 'Rejestruj pismo wychodzące', _this, 'ADD_NEW');
        _this.editOurLetterModal = new OurLetterModal(id + '_editOurLetterModal', 'Edytuj dane pisma wychodzącego', _this, 'EDIT');
        _this.addNewOurOldTypeLetterModal = new OurOldTypeLetterModal(id + '_OurOldTypeLetterModal', 'Rejestruj email', _this, 'ADD_NEW');
        _this.editOurOldTypeLetterModal = new OurOldTypeLetterModal(id + '_editOurOldTypeLetterModal', 'Edytuj dane pisma wychodzącego po staremu', _this, 'EDIT');
        _this.addNewIncomingLetterModal.preppendTriggerButtonTo(_this.$actionsMenu, "Rejestruj przychodzące", _this);
        _this.addNewOurLetterModal.preppendTriggerButtonTo(_this.$actionsMenu, "Rejestruj wychodzące", _this);
        _this.addNewOurOldTypeLetterModal.preppendTriggerButtonTo(_this.$actionsMenu, "Rejestruj email", _this, 'FLAT');
        var entityRawPanel = new RawPanel({
            id: 'newEntityRawPanel',
            connectedRepository: MainSetup.entitiesRepository
        });
        entityRawPanel.initialise(new EntityModal('newEntityModal', 'Dodaj podmiot', entityRawPanel, 'ADD_NEW'), 'FLAT');
        _this.$actionsMenu.append(entityRawPanel.$dom);
        _this.appendLetterAttachmentsModal = new AppendLetterAttachmentsModal(id + '_appendLetterAttachmentsModal', 'Dodaj załączniki', _this, 'EDIT');
        _this.initialise(_this.makeCollapsibleItemsList());
        return _this;
    }
    /*
     * Przetwarza surowe dane z repozytorium na item gotowy dla Collapsible.buildRow()
     * @param {type} connectedRepository.items[i]
     * @returns {Collapsible.Item}
     */
    LettersCollapsible.prototype.makeItem = function (dataItem) {
        var item = _super.prototype.makeItem.call(this, dataItem);
        var editModal;
        if (dataItem.isOur) {
            if (dataItem.number == dataItem.id)
                editModal = this.editOurLetterModal;
            else
                editModal = this.editOurOldTypeLetterModal;
        }
        else
            editModal = this.editIncomingLetterModal;
        var name = '';
        name += '<strong>' + dataItem.creationDate + '</strong> ' + dataItem.description + '<Br>';
        name += 'Numer&nbsp;<strong>' + dataItem.number + '</strong>, ';
        name += (dataItem.isOur) ? 'Nadano:&nbsp;' : 'Otrzymano:&nbsp;';
        name += '<strong>' + dataItem.registrationDate + '</strong>, ';
        name += (dataItem.isOur) ? 'Odbiorca:&nbsp;' : 'Nadawca:&nbsp;';
        name += this.makeEntitiesLabel(dataItem._entitiesMain);
        item.name = name;
        item.editModal = editModal;
        return item;
    };
    LettersCollapsible.prototype.makeEntitiesLabel = function (entities) {
        var label = '';
        for (var i = 0; i < entities.length - 1; i++) {
            label += entities[i].name + ', ';
        }
        if (entities[i])
            label += entities[i].name;
        return label;
    };
    LettersCollapsible.prototype.makeBody = function (dataItem) {
        var $actionButtons = $('<div class="row">');
        //if (dataItem._canUserChangeFileOrFolder)
        this.appendLetterAttachmentsModal.preppendTriggerButtonTo($actionButtons, 'Dodaj załączniki', this);
        var $casesUl = $('<ul class="collection">');
        this.createCasesList(dataItem, $casesUl);
        var timestamp = (dataItem._lastUpdated) ? Tools.timestampToString(dataItem._lastUpdated) : '[czas wyświetli po odświeżeniu]';
        var $panel = $('<div>')
            .attr('id', 'collapsibleBody' + dataItem.id)
            .attr('letterId', dataItem.id)
            .append($actionButtons)
            .append($('<strong>Dotyczy spraw:</stron>'))
            .append($casesUl)
            .append($('<span class="comment">Ostania zmiana: ' + timestamp + ' ' +
            'przez&nbsp;' + dataItem._editor.name + '&nbsp;' + dataItem._editor.surname + '</span>'));
        return {
            collection: undefined,
            $dom: $panel
        };
    };
    LettersCollapsible.prototype.createCasesList = function (dataItem, $casesUl) {
        for (var i = 0; i < dataItem._cases.length; i++) {
            var $caseLi = $('<li class="collection-item">');
            var caseLabel;
            if (dataItem._cases[i]._parent._parent.ourId)
                caseLabel = dataItem._cases[i]._parent._parent.ourId;
            else
                caseLabel = dataItem._cases[i]._parent._parent.number;
            caseLabel += ', ' + dataItem._cases[i]._parent._type._folderNumber + ' ' +
                dataItem._cases[i]._parent._type.name +
                ' | ';
            caseLabel += dataItem._cases[i]._typeFolderNumber_TypeName_Number_Name;
            $caseLi.html(caseLabel);
            $casesUl.append($caseLi);
        }
    };
    return LettersCollapsible;
}(SimpleCollapsible));
