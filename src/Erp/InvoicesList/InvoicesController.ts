import { Entity, Invoice, InvoiceItem, OurContract, Project } from "../../../Typings/bussinesTypes";
import RepositoryReact from "../../React/RepositoryReact";



export const statusNames = [
    'Roboczy',
    'Do wysłania',
    'Wysłany',
];

export const invoicesRepository = new RepositoryReact<Invoice>({
    actionRoutes: {
        getRoute: 'invoices',
        addNewRoute: 'invoice',
        editRoute: 'invoice',
        copyRoute: 'copyInvoice',
        deleteRoute: 'invoice'
    },
    name: 'invoices'
});

export const invoiceItemsRepository = new RepositoryReact<InvoiceItem>({
    actionRoutes: {
        getRoute: 'invoiceItems',
        addNewRoute: 'invoiceItem',
        editRoute: 'invoiceItem',
        deleteRoute: 'invoiceItem'
    },
    name: 'invoiceItems'
});

export const projectsRepository = new RepositoryReact<Project>({
    actionRoutes: {
        getRoute: 'projects',
        addNewRoute: '',
        editRoute: '',
        deleteRoute: ''
    },
    name: 'projects'
});

export const contractsRepository = new RepositoryReact<OurContract>({
    actionRoutes: {
        getRoute: 'contracts',
        addNewRoute: '',
        editRoute: '',
        deleteRoute: ''
    },
    name: 'contracts'
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