class OurOldTypeLetterModalController extends IncomingLetterModalController {
    constructor(modal) {
        super(modal);
    }
    /*
     * Przed dodaniem nowego obiektu trzeba wyczyścić currentItem np. z ourId
     */
    initAddNewDataHandler() {
        super.initAddNewDataHandler();
        this.modal.connectedResultsetComponent.connectedRepository.currentItem.isOur = true;
    }
};