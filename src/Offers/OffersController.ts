import { Case, Contract, Entity, ExternalOffer, Milestone, OtherContract, OurContract, OurOffer, Project } from "../../Typings/bussinesTypes";
import RepositoryReact from "../React/RepositoryReact";


export const OffersRepository = new RepositoryReact<OurOffer | ExternalOffer>({
    actionRoutes: {
        getRoute: 'offers',
        addNewRoute: 'offer',
        editRoute: 'offer',
        deleteRoute: 'offer'
    },
    name: 'offers'
});

export const entitiesRepository = new RepositoryReact<Entity>({
    actionRoutes: {
        getRoute: 'entities',
        addNewRoute: 'entity',
        editRoute: 'entity',
        deleteRoute: 'entity'
    },
    name: 'entities'
});