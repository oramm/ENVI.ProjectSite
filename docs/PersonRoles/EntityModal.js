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
var EntityModal = /** @class */ (function (_super) {
    __extends(EntityModal, _super);
    function EntityModal(id, title, connectedResultsetComponent, mode) {
        var _this = _super.call(this, id, title, connectedResultsetComponent, mode) || this;
        _this.formElements = [
            { input: new InputTextField(_this.id + 'nameTextField', 'Nazwa', undefined, true, 150, '.{3,}'),
                dataItemKeyName: 'name'
            },
            { input: new InputTextField(_this.id + 'addressTextField', 'Adres', undefined, false, 250, '.{3,}'),
                dataItemKeyName: 'address'
            },
            { input: new InputTextField(_this.id + 'taxNumberTextField', 'NIP', undefined, false, 13, '([0-9]{3})(-|)([0-9]{3})(-|)([0-9]{2})(-|)([0-9]{2})'),
                dataItemKeyName: 'taxNumber'
            },
            { input: new InputTextField(_this.id + 'wwwTextField', 'Strona www', undefined, false, 150, '.{3,}'),
                dataItemKeyName: 'www'
            },
            { input: new InputTextField(_this.id + 'emailTextField', 'E-mail', undefined, false, 80, '.{3,}'),
                dataItemKeyName: 'email'
            },
            { input: new InputTextField(_this.id + 'phoneTextField', 'Tel.', undefined, false, 25, '.{3,}'),
                dataItemKeyName: 'phone'
            }
        ];
        _this.initialise();
        return _this;
    }
    /*
     * Używana przy włączaniu Modala w celu dodania nowego rekordu
     * @returns {undefined}
     */
    EntityModal.prototype.initAddNewData = function () {
        this.connectedResultsetComponent.connectedRepository.currentItem = {};
    };
    return EntityModal;
}(Modal));
;
