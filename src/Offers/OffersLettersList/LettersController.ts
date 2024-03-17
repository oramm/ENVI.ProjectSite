import {
    Case,
    Contract,
    Entity,
    ExternalOffer,
    IncomingLetter,
    Milestone,
    OtherContract,
    OurContract,
    OurLetter,
    OurOffer,
    Project,
} from "../../../Typings/bussinesTypes";
import RepositoryReact from "../../React/RepositoryReact";

export const lettersRepository = new RepositoryReact<OurLetter | IncomingLetter>({
    actionRoutes: {
        getRoute: "offersLetters",
        addNewRoute: "letterReact",
        editRoute: "letter",
        deleteRoute: "letter",
    },
    name: "letters",
});

export const offersRepository = new RepositoryReact<OurOffer | ExternalOffer>({
    actionRoutes: {
        getRoute: "offers",
        addNewRoute: "",
        editRoute: "",
        deleteRoute: "",
    },
    name: "offers",
});

export const milestonesRepository = new RepositoryReact<Milestone>({
    actionRoutes: {
        getRoute: "milestones",
        addNewRoute: "",
        editRoute: "",
        deleteRoute: "",
    },
    name: "milestones",
});

export const casesRepository = new RepositoryReact<Case>({
    actionRoutes: {
        getRoute: "cases",
        addNewRoute: "",
        editRoute: "",
        deleteRoute: "",
    },
    name: "cases",
});

export const entitiesRepository = new RepositoryReact<Entity>({
    actionRoutes: {
        getRoute: "entities",
        addNewRoute: "entity",
        editRoute: "entity",
        deleteRoute: "entity",
    },
    name: "entities",
});
