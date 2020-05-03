/* 
 * http://materializecss.com/collapsible.html
 */
class RawPanel extends Resultset {
    constructor(initParamObject) {
        super(initParamObject)
        this.connectedRepository = initParamObject.connectedRepository;
        this.$dom = $('<div>')
            .attr('id', 'container' + '_' + this.id);
        this.$actionsMenu = $('<div>')
            .attr('id', 'actionsMenu' + '_' + this.id)
            .addClass('cyan lighten-5')
            .addClass('actionsMenu');
    }

    /*
     * @param {CollapsibleItems[]} items - generowane m. in. SompleCollapsible
     * @param {type} parentViewObject
     * @param {type} parentViewObjectSelectHandler
     * @returns {undefined}
     */
    initialise() {
        this.buildDom();
    }

    buildDom() {
        this.$dom
            .append(this.$actionsMenu)
            .append(this.$collapsible);
        if (this.title)
            this.$dom.prepend(this.$title)
    }

    /*
     * funkcja wywoływana w repository, potrzebny trik z appply dla callbacka
     * @param {String} status
     * @param {CollapsibleItem} item
     * @param {String} errorMessage
     * @returns {Promise}
     */
    addNewHandler(status, item, errorMessage) {
        switch (status) {
            case "DONE":
                this.$dom.find('.progress').remove();
                return status;
                break;
            case "PENDING":
                item.id = item._tmpId;
                this.$dom.find('[itemid=' + item.id + ']').append(this.makePreloader('preloader' + item.id))
                return item.id;
                break;
            case "ERROR":
                alert(errorMessage);
                this.$dom.find('.progress').remove();
                return status;
                break;
        }
    }

    makePreloader(id) {
        var $preloader = $('<div class="progress">');
        $preloader
            .attr('id', id)
            .append('<div class="indeterminate">');
        return $preloader;
    }
}