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
var MeetingsListView = /** @class */ (function (_super) {
    __extends(MeetingsListView, _super);
    function MeetingsListView() {
        var _this = _super.call(this) || this;
        _this.$meetingsPanel;
        return _this;
    }
    MeetingsListView.prototype.initialise = function () {
        //this.setTittle("Spotkania");
        this.buidDom();
        this.dataLoaded(true);
    };
    MeetingsListView.prototype.buidDom = function () {
        $("#content").find('.row')
            .append(new MeetingsCollapsible('meetingsCollapsible').$dom);
    };
    return MeetingsListView;
}(Popup));
