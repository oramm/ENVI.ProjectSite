"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.casesRepository = exports.milestonesRepository = exports.contractsRepository = exports.projectsRepository = exports.entitiesRepository = exports.lettersRepository = void 0;
const react_1 = __importDefault(require("react"));
const FilterableTable_1 = __importDefault(require("../../View/Resultsets/FilterableTable/FilterableTable"));
const LettersController_1 = __importDefault(require("./LettersController"));
const LetterFilterBody_1 = require("./LetterFilterBody");
const LetterModalButtons_1 = require("./Modals/LetterModalButtons");
const react_fontawesome_1 = require("@fortawesome/react-fontawesome");
const free_solid_svg_icons_1 = require("@fortawesome/free-solid-svg-icons");
exports.lettersRepository = LettersController_1.default.lettersRepository;
exports.entitiesRepository = LettersController_1.default.entitiesRepository;
exports.projectsRepository = LettersController_1.default.projectsRepository;
exports.contractsRepository = LettersController_1.default.contractsRepository;
exports.milestonesRepository = LettersController_1.default.milestonesRepository;
exports.casesRepository = LettersController_1.default.casesRepository;
function LettersSearch({ title }) {
    function makeEntitiesLabel(letter) {
        const entities = letter._entitiesMain;
        let label = '';
        for (var i = 0; i < entities.length - 1; i++) {
            label += entities[i].name + ', ';
        }
        if (entities[i])
            label += entities[i].name;
        return react_1.default.createElement(react_1.default.Fragment, null, label);
    }
    function renderIconTdBody(letter) {
        letter = letter;
        const icon = letter.isOur ? free_solid_svg_icons_1.faPaperPlane : free_solid_svg_icons_1.faEnvelope;
        return react_1.default.createElement(react_fontawesome_1.FontAwesomeIcon, { icon: icon, size: "lg" });
    }
    return (react_1.default.createElement(FilterableTable_1.default, { title: title, FilterBodyComponent: LetterFilterBody_1.LettersFilterBody, tableStructure: [
            { renderThBody: () => react_1.default.createElement("i", { className: "fa fa-inbox fa-lg" }), renderTdBody: renderIconTdBody },
            { header: 'Utworzono', objectAttributeToShow: 'creationDate' },
            { header: 'Wysłano &nbs', objectAttributeToShow: 'registrationDate' },
            { header: 'Numer', objectAttributeToShow: 'number' },
            { header: 'Dotyczy', objectAttributeToShow: 'description' },
            { header: 'Odbiorca', renderTdBody: makeEntitiesLabel },
        ], AddNewButtonComponents: [LetterModalButtons_1.OurLetterAddNewModalButton, LetterModalButtons_1.IncomingLetterAddNewModalButton], EditButtonComponent: LetterModalButtons_1.LetterEditModalButton, isDeletable: true, repository: exports.lettersRepository, selectedObjectRoute: '/letter/' }));
}
exports.default = LettersSearch;
