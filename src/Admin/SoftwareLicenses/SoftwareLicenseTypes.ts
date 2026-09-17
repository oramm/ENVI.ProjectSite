import { RepositoryDataItem } from "../../../Typings/bussinesTypes";

export interface SoftwareLicenseData extends RepositoryDataItem {
    manufacturer: string;
    product: string;
    version: string | null;
    licenseType: string | null;
    registrationAccount: string | null;
    vendorPanelUrl: string | null;
    googleDriveUrl: string | null;
    seatsPurchased: number;
    seatsUsed: number;
    seatsFree: number;
    assignment: string | null;
    purchaseDate: string | null;
    expirationDate: string | null;
    cost: string | null;
    billingCycle: string | null;
    status: string | null;
    comment: string | null;
    hasLicenseKey: boolean;
    createdAt?: string;
    updatedAt?: string;
}

// Explicit allowlist: key material can never become repository/snapshot data.
export function publicLicense(item: SoftwareLicenseData): SoftwareLicenseData {
    return {
        id: item.id, manufacturer: item.manufacturer, product: item.product,
        version: item.version, licenseType: item.licenseType,
        registrationAccount: item.registrationAccount, vendorPanelUrl: item.vendorPanelUrl,
        googleDriveUrl: item.googleDriveUrl,
        seatsPurchased: item.seatsPurchased, seatsUsed: item.seatsUsed, seatsFree: item.seatsFree,
        assignment: item.assignment, purchaseDate: item.purchaseDate, expirationDate: item.expirationDate,
        cost: item.cost, billingCycle: item.billingCycle, status: item.status, comment: item.comment,
        hasLicenseKey: item.hasLicenseKey, createdAt: item.createdAt, updatedAt: item.updatedAt,
    };
}
