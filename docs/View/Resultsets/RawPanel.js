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
/*
 * http://materializecss.com/collapsible.html
 * słuzy jako pojemnik na przyciski wykonujące akcję na serwerze bez rezultsetu
 */
var RawPanel = /** @class */ (function (_super) {
    __extends(RawPanel, _super);
    function RawPanel(initParamObject) {
        var _this = _super.call(this, initParamObject) || this;
        _this.connectedRepository = initParamObject.connectedRepository;
        _this.$dom = $('<div>')
            .attr('id', 'container' + '_' + _this.id);
        _this.$actionsMenu = $('<div>')
            .attr('id', 'actionsMenu' + '_' + _this.id)
            .addClass('cyan lighten-5')
            .addClass('actionsMenu');
        return _this;
    }
    /*
     * @param {CollapsibleItems[]} items - generowane m. in. SompleCollapsible
     * @param {type} parentViewObject
     * @param {type} parentViewObjectSelectHandler
     * @returns {undefined}
     */
    RawPanel.prototype.initialise = function (modal, buttonStyle) {
        this.modal = modal;
        this.buildDom(buttonStyle);
    };
    RawPanel.prototype.buildDom = function (buttonStyle) {
        this.$dom
            .append(this.$actionsMenu);
        this.modal.preppendTriggerButtonTo(this.$actionsMenu, this.modal.title, this, buttonStyle);
        if (this.title)
            this.$dom.prepend(this.$title);
    };
    /*
     * funkcja wywoływana w repository, potrzebny trik z appply dla callbacka
     * @param {String} status
     * @param {CollapsibleItem} item
     * @param {String} errorMessage
     * @returns {Promise}
     */
    RawPanel.prototype.addNewHandler = function (status, item, errorMessage) {
        switch (status) {
            case "DONE":
                this.$dom.find('.progress').remove();
                return status;
                break;
            case "PENDING":
                item.id = item._tmpId;
                this.$dom.append(this.makePreloader('preloader' + item.id));
                return item.id;
                break;
            case "ERROR":
                alert(errorMessage);
                this.$dom.find('.progress').remove();
                return status;
                break;
        }
    };
    return RawPanel;
}(Resultset));
