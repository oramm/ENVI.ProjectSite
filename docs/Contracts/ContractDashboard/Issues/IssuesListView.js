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
var IssuesListView = /** @class */ (function (_super) {
    __extends(IssuesListView, _super);
    function IssuesListView() {
        return _super.call(this) || this;
    }
    IssuesListView.prototype.initialise = function () {
        this.setTittle("Zgłoszone problemy");
        this.actionsMenuInitialise();
        $('#actionsMenu').after(new IssuesCollapsible('issuesCollapsible').$dom);
        this.dataLoaded(true);
    };
    IssuesListView.prototype.actionsMenuInitialise = function () {
    };
    return IssuesListView;
}(Popup));
