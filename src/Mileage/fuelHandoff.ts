/**
 * Dane tankowania wędrujące między kilometrówką a zaliczkami - w obie strony te same.
 *
 * Tankowanie zostawia ślad w dwóch arkuszach: kilometrówka notuje licznik, zaliczki
 * pieniądze. Żaden z tych wpisów nie zastąpi drugiego (w arkuszu kilometrówki nie ma
 * kolumny kwotowej, w zaliczkach nie ma licznika), więc zamiast zlepiać oba formularze
 * w jeden, przekazujemy między nimi to, co już wiadomo. Każdy zapis potwierdza się
 * osobno, dzięki czemu widać, co trafiło do którego arkusza.
 *
 * Jedzie w `state` trasy (react-router), nie w adresie: to podpowiedź do formularza,
 * a nie zasób, który ktoś miałby linkować.
 *
 * Klucze w `state`: `fuelFromMileage` (kilometrówka -> zaliczki),
 * `fuelFromPettyCash` (zaliczki -> kilometrówka).
 */
export type FuelHandoff = {
    /** Data tankowania. */
    entryDate: string;
    /** Pojazd z listy kilometrówki. */
    vehicleId: string;
    /** Stan licznika przy tankowaniu, tak jak wpisał go człowiek. */
    odometerReading: string;
};
