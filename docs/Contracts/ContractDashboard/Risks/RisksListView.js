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
var RisksListView = /** @class */ (function (_super) {
    __extends(RisksListView, _super);
    function RisksListView() {
        return _super.call(this) || this;
    }
    RisksListView.prototype.initialise = function () {
        this.setTittle("Rejestr Ryzyk");
        this.actionsMenuInitialise();
        $('#actionsMenu').after(new RisksCollapsible('risksCollapsible').$dom);
        this.dataLoaded(true);
    };
    RisksListView.prototype.actionsMenuInitialise = function () {
    };
    return RisksListView;
}(Popup));
