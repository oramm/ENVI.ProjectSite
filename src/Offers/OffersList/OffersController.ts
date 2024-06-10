import { EntityData, ExternalOffer, OfferBondData, OurOffer } from "../../../Typings/bussinesTypes";
import RepositoryReact from "../../React/RepositoryReact";

export const OffersRepository = new RepositoryReact<OurOffer | ExternalOffer>({
    actionRoutes: {
        getRoute: "offers",
        addNewRoute: "offer",
        editRoute: "offer",
        deleteRoute: "offer",
    },
    name: "offers",
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
