/* 
 * http://materializecss.com/collections.html
 */
class Collection {
    constructor(){
        this.isDeletable = true;
        this.isEditable = true;
        this.isSelectable = true;
        this.$dom;
        this.$emptyList = $('<H4 class="emptyList">Lista jest pusta</H4>');
        this.$collection = $('<ul class="collection">');
    }
    
    initialise(id, items, parentViewObject, parentViewObjectSelectHandler){
        this.id = id;
        this.items = items;
        //this.parentViewObjectSelectHandler = parentViewObjectSelectHandler;
        //this.parentViewObject = parentViewObject;
        
        //this.parentViewObjectSelectHandler = parentViewObjectSelectHandler;
        //this.parentViewObject = parentViewObject;
        
        //this.$dom = $('<div id='+ this.id +'>');
        this.$dom = $('<div id='+ this.id +'>')
                .append(this.$collection);
        
        if (this.items.length > 0) {
            this.isEditable = this.items[0].editUrl!==undefined;            
            this.$collection
                .append(this.buildDom());
        }
        else this.$dom 
                .prepend(this.$emptyList);
    }
    
    buildDom(){
        for (var i=0; i<this.items.length; i++){
            var $row = this.buildRow(this.items[i]);
            this.$collection.append($row);
        }
            if (this.isDeletable) this.setRemoveAction();
            if (this.isSelectable) this.setClickAction();
    }
    
    //funkcja wywoływana w repository, potrzebny trik z appply dla callbacka
    addNewHandler(status, item, errorMessage){
        return new Promise((resolve, reject) => {
            switch (status) {
                case "DONE":
                    $('#preloader'+item.id).remove();
                    this.setRemoveAction();
                    this.items.push(item);
                    break;
                case "PENDING":  
                    if (this.items.length == 0) {
                        this.$dom.find('.emptyList').remove();
                    }
                    this.$dom.find('ul:first').append(this.buildRow(item));
                    this.$dom.find('#' + item.id).append(this.makePreloader('preloader'+item.id))
                    break;
                case "ERROR":
                    alert(errorMessage);
                    this.$dom.find('#' + item.id).remove();
                    //$('#preloader'+item.id).remove();
                    if (this.items.length == 0) {
                        this.$dom.prepend(this.$emptyList);
                    }

                    break;
                }
            resolve(status)
        });
    }

    /*
     * Krok 3 - funkcja wywoływana w rolesRepository.unasoosciatePersonRole potrzebny trik z appply dla callbacka
     */
    removeHandler(status,itemId, errorMessage){
        return new Promise((resolve, reject) => {
            switch (status) {
                case "DONE":
                    this.$dom.find('#' + itemId).remove();
                    this.items = this.items.filter(function(item){return item.id!==itemId});
                    if (this.items.length == 0) {
                        this.$dom.prepend(this.$emptyList);
                    }
                    break;
                case "PENDING":
                    this.$dom.find('#' + itemId).append('<span class="new badge red" data-badge-caption="">kasuję...</span>');
                    break;
                case "ERROR":
                    alert(errorMessage);
                    break;
                }
            resolve(status);
        });
    }
    
    setClickAction(){
        this.$dom.find("li").off('click');
        var _this = this;
        this.$dom.find("li").click(function() {   
                                            _this.$dom.find(".collection-item").attr("class", "collection-item avatar");
                                            $(this).attr("class", "collection-item avatar active");
                                            //_this.parentViewObjectSelectHandler.apply(_this.parentViewObject,[$(this).attr("id")]);
                                            _this.selectTrigger($(this).attr("id"));
                                        });
    }
    /*
     * Klasa pochodna musi mieć zadeklarowaną metodę removeTrigger()
     */
    setRemoveAction(){
        this.$dom.find(".itemDelete").off('click');
        var _this = this;
        this.$dom.find(".itemDelete").click(function() {   
                                        _this.removeTrigger($(this).parent().parent().parent().parent().attr("id")); 
                                        console.log(this);  
                                        });
    }
    //-------------------------------------- funkcje prywatne -----------------------------------------------------
    
    buildRow(item){
        var $row = $('<li class="collection-item avatar" id="'+ item.id + '">');
        $row
            .append('<i class="material-icons circle">'+ item.icon +'</i>')
            .append('<span class="title">'+ item.title + '</span>')
            .append('<p>' + item.description + '</p>')
            .append('<div class="secondary-content fixed-action-btn horizontal"></div>');
        
        this.addRowCrudButtons($row,item);
        return $row;        
    }
    
    /*
     * Ustawia pryciski edycji wierszy
     */
    addRowCrudButtons($row,item){
        if (this.isDeletable || this.isEditable){
            var button = $row.find('.secondary-content:last-child');
            button
                .append('<a class="btn-floating btn-large"><i class="material-icons">menu</i></a>')
                .append('<ul>');
            if (this.isEditable) 
                button.children('ul')
                    //.append('<li><a class="btn-floating red itemDelete"><i class="material-icons">delete</i></a></li>')
                    .append('<li><a href ="'+ item.editUrl + '" target="_blank" class="btn-floating blue itemEdit"><i class="material-icons">edit</i></a></li>');
            if (this.isDeletable) 
                button.children('ul')
                    .append('<li><a class="btn-floating red itemDelete"><i class="material-icons">delete</i></a></li>')
                    //.append('<li><a href ="'+ item.editUrl + '" target="_blank" class="btn-floating blue itemEdit"><i class="material-icons">edit</i></a></li>');
        }
    }
    
    makePreloader(id){
        var $preloader = $('<div class="progress">');
        $preloader
                .attr('id',id)
                .append('<div class="indeterminate">');
        return $preloader;
    }
}

class CollectionItem{
    constructor(id, icon, title, description, editUrl){
        this.id = id;
        this. icon = icon;
        this.title = title;
        this.description = description;
        this.editUrl = editUrl;
    }
    
    initialise(paramObject){
        this.id = paramObject.id;
        this.icon = paramObject.icon;
        this.title = paramObject.title;
        this.description = paramObject.description;
        this.editUrl = paramObject.editUrl;
    }   
};