/**
 * Model hierarchii typów: umowa → kamień milowy → sprawa → podsprawa.
 *
 * Backend zwraca GRAF ZNORMALIZOWANY (słowniki + krawędzie), a nie zagnieżdżone
 * drzewo, z trzech powodów wynikających z modelu danych:
 *
 * 1. Numer folderu i flaga „domyślny” należą do KRAWĘDZI (para kamień × umowa),
 *    a nie do typu kamienia. Ten sam kamień ma różne numery w różnych typach umów.
 * 2. Podsprawa może mieć kilku rodziców - to graf, nie drzewo.
 * 3. Panel edytuje węzły, więc potrzebuje jednej instancji węzła na identyfikator.
 *
 * Ten plik zawiera wyłącznie typy i czyste selektory - zero Reacta.
 */

export type TypesTreeContractType = {
    id: number;
    name: string;
    description: string;
    status: string;
    isOur: boolean;
};

export type TypesTreeMilestoneType = {
    id: number;
    name: string;
    description: string;
    isUniquePerContract: boolean;
    isInScrumByDefault: boolean;
    /** Ile realnych kamieni korzysta z typu. */
    _usageCount: number;
    /** Kod odwołuje się do typu wprost - nazwa zablokowana do edycji. */
    _isNameLocked: boolean;
};

export type TypesTreeContractTypeMilestoneType = {
    contractTypeId: number | null;
    milestoneTypeId: number;
    folderNumber: string | null;
    isDefault: boolean;
};

export type TypesTreeOfferMilestoneType = {
    milestoneTypeId: number;
    folderNumber: string;
};

export type TypesTreeCaseType = {
    id: number;
    milestoneTypeId: number | null;
    name: string;
    description: string;
    folderNumber: string | null;
    isDefault: boolean;
    isUniquePerMilestone: boolean;
    isInScrumByDefault: boolean;
    isSubCaseOnly: boolean;
    /** Ile realnych spraw korzysta z typu. */
    _usageCount: number;
    /** Kod rozpoznaje typ po identyfikatorze albo nazwie - nazwa zablokowana. */
    _isNameLocked: boolean;
};

export type TypesTreeSubCaseLink = {
    parentCaseTypeId: number;
    subCaseTypeId: number;
};

export type TypesTreeData = {
    contractTypes: TypesTreeContractType[];
    milestoneTypes: TypesTreeMilestoneType[];
    contractTypeMilestoneTypes: TypesTreeContractTypeMilestoneType[];
    offerMilestoneTypes: TypesTreeOfferMilestoneType[];
    caseTypes: TypesTreeCaseType[];
    subCaseTypeLinks: TypesTreeSubCaseLink[];
};

export const EMPTY_TREE: TypesTreeData = {
    contractTypes: [],
    milestoneTypes: [],
    contractTypeMilestoneTypes: [],
    offerMilestoneTypes: [],
    caseTypes: [],
    subCaseTypeLinks: [],
};

/** Krawędzie danego typu umowy wraz z rozwiązanym typem kamienia. */
export function milestoneTypesForContractType(data: TypesTreeData, contractTypeId: number) {
    const byId = new Map(data.milestoneTypes.map((type) => [type.id, type]));
    return data.contractTypeMilestoneTypes
        .filter((edge) => edge.contractTypeId === contractTypeId)
        .map((edge) => ({ edge, milestoneType: byId.get(edge.milestoneTypeId) }))
        .filter((entry): entry is { edge: TypesTreeContractTypeMilestoneType; milestoneType: TypesTreeMilestoneType } =>
            Boolean(entry.milestoneType),
        )
        .sort((a, b) => (a.edge.folderNumber ?? "").localeCompare(b.edge.folderNumber ?? ""));
}

/**
 * Typy spraw, które mogą powstać jako SAMODZIELNA sprawa w danym kamieniu.
 *
 * Typy z isSubCaseOnly są wykluczone celowo: mają wprawdzie przypisany kamień
 * (bo stamtąd biorą numerację folderów), ale nie da się ich założyć jako zwykłej
 * sprawy - backend też je odfiltrowuje z selektora. Pokazywanie ich tutaj
 * dublowałoby je z kolumną podspraw.
 */
export function caseTypesForMilestoneType(data: TypesTreeData, milestoneTypeId: number) {
    return data.caseTypes
        .filter((caseType) => caseType.milestoneTypeId === milestoneTypeId && !caseType.isSubCaseOnly)
        .sort((a, b) => (a.folderNumber ?? "").localeCompare(b.folderNumber ?? ""));
}

/** Typy podspraw dopuszczone dla danego typu sprawy. */
export function subCaseTypesFor(data: TypesTreeData, parentCaseTypeId: number) {
    const byId = new Map(data.caseTypes.map((caseType) => [caseType.id, caseType]));
    return data.subCaseTypeLinks
        .filter((link) => link.parentCaseTypeId === parentCaseTypeId)
        .map((link) => byId.get(link.subCaseTypeId))
        .filter((caseType): caseType is TypesTreeCaseType => Boolean(caseType));
}

/**
 * Typy kamieni bez żadnej krawędzi do typu umowy.
 *
 * Muszą być widoczne w osobnej szufladzie - bez tego użytkownik zobaczy obraz,
 * który wygląda na kompletny, a nim nie jest, i nigdy nie przypisze tych typów.
 * Kamienie ofertowe (osobna gałąź) są tu wyłączone, bo mają własne powiązanie.
 */
export function unassignedMilestoneTypes(data: TypesTreeData) {
    const assigned = new Set(data.contractTypeMilestoneTypes.map((edge) => edge.milestoneTypeId));
    const offerBound = new Set(data.offerMilestoneTypes.map((edge) => edge.milestoneTypeId));
    return data.milestoneTypes.filter((type) => !assigned.has(type.id) && !offerBound.has(type.id));
}

/** Typy kamieni należące do gałęzi ofertowej. */
export function offerMilestoneTypes(data: TypesTreeData) {
    const byId = new Map(data.milestoneTypes.map((type) => [type.id, type]));
    return data.offerMilestoneTypes
        .map((edge) => ({ edge, milestoneType: byId.get(edge.milestoneTypeId) }))
        .filter((entry): entry is { edge: TypesTreeOfferMilestoneType; milestoneType: TypesTreeMilestoneType } =>
            Boolean(entry.milestoneType),
        );
}

/** Typy spraw nieprzypisane do żadnego kamienia - też muszą być widoczne. */
export function caseTypesWithoutMilestone(data: TypesTreeData) {
    return data.caseTypes.filter((caseType) => caseType.milestoneTypeId === null);
}
