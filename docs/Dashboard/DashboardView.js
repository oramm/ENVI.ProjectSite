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
var DashboardView = /** @class */ (function (_super) {
    __extends(DashboardView, _super);
    function DashboardView() {
        return _super.call(this) || this;
    }
    DashboardView.prototype.initialise = function () {
        this.loadIframe("help", '../Help/Help.html');
        //this.loadIframe("myTasks", '../Cases/Tasks/MyTasks/MyTasks.html');
        //this.loadIframe("currentDeadlines", '../Contracts/Milestones/CurrentMilestones/CurrentMilestones.html');
        console.log("DashboardView initialised");
    };
    return DashboardView;
}(Popup));
