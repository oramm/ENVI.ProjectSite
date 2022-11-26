"use strict";
/*
 * @type AutoCompleteTextField
 * Używać tego następująco:
 * 1. tworzymy obiekt
 * 2. dodajemy $dom do formularza
 * 3. wywołujemy initialise();
 */
var AutoCompleteTextField_1 = /** @class */ (function () {
    function AutoCompleteTextField_1(id, label, icon, isRequired) {
        this.id = id;
        this.label = label;
        this.icon = icon;
        this.isRequired = isRequired;
        this.$dom;
        this.createAutoCompleteTextField(id, label, icon, isRequired);
    }
    AutoCompleteTextField_1.prototype.initialise = function (repository, key, onCompleteCallBack, viewObject) {
        this.repository = repository;
        this.objectList = repository.items;
        this.key = key;
        this.onCompleteCallBack = onCompleteCallBack;
        this.viewObject = viewObject;
        this.chosenItem;
        this.isRequired = false;
        this.pushData(this.key);
    };
    AutoCompleteTextField_1.prototype.createAutoCompleteTextField = function (id, label, icon, isRequired) {
        this.$dom = $('<div class="input-field">');
        var $icon = $('<i class="material-icons prefix">' + icon + '</i>');
        var $input = $('<input name="' + id + '" type="text" class="autocomplete" autocomplete="off">')
            .attr('id', id);
        var $label = $('<label for="' + id + '">' + label + '</label>');
        if (isRequired) {
            $input
                .attr('required', 'true')
                .attr('pattern', '[]');
            this.isRequired = true;
        }
        this.$dom
            .append($icon)
            .append($input)
            .append($label);
        return this.$dom;
    };
    AutoCompleteTextField_1.prototype.pushData = function (key) {
        var _this_1 = this;
        var autocompleteList = {};
        var _this = this;
        Object.keys(this.objectList).forEach(function (id) {
            _this;
            autocompleteList[_this_1.objectList[id][key]] = null;
        });
        // Plugin initialization
        $('input.autocomplete').autocomplete({
            //this.$dom.children('input.autocomplete').autocomplete({
            data: autocompleteList,
            limit: 20,
            onAutocomplete: function (inputValue) {
                _this_1.setValue(inputValue);
                if (typeof _this_1.onCompleteCallBack === "function") {
                    _this_1.onCompleteCallBack.apply(_this_1.viewObject, [inputValue]);
                }
            },
            minLength: 1 // The minimum length of the input for the autocomplete to start. Default: 1.
        });
    };
    AutoCompleteTextField_1.prototype.setValue = function (inputValue) {
        this.chosenItem = Tools.search(inputValue, this.key, this.repository.items);
        this.repository.selectedItem = this.chosenItem;
        if (this.chosenItem !== undefined)
            this.$dom.children('input').attr('pattern', '^' + inputValue + '$');
        this.$dom.children('input').val(inputValue);
    };
    return AutoCompleteTextField_1;
}());
