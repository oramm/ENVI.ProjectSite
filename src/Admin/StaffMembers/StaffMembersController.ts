import { StaffMemberData, SystemUserData } from "../../../Typings/bussinesTypes";
import RepositoryReact from "../../React/RepositoryReact";

/**
 * Uprawnienia funkcyjne personelu.
 *
 * Celowo BEZ addNewRoute i deleteRoute: pod tym adresem serwer zapisuje SAME flagi
 * istniejących osób - nie zakłada i nie kasuje ludzi. Osobę zakłada modal dodawania
 * użytkownika przez `newUserRepository` niżej, a kasowania w tym oknie nie ma.
 *
 * Adres zapisu składa się jako `admin/staffMember/${item.id}`, a `id` to PersonId
 * (backend zwraca tu numer osoby, nie numer wiersza w StaffMembers).
 */
export const staffMembersRepository = new RepositoryReact<StaffMemberData>({
    actionRoutes: {
        getRoute: "admin/staffMembers",
        addNewRoute: "admin/staffMember",
        editRoute: "admin/staffMember",
        deleteRoute: "admin/staffMember",
    },
    name: "staffMembers",
});

/**
 * Zakładanie użytkownika z okna „Personel i uprawnienia" (PER-3, po przejęciu roli
 * ekranu „Dodawanie użytkowników").
 *
 * `POST /person` zakłada SAMĄ osobę - serwer wycina z niej pola konta. Rolę, e-mail
 * systemowy i flagę FIDmana dokłada osobne żądanie `PUT /v2/persons/:id/account`,
 * a przypisania projektów trzecie. Kolejność i powody: `UserModalButtons`.
 *
 * Osobne repozytorium, bo trasa i kształt danych są inne niż w liście okna. Własna nazwa,
 * bo nazwa jest kluczem w sessionStorage - kolizja podmieniłaby zawartość cudzej listy.
 */
export const newUserRepository = new RepositoryReact<SystemUserData>({
    actionRoutes: {
        getRoute: "persons",
        addNewRoute: "person",
        editRoute: "person",
        deleteRoute: "person",
    },
    name: "staffMembers_newUser",
});
