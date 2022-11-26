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
var MyTasksView = /** @class */ (function (_super) {
    __extends(MyTasksView, _super);
    function MyTasksView() {
        return _super.call(this) || this;
    }
    MyTasksView.prototype.initialise = function () {
        this.setTittle("Moje zadania");
        this.actionsMenuInitialise();
        $('#actionsMenu').after(new MyTasksCollection('myTasksCollection').$dom);
        this.dataLoaded(true);
    };
    MyTasksView.prototype.actionsMenuInitialise = function () {
    };
    return MyTasksView;
}(Popup));
