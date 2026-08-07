/**
 * Drzewo struktury umowy — typy kamieni milowych, typy spraw i foldery
 * opcjonalne dostępne dla danego typu umowy.
 *
 * Celowo NIE korzysta z RepositoryReact: ten mówi wyłącznie POST-em
 * z `orConditions` i zwraca listę obiektów z `id`, a tu jest GET z parametrem
 * zwracający zagnieżdżony obiekt bez `id`. Do tego cache'uje do sessionStorage
 * pod kluczem będącym samą nazwą repozytorium, więc przełączenie typu umowy
 * podałoby drzewo poprzedniego typu.
 *
 * Fetch idzie przez ToolsFetch, żeby 401 kończył się przejściem do logowania,
 * a brak sieci czytelnym komunikatem — ręczny fetch to gubił i użytkownik
 * z wygasłą sesją widziałby „nie udało się wczytać struktury".
 */
import MainSetup from "../../../React/MainSetupReact";
import ToolsFetch from "../../../React/Tools/ToolsFetch";
import { ContractTemplatesTree } from "../../../../Typings/bussinesTypes";

export async function fetchContractTemplatesTree(contractTypeId: number): Promise<ContractTemplatesTree> {
    return ToolsFetch.fetchJsonWithSafeError(
        `${MainSetup.serverUrl}contractTemplatesTree?contractTypeId=${contractTypeId}`,
        { method: "GET", credentials: "include" },
    );
}
