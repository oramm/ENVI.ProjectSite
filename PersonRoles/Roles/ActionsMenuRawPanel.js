class ActionsMenuRawPanel extends RawPanel {
    constructor(id) {
        super({
            id: id,
            connectedRepository: MainSetup.personsRepository
        });
        this.addNewPersonModal = new PersonModal(id + '_newPersonModal', 'Dodaj osobę', this, 'ADD_NEW');
        this.addNewEntityModal = new EntityModal(id + '_newEntityModal', 'Dodaj podmiot', this, 'ADD_NEW');

        this.addNewPersonModal.preppendTriggerButtonTo(this.$dom, "Dodaj brakującą osobę", this);
        this.addNewEntityModal.preppendTriggerButtonTo(this.$dom, "Dodaj brakujący podmiot", this);
        this.initialise();
    }

}