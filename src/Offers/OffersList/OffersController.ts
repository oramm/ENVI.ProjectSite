import {
    EntityData,
    ExternalOffer,
    MailData,
    OfferBondData,
    OurOffer,
    PersonData,
} from "../../../Typings/bussinesTypes";
import RepositoryReact from "../../React/RepositoryReact";

export const offersRepository = new RepositoryReact<OurOffer | ExternalOffer>({
    actionRoutes: {
        getRoute: "offers",
        addNewRoute: "offer",
        editRoute: "offer",
        deleteRoute: "offer",
    },
    name: "offers",
});

export const mailsToCheckRepository = new RepositoryReact<MailData>({
    actionRoutes: {
        getRoute: "mailsToCheck",
        addNewRoute: "mailToCheck",
        editRoute: "mailToCheck",
        deleteRoute: "mailToCheck",
    },
    name: "mailsToCheck",
});

export const mailInvitationsRepository = new RepositoryReact<MailData>({
    actionRoutes: {
        getRoute: "mailInvitations",
        addNewRoute: "mailInvitation",
        editRoute: "mailInvitation",
        deleteRoute: "mailInvitation",
    },
    name: "mailInvitations",
});

export const offerBondsRepository = new RepositoryReact<OfferBondData>({
    actionRoutes: {
        getRoute: "offerBonds",
        addNewRoute: "offerBond",
        editRoute: "offerBond",
        deleteRoute: "offerBond",
    },
    name: "offerBonds",
});

export const entitiesRepository = new RepositoryReact<EntityData>({
    actionRoutes: {
        getRoute: "entities",
        addNewRoute: "entity",
        editRoute: "entity",
        deleteRoute: "entity",
    },
    name: "entities",
});

export const personsRepository = new RepositoryReact<PersonData>({
    actionRoutes: {
        getRoute: "persons",
        addNewRoute: "",
        editRoute: "",
        deleteRoute: "",
    },
    name: "offers-persons",
});
