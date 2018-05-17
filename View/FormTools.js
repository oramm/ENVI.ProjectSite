class AutoComplete {
    constructor(repository, key, onCompleteCallBack,viewObject){
        this.repository = repository;
        this.objectList = repository.items;
        this.key=key;
        this.onCompleteCallBack = onCompleteCallBack;
        this.viewObject = viewObject;
        this.chosenItem;
        //this.autocompleteList = {};

        this.pushData(key);
    }    
    pushData(key){
        var autocompleteList = {};
        //var localObjectList = this.objectList;
        var _this = this;
        Object.keys(this.objectList).forEach((id) => {
                    _this;
                    autocompleteList[this.objectList[id][key]] = null;
                });
        // Plugin initialization
        $('input.autocomplete').autocomplete({
           data: autocompleteList,
           limit: 20, // The max amount of results that can be shown at once. Default: Infinity.
           onAutocomplete: (inputValue) => {
                                this.onItemChosen(inputValue);
                                if (typeof this.onCompleteCallBack === "function") { 
                                    this.onCompleteCallBack.apply(this.viewObject,[inputValue]);
                                }
                            },
           minLength: 1 // The minimum length of the input for the autocomplete to start. Default: 1.
             });
        }

    onItemChosen(inputValue){
            this.chosenItem = search(inputValue, this.key, this.repository.items);
            this.repository.selectedItem = this.chosenItem;
    }
}


class FormTools{
    /* 
     * initiates a radio input
     * it must be wrapped in a HTML element named as #name argument
     * @repository {object} must have .id and .name attribute
     */
    
    static createRadioButtons(name, repository){
        var options = repository.items;
        
        var radioButtons = $('<div></div>');
        
        for (var i = 0; i < options.length; i++) {
            var id = name + 'Option' + i+1;
            var radioBtn = $('<p>' +
                                '<input type="radio" name="' + name + '1" value="' + options[i].id + '" id="' + id + '" />' +
                                '<label for="' + id + '">' + options[i].name + '</label>' +
                            '</p>'
                            );
            radioBtn.appendTo(radioButtons);
        }
        
        radioButtons.click = function() {
                alert($(this).val()+ "ssssss");
                repository.selectedItemId = $(this).val();
                };
                
        $("[name^="+ name +"]").click(function() {
                alert($(this).val());
                repository.selectedItemId = $(this).val();
                });
        return radioButtons;
    }

    static createForm(id, method){
        var form = $('<form id="'+ id +'" method="'+ method +'">');
        return form;
    }

    static createSubmitButton(caption){
        var button = $('<Button class="btn waves-effect waves-light" name="action"></button>');
        button.append(caption);
        button.append('<i class="material-icons right">send</i>')
        return button;
    }

    static createInputField(id, label){
        var textField = $('<div class="input-field">');
        textField
            .append('<input type="text" class="validate">')
            .attr('id',id)
            .attr('name',id)
            .append('<label for="'+ id +'">'+ label +'</label>');
        
        return textField;
    }
    
    static createFilterInputField(id, label){
        var $textField = this.createInputField(id, label);
        
        $textField.children().on("keyup", function() {
            var value = $(this).val().toLowerCase();
            $("#contractsCollapsible > li").filter(function() {
                $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1)
            });
        });
        
        return $textField;
    }
    
    static createAutoCompleteTextField(name, repository){
        
        var textField = $('<div class="input-field"></div>');
        $('<i class="material-icons prefix">person</i>').appendTo(textField);
        $('<input name="personId" type="text" id="autocomplete-input" class="autocomplete" autocomplete="off" required>').appendTo(textField);;
        $('<label for="autocomplete-input">Imie</label>').appendTo(textField);
        
        return textField;
    }

    static createFlatButton(caption, onClickFunction){
        var $button = $('<input type="button" ' +
                               'value="' + caption  +'" ' + 
                               'class="waves-effect waves-teal btn-flat"' +
                        '/>');
        $button.click(onClickFunction);
        return $button;
    }

    static createRaisedButton(caption, onClickFunction){
        var $button = $('<input type="button" ' +
                               'value="' + caption  +'" ' + 
                               'class="waves-effect waves-teal btn"' +
                        '/>');
        $button.click(onClickFunction);
        return $button;
    }

    static appendButtonTo(parentNode, onClickFunction, value, className){
        var $input = $('<input type="button" ' +
                               'value="' + value  +'" ' + 
                               'class="' + className + '" ' +
                        '/>');
        $input.click(onClickFunction);

        $input.appendTo(parentNode);
    }
}

