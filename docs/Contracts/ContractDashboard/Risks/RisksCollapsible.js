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
var RisksCollapsible = /** @class */ (function (_super) {
    __extends(RisksCollapsible, _super);
    function RisksCollapsible(id) {
        var _this = _super.call(this, {
            id: id,
            hasFilter: true,
            isEditable: true,
            isAddable: true,
            isDeletable: true,
            connectedRepository: RisksSetup.risksRepository
            //subitemsCount: 12
        }) || this;
        _this.addNewModal = new RiskModal(id + '_newRisk', 'Zgłoś ryzyko', _this, 'ADD_NEW');
        _this.editModal = new RiskModal(id + '_editRisk', 'Edytuj rysyko', _this, 'EDIT');
        //modale dla ReactionsCollection:
        _this.addNewReactionModal = new ReactionModal(_this.id + '_newReaction', 'Dodaj zadanie', _this, 'ADD_NEW');
        _this.editReactionModal = new ReactionModal(_this.id + '_editReaction', 'Edytuj zadanie', _this, 'EDIT');
        _this.initialise(_this.makeCollapsibleItemsList());
        return _this;
        //trzeba zainicjować dane parentów na wypadek dodania nowego obiektu
        //funkcja Modal.submitTrigger() bazuje na danych w this.connectedRepository.currentItem
        //this.connectedRepository.currentItem._parent =  RisksSetup.milestonesRepository.currentItem;
        //this.connectedRepository.currentItem._parent._parent = RisksSetup.contractsRepository.currentItem;
    }
    /*
     * Przetwarza surowe dane z repozytorium na item gotowy dla Collapsible.buildRow()
     * @param {type} connectedRepository.items[i]
     * @returns {Collapsible.Item}
     */
    RisksCollapsible.prototype.makeItem = function (dataItem) {
        var item = _super.prototype.makeItem.call(this, dataItem);
        var folderNumber = (dataItem._case._type.folderNumber) ? dataItem._case._type.folderNumber : '';
        var typeName = dataItem._case._type.name;
        var name = (dataItem._case.name) ? dataItem._case.name : '';
        dataItem._rate = dataItem.probability * dataItem.overallImpact;
        item.name = dataItem._parent._folderNumber + ' ' + dataItem._parent._type.name + ' | ' +
            folderNumber + ' ' + typeName + ' | ' + name + '<BR>' +
            'Stopień: <strong>' + dataItem._rate + '<strong>';
        return item;
    };
    RisksCollapsible.prototype.makeBody = function (dataItem) {
        var subCollection = new ReactionsCollection({
            id: 'reactionsListCollection_' + dataItem.id,
            parentDataItem: dataItem._case,
            title: 'Reakcje na ryzyko',
            isAddable: true
        });
        var $panel = $('<div>')
            .attr('id', 'reactionsActionsMenuForRisk' + dataItem.id)
            .attr('riskid', dataItem.id)
            .append(subCollection.$dom);
        return {
            collection: subCollection,
            $dom: $panel
        };
    };
    return RisksCollapsible;
}(SimpleCollapsible));
