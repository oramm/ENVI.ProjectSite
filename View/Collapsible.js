/* 
 * http://materializecss.com/collapsible.html
 */
class Collapsible {
    constructor(){
    }
    
    initialise(id, items, parentViewObject, parentViewObjectRemoveHandler, parentViewObjectSelectHandler){
        this.id = id;
        this.items = items;
        this.parentViewObject = parentViewObject;
        this.parentViewObjectRemoveHandler = parentViewObjectRemoveHandler;
        this.parentViewObjectSelectHandler = parentViewObjectSelectHandler;
        this.parentHTMLElement = this.buildDom()
        return this.parentHTMLElement;
    }
    
    buildDom(){
        var $collapsible = $('<ul class="collapsible" data-collapsible="accordion">');
        $collapsible.attr("id",this.id);
        for (var i=0; i<this.items.length; i++){
            var $row = this.buildRow(this.items[i]);
            $collapsible
                .append($row);
        }
        $collapsible.collapsible();//inicjacja wg instrukcji materialisecss
        
        this.parentHTMLElement = $collapsible;
        
        if (this.parentViewObjectRemoveHandler !== undefined)
            this.setRemoveAction();
        if (this.parentViewObjectSelectHandler !== undefined)
            this.setClickAction();

        return $collapsible;
    }
    
    buildRow(item){
        var $row = $('<li>');
        $row
                .append('<div class="collapsible-header"><i class="material-icons">filter_list</i>'+ item.name +'</div>')
                .append('<div class="collapsible-body">');
       (item.$body!==undefined)? $row.children(':last').append(item.$body) : $row.children(':last').append('lista jest pusta');
        
        return $row;
        
    }

    setClickAction(){
        var _this = this;
        this.parentHTMLElement.find(".collapsible > li").click(function() {   
                                            _this.$parentHTMLElement.find(".collapsible > li").attr("class", "collection-item avatar");
                                            $(this).attr("class", "collection-item avatar active");
                                            _this.parentViewObjectSelectHandler.apply(_this.parentViewObject,[$(this).attr("id")]);
                                        });
    }
    
    setRemoveAction(){
        var _this = this;
        this.parentHTMLElement.find(".itemDelete").click(function() {   
                                            _this.parentViewObjectRemoveHandler.apply(_this.parentViewObject,[$(this).parent().parent().parent().parent().attr("id")]);
                                        });
    }
}

