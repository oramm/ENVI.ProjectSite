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
var ProjectDetailsCollection = /** @class */ (function (_super) {
    __extends(ProjectDetailsCollection, _super);
    function ProjectDetailsCollection(id) {
        var _this = _super.call(this, {
            id: id,
            //isPlain: false, 
            hasFilter: false,
            isEditable: false,
            isAddable: false,
            isDeletable: false,
            isSelectable: false
        }) || this;
        _this.connectedRepository = MainSetup.projectsRepository;
        _this.editModal = new ProjectsDetailsModal(_this.id + '_editProject', 'Edytuj dane projektu', _this, 'EDIT');
        _this.$externalLinks = $('<span class="externalLinks">');
        _this.initialise(_this.makeList());
        _this.$addCalendarButton;
        return _this;
    }
    ProjectDetailsCollection.prototype.actionsMenuInitialise = function () {
        this.$actionsMenu.append(this.editModal.createTriggerIcon(this));
        //this.$actionsMenu.append(FormTools.createModalTriggerIcon(this.editModal.id,'edit',this));
        if (!this.connectedRepository.currentItem.googleCalendarId) {
            this.$addCalendarButton = FormTools.createFlatButton('Utwórz kalendarz', this.createCalendar, this);
            this.$actionsMenu.append(this.$addCalendarButton);
        }
        this.appendIconToExternalLinks('../Resources/View/Google-Drive-icon.png', this.connectedRepository.currentItem._gdFolderUrl);
        this.appendIconToExternalLinks('../Resources/View/Google-Groups-icon.png', this.connectedRepository.currentItem._googleGroupUrl);
        this.appendIconToExternalLinks('../Resources/View/Google-Calendar-icon.png', this.connectedRepository.currentItem._googleCalendarUrl);
        this.$actionsMenu.append(this.$externalLinks);
        this.setEditAction();
    };
    ProjectDetailsCollection.prototype.appendIconToExternalLinks = function (icon, url) {
        if (url)
            this.$externalLinks
                .append('<a  target="_blank "href="' + url + '">' +
                '<img height=25px src="' + icon + '"></a>');
    };
    //uruchamiana po kliknięciu w menu
    ProjectDetailsCollection.prototype.createCalendar = function () {
        var _this = this;
        var $preloader = this.makePreloader('add_calendar_preloader');
        this.$dom.append($preloader);
        this.connectedRepository.doServerFunction('addProjectCalendar', JSON.stringify({ id: this.connectedRepository.currentItem.id }))
            .then(function (result) {
            _this.connectedRepository.currentItem.googleCalendarId = result.googleCalendarId;
            _this.connectedRepository.currentItem.googleCalendarUrl = result.googleCalendarUrl;
            _this.$addCalendarButton.remove();
            _this.appendIconToExternalLinks('../Resources/View/Google-Calendar-icon.png', _this.connectedRepository.currentItem.googleCalendarUrl);
            $preloader.remove();
        });
    };
    /*
     * Dodano atrybut z ContractId, żeby szybciej filtorwac widok po stronie klienra zamiast przez SELECT z db
     */
    ProjectDetailsCollection.prototype.makeList = function () {
        var itemsList = [];
        itemsList[0] = new CollectionItem('projectId', 'info', //icon
        MainSetup.currentProject.ourId, MainSetup.currentProject.name);
        itemsList[1] = new CollectionItem('employers', 'business', //icon
        'Podmioty zarządzające', this.makeEmployersDescription() + '<br>' + this.makeEngineersDescription());
        itemsList[2] = new CollectionItem('projectId', 'date_range', //icon
        MainSetup.currentProject.status, 'Rozpoczęcie: ' + MainSetup.currentProject.startDate + '<BR>' +
            'Zakończenie: ' + MainSetup.currentProject.endDate);
        itemsList[3] = new CollectionItem('technicalDescription', 'info', //icon
        'Zakres rzeczowy', MainSetup.currentProject.comment);
        var totalValue = new Intl.NumberFormat('pl-PL', { style: 'currency', currency: 'PLN' }).format(MainSetup.currentProject.totalValue);
        var qualifiedValue = new Intl.NumberFormat('pl-PL', { style: 'currency', currency: 'PLN' }).format(MainSetup.currentProject.qualifiedValue);
        var dotationValue = new Intl.NumberFormat('pl-PL', { style: 'currency', currency: 'PLN' }).format(MainSetup.currentProject.dotationValue);
        itemsList[4] = new CollectionItem('financialDescription', 'euro_symbol', //icon
        'Dane finansowe', 'Wartość całkowita netto: ' + totalValue + '<BR>' +
            'Wydatki kwalifikowalne: ' + qualifiedValue + '<BR>' +
            'Wartość dotacji: ' + dotationValue, MainSetup.currentProject.financialComment);
        return itemsList;
    };
    ProjectDetailsCollection.prototype.makeEmployersDescription = function () {
        var description = '';
        if (this.connectedRepository.currentItem._employers.length > 0) {
            description = 'Zamawiający/Beneficjent: ';
            for (var i = 0; i < this.connectedRepository.currentItem._employers.length; i++) {
                description += this.connectedRepository.currentItem._employers[i].name;
                if (this.connectedRepository.currentItem._employers[i].address)
                    description += ', ' + this.connectedRepository.currentItem._employers[i].address;
            }
        }
        return description;
    };
    ProjectDetailsCollection.prototype.makeEngineersDescription = function () {
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
    };
    ProjectDetailsCollection.prototype.makeItem = function (dataItem) {
        //funkcja zbędna, ale musi być zaimplementowana bo wymaga tego Collection
    };
    /*
     * funkcja wywoływana w repository, potrzebny trik z appply dla callbacka
     * @param {String} status
     * @param {CollectionItem} item
     * @param {String} errorMessage
     * @returns {Promise}
     */
    ProjectDetailsCollection.prototype.editHandler = function (status, item, errorMessage) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            switch (status) {
                case "DONE":
                    _this.oldItems = [];
                    var $oldCollection = _this.$dom.find('#' + _this.id + '_collectionToDelete');
                    $oldCollection.remove();
                    _this.$dom.find('.progress').remove();
                    //if (this.isDeletable) this.setDeleteAction();
                    break;
                case "PENDING":
                    _this.oldItems = _this.items;
                    _this.items = _this.makeList();
                    _this.$collection.hide();
                    _this.$collection.attr('id', _this.id + '_collectionToDelete');
                    _this.$collection = $('<ul class="collection">');
                    _this.$dom.append(_this.$collection);
                    _this.buildCollectionDom();
                    _this.$dom.append(_this.makePreloader('preloader' + item.id));
                    break;
                case "ERROR":
                    alert(errorMessage);
                    _this.items = _this.oldItems;
                    _this.$collection.remove();
                    var $oldCollection = _this.$dom.find('#' + _this.id + '_collectionToDelete');
                    _this.$collection = $oldCollection;
                    $oldCollection.show(1000);
                    _this.$collection.removeAttr('id');
                    _this.$dom.find('.progress').remove();
                    break;
            }
            resolve(status);
        });
    };
    return ProjectDetailsCollection;
}(Collection));
