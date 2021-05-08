class ProjectDetailsCollection extends Collection {
    constructor(id) {
        super({
            id: id,
            //isPlain: false, 
            hasFilter: false,
            isEditable: false,
            isAddable: false,
            isDeletable: false,
            isSelectable: false
        });
        this.connectedRepository = MainSetup.projectsRepository;
        this.editModal = new ProjectsDetailsModal(this.id + '_editProject', 'Edytuj dane projektu', this, 'EDIT');

        this.$externalLinks = $('<span class="externalLinks">');
        this.initialise(this.makeList());
        this.$addCalendarButton;
    }

    actionsMenuInitialise() {
        this.$actionsMenu.append(this.editModal.createTriggerIcon(this));
        //this.$actionsMenu.append(FormTools.createModalTriggerIcon(this.editModal.id,'edit',this));
        if (!this.connectedRepository.currentItem.googleCalendarId) {
            this.$addCalendarButton = FormTools.createFlatButton('Utwórz kalendarz', this.createCalendar, this)
            this.$actionsMenu.append(this.$addCalendarButton);
        }
        this.appendIconToExternalLinks('../Resources/View/Google-Drive-icon.png', this.connectedRepository.currentItem._gdFolderUrl);
        this.appendIconToExternalLinks('../Resources/View/Google-Groups-icon.png', this.connectedRepository.currentItem._googleGroupUrl);
        this.appendIconToExternalLinks('../Resources/View/Google-Calendar-icon.png', this.connectedRepository.currentItem._googleCalendarUrl);

        this.$actionsMenu.append(this.$externalLinks);
        this.setEditAction();
    }
    appendIconToExternalLinks(icon, url) {
        if (url)
            this.$externalLinks
                .append('<a  target="_blank "href="' + url + '">' +
                    '<img height=25px src="' + icon + '"></a>');
    }
    //uruchamiana po kliknięciu w menu
    createCalendar() {
        var $preloader = this.makePreloader('add_calendar_preloader');
        this.$dom.append($preloader);
        this.connectedRepository.doServerFunction('addProjectCalendar', JSON.stringify({ id: this.connectedRepository.currentItem.id }))
            .then((result) => {//window.alert(result.googleCalendarUrl);
                this.connectedRepository.currentItem.googleCalendarId = result.googleCalendarId;
                this.connectedRepository.currentItem.googleCalendarUrl = result.googleCalendarUrl;
                this.$addCalendarButton.remove();
                this.appendIconToExternalLinks('../Resources/View/Google-Calendar-icon.png', this.connectedRepository.currentItem.googleCalendarUrl);
                $preloader.remove();
            });
    }

    /*
     * Dodano atrybut z ContractId, żeby szybciej filtorwac widok po stronie klienra zamiast przez SELECT z db
     */
    makeList() {
        var itemsList = [];

        itemsList[0] = new CollectionItem('projectId',
            'info', //icon
            MainSetup.currentProject.ourId,
            MainSetup.currentProject.name
        );
        itemsList[1] = new CollectionItem('employers',
            'business', //icon
            'Podmioty zarządzające',
            this.makeEmployersDescription() + '<br>' + this.makeEngineersDescription()
        );
        itemsList[2] = new CollectionItem('projectId',
            'date_range', //icon
            MainSetup.currentProject.status,
            'Rozpoczęcie: ' + MainSetup.currentProject.startDate + '<BR>' +
            'Zakończenie: ' + MainSetup.currentProject.endDate
        );
        itemsList[3] = new CollectionItem('technicalDescription',
            'info', //icon
            'Zakres rzeczowy',
            MainSetup.currentProject.comment
        );
        var totalValue = new Intl.NumberFormat('pl-PL', { style: 'currency', currency: 'PLN' }).format(MainSetup.currentProject.totalValue);
        var qualifiedValue = new Intl.NumberFormat('pl-PL', { style: 'currency', currency: 'PLN' }).format(MainSetup.currentProject.qualifiedValue);
        var dotationValue = new Intl.NumberFormat('pl-PL', { style: 'currency', currency: 'PLN' }).format(MainSetup.currentProject.dotationValue);
        itemsList[4] = new CollectionItem('financialDescription',
            'euro_symbol', //icon
            'Dane finansowe',
            'Wartość całkowita netto: ' + totalValue + '<BR>' +
            'Wydatki kwalifikowalne: ' + qualifiedValue + '<BR>' +
            'Wartość dotacji: ' + dotationValue,
            MainSetup.currentProject.financialComment
        );
        return itemsList;
    }

    makeEmployersDescription() {
        var description = '';
        if (this.connectedRepository.currentItem._employers.length > 0) {
            description = 'Zamawiający/Beneficjent: '
            for (var i = 0; i < this.connectedRepository.currentItem._employers.length; i++) {
                description += this.connectedRepository.currentItem._employers[i].name;
                if (this.connectedRepository.currentItem._employers[i].address)
                    description += ', ' + this.connectedRepository.currentItem._employers[i].address;
            }
        }
        return description;
    }

    makeEngineersDescription() {
        var description = '';
        if (this.connectedRepository.currentItem._engineers.length > 0) {
            description = 'Inżynier: ';
            for (var i = 0; i < this.connectedRepository.currentItem._engineers.length; i++) {
                description += this.connectedRepository.currentItem._engineers[i].name;
                if (this.connectedRepository.currentItem._engineers[i].address)
                    description += ', ' + this.connectedRepository.currentItem._engineers[i].address;
            }
        }
        return description;
    }

    makeItem(dataItem) {
        //funkcja zbędna, ale musi być zaimplementowana bo wymaga tego Collection
    }

    /*
     * funkcja wywoływana w repository, potrzebny trik z appply dla callbacka
     * @param {String} status
     * @param {CollectionItem} item
     * @param {String} errorMessage
     * @returns {Promise}
     */
    editHandler(status, item, errorMessage) {
        return new Promise((resolve, reject) => {
            switch (status) {
                case "DONE":
                    this.oldItems = [];
                    var $oldCollection = this.$dom.find('#' + this.id + '_collectionToDelete');
                    $oldCollection.remove();
                    this.$dom.find('.progress').remove();
                    //if (this.isDeletable) this.setDeleteAction();
                    break;
                case "PENDING":
                    this.oldItems = this.items;
                    this.items = this.makeList();
                    this.$collection.hide();
                    this.$collection.attr('id', this.id + '_collectionToDelete');
                    this.$collection = $('<ul class="collection">');
                    this.$dom.append(this.$collection);
                    this.buildCollectionDom();

                    this.$dom.append(this.makePreloader('preloader' + item.id));

                    break;
                case "ERROR":
                    alert(errorMessage);
                    this.items = this.oldItems;
                    this.$collection.remove();
                    var $oldCollection = this.$dom.find('#' + this.id + '_collectionToDelete');
                    this.$collection = $oldCollection;
                    $oldCollection.show(1000);
                    this.$collection.removeAttr('id');
                    this.$dom.find('.progress').remove();

                    break;
            }
            resolve(status);
        });
    }
}