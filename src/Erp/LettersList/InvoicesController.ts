import { Entity, Invoice, InvoiceItem, OurContract, Project } from "../../../Typings/bussinesTypes";
import RepositoryReact from "../../React/RepositoryReact";


export default class InvoicesController {
    static statusNames = [
        'Roboczy',
        'Do wysłania',
        'Wysłany',
    ];

    static invoicesRepository = new RepositoryReact<Invoice>({
        actionRoutes: {
            getRoute: 'invoices',
            addNewRoute: 'invoiceReact',
            editRoute: 'invoice',
            deleteRoute: 'invoice'
        },
        name: 'invoices'
    });

    static invoiceItemsRepository = new RepositoryReact<InvoiceItem>({
        actionRoutes: {
            getRoute: 'invoiceItems',
            addNewRoute: 'invoiceItemReact',
            editRoute: 'invoiceItem',
            deleteRoute: 'invoiceItem'
        },
        name: 'invoiceItems'
    });

    static projectsRepository = new RepositoryReact<Project>({
        actionRoutes: {
            getRoute: 'projects',
            addNewRoute: '',
            editRoute: '',
            deleteRoute: ''
        },
        name: 'projects'
    });

    static contractsRepository = new RepositoryReact<OurContract>({
        actionRoutes: {
            getRoute: 'contracts',
            addNewRoute: '',
            editRoute: '',
            deleteRoute: ''
        },
        name: 'contracts'
    });


    static entitiesRepository = new RepositoryReact<Entity>({
        actionRoutes: {
            getRoute: 'entities',
            addNewRoute: 'entity',
            editRoute: 'entity',
            deleteRoute: 'entity'
        },
        name: 'entities'
    });
}