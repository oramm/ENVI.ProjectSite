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
/*
 * @type AutoCompleteTextField
 * Używać tego następująco:
 * 1. tworzymy obiekt
 * 2. dodajemy $dom do formularza
 * 3. wywołujemy initialise();
 */
var AutoCompleteTextField = /** @class */ (function () {
    function AutoCompleteTextField(id, label, icon, isRequired) {
        this.id = id;
        this.label = label;
        this.icon = icon;
        this.isRequired = isRequired;
        this.$dom;
        this.$label;
        this.buildDom(id, icon, isRequired);
    }
    AutoCompleteTextField.prototype.initialise = function (repository, key, onCompleteCallBack, viewObject) {
        this.repository = repository;
        this.objectList = [];
        this.key = key;
        this.onCompleteCallBack = onCompleteCallBack;
        this.viewObject = viewObject;
        this.chosenItem;
        this.pushData(this.key);
    };
    AutoCompleteTextField.prototype.buildDom = function (id, icon, isRequired) {
        this.$dom = $('<div class="input-field">');
        var $icon = $('<i class="material-icons prefix">' + icon + '</i>');
        var $input = $('<input name="' + id + '" type="search" autocomplete="off" class="autocomplete">')
            .attr('id', id);
        this.$label = $('<label>');
        this.setLabel(this.label);
        if (isRequired) {
            $input
                .attr('required', 'true')
                .attr('pattern', '[]');
            this.isRequired = isRequired;
        }
        this.$dom
            .append($icon)
            .append($input)
            .append(this.$label);
        return this.$dom;
    };
    AutoCompleteTextField.prototype.setLabel = function (label) {
        this.label = label;
        //this.$label = $('<label for="'+ id +'">'+ this.label +'</label>');
        this.$label
            .attr('for', this.id)
            .text(this.label);
    };
    AutoCompleteTextField.prototype.pushData = function (key) {
        var _this_1 = this;
        var autocompleteList = {};
        Object.keys(this.repository.items).forEach(function (id) {
            if (_this_1.repository.items[id][key] !== undefined) {
                _this_1.objectList.push(_this_1.repository.items[id]);
                autocompleteList[_this_1.repository.items[id][key]] = null;
            }
        });
        // Plugin initialization
        this.$dom.children('input.autocomplete').autocomplete({
            data: autocompleteList,
            limit: 20,
            onAutocomplete: function (inputValue) {
                _this_1.setValue(inputValue);
            },
            minLength: 1,
            onChange: function () { return alert(inputValue); }
        });
    };
    AutoCompleteTextField.prototype.setValue = function (inputValue) {
        if (inputValue !== undefined) {
            //inputValue pochodzi z formularza
            if (typeof inputValue !== 'object') {
                this.chosenItem = Tools.search(inputValue, this.key, this.repository.items);
                this.repository.currentItem = this.chosenItem;
                if (this.chosenItem)
                    this.$dom.children('input').attr('pattern', '^' + inputValue + '$');
                this.$dom.children('input').val(inputValue);
            }
            //inputValue pochodzi z repository i jest obiektem
            else {
                this.chosenItem = inputValue;
                //zakłądam, że oiekt posiada atrybut this.key
                inputValue = inputValue[this.key];
            }
            if (this.chosenItem)
                this.$dom.children('input').attr('pattern', '^' + inputValue + '$');
            this.$dom.children('input').val(inputValue);
            //this.onCompleteCallBack powinien być zadeklarowany w modalu
            if (typeof this.onCompleteCallBack === "function") {
                this.onCompleteCallBack.apply(this.viewObject, [this.chosenItem]);
            }
        }
    };
    AutoCompleteTextField.prototype.setDefaultValue = function () {
        if (this.objectList.length === 1)
            this.setValue(this.objectList[0]);
    };
    AutoCompleteTextField.prototype.clearInput = function () {
        this.$dom.children('input').val('');
    };
    AutoCompleteTextField.prototype.clearChosenItem = function () {
        this.chosenItem = undefined;
        this.repository.currentItem = {};
        this.repository.currentItems = [];
        this.clearInput;
    };
    return AutoCompleteTextField;
}());
var SelectField = /** @class */ (function () {
    /*
     *
     * @param {type} id
     * @param {type} label
     * @param {type} icon
     * @param {type} isRequired
     * @returns {SelectField}
     */
    function SelectField(id, label, icon, isRequired, defaultDisabledOption) {
        if (defaultDisabledOption === void 0) { defaultDisabledOption = "Wybierz opcję"; }
        this.id = id;
        this.label = label;
        this.icon = icon;
        this.isRequired = isRequired;
        this.chosenItem;
        this.$dom;
        this.$select;
        this.defaultDisabledOption = defaultDisabledOption;
        this.buildDom(id, label, icon, isRequired);
    }
    SelectField.prototype.initialise = function (optionsData, key, onItemSelectedHandler, viewObject) {
        this.$select.empty();
        this.optionsData = optionsData;
        this.key = key;
        this.onItemSelectedHandler = onItemSelectedHandler;
        this.viewObject = viewObject;
        //this.$select.append('<option value="" disabled selected>' + this.defaultDisabledOption + '</option>');
        var $emptyOption = $('<option>')
            .attr('value', '')
            .attr('selected', '')
            .text(this.defaultDisabledOption);
        if (this.isRequired)
            $emptyOption.attr('disabled', '');
        this.$select.append($emptyOption);
        if (typeof optionsData[0] !== 'object')
            this.pushDataFromStringList();
        else
            this.pushDataFromObjectsList();
        this.$dom.find('select').material_select();
        if (this.isRequired) {
            var regex = new RegExp('^((?!' + this.defaultDisabledOption + ').)*$');
            this.$dom.find('input').attr('pattern', regex);
        }
        this.setOnchangeAction();
    };
    //this.optionsData jest typu Object
    SelectField.prototype.pushDataFromObjectsList = function () {
        for (var i = 0; i < this.optionsData.length; i++) {
            var $option = $('<option>')
                .attr('value', '' + i)
                .text(this.optionsData[i][this.key]);
            this.$select.append($option);
        }
    };
    SelectField.prototype.pushDataFromStringList = function () {
        for (var i in this.optionsData) {
            var $option = $('<option>')
                .attr('value', '' + i)
                .text(this.optionsData[i]);
            this.$select.append($option);
        }
    };
    SelectField.prototype.buildDom = function (id, label) {
        this.$dom = $('<div class="input-field">');
        this.$select = $('<select>');
        this.$select.attr('id', id);
        var $label = $('<label>' + label + '</label>');
        this.$dom
            .append(this.$select)
            .append($label);
        return this.$dom;
    };
    SelectField.prototype.setOnchangeAction = function () {
        var _this = this;
        //this.$dom.find('li').on("click",function(){_this.onItemChosen(this)});
        if (this.onItemSelectedHandler) {
            this.$select.off('change');
            this.$select.on('change', function () {
                _this.getValue();
                _this.onItemSelectedHandler.apply(_this.viewObject, [_this.chosenItem]);
            });
        }
    };
    SelectField.prototype.getValue = function () {
        var _this_1 = this;
        var inputValue = this.$dom.find('input').val();
        if (!this.optionsData && !this.isRequired)
            return;
        if (inputValue !== this.defaultDisabledOption) {
            if (typeof this.optionsData[0] !== 'object') {
                this.chosenItem = inputValue;
            }
            else {
                this.chosenItem = this.optionsData.find(function (item) { return item[_this_1.key] == inputValue; });
            }
        }
        else
            this.chosenItem = undefined;
        return this.chosenItem;
    };
    SelectField.prototype.simulateChosenItem = function (inputValue) {
        var _this_1 = this;
        if (inputValue !== undefined) {
            var itemSelectedId = 2 + this.optionsData.indexOf(inputValue);
            if (inputValue === this.defaultDisabledOption) {
                this.chosenItem = undefined;
                this.$select.val(inputValue).trigger('change');
            }
            else if (typeof this.optionsData[0] !== 'object') {
                this.chosenItem = inputValue;
                //var itemSelectedId = 2 + this.optionsData.indexOf(inputValue);
                //this.$dom.find('li:nth-child('+itemSelectedId+')').click();
            }
            else {
                this.chosenItem = this.optionsData.find(function (item) { return item.id == inputValue.id ||
                    item[_this_1.key] == inputValue[_this_1.key]; });
                if (this.chosenItem) {
                    var optionsString = this.optionsData.map(function (item) { return item[_this_1.key]; });
                    itemSelectedId = 2 + optionsString.indexOf(this.chosenItem[this.key]);
                }
                else
                    itemSelectedId = 0;
            }
            this.$dom.find('li:nth-child(' + itemSelectedId + ')').click();
        }
    };
    SelectField.prototype.clearChosenItem = function () {
        this.chosenItem = undefined;
        this.$dom.find('input').val('');
    };
    SelectField.prototype.validate = function () {
        if (this.isRequired) {
            return this.chosenItem !== this.defaultDisabledOption && this.chosenItem !== undefined;
        }
        else
            return true;
    };
    return SelectField;
}());
var Chip = /** @class */ (function () {
    function Chip(id, caption, dataItem, onDeleteCallBack, viewObject) {
        this.id = id;
        this.caption = caption;
        this.dataItem = dataItem;
        this.onDeleteCallBack = onDeleteCallBack;
        this.viewObject = viewObject;
        this.$dom;
        this.buidDom();
        this.setOnDeleteAction();
    }
    Chip.prototype.buidDom = function () {
        this.$dom = $('<div>');
        this.$dom
            .attr('id', 'chip_' + this.id)
            .addClass('chip')
            .html(this.caption);
        if (this.onDeleteCallBack)
            this.$dom.append('<i class="close material-icons">close</i>');
    };
    Chip.prototype.setOnDeleteAction = function () {
        this.$dom.children('i').off('change');
        var _this = this;
        this.$dom.children('i').on('click', function (e) {
            _this.onDeleteCallBack.apply(_this.viewObject, [_this.dataItem]);
        });
    };
    return Chip;
}());
/*
 * value to obiekt, który chcemy wysyłać do serwera np. tablica
 * @type type
 */
var HiddenInput = /** @class */ (function () {
    function HiddenInput(id, name, value, isRequired) {
        this.id = id;
        this.name = (name) ? name : id;
        this.value = value;
        this.isRequired = isRequired;
        this.$dom;
        this.buildDom();
    }
    HiddenInput.prototype.buildDom = function () {
        this.$dom = $('<input>');
        this.$dom
            .attr('type', 'hidden')
            .attr('id', this.id)
            .attr('name', this.name);
    };
    HiddenInput.prototype.setValue = function (value) {
        this.value = value;
    };
    HiddenInput.prototype.getValue = function () {
        return this.value;
    };
    HiddenInput.prototype.validate = function () {
        var test = !this.isRequired || this.value !== undefined && this.value.length > 0 && this.value !== {};
        if (!test) {
            this.$dom.addClass('invalid');
        }
        else {
            this.$dom.removeClass('invalid');
        }
        return test;
    };
    return HiddenInput;
}());
/*
 * value to obiekt, który chcemy wysyłać do serwera np. tablica
 * @type type
 */
var FileInput = /** @class */ (function () {
    function FileInput(id, name, viewObject, isRequired) {
        this.id = id;
        this.name = (name) ? name : id;
        this.viewObject = viewObject;
        this.isRequired = isRequired;
        this.$dom;
        this.buildDom();
    }
    FileInput.prototype.buildDom = function () {
        this.$dom = $('<form action="#">');
        this.$fileField = $('<div>');
        this.$input = $('<input>');
        this.$input
            .attr('type', 'file')
            .attr('id', this.id)
            .attr('multiple', '')
            .attr('name', this.name);
        this.$button = $('<div>');
        this.$button
            .addClass('btn')
            .append($('<span>Plik</span>'))
            .append(this.$input);
        this.$fileField
            .addClass('file-field')
            .addClass('input-field')
            .append(this.$button)
            .append('<div class="file-path-wrapper">').children('.file-path-wrapper')
            .append('<input class="file-path validate" type="text" placeholder="Wybierz jeden lub kilka plików">');
        this.$dom.append(this.$fileField);
    };
    FileInput.prototype.getFiles = function () {
        return this.$input[0].files;
    };
    FileInput.prototype.readFile = function (blob) {
        return new Promise(function (resolve, reject) {
            //pobierz plik z pickera
            if (!blob)
                resolve();
            else {
                var reader = new FileReader();
                var base64data;
                reader.onloadend = function () {
                    base64data = reader.result.replace(/^data:.+;base64,/, '');
                    resolve({
                        blobBase64String: base64data,
                        name: blob.name,
                        mimeType: blob.type
                    });
                };
                reader.readAsDataURL(blob);
            }
        });
    };
    FileInput.prototype.getValue = function () {
        var _this_1 = this;
        return new Promise(function (resolve, reject) {
            if (_this_1.getFiles().length == 0) {
                resolve([]);
                return [];
            }
            var promises = [];
            var blobs = [];
            for (var i = 0; i < _this_1.getFiles().length; i++) {
                promises[i] = _this_1.readFile(_this_1.getFiles()[i])
                    .then(function (result) { return blobs.push(result); });
            }
            Promise.all(promises)
                .then(function () { return resolve(blobs); });
        });
    };
    FileInput.prototype.validate = function () {
        var test = true;
        if (this.isRequired && !this.getFiles()[0])
            test = false;
        return test;
    };
    return FileInput;
}());
var ReachTextArea = /** @class */ (function () {
    function ReachTextArea(id, label, isRequired, maxCharacters) {
        this.id = id;
        this.label = label;
        this.isRequired = isRequired;
        this.maxCharacters = maxCharacters;
        this.createReachTextArea();
    }
    /*
     * Używać w klasie XxxxController po XxxxView.initilise()
     */
    ReachTextArea.reachTextAreaInit = function () {
        tinymce.init({
            selector: '.reachTextArea',
            toolbar: 'undo redo | bold italic underline | outdent indent | link',
            menubar: false,
            forced_root_block: false,
            statusbar: true,
            plugins: "autoresize link paste",
            paste_auto_cleanup_on_paste: true,
            paste_as_text: true,
            autoresize_bottom_margin: 20,
            autoresize_min_height: 30,
            //max_chars: 30,
            branding: false,
            setup: function (ed) {
                var allowedKeys = [8, 37, 38, 39, 40, 46]; // backspace, delete and cursor keys
                ed.on('keydown', function (e) {
                    if (allowedKeys.indexOf(e.keyCode) != -1)
                        return true;
                    var maxCharacters = $(tinyMCE.get(tinyMCE.activeEditor.id).getElement()).attr('max_chars');
                    if ($(ed.getBody()).text().length + 1 > maxCharacters) {
                        //if (ReachTextArea.tinymce_getContentLength() + 1 > this.settings.max_chars) {
                        e.preventDefault();
                        e.stopPropagation();
                        return false;
                    }
                    return true;
                });
                ed.on('keyup', function (e) {
                    var maxCharacters = $(tinyMCE.get(tinyMCE.activeEditor.id).getElement()).attr('max_chars');
                    ReachTextArea.tinymce_updateCharCounter(this, ReachTextArea.tinymce_getContentLength(), maxCharacters);
                });
            },
            init_instance_callback: function () {
                var maxCharacters = $(tinyMCE.get(tinyMCE.activeEditor.id).getElement()).attr('max_chars');
                $('#' + this.id).prev().append('<div class="char_count" style="text-align:right"></div>');
                ReachTextArea.tinymce_updateCharCounter(this, ReachTextArea.tinymce_getContentLength(), maxCharacters);
            },
            paste_preprocess: function (plugin, args) {
                return;
                var maxCharacters = $(tinyMCE.get(tinyMCE.activeEditor.id).getElement()).attr('max_chars');
                var editor = tinymce.get(tinymce.activeEditor.id);
                var len = editor.contentDocument.body.innerHTML.length;
                var text = $(args.content).text();
                if (len + text.length > editor.settings.max_chars) {
                    alert('Pasting this exceeds the maximum allowed number of ' + editor.settings.max_chars + ' characters.');
                    args.content = '';
                }
                else {
                    ReachTextArea.tinymce_updateCharCounter(editor, len + text.length, maxCharacters);
                }
            }
        });
    };
    ReachTextArea.tinymce_updateCharCounter = function (el, len, maxCharacters) {
        $('#' + el.id).prev().find('.char_count').text(len + '/' + maxCharacters);
    };
    ReachTextArea.tinymce_getContentLength = function () {
        return tinymce.get(tinymce.activeEditor.id).contentDocument.body.innerHTML.length;
    };
    /*
     * w funkcji fillWithData() użyć:
     *      tinyMCE.get(this.id + 'descriptionTextField').setContent(rolesRepository.currentItem.description);
     *      tinyMCE.triggerSave();
     */
    ReachTextArea.prototype.createReachTextArea = function () {
        this.$dom = $('<div>');
        this.$input = $('<textarea class="materialize-textarea validate" id="' + this.id + '" name="' + this.id + '" >');
        var $label = $('<label>' + this.label + '</label>');
        $label.addClass('active');
        this.$dom
            .append($label)
            .append(this.$input);
        this.$input
            .attr('max_chars', this.maxCharacters)
            .addClass('reachTextArea');
    };
    ReachTextArea.prototype.setLabel = function (label) {
        this.label = label;
        this.$dom.find('label').text(label);
    };
    return ReachTextArea;
}());
var SelectFieldBrowserDefault = /** @class */ (function () {
    /*
     * Sposób użycia: tworzymy nowy obiekt >> initialise >> w kontrolerze po zbudowaniu DOM >> ()=>{$('select').material_select();
     * @param {type} id
     * @param {type} label
     * @param {type} icon
     * @param {type} isRequired
     * @returns {SelectField}
     */
    function SelectFieldBrowserDefault(id, label, icon, isRequired) {
        this.id = id;
        this.label = label;
        this.icon = icon;
        this.isRequired = isRequired;
        this.chosenItem;
        this.$dom;
        this.$select;
        this.buildDom(id, label, icon, isRequired);
    }
    SelectFieldBrowserDefault.prototype.initialise = function (optionsData) {
        this.$select.empty();
        if (optionsData === undefined)
            optionsData = this.optionsData;
        else
            this.optionsData = optionsData;
        this.$select.append('<option value="" disabled selected>' + this.defaultDisabledOption + '</option>');
        for (var i in optionsData) {
            var $option = $('<option>')
                .val(optionsData[i].name)
                .text(optionsData[i].name);
            this.$select.append($option);
        }
        this.setChangeAction();
    };
    SelectFieldBrowserDefault.prototype.buildDom = function (id, label, icon, isRequired, options) {
        this.$select = $('<select class="browser-default">');
        this.$dom = $('<div>');
        var $label = $('<label>' + label + '</label>');
        this.$dom
            .append($label)
            .append(this.$select);
        //if (isRequired)
        //    $select.attr('required','true')
        return this.$dom;
    };
    SelectFieldBrowserDefault.prototype.getValue = function () {
        return this.chosenItem;
    };
    //uruchamiana na click
    SelectFieldBrowserDefault.prototype.setValue = function (inputValue) {
        this.chosenItem = Tools.search(inputValue, 'name', this.optionsData);
    };
    SelectFieldBrowserDefault.prototype.setChangeAction = function () {
        var _this = this;
        this.$select.change(function () {
            _this.setValue($(this).val());
        });
    };
    SelectFieldBrowserDefault.prototype.simulateChosenItem = function (inputValue) {
        this.setValue(inputValue);
        var itemSelectedId = this.optionsData.findIndex(function (x) { return x.hello === inputValue; });
        //var itemSelectedId = 2 + this.optionsData.indexOf(inputValue);
        this.$dom.find('li:nth-child(' + itemSelectedId + ')').click();
    };
    return SelectFieldBrowserDefault;
}());
var DatePicker = /** @class */ (function () {
    function DatePicker(id, label, icon, isRequired) {
        this.id = id;
        this.label = label;
        this.icon = icon;
        this.isRequired = isRequired;
        this.chosenDate;
        this.$dom;
        this.$input;
        this.createDatePickerField(id, label, icon, isRequired);
    }
    DatePicker.prototype.createDatePickerField = function (id, label, icon, isRequired) {
        this.$dom = $('<div class="input-field">');
        this.$input = $('<input type="text" class="datepicker" id="' + id + '" name="' + id + '">');
        var $label = $('<label for="' + id + '">' + label + '</label>');
        this.$dom
            .append(this.$input)
            .append($label);
        this.$input.pickadate(MainSetup.datePickerSettings);
        return this.$dom;
    };
    //https://stackoverflow.com/questions/30324552/how-to-set-the-date-in-materialize-datepicker
    DatePicker.prototype.setValue = function (date) {
        var $generatedInput = this.$input.pickadate();
        // Use the picker object directly.
        var picker = $generatedInput.pickadate('picker');
        picker.set('select', date, { format: 'yyyy-mm-dd' });
    };
    DatePicker.prototype.getValue = function () {
        return this.$input.val();
    };
    DatePicker.prototype.validate = function () {
        if (!this.isRequired)
            return true;
        var test = $('#' + this.id).val() != '';
        if (test === false) {
            this.$input.addClass('invalid');
        }
        else {
            this.$input.removeClass('invalid');
        }
        return test;
    };
    DatePicker.prototype.setLabel = function (label) {
        this.label = label;
        this.$dom.find('label').text(label);
    };
    return DatePicker;
}());
var InputTextField = /** @class */ (function () {
    function InputTextField(id, label, icon, isRequired, maxCharacters, validateRegex, dataError) {
        this.id = id;
        this.label = label;
        this.icon = icon;
        this.isRequired = isRequired;
        this.maxCharacters = maxCharacters;
        this.validateRegex = validateRegex;
        this.dataError = dataError;
        this.$dom;
        this.$input;
        this.$label;
        this.buildDom();
    }
    //ikony do dodania
    InputTextField.prototype.buildDom = function () {
        this.$dom = $('<div class="input-field">');
        this.$input = $('<input type="text" class="validate" id="' + this.id + '" name="' + this.id + '">');
        this.$label = $('<label for="' + this.id + '">' + this.label + '</label>');
        this.$dom
            .append(this.$input)
            .append(this.$label);
        this.setIsRequired(this.isRequired);
        if (this.maxCharacters > 0) {
            this.$input
                .attr('data-length', this.maxCharacters);
            this.$input.characterCounter();
        }
        if (this.validateRegex) {
            this.$input
                .attr('pattern', this.validateRegex);
        }
        if (this.dataError !== undefined)
            this.$label.attr('data-error', this.dataError);
        else
            this.$label.attr('data-error', 'Niewłaściwy format danych');
    };
    InputTextField.prototype.setIsRequired = function (isRequired) {
        this.isRequired = isRequired;
        if (this.isRequired)
            this.$input.attr('required', this.isRequired);
        else
            this.$input.removeAttr('required');
    };
    InputTextField.prototype.getValue = function () {
        return this.$input.val();
    };
    InputTextField.prototype.setValue = function (inputvalue) {
        this.$input.val(inputvalue);
    };
    return InputTextField;
}());
var Tabs = /** @class */ (function () {
    function Tabs(initParameters) {
        this.id = initParameters.id;
        this.itemSelectedNumber = (initParameters.itemSelectedNumber) ? initParameters.itemSelectedNumber : 0;
        this.swipeable = initParameters.swipeable;
        this.parentId = initParameters.parentId;
        this.responsiveThreshold = initParameters.responsiveThreshold;
        this.tabsData = initParameters.tabsData;
        this.contentIFrameId = initParameters.contentIFrameId;
        this.$dom = $('<div class="row">');
        this.$tabs = $('<ul class="tabs">');
        //this.$panels = $('<div class="tabsPanels">');
        this.buildDom();
    }
    //ikony do dodania
    Tabs.prototype.buildDom = function () {
        this.$dom
            .append('<div class="col s12"') //.children()
            .append(this.$tabs);
        this.$dom.append(this.$panels);
        for (var i = 0; i < this.tabsData.length; i++) {
            var $link = $('<a>');
            $link.html(this.tabsData[i].name);
            this.$tabs
                .append('<li class="tab col s3">').children()
                .append($link);
            (this.contentIFrameId) ? this.makeTabIframe($link, i) : this.makeTabDiv($link, i);
        }
        var _this = this;
        this.$tabs.tabs();
        this.$tabs.on('click', 'a', function (e) {
            _this.tabChosen($(this).closest('li'));
        });
        //this.$dom.tabs({onShow: function(){_this.tabChosen($(this).closest('li'))}});
    };
    Tabs.prototype.makeTabIframe = function ($link, i) {
        $link.attr('href', 'tab_' + this.tabsData[i].url);
    };
    Tabs.prototype.makeTabDiv = function ($link, i) {
        var divId = 'tab_' + this.tabsData[i].name.replace(/ /g, "-") + '-' + this.id;
        var $tabPanel = $('<div id="' + divId + '" class="col s12">');
        $tabPanel.append(this.tabsData[i].panel);
        $link.attr('href', '#' + divId);
        this.$dom.append($tabPanel);
        //if(i==1){
        //    this.$dom.find('.tabs').tabs('select_tab', divId);
        //}
    };
    Tabs.prototype.tabChosen = function ($tab) {
        if (this.contentIFrameId)
            $('#' + this.contentIFrameId)
                .attr('src', this.tabsData[$tab.index()].url);
        else {
        }
    };
    return Tabs;
}());
var Form = /** @class */ (function () {
    function Form(id, method, elements, noRows, submitCaption) {
        if (noRows === void 0) { noRows = false; }
        if (submitCaption === void 0) { submitCaption = 'Zapisz'; }
        this.id = id;
        this.method = method;
        this.elements = elements;
        this.noRows = noRows;
        this.submitCaption = submitCaption;
        this.$dom;
        this.buidDom();
        this.dataObject; //do refactoringu w przyszłości przenieść tu obsługę SubmitRrigger() z modali
    }
    Form.prototype.buidDom = function () {
        this.$dom = $('<form id="' + this.id + '" method="' + this.method + '">');
        for (var _i = 0, _a = this.elements; _i < _a.length; _i++) {
            var element = _a[_i];
            var $inputDescription = '';
            if (element.description)
                $inputDescription = $('<span class="envi-input-description">' + element.description + '</span>');
            var $inputContainer = $('<div>');
            if (!this.noRows)
                $inputContainer.addClass('row');
            this.$dom.append($inputContainer);
            $inputContainer
                .append($inputDescription)
                .append(element.input.$dom);
        }
        this.$dom.append(FormTools.createSubmitButton(this.submitCaption));
        if (this.noRows) {
            var $tmpDom = this.$dom;
            this.$dom = $('<div class="row">');
            this.$dom.append($tmpDom);
        }
    };
    /*
     * Ustawia opis elementu formularza
     * @param {String} description
     * @param {FormElement} element
     * @returns {undefined}
     */
    Form.prototype.setElementDescription = function (description, element) {
        var $descriptionLabel = element.input.$dom.parent().find('.envi-input-description');
        if ($descriptionLabel.length == 0) {
            $descriptionLabel = $('<div class="envi-input-description">');
            element.input.$dom.parent().prepend($descriptionLabel);
        }
        $descriptionLabel.html(description);
    };
    /*
     * używane przy edycji modala
     * @param {Array [connectedRepositryCurrentItemValues]} currentItem
     * @returns {undefined}
     */
    Form.prototype.fillWithData = function (currentItem) {
        //określ ile maksymalnie może być elementów do wypełnienia
        var inputElements = Math.min(this.elements.length, Object.keys(currentItem).length);
        for (var i = 0; i < inputElements; i++) {
            var inputvalue = currentItem[this.elements[i].dataItemKeyName];
            switch (this.elements[i].input.constructor.name) {
                case 'InputTextField':
                    //this.elements[i].input.$dom.children('input').val(inputvalue);
                    this.elements[i].input.setValue(inputvalue);
                    break;
                case 'ReachTextArea':
                    if (!inputvalue)
                        inputvalue = '';
                    tinyMCE.get(this.elements[i].input.id).setContent(inputvalue);
                    tinyMCE.triggerSave();
                    break;
                case 'DatePicker':
                    this.elements[i].input.setValue(inputvalue);
                    break;
                case 'SelectField':
                    this.elements[i].input.simulateChosenItem(inputvalue);
                    break;
                case 'AutoCompleteTextField':
                    this.elements[i].input.setValue(inputvalue);
                    break;
                case 'SelectFieldBrowserDefault':
                case 'CollapsibleSelect':
                case 'CollapsibleMultiSelect':
                    this.elements[i].input.simulateChosenItem(inputvalue);
                    break;
                case 'SwitchInput':
                case 'Chips':
                case 'HiddenInput':
                    this.elements[i].input.setValue(inputvalue);
            }
        }
        Materialize.updateTextFields();
    };
    //używane przy SubmitTrigger w Modalu
    Form.prototype.validate = function (dataObject) {
        for (var i = 0; i < this.elements.length; i++) {
            var test;
            switch (this.elements[i].input.constructor.name) {
                case 'DatePicker':
                case 'SelectField':
                case 'HiddenInput':
                case 'FileInput':
                case 'CollapsibleSelect':
                case 'CollapsibleMultiSelect':
                    test = this.elements[i].input.validate(dataObject[this.elements[i].input.dataItemKeyName]);
                    if (!test) {
                        alert('Źle wypełnione pole "' + this.elements[i].input.name + '"');
                        return false;
                    }
                    break;
                default:
                    //w pozostałych przypadkach walidację zostawiamy dla natywnego HTML5
                    test = true;
            }
        }
        return test;
    };
    /*
     * Aktualizuje atrybuty edytowanego obiektu na podstawie pól formularza
     * @param {repositoryData} dataObject
     */
    Form.prototype.submitHandler = function (dataObject) {
        return __awaiter(this, void 0, void 0, function () {
            var _i, _a, element, _b, _c, _d;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        _i = 0, _a = this.elements;
                        _e.label = 1;
                    case 1:
                        if (!(_i < _a.length)) return [3 /*break*/, 9];
                        element = _a[_i];
                        _b = element.input.constructor.name;
                        switch (_b) {
                            case 'InputTextField': return [3 /*break*/, 2];
                            case 'ReachTextArea': return [3 /*break*/, 2];
                            case 'TextArea': return [3 /*break*/, 2];
                            case 'DatePicker': return [3 /*break*/, 3];
                            case 'SelectField': return [3 /*break*/, 4];
                            case 'SelectFieldBrowserDefault': return [3 /*break*/, 4];
                            case 'AutoCompleteTextField': return [3 /*break*/, 5];
                            case 'SwitchInput': return [3 /*break*/, 6];
                            case 'Chips': return [3 /*break*/, 6];
                            case 'HiddenInput': return [3 /*break*/, 6];
                            case 'FileInput': return [3 /*break*/, 6];
                            case 'CollapsibleSelect': return [3 /*break*/, 6];
                            case 'CollapsibleMultiSelect': return [3 /*break*/, 6];
                        }
                        return [3 /*break*/, 8];
                    case 2:
                        //TODO: trzeba przenieść TextArea do odrębnej klasy, żeby to zadziałało
                        //$('#' + this.id + 'employerTextArea').val()
                        dataObject[element.dataItemKeyName] = $('#' + element.input.id).val();
                        return [3 /*break*/, 8];
                    case 3:
                        dataObject[element.dataItemKeyName] = Tools.dateDMYtoYMD($('#' + element.input.id).val());
                        return [3 /*break*/, 8];
                    case 4:
                        element.input.getValue();
                        if (element.input.chosenItem) {
                            if (typeof element.input.chosenItem === 'object') {
                                dataObject[element.dataItemKeyName] = element.input.chosenItem;
                            }
                            else
                                dataObject[element.dataItemKeyName] = element.input.$dom.find('input').val();
                        }
                        return [3 /*break*/, 8];
                    case 5:
                        if (element.input.chosenItem)
                            //jeżęli nic nie wybrano (pole puste przypisz pusty obiekt)
                            dataObject[element.dataItemKeyName] = (element.input.$dom.children('input').val()) ? element.input.chosenItem : {};
                        return [3 /*break*/, 8];
                    case 6:
                        _c = dataObject;
                        _d = element.dataItemKeyName;
                        return [4 /*yield*/, element.input.getValue()];
                    case 7:
                        _c[_d] = _e.sent();
                        return [3 /*break*/, 8];
                    case 8:
                        _i++;
                        return [3 /*break*/, 1];
                    case 9: return [2 /*return*/];
                }
            });
        });
    };
    return Form;
}());
var AtomicEditForm = /** @class */ (function (_super) {
    __extends(AtomicEditForm, _super);
    function AtomicEditForm(id, method, elements, atomicEditLabel) {
        var _this_1 = _super.call(this, id, method, elements) || this;
        if (_this_1.elements[0].constructor.name !== 'ReachTextArea')
            _this_1.$dom.children(':last-child').remove();
        _this_1.dataObject = { editedParameter: '' };
        _this_1.atomicEditLabel = atomicEditLabel;
        _this_1.setSubmitAction();
        _this_1.setCancelAction();
        return _this_1;
    }
    /*
     * Funkcja musi być przekazana joko argument, albo obsłużona w klasie pochodnej.
     * Klasa pochodna musi mieć metodę submitTrigger()
     * @param {function} submitTrigger
     */
    AtomicEditForm.prototype.setSubmitAction = function () {
        var _this_1 = this;
        this.$dom.submit(function (event) {
            _this_1.submitTrigger();
            // prevent default posting of form
            event.preventDefault();
        });
    };
    AtomicEditForm.prototype.setCancelAction = function () {
        var _this_1 = this;
        this.$dom.keyup(function (event) {
            if (event.keyCode === 13) {
                _this_1.$dom.submit();
            }
            if (event.keyCode === 27) {
                _this_1.atomicEditLabel.switchOffEditMode();
            }
        });
        this.$dom.find('input').focusout(function (event) {
            if (_this_1.elements[0].constructor.name !== 'DatePicker')
                _this_1.atomicEditLabel.switchOffEditMode();
        });
    };
    /*
     * Uruchamiana po kliknięciu przesłaniu formularza
     */
    AtomicEditForm.prototype.submitTrigger = function () {
        this.submitHandler(this.dataObject);
        if (this.validate(this.dataObject)) {
            this.atomicEditLabel.caption = this.dataObject.editedParameter;
            this.atomicEditLabel.connectedResultsetComponent.connectedRepository.currentItem[this.atomicEditLabel.editedPropertyName] = this.dataObject.editedParameter;
            this.atomicEditLabel.connectedResultsetComponent.connectedRepository.editItem(this.atomicEditLabel.connectedResultsetComponent.connectedRepository.currentItem, this.atomicEditLabel.connectedResultsetComponent);
        }
    };
    return AtomicEditForm;
}(Form));
var AtomicEditLabel = /** @class */ (function () {
    /*
     * @param {String} caption
     * @param {this.connectedRepository.currentItem} dataObject
     * @param {type} input
     * @param {String} editedPropertyName
     * @param {Collection} connectedResultsetComponent
     * @returns {AtomicEditLabel}
     */
    function AtomicEditLabel(caption, dataObject, input, editedPropertyName, connectedResultsetComponent) {
        this.caption = caption;
        this.dataObject = dataObject;
        this.editedPropertyName = editedPropertyName;
        this.connectedResultsetComponent = connectedResultsetComponent;
        this.input = input;
        this.buildStaticDom();
        this.$parent;
    }
    AtomicEditLabel.prototype.buildStaticDom = function () {
        if (this.caption) {
            this.$dom = $('<span>');
            this.$dom
                .html(this.caption + '<br>');
            this.setEditLabelAction();
        }
        else
            this.$dom = '';
    };
    AtomicEditLabel.prototype.buildEditModeDom = function () {
        this.$parent = this.$dom.parent();
        this.$parent.children('form').remove();
        this.$dom.remove();
        this.form = new AtomicEditForm("tmpEditForm_" + this.dataObject.id, "GET", [this.input], this);
        this.$dom = this.form.$dom;
        this.$dom.addClass('atomicEditForm');
    };
    /*
     * inicjuje i wyświetla formularz edycji pola
     */
    AtomicEditLabel.prototype.setEditLabelAction = function () {
        this.$dom.off('dblclick');
        var _this = this;
        this.$dom.dblclick(function (e) {
            //$(this).parent().parent().parent().parent().trigger('click');                                 
            _this.switchOnEditMode();
            _this.$dom.find('.datepicker').pickadate({
                selectMonths: true,
                selectYears: 15,
                today: 'Dzisiaj',
                clear: 'Wyszyść',
                close: 'Ok11',
                closeOnSelect: false,
                container: undefined,
                format: 'dd-mm-yyyy'
            });
            ReachTextArea.reachTextAreaInit();
            _this.form.fillWithData([_this.dataObject[_this.editedPropertyName]]);
            _this.$dom.find('input').focus();
        });
    };
    AtomicEditLabel.prototype.switchOnEditMode = function () {
        this.buildEditModeDom();
        this.$parent.append(this.$dom);
        $('select').material_select();
        Materialize.updateTextFields();
    };
    AtomicEditLabel.prototype.switchOffEditMode = function () {
        this.$dom.remove();
        this.buildStaticDom();
        this.$parent
            .append(this.$dom);
    };
    return AtomicEditLabel;
}());
var SwitchInput = /** @class */ (function () {
    function SwitchInput(onLabel, offLabel, changeAction, viewObject) {
        this.onLabel = onLabel;
        this.offLabel = offLabel;
        this.changeAction = changeAction;
        this.viewObject = viewObject;
        this.$dom = $('<div class="switch">');
        this.buildDom();
        this.setChangeAction();
        this.value;
    }
    SwitchInput.prototype.buildDom = function () {
        this.$dom
            .append('<label>').children()
            .append(this.offLabel)
            .append('<input type="checkbox">')
            .append('<span class="lever">')
            .append(this.onLabel);
    };
    SwitchInput.prototype.setChangeAction = function () {
        var _this = this;
        this.$dom.find("input[type=checkbox]").on("change", function () {
            _this.value = $(this).prop('checked');
            if (_this.changeAction)
                _this.changeAction.apply(_this.viewObject, [_this.value]);
        });
    };
    SwitchInput.prototype.setValue = function (value) {
        this.value = value;
        this.$dom.find("input[type=checkbox]").prop('checked', value);
    };
    SwitchInput.prototype.getValue = function () {
        return (this.value) ? true : false;
    };
    return SwitchInput;
}());
/*
 * Używana w klasie FIlter jako domyślny komponent
 * filterELement - obiekt pola filtra definiowany w Filter
 * @type type
 */
var FilterSwitchInput = /** @class */ (function (_super) {
    __extends(FilterSwitchInput, _super);
    function FilterSwitchInput(filterElement, connectedFilterObject) {
        var _this_1 = _super.call(this, filterElement.onLabel, filterElement.offLabel) || this;
        _this_1.filterElement = filterElement;
        _this_1.connectedFilterObject = connectedFilterObject;
        _this_1.$dom.find('input').attr('checked', (_this_1.connectedFilterObject.showActiveRows) ? 'true' : 'false');
        _this_1.value = (_this_1.connectedFilterObject.showActiveRows) ? true : false;
        return _this_1;
    }
    FilterSwitchInput.prototype.setChangeAction = function () {
        var _this = this;
        this.$dom.find("input[type=checkbox]").on("change", function () {
            _this.value = $(this).prop('checked');
            _this.connectedFilterObject.changeFilterCriteriaHandler(_this.filterElement);
        });
    };
    return FilterSwitchInput;
}(SwitchInput));
var Badge = /** @class */ (function () {
    function Badge(id, caption, bgColor) {
        this.id = id;
        this.caption = caption;
        this.bgColor = bgColor;
        this.$dom = $('<span>');
        this.buidDom();
    }
    Badge.prototype.buidDom = function () {
        this.$dom
            .attr('id', 'badge_' + this.id)
            .attr('data-badge-caption', '')
            .addClass('new badge')
            .addClass(this.bgColor)
            .html(this.caption);
    };
    return Badge;
}());
//kopatybilny z FormTools_mcss1.0
var RaisedButton = /** @class */ (function () {
    function RaisedButton(caption, onClickFunction, viewObject) {
        this.caption = caption;
        this.onClickFunction = onClickFunction;
        this.viewObject = viewObject;
        this.$dom;
        this.buidDom();
    }
    RaisedButton.prototype.buidDom = function () {
        var _this_1 = this;
        this.$dom = $('<input>');
        this.$dom
            .attr('type', 'button')
            .attr('value', this.caption)
            .addClass('waves-effect waves-teal btn');
        this.$dom.click(function () { return _this_1.onClickFunction.apply(_this_1.viewObject, []); });
    };
    RaisedButton.prototype.setEnabled = function (enable) {
        var onClassName = (enable) ? 'enabled' : 'disabled';
        var offClassName = (enable) ? 'disabled' : 'enabled';
        this.$dom
            .addClass(onClassName)
            .removeClass(offClassName);
    };
    return RaisedButton;
}());
var FlatButton = /** @class */ (function (_super) {
    __extends(FlatButton, _super);
    function FlatButton(caption, onClickFunction, viewObject) {
        return _super.call(this, caption, onClickFunction, viewObject) || this;
    }
    FlatButton.prototype.buidDom = function () {
        _super.prototype.buidDom.call(this);
        this.$dom
            .removeClass('btn')
            .addClass('btn-flat');
    };
    return FlatButton;
}(RaisedButton));
//kopatybilny z FormTools_mcss1.0
var IconButton = /** @class */ (function () {
    function IconButton(icon, onClickFunction, viewObject) {
        this.icon = icon;
        this.onClickFunction = onClickFunction;
        this.viewObject = viewObject;
        this.$dom;
        this.buidDom();
    }
    IconButton.prototype.buidDom = function () {
        var _this_1 = this;
        switch (this.icon) {
            case 'GD_ICON':
                this.icon = 'https://ps.envi.com.pl/Resources/View/Google-Drive-icon.png';
                break;
            case 'GD_DOCUMENT_ICON':
                this.icon = 'https://ps.envi.com.pl/Resources/View/Google-Docs-icon.png';
                break;
            case 'GD_SHEET_ICON':
                this.icon = 'https://ps.envi.com.pl/Resources/View/Google-Sheets-icon.png';
                break;
            case 'GGROUP_ICON':
                this.icon = 'https://ps.envi.com.pl/Resources/View/Google-Groups-icon.png';
                break;
            case 'GCALENDAR_ICON':
                this.icon = 'https://ps.envi.com.pl/Resources/View/Google-Calendar-icon.png';
                break;
            case 'ATTACH_FILE':
                this.icon = 'https://ps.envi.com.pl/Resources/View/attach-file-icon.png';
                break;
        }
        this.$dom = $('<a  target="_blank">');
        if (this.url)
            this.$dom.attr('href', this.url);
        var $img = $('<img height=21px>');
        $img.attr('src', this.icon);
        this.$dom.append($img);
        this.$dom.click(function () { return _this_1.onClickFunction.apply(_this_1.viewObject, []); });
    };
    return IconButton;
}());
var ExternalResourcesIconLink = /** @class */ (function () {
    function ExternalResourcesIconLink(icon, url) {
        if (!icon)
            throw new SyntaxError('Icon must be defined!');
        this.icon = icon;
        this.url = url;
        this.buidDom();
        this.$dom;
    }
    ExternalResourcesIconLink.prototype.buidDom = function () {
        switch (this.icon) {
            case 'GD_ICON':
                this.icon = 'https://ps.envi.com.pl/Resources/View/Google-Drive-icon.png';
                break;
            case 'GD_DOCUMENT_ICON':
                this.icon = 'https://ps.envi.com.pl/Resources/View/Google-Docs-icon.png';
                break;
            case 'GD_SHEET_ICON':
                this.icon = 'https://ps.envi.com.pl/Resources/View/Google-Sheets-icon.png';
                break;
            case 'GGROUP_ICON':
                this.icon = 'https://ps.envi.com.pl/Resources/View/Google-Groups-icon.png';
                break;
            case 'GCALENDAR_ICON':
                this.icon = 'https://ps.envi.com.pl/Resources/View/Google-Calendar-icon.png';
                break;
            case 'ATTACH_FILE':
                this.icon = 'https://ps.envi.com.pl/Resources/View/attach-file-icon.png';
                break;
        }
        this.$dom = $('<a  target="_blank">');
        if (this.url)
            this.$dom.attr('href', this.url);
        var $img = $('<img height=21px>');
        $img.attr('src', this.icon);
        this.$dom.append($img);
    };
    return ExternalResourcesIconLink;
}());
var FormTools = /** @class */ (function () {
    function FormTools() {
    }
    /*
     * initiates a radio input
     * it must be wrapped in a HTML element named as #name argument
     * @repository {object} must have .id and .name attribute
     */
    FormTools.createRadioButtons = function (name, repository) {
        var options = repository.items;
        var radioButtons = $('<div></div>');
        for (var i = 0; i < options.length; i++) {
            var id = name + 'Option' + i + 1;
            var radioBtn = $('<p>' +
                '<input type="radio" name="' + name + '1" value="' + options[i].id + '" id="' + id + '" />' +
                '<label for="' + id + '">' + options[i].name + '</label>' +
                '</p>');
            radioBtn.appendTo(radioButtons);
        }
        radioButtons.click = function () {
            alert($(this).val() + "ssssss");
            repository.currentItemId = $(this).val();
        };
        $("[name^=" + name + "]").click(function () {
            alert($(this).val());
            repository.currentItemId = $(this).val();
        });
        return radioButtons;
    };
    FormTools.createSubmitButton = function (caption) {
        var button = $('<Button class="btn waves-effect waves-light" name="action"></button>');
        button.append(caption);
        button.append('<i class="material-icons right">send</i>');
        return button;
    };
    FormTools.createEmailInputField = function (id, label, isRequired, maxCharacters, validateRegex, dataError) {
        var $emailInputField = FormTools.createInputField(id, label, isRequired, maxCharacters);
        $emailInputField.children('input').attr('type', 'email');
        return $emailInputField;
    };
    FormTools.createInputField = function (id, label, isRequired, maxCharacters, validateRegex, dataError) {
        var $textField = $('<div class="input-field">');
        var $input = $('<input type="text" class="validate" id="' + id + '" name="' + id + '">');
        var $label = $('<label for="' + id + '">' + label + '</label>');
        $textField
            .append($input)
            .append($label);
        if (isRequired)
            $input.attr('required', 'true');
        if (maxCharacters > 0) {
            $input
                .attr('data-length', maxCharacters);
            $input.characterCounter();
        }
        if (validateRegex !== undefined) {
            $input
                .attr('pattern', validateRegex);
        }
        if (dataError !== undefined)
            $label.attr('data-error', dataError);
        else
            $label.attr('data-error', 'Niewłaściwy format danych');
        return $textField;
    };
    FormTools.createTextArea = function (id, label, isRequired, maxCharacters, dataError) {
        var $textArea = $('<div class="input-field">');
        var $input = $('<textarea class="materialize-textarea validate" id="' + id + '" name="' + id + '">');
        var $label = $('<label for="' + id + '">' + label + '</label>');
        $textArea
            .append($input)
            .append($label);
        if (isRequired)
            $input.attr('required', 'true');
        if (maxCharacters > 0) {
            $input
                .attr('data-length', maxCharacters);
            $input.characterCounter();
        }
        if (dataError !== undefined)
            $label.attr('data-error', dataError);
        else
            $label.attr('data-error', 'Wpisany tekst jest za długi');
        return $textArea;
    };
    //kopatybilny z FormTools_mcss1.0 
    FormTools.createFlatButton = function (caption, onClickFunction, viewObject) {
        var $button = $('<input type="button" ' +
            'value="' + caption + '" ' +
            'class="waves-effect waves-teal btn-flat"' +
            '/>');
        $button.click(function () { onClickFunction.apply(viewObject, []); });
        return $button;
    };
    FormTools.createModalTriggerIcon = function (id, icon) {
        var $triggerIcon = $('<span>');
        $triggerIcon
            .attr('data-target', id)
            .addClass('collectionItemEdit modal-trigger');
        $triggerIcon
            .append('<span>').children()
            .addClass('material-icons')
            .html(icon);
        //'<span data-target="' + this.projectDetailsCollection.editModal.id + '" class="collectionItemEdit modal-trigger"><i class="material-icons">edit</i></span>'
        return $triggerIcon;
    };
    return FormTools;
}());
