class ActionsMenuRawPanel extends RawPanel {
    constructor(id) {
        super({
            id: id,
            connectedRepository: MainSetup.personsRepository
        });
        this.addNewPersonModal.preppendTriggerButtonTo(this.$dom, "Dodaj brakującą osobę", this);
        this.addNewEntityModal.preppendTriggerButtonTo(this.$dom, "Dodaj brakujący podmiot", this);
        this.initialise();
    }

}