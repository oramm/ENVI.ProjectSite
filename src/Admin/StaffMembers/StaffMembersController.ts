import { StaffMemberData } from "../../../Typings/bussinesTypes";
import RepositoryReact from "../../React/RepositoryReact";

/**
 * Uprawnienia funkcyjne personelu.
 *
 * Celowo BEZ addNewRoute i deleteRoute: panel edytuje flagi istniejących osób,
 * nie zakłada i nie kasuje ludzi. Od zakładania kont jest ekran użytkowników.
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
