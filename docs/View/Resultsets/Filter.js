"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var Filter = /** @class */ (function () {
    function Filter(connectedResultsetComponent, showActiveRows) {
        this.id = connectedResultsetComponent.id + "-filter";
        this.connectedResultsetComponent = connectedResultsetComponent;
        this.showActiveRows = (showActiveRows === undefined) ? true : showActiveRows;
        this.filterElements = [];
        if (this.connectedResultsetComponent.hasArchiveSwitch === undefined)
            this.connectedResultsetComponent.hasArchiveSwitch = false;
        this.$dom = $('<div class="row">');
    }
    Filter.prototype.initialise = function (filterElements) {
        if (filterElements === void 0) { filterElements = []; }
        this.addDefaultFilter();
        for (var _i = 0, filterElements_1 = filterElements; _i < filterElements_1.length; _i++) {
            var element = filterElements_1[_i];
            this.addInput(element);
        }
        if (this.connectedResultsetComponent.hasArchiveSwitch) {
            this.addArchiveSwitch();
        }
    };
    Filter.prototype.addDefaultFilter = function () {
        var filterElement = {
            inputType: 'InputTextField',
            colSpan: 12,
            label: 'Filtruj listę'
        };
        this.addInput(filterElement);
    };
    Filter.prototype.addArchiveSwitch = function () {
        var filterElement = {
            serverSideReload: true,
            inputType: 'FilterSwitchInput',
            colSpan: 3,
            onLabel: 'Aktualne',
            offLabel: 'Archiwum',
            attributeToCheck: 'isArchived'
        };
        this.addInput(filterElement);
    };
    /*
     * Uruchamiana po kliknięciu w Switch Archiwum
     * @param {boolean} showArchive
     * @returns {undefined}
     */
    Filter.prototype.changeFilterCriteriaHandler = function (lastChangedFilterElement) {
        return __awaiter(this, void 0, void 0, function () {
            var _this, $filteredListObject;
            return __generator(this, function (_a) {
                if (lastChangedFilterElement.serverSideReload) {
                    this.connectedResultsetComponent.reload();
                }
                _this = this;
                if (this.connectedResultsetComponent.$collapsible)
                    $filteredListObject = this.connectedResultsetComponent.$collapsible;
                else if (this.connectedResultsetComponent.$collection)
                    $filteredListObject = this.connectedResultsetComponent.$collection;
                $filteredListObject.children("li").map(function () {
                    if (!_this.checkIfRowMatchesFilters($(this)))
                        $(this).hide();
                    else
                        $(this).show();
                });
                return [2 /*return*/];
            });
        });
    };
    /*
     * tworzy paramatry zapytania GET do serwer - pierwszy człon jest tworzony w Resultset
     */
    Filter.prototype.makeRequestParams = function () {
        var paramsString = '';
        for (var _i = 0, _a = this.filterElements; _i < _a.length; _i++) {
            var filterElement = _a[_i];
            if (filterElement.serverSideReload)
                paramsString += "&" + filterElement.attributeToCheck + "=" + filterElement.input.getValue();
        }
        return paramsString;
    };
    /*
     * Sprawdza czy wiersz connectedResultsetComponent pasuje do kreyteriów wyszukiwania
     * @param {type} $row
     * @returns {Filter@call;isRowArchived|Boolean}
     *
     * //TODO: obsłużyć dodatkowe pola
     * https://www.w3schools.com/bootstrap/bootstrap_filters.asp
     */
    Filter.prototype.checkIfRowMatchesFilters = function ($row) {
        for (var _i = 0, _a = this.filterElements; _i < _a.length; _i++) {
            var filterElement = _a[_i];
            if (!filterElement.serverSideReload)
                switch (filterElement.inputType) {
                    case 'InputTextField':
                        if (!$row.text().toLowerCase().includes(filterElement.input.getValue().toLowerCase()))
                            return false;
                        break;
                    case 'FilterSwitchInput':
                        if ($row.attr(filterElement.attributeToCheck) !== undefined) {
                            var attrValueIsPositive = $row.attr(filterElement.attributeToCheck).match(filterElement.searchedRegex);
                            attrValueIsPositive = (!attrValueIsPositive) ? false : true;
                            var valeshouldBepositive = this.filterElements[this.filterElements.length - 1].input.getValue();
                            if (attrValueIsPositive != valeshouldBepositive)
                                return false;
                        }
                        break;
                    case 'SelectField':
                        if (filterElement.input.getValue() && $row.attr(filterElement.attributeToCheck) != filterElement.input.getValue())
                            return false;
                        break;
                }
        }
        return true;
    };
    /*
     * dodaje niestandardowy element do filtra (lista i $dom)
     */
    Filter.prototype.addInput = function (filterElement) {
        switch (filterElement.inputType) {
            case 'InputTextField':
                filterElement.input = this.createInputTextField(filterElement);
                break;
            case 'FilterSwitchInput':
                filterElement.input = new FilterSwitchInput(filterElement, this);
                break;
            case 'SelectField':
                filterElement.input = this.createSelectField(filterElement);
                break;
            default:
                throw new Error(filterElement.inputType + " to niewłaściwy typ pola filtrującego!");
        }
        var $col = $('<div>');
        this.filterElements.push(filterElement);
        this.$dom
            .append($col).children(':last-child')
            .append(filterElement.input.$dom);
        this.setElementSpan(filterElement, filterElement.colSpan);
        //skoryguj szerokość gównego pola filtrowania
        var newDefaultElementColspan = 12 - this.totalElementsColsPan();
        this.filterElements[0].input.$dom.removeClass('col s' + this.filterElements[0].colSpan);
        this.setElementSpan(this.filterElements[0], newDefaultElementColspan);
    };
    /*
     * Ustawia szerokość elementu w siatce GUI
     */
    Filter.prototype.setElementSpan = function (filterElement, colSpan) {
        filterElement.colSpan = colSpan;
        filterElement.input.$dom.addClass('col s' + filterElement.colSpan);
    };
    /*
     * Podstawowe pole filtrowania
     */
    Filter.prototype.createInputTextField = function (filterElement) {
        var textField = new InputTextField(this.id + this.filterElements.length, filterElement.label);
        var _this = this;
        textField.$input.on("keyup", function () {
            _this.changeFilterCriteriaHandler(filterElement);
        });
        return textField;
    };
    Filter.prototype.createSelectField = function (filterElement) {
        var selectField = new SelectField(this.id + this.filterElements.length, filterElement.label, undefined, false, 'Wszystkie');
        selectField.initialise(filterElement.selectItems, filterElement, this.changeFilterCriteriaHandler, this);
        return selectField;
    };
    Filter.prototype.totalElementsColsPan = function () {
        var colSpan = 0;
        for (var _i = 0, _a = this.filterElements; _i < _a.length; _i++) {
            var element = _a[_i];
            colSpan += element.colSpan;
        }
        return colSpan;
    };
    return Filter;
}());
