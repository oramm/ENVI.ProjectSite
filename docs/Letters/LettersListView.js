class LettersListView extends Popup {
    constructor() {
        super();
    }

    initialise() {
        this.setTittle("Pisma");
        this.actionsMenuInitialise();

        //$("#title").after(new LettersCollapsible('lettersCollapsible').$dom);
        this.dataLoaded(true);
    }

    actionsMenuInitialise() {
        this.startDateFormElement = {
            input: new DatePicker(this.id + '_startDatePickerField', 'Od', undefined, true),
            dataItemKeyName: 'startDate',
            colsPan: 4
        };
        this.endDateFormElement = {
            input: new DatePicker(this.id + '_endDatePickerField', 'Do', undefined, true),
            dataItemKeyName: 'endDate',
            colsPan: 4
        };
        this.startDateFormElement.input.setValue(new Date(new Date().getTime() - Tools.daysToMilliseconds(30)));
        this.endDateFormElement.input.setValue(new Date(new Date().getTime() + Tools.daysToMilliseconds(15)));

        this.filterRawPanel = new FilterRawPanel({
            formElements: [
                this.startDateFormElement,
                this.endDateFormElement
            ],
            parentViewObject: this,
            resultsetData: [{
                repository: LettersSetup.lettersRepository,
                route: `letters/?projectId=${LettersSetup.lettersRepository.parentItemId}`
            }],
            createResultset: () => new LettersCollapsible('lettersCollapsible')
        });
        $('#actionsMenu').append(this.filterRawPanel.$dom)
    }
}