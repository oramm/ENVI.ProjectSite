class Filter {
    constructor(connectedResultsetComponent, showActiveRows){
        this.connectedResultsetComponent = connectedResultsetComponent;
        this.showActiveRows = (showActiveRows === undefined)? true : showActiveRows;
        this.filterElements = [];
        if (this.connectedResultsetComponent.hasArchiveSwitch===undefined) 
            this.connectedResultsetComponent.hasArchiveSwitch = false; 
        this.$dom = $('<div class="row">');
        
    }
    initialise(){
        this.addDefaultFilter();
        if (this.connectedResultsetComponent.hasArchiveSwitch){
            this.addArchiveSwitch();
        }
    }
    addDefaultFilter(){
        var filterElement = {   input: this.createFilterInputField("contract-filter",this.connectedResultsetComponent.$dom.find('li')),
                                colSpan: 12  
                            };
        this.addInput(filterElement);
    }
    
    addArchiveSwitch(){
        var filterElement = {   input: new ArchiveSwitchInput(this),
                                colSpan: 3                                
                            };
        this.addInput(filterElement);
    }
    /*
     * Uruchamiana po kliknięciu w Switch Archiwum
     * @param {boolean} showArchive
     * @returns {undefined}
     */
    archiveSwitchHandler(showArchived){
            var _this = this;
            this.connectedResultsetComponent.$dom.find("li").map(function() {
                    //if (showArchived) $(this).toggle();
                    if (!_this.checkIfRowMatchesFilters($(this)))
                        $(this).hide()
                    else
                        $(this).show();
                });
    }
    /*
     * Sprawdza czy wiersz connectedResultsetComponent pasuje do kreyteriów wyszukiwania
     * @param {type} $row
     * @returns {Filter@call;isRowArchived|Boolean}
     */
    checkIfRowMatchesFilters($row){
        //na początku pokaż tylko aktywne wiersze (ukryj arhiwum)
        var test = true;
        if(this.filterElements.length==0)
          return (this.connectedResultsetComponent.hasArchiveSwitch)? this.isRowActive($row) : true;  
        //pole tekstowe
        if (!$row.text().toLowerCase().includes(this.filterElements[0].input.value))
            return false;

        if(this.connectedResultsetComponent.hasArchiveSwitch && this.isRowActive($row)!=this.filterElements[1].input.value)
            return false

        return true;
    }
    
    isRowActive($row){
        var test;
        if($row.attr('status')===undefined){
            test = true;
            console.log($row);
        } else
         test = $row.attr('status').match(/Zakończ|Zamknięt|Archiw/i);
        return (test)? false : true; 
    }
    
    /*
     * dodaje nistandardowy element do filtra (lista i $dom)
     */
    addInput(filterElement){
        var $col = $('<div>');
        
        this.filterElements.push(filterElement);
        this.$dom
            .append($col).children(':last-child')
                .append(filterElement.input.$dom);
        this.setElementSpan(filterElement,filterElement.colSpan);
        //skoryguj szerokość gównego pola filtrowania
        this.setElementSpan(this.filterElements[0],12-this.totalElementsColsPan());
    }
    /*
     * Ustawia szerokość elementu w siatce GUI
     */
    setElementSpan(filterElement, colSpan){
        filterElement.colSpan = colSpan;
        filterElement.input.$dom.parent().attr('class', 'col s' + filterElement.colSpan);
    }
    /*
     * Podstawowe pole filtrowania
     */
    createFilterInputField(id, $filteredObject){
        
        var $textField = FormTools.createInputField(id, 'Filtruj listę');
        var _this = this;
        var value;
        $textField.children('input').on("keyup", function() {
            _this.filterElements[0].input.value = $(this).val().toLowerCase();
            _this.archiveSwitchHandler();
            
        });
        
        return {$dom: $textField, value: ''};
    }
    
    totalElementsColsPan(){
        var colSpan = 0;
        for (var i=1; i<this.filterElements.length; i++){
            colSpan += this.filterElements[i].colSpan;
        }
        return colSpan;
    }
    
    buildDom(){
        
    }
    
    clear(){
        
    }
}