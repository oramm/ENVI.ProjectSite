class MaterialCardsCollapsible extends SimpleCollapsible {
    constructor(id) {
        super({
            id: id,
            hasFilter: true,
            isEditable: true,
            isAddable: true,
            isDeletable: true,
            hasArchiveSwitch: true,
            connectedRepository: MaterialCardsSetup.materialCardsRepository,
            //subitemsCount: 12
        });

        this.addNewModal = new MaterialCardModalContractor(id + '_newMaterialCard', 'Złoż wniosek', this, 'ADD_NEW');
        this.editModal = new MaterialCardModalEngineer(id + '_editMaterialCard', 'Edytuj wniosek', this, 'EDIT');
        this.editModalContractor = new MaterialCardModalContractor(id + '_editMaterialCardMaterialCardContractor', 'Edytuj wniosek (Wykonawca)', this, 'EDIT');

        this.initialise(this.makeCollapsibleItemsList());
    }
    /*
     * Przetwarza surowe dane z repozytorium na item gotowy dla Collapsible.buildRow()
     * @param {type} connectedRepository.items[i]
     * @returns {Collapsible.Item}
     */
    makeItem(dataItem, $bodyDom) {
        var collapsibleItemName = '<strong>' + dataItem.id + '</strong> ' + dataItem.name
        if (dataItem.deadline) collapsibleItemName += '<br>Załatwić do: <strong>' + dataItem.deadline + '</strong>';
        if (dataItem._owner) collapsibleItemName += ', odpowiedzialny: <strong>' + dataItem._owner.name + ' ' + dataItem._owner.surname + '</strong>'

        var editModal;
        if (dataItem.status.match(/Robocze|Do poprawy/i))     //'Robocze','Do poprawy','Do akceptacji','Zakończone'
            editModal = this.editModalContractor;
        else editModal = this.editModal;

        return {
            id: dataItem.id,
            name: collapsibleItemName,
            $body: $bodyDom,
            dataItem: dataItem,
            editModal: editModal
        };
    }

    makeBodyDom(dataItem) {
        var $versionsUl = $('<ul class="collection">');
        this.createVersionsList(dataItem, $versionsUl);
        var timestamp = (dataItem._lastUpdated) ? Tools.timestampToString(dataItem._lastUpdated) : '[czas wyświetli po odświeżeniu]'
        var description = (dataItem.description) ? dataItem.description : '';
        var contractorsDescription = (dataItem.contractorsDescription) ? dataItem.contractorsDescription : 'brak';

        var $panel = $('<div>')
            .attr('id', 'collapsibleBodyForMaterialCard' + dataItem.id)
            .attr('materialCardid', dataItem.id)
            .attr('status', dataItem.status)
            .append('<b>Opis:</b><br>' + description + '<br>')
            .append('<b>Uwagi:</b><br>' + contractorsDescription)
            .append($('<br><span class="comment">Ostania zmiana danych: ' + timestamp + ' ' +
                'przez&nbsp;' + dataItem._editor.name + '&nbsp;' + dataItem._editor.surname + '</span>'))
            .append(new Badge(dataItem.id, dataItem.status, 'light-blue').$dom)
            .append($('<br><strong>Historia zmian:</stron>'))
            .append($versionsUl);
        return $panel;
    }

    createVersionsList(dataItem, $casesUl) {
        for (var version of dataItem._versions) {
            var timestamp = (version._lastUpdated) ? Tools.timestampToString(version._lastUpdated) : '[czas wyświetli po odświeżeniu]'

            var $caseLi = $('<li class="collection-item comment">');
            var caseLabel = timestamp + ': ';
            caseLabel += version._editor.name + ' ' + version._editor.surname + ' ';
            caseLabel += 'zmienił status na '
            caseLabel += version.status;

            $caseLi.html(caseLabel);
            $casesUl.append($caseLi);
        }
    }

}