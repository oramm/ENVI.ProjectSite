"use strict";
class MilestoneModal extends Modal {
    constructor(id, title, connectedResultsetComponent, mode) {
        super(id, title, connectedResultsetComponent, mode);
        /*
        this.contractsAutoCompleteTextField = new AutoCompleteTextField(this.id+'personAutoCompleteTextField',
                                                                        'Dotyczy kontraktu',
                                                                        'info',
                                                                        false,
                                                                        'Wybierz kontrakt')
        this.contractsAutoCompleteTextField.initialise(ContractsSetup.otherContractsRepository,"_ourIdOrNumber_Name", this.onContractChosen, this);
        */
        this.typeSelectField = new SelectField(this.id + 'typeSelectField', 'Typ kamienia milowego', undefined, true);
        this.descriptionReachTextArea = new ReachTextArea(this.id + 'descriptionReachTextArea', 'Opis', false, 500);
        this.startDatePicker = new DatePicker(this.id + 'startDatePickerField', 'Początek', true);
        this.endDatePicker = new DatePicker(this.id + 'endDatePickerField', 'Koniec', true);
        this.statusSelectField = new SelectField(this.id + 'statusSelectField', 'Status', undefined, true);
        this.statusSelectField.initialise(MilestonesSetup.statusNames);
        var _this = this;
        this.formElements = [];
        if (this.mode == 'ADD_NEW')
            this.formElements
                .push({
                input: this.typeSelectField,
                dataItemKeyName: '_type',
                refreshDataSet: function () {
                    var currentMilestoneTypes = MilestonesSetup.milestoneTypesRepository.items.filter(item => item._contractType.id == ContractsSetup.contractsRepository.currentItem.typeId &&
                        this.checkMilestoneType(item));
                    //zostaw tylko elementy unique
                    currentMilestoneTypes = Tools.ArrNoDuplicates(currentMilestoneTypes);
                    this.input.initialise(currentMilestoneTypes, '_folderNumber_MilestoneTypeName', _this.onTypeChosen, _this);
                },
                checkMilestoneType(milestoneTypeItem) {
                    //wyklucz typy unikalne, dla których sprawy dodano już wcześniej
                    var allowType = true;
                    if (milestoneTypeItem.isUniquePerContract)
                        MilestonesSetup.milestonesRepository.items.map(existingMilestoneItem => {
                            if (existingMilestoneItem._type.id == milestoneTypeItem.id &&
                                existingMilestoneItem._parent.id == ContractsSetup.contractsRepository.currentItem.id)
                                //jeśli edytujesz dopuść typ istniejący taki jak ten edytowany
                                if (_this.mode == 'EDIT' &&
                                    MilestonesSetup.milestonesRepository.currentItem._type.id != existingMilestoneItem._type.id ||
                                    _this.mode != 'EDIT') {
                                    allowType = false;
                                }
                        });
                    return allowType; //caseTypeItem.milestoneTypeId==CasesSetup.currentMilestone._type.id;
                }
            });
        this.formElements
            .push({
            input: new InputTextField(this.id + 'nameTextField', 'Dopisek', undefined, false, 50),
            dataItemKeyName: 'name',
            refreshDataSet: function (chosenItem) {
                //Otwarto okno - użytkownik dodaje nowy kamień
                if (_this.mode != 'EDIT' && !chosenItem)
                    this.input.$dom.hide();
                //Otwarto okno - Użytkownik edytuje nowy kamień
                else if (_this.mode == 'EDIT' && !chosenItem) {
                    if (MilestonesSetup.milestonesRepository.currentItem._type &&
                        MilestonesSetup.milestonesRepository.currentItem._type.isUniquePerContract)
                        this.input.$dom.hide();
                    else
                        this.input.$dom.show();
                }
                //Użytkownik wybrał typ kamienia - zmienił pole Typ
                else if (chosenItem) {
                    if (chosenItem.isUniquePerContract)
                        this.input.$dom.hide();
                    else
                        this.input.$dom.show();
                }
            }
        });
        this.formElements
            .push({
            input: this.descriptionReachTextArea,
            dataItemKeyName: 'description'
        });
        this.formElements
            .push({
            input: this.startDatePicker,
            dataItemKeyName: 'startDate'
        });
        this.formElements
            .push({
            input: this.endDatePicker,
            dataItemKeyName: 'endDate'
        });
        this.formElements
            .push({
            input: this.statusSelectField,
            dataItemKeyName: 'status'
        });
        this.initialise();
    }
    /*
     * inicjuje dane przed dodaniem nowego elementu - czyści CurrentItem i ew. ustawia zmienne kontekstowe niewyświetlane w modalu
     */
    initAddNewData() {
        this.connectedResultsetComponent.connectedRepository.currentItem = {
            _parent: ContractsSetup.contractsRepository.currentItem,
            _type: { name: '' }
        };
    }
    onTypeChosen(chosenItem) {
        MilestonesSetup.milestoneTypesRepository.currentItems.push(chosenItem);
        this.formElements[1].refreshDataSet(chosenItem);
    }
}
;
