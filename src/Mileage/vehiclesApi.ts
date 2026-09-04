import MainSetup from "../React/MainSetupReact";

/**
 * Pojazdy kilometrówki. Listę czyta i kilometrówka, i formularz zaliczek przy tankowaniu,
 * więc kształt danych i adres trasy stoją w jednym miejscu.
 *
 * Trasa jest bramkowana flagą kierowcy, ale pracownicy ENVI (jedyni z dostępem do zaliczek)
 * przechodzą ją zawsze.
 */
export type Vehicle = {
    id: string;
    brand: string;
    model: string;
    plate: string;
    currentReading: number | null;
    sheetUrl?: string;
};

export async function fetchVehicles(): Promise<Vehicle[]> {
    const response = await fetch(`${MainSetup.serverUrl}mileage/vehicles`, {
        credentials: "include",
    });
    if (!response.ok) throw new Error("Nie udało się pobrać listy pojazdów.");
    const vehicles: Vehicle[] = await response.json();
    // Baza oddaje identyfikator jako liczbę, a lista wyboru i adres trasy operują napisem.
    // Wyrównujemy go tutaj, żeby porównania w formularzach nie milkły po cichu.
    return vehicles.map((vehicle) => ({ ...vehicle, id: String(vehicle.id) }));
}

/** Auto w jednym napisie: "Ford Focus OP 8105L". */
export function vehicleLabel(vehicle: Vehicle): string {
    return [vehicle.brand, vehicle.model, vehicle.plate].filter(Boolean).join(" ");
}
