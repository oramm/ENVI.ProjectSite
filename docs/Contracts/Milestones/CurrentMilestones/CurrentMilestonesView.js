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
var CurrentMilestonesView = /** @class */ (function (_super) {
    __extends(CurrentMilestonesView, _super);
    function CurrentMilestonesView() {
        return _super.call(this) || this;
    }
    CurrentMilestonesView.prototype.initialise = function () {
        this.setTittle("Bieżące kamienie milowe");
        this.actionsMenuInitialise();
        $('#actionsMenu').after(new CurrentMilestonesCollection('currentMilestonesViewCollection').$dom);
        this.dataLoaded(true);
    };
    CurrentMilestonesView.prototype.actionsMenuInitialise = function () {
    };
    return CurrentMilestonesView;
}(Popup));
