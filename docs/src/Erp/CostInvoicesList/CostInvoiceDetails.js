"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = CostInvoiceDetails;
const react_1 = __importStar(require("react"));
const react_router_dom_1 = require("react-router-dom");
const react_bootstrap_1 = require("react-bootstrap");
const CostInvoicesController_1 = require("./CostInvoicesController");
const CostInvoicesBadges_1 = require("./CostInvoicesBadges");
const Tools_1 = __importDefault(require("../../React/Tools/Tools"));
const ToolsDate_1 = __importDefault(require("../../React/Tools/ToolsDate"));
const CommonComponents_1 = require("../../View/Resultsets/CommonComponents");
function CostInvoiceDetails() {
    const { id } = (0, react_router_dom_1.useParams)();
    const navigate = (0, react_router_dom_1.useNavigate)();
    const [invoice, setInvoice] = (0, react_1.useState)(null);
    const [categories, setCategories] = (0, react_1.useState)([]);
    const [loading, setLoading] = (0, react_1.useState)(true);
    const [saving, setSaving] = (0, react_1.useState)(false);
    const [error, setError] = (0, react_1.useState)(null);
    const [success, setSuccess] = (0, react_1.useState)(null);
    // Edytowalne pola faktury
    const [categoryId, setCategoryId] = (0, react_1.useState)(null);
    const [bookingPercentage, setBookingPercentage] = (0, react_1.useState)(100);
    const [vatDeductionPercentage, setVatDeductionPercentage] = (0, react_1.useState)(100);
    const [notes, setNotes] = (0, react_1.useState)("");
    const [status, setStatus] = (0, react_1.useState)(CostInvoicesController_1.CostInvoiceStatuses.NEW);
    // Edytowalne pozycje
    const [editedItems, setEditedItems] = (0, react_1.useState)(new Map());
    (0, react_1.useEffect)(() => {
        if (!id)
            return;
        loadData();
    }, [id]);
    const loadData = (0, react_1.useCallback)(async () => {
        if (!id)
            return;
        setLoading(true);
        setError(null);
        try {
            const [invoiceData, categoriesData] = await Promise.all([
                (0, CostInvoicesController_1.fetchCostInvoiceDetails)(Number(id)),
                (0, CostInvoicesController_1.fetchCategories)(),
            ]);
            const items = invoiceData.items || invoiceData._items || [];
            const invoiceWithItems = { ...invoiceData, items };
            setInvoice(invoiceWithItems);
            setCategories(categoriesData);
            // Ustaw wartości edytowalnych pól
            setCategoryId(invoiceWithItems.categoryId || null);
            setBookingPercentage(invoiceWithItems.bookingPercentage);
            setVatDeductionPercentage(invoiceWithItems.vatDeductionPercentage);
            setNotes(invoiceWithItems.notes || "");
            setStatus(invoiceWithItems.status);
            document.title = `Faktura ${invoiceWithItems.invoiceNumber} | ${invoiceWithItems.supplierName}`;
        }
        catch (err) {
            setError(err instanceof Error ? err.message : "Błąd ładowania danych");
        }
        finally {
            setLoading(false);
        }
    }, [id]);
    const handleCategoryChange = (newCategoryId) => {
        setCategoryId(newCategoryId);
        // Ustaw domyślny % odliczenia VAT dla kategorii
        if (newCategoryId) {
            const category = categories.find((c) => c.id === newCategoryId);
            if (category) {
                setVatDeductionPercentage(category.vatDeductionDefault);
            }
        }
    };
    const handleItemChange = (itemId, field, value) => {
        setEditedItems((prev) => {
            const newMap = new Map(prev);
            const existing = newMap.get(itemId) || {};
            newMap.set(itemId, { ...existing, [field]: value });
            return newMap;
        });
    };
    const handleSave = async () => {
        if (!invoice)
            return;
        setSaving(true);
        setError(null);
        setSuccess(null);
        try {
            // Zapisz zmiany faktury
            await (0, CostInvoicesController_1.updateCostInvoice)(invoice.id, {
                categoryId,
                bookingPercentage,
                vatDeductionPercentage,
                notes: notes || null,
                status,
            });
            // Zapisz zmiany pozycji
            for (const [itemId, changes] of editedItems) {
                if (Object.keys(changes).length > 0) {
                    await (0, CostInvoicesController_1.updateCostInvoiceItem)(invoice.id, itemId, changes);
                }
            }
            setSuccess("Zmiany zostały zapisane");
            setEditedItems(new Map());
            // Odśwież dane
            await loadData();
        }
        catch (err) {
            setError(err instanceof Error ? err.message : "Błąd zapisywania");
        }
        finally {
            setSaving(false);
        }
    };
    const handleBook = async () => {
        if (!invoice)
            return;
        setSaving(true);
        setError(null);
        try {
            const updated = await (0, CostInvoicesController_1.bookCostInvoice)(invoice.id);
            setInvoice((prev) => (prev ? { ...updated, items: prev.items || updated.items } : updated));
            setStatus(updated.status);
            setSuccess("Faktura została zaksięgowana");
        }
        catch (err) {
            setError(err instanceof Error ? err.message : "Błąd księgowania");
        }
        finally {
            setSaving(false);
        }
    };
    if (loading) {
        return (react_1.default.createElement("div", { className: "text-center m-5" },
            react_1.default.createElement(CommonComponents_1.SpinnerBootstrap, null),
            react_1.default.createElement("div", { className: "mt-3" }, "\u0141adowanie danych faktury...")));
    }
    if (!invoice) {
        return (react_1.default.createElement(react_bootstrap_1.Alert, { variant: "danger", className: "m-3" }, "Nie znaleziono faktury"));
    }
    const isBooked = invoice.status === CostInvoicesController_1.CostInvoiceStatuses.BOOKED;
    const getItemSelection = (item) => {
        const edited = editedItems.get(item.id) || {};
        return {
            isSelected: edited.isSelectedForBooking ?? item.isSelectedForBooking,
            bookingPercentage: edited.bookingPercentage ?? item.bookingPercentage,
            vatDeductionPercentage: edited.vatDeductionPercentage ?? item.vatDeductionPercentage,
        };
    };
    const costItems = (invoice.items || []).filter((item) => getItemSelection(item).isSelected);
    const nonCostItems = (invoice.items || []).filter((item) => !getItemSelection(item).isSelected);
    const renderItemsTable = (items, title) => (react_1.default.createElement("div", { className: "mb-3" },
        react_1.default.createElement("div", { className: "px-3 pt-3 fw-semibold" },
            title,
            " (",
            items.length,
            ")"),
        items.length === 0 ? (react_1.default.createElement("div", { className: "px-3 pb-3 text-muted small" }, "Brak pozycji")) : (react_1.default.createElement(react_bootstrap_1.Table, { striped: true, hover: true, responsive: true, className: "mb-0" },
            react_1.default.createElement("thead", null,
                react_1.default.createElement("tr", null,
                    react_1.default.createElement("th", { style: { width: "40px" } },
                        react_1.default.createElement(react_bootstrap_1.Form.Check, { type: "checkbox", disabled: isBooked, checked: items.every((i) => getItemSelection(i).isSelected), onChange: (e) => {
                                items.forEach((item) => {
                                    handleItemChange(item.id, "isSelectedForBooking", e.target.checked);
                                });
                            } })),
                    react_1.default.createElement("th", null, "Lp."),
                    react_1.default.createElement("th", null, "Opis"),
                    react_1.default.createElement("th", { className: "text-end" }, "Ilo\u015B\u0107"),
                    react_1.default.createElement("th", { className: "text-end" }, "Cena jedn."),
                    react_1.default.createElement("th", { className: "text-end" }, "Netto"),
                    react_1.default.createElement("th", { className: "text-center" }, "VAT"),
                    react_1.default.createElement("th", { className: "text-end" }, "Brutto"),
                    react_1.default.createElement("th", { style: { width: "100px" } }, "Ksi\u0119g. %"),
                    react_1.default.createElement("th", { style: { width: "100px" } }, "VAT odl. %"))),
            react_1.default.createElement("tbody", null, items.map((item) => {
                const { isSelected, bookingPercentage, vatDeductionPercentage } = getItemSelection(item);
                return (react_1.default.createElement("tr", { key: item.id, className: !isSelected ? "text-muted" : "" },
                    react_1.default.createElement("td", null,
                        react_1.default.createElement(react_bootstrap_1.Form.Check, { type: "checkbox", checked: isSelected, disabled: isBooked, onChange: (e) => handleItemChange(item.id, "isSelectedForBooking", e.target.checked) })),
                    react_1.default.createElement("td", null, item.lineNumber),
                    react_1.default.createElement("td", null, item.description),
                    react_1.default.createElement("td", { className: "text-end" },
                        item.quantity,
                        " ",
                        item.unit),
                    react_1.default.createElement("td", { className: "text-end" }, Tools_1.default.formatNumber(item.unitPrice)),
                    react_1.default.createElement("td", { className: "text-end" }, Tools_1.default.formatNumber(item.netValue)),
                    react_1.default.createElement("td", { className: "text-center" },
                        item.vatRate,
                        "%"),
                    react_1.default.createElement("td", { className: "text-end" }, Tools_1.default.formatNumber(item.grossValue)),
                    react_1.default.createElement("td", null,
                        react_1.default.createElement(react_bootstrap_1.Form.Control, { type: "number", size: "sm", min: 0, max: 100, value: bookingPercentage, disabled: isBooked || !isSelected, onChange: (e) => handleItemChange(item.id, "bookingPercentage", Number(e.target.value)) })),
                    react_1.default.createElement("td", null,
                        react_1.default.createElement(react_bootstrap_1.Form.Control, { type: "number", size: "sm", min: 0, max: 100, value: vatDeductionPercentage, disabled: isBooked || !isSelected, onChange: (e) => handleItemChange(item.id, "vatDeductionPercentage", Number(e.target.value)) }))));
            }))))));
    return (react_1.default.createElement(react_bootstrap_1.Container, { fluid: true, className: "py-3" },
        error && (react_1.default.createElement(react_bootstrap_1.Alert, { variant: "danger", onClose: () => setError(null), dismissible: true }, error)),
        success && (react_1.default.createElement(react_bootstrap_1.Alert, { variant: "success", onClose: () => setSuccess(null), dismissible: true }, success)),
        react_1.default.createElement(react_bootstrap_1.Card, { className: "mb-3" },
            react_1.default.createElement(react_bootstrap_1.Card.Header, null,
                react_1.default.createElement(react_bootstrap_1.Row, { className: "align-items-center" },
                    react_1.default.createElement(react_bootstrap_1.Col, null,
                        react_1.default.createElement("h4", { className: "mb-0" },
                            "Faktura ",
                            invoice.invoiceNumber,
                            react_1.default.createElement(CostInvoicesBadges_1.CostInvoiceStatusBadge, { status: status }))),
                    react_1.default.createElement(react_bootstrap_1.Col, { xs: "auto", className: "d-flex align-items-center gap-2" },
                        react_1.default.createElement(react_bootstrap_1.Form.Label, { className: "mb-0 small text-muted" }, "Status"),
                        react_1.default.createElement(react_bootstrap_1.Form.Select, { size: "sm", value: status, onChange: (e) => setStatus(e.target.value), disabled: isBooked || saving, "aria-label": "Status faktury" },
                            react_1.default.createElement("option", { value: CostInvoicesController_1.CostInvoiceStatuses.NEW }, "Nowa"),
                            react_1.default.createElement("option", { value: CostInvoicesController_1.CostInvoiceStatuses.EXCLUDED }, "Poza kosztami"))),
                    react_1.default.createElement(react_bootstrap_1.Col, { xs: "auto" },
                        react_1.default.createElement(react_bootstrap_1.Button, { variant: "outline-secondary", size: "sm", onClick: () => navigate("/costInvoices") }, "\u2190 Powr\u00F3t do listy")))),
            react_1.default.createElement(react_bootstrap_1.Card.Body, null,
                react_1.default.createElement(react_bootstrap_1.Row, null,
                    react_1.default.createElement(react_bootstrap_1.Col, { md: 6 },
                        react_1.default.createElement("h6", null, "Dostawca"),
                        react_1.default.createElement("p", { className: "mb-1" },
                            react_1.default.createElement("strong", null, invoice.supplierName)),
                        react_1.default.createElement("p", { className: "mb-1 text-muted" },
                            "NIP: ",
                            invoice.supplierNip),
                        invoice.supplierAddress && (react_1.default.createElement("p", { className: "mb-0 text-muted small" }, invoice.supplierAddress))),
                    react_1.default.createElement(react_bootstrap_1.Col, { md: 3 },
                        react_1.default.createElement("h6", null, "Daty"),
                        react_1.default.createElement("p", { className: "mb-1" },
                            react_1.default.createElement("small", { className: "text-muted" }, "Wystawienia:"),
                            " ",
                            ToolsDate_1.default.dateYMDtoDMY(invoice.issueDate)),
                        invoice.saleDate && (react_1.default.createElement("p", { className: "mb-1" },
                            react_1.default.createElement("small", { className: "text-muted" }, "Sprzeda\u017Cy:"),
                            " ",
                            ToolsDate_1.default.dateYMDtoDMY(invoice.saleDate))),
                        invoice.dueDate && (react_1.default.createElement("p", { className: "mb-0" },
                            react_1.default.createElement("small", { className: "text-muted" }, "P\u0142atno\u015Bci:"),
                            " ",
                            ToolsDate_1.default.dateYMDtoDMY(invoice.dueDate)))),
                    react_1.default.createElement(react_bootstrap_1.Col, { md: 3 },
                        react_1.default.createElement("h6", null, "Warto\u015Bci"),
                        react_1.default.createElement("p", { className: "mb-1" },
                            react_1.default.createElement("small", { className: "text-muted" }, "Netto:"),
                            " ",
                            react_1.default.createElement("strong", null,
                                Tools_1.default.formatNumber(invoice.netAmount),
                                " ",
                                invoice.currency)),
                        react_1.default.createElement("p", { className: "mb-1" },
                            react_1.default.createElement("small", { className: "text-muted" }, "VAT:"),
                            " ",
                            Tools_1.default.formatNumber(invoice.vatAmount),
                            " ",
                            invoice.currency),
                        react_1.default.createElement("p", { className: "mb-0" },
                            react_1.default.createElement("small", { className: "text-muted" }, "Brutto:"),
                            " ",
                            react_1.default.createElement("strong", null,
                                Tools_1.default.formatNumber(invoice.grossAmount),
                                " ",
                                invoice.currency)))),
                react_1.default.createElement(react_bootstrap_1.Row, { className: "mt-3" },
                    react_1.default.createElement(react_bootstrap_1.Col, null,
                        react_1.default.createElement("small", { className: "text-muted" }, "Nr KSeF: "),
                        react_1.default.createElement("code", { className: "small" }, invoice.ksefNumber))))),
        react_1.default.createElement(react_bootstrap_1.Card, { className: "mb-3" },
            react_1.default.createElement(react_bootstrap_1.Card.Header, null,
                react_1.default.createElement("h5", { className: "mb-0" }, "Ustawienia ksi\u0119gowania")),
            react_1.default.createElement(react_bootstrap_1.Card.Body, null,
                react_1.default.createElement(react_bootstrap_1.Row, null,
                    react_1.default.createElement(react_bootstrap_1.Col, { md: 3 },
                        react_1.default.createElement(react_bootstrap_1.Form.Group, { className: "mb-3" },
                            react_1.default.createElement(react_bootstrap_1.Form.Label, null, "Kategoria kosztu"),
                            react_1.default.createElement(react_bootstrap_1.Form.Select, { value: categoryId || "", onChange: (e) => handleCategoryChange(e.target.value ? Number(e.target.value) : null), disabled: isBooked },
                                react_1.default.createElement("option", { value: "" }, "-- Wybierz kategori\u0119 --"),
                                categories.map((cat) => (react_1.default.createElement("option", { key: cat.id, value: cat.id },
                                    cat.name,
                                    " (VAT: ",
                                    cat.vatDeductionDefault,
                                    "%)")))))),
                    react_1.default.createElement(react_bootstrap_1.Col, { md: 3 },
                        react_1.default.createElement(react_bootstrap_1.Form.Group, { className: "mb-3" },
                            react_1.default.createElement(react_bootstrap_1.Form.Label, null, "% do ksi\u0119gowania"),
                            react_1.default.createElement(react_bootstrap_1.Form.Control, { type: "number", min: 0, max: 100, value: bookingPercentage, onChange: (e) => setBookingPercentage(Number(e.target.value)), disabled: isBooked }),
                            react_1.default.createElement(react_bootstrap_1.Form.Text, { className: "text-muted" },
                                "Do zaksi\u0119gowania: ",
                                Tools_1.default.formatNumber((invoice.netAmount * bookingPercentage) / 100),
                                " z\u0142"))),
                    react_1.default.createElement(react_bootstrap_1.Col, { md: 3 },
                        react_1.default.createElement(react_bootstrap_1.Form.Group, { className: "mb-3" },
                            react_1.default.createElement(react_bootstrap_1.Form.Label, null, "% odliczenia VAT"),
                            react_1.default.createElement(react_bootstrap_1.Form.Control, { type: "number", min: 0, max: 100, value: vatDeductionPercentage, onChange: (e) => setVatDeductionPercentage(Number(e.target.value)), disabled: isBooked }),
                            react_1.default.createElement(react_bootstrap_1.Form.Text, { className: "text-muted" },
                                "VAT do odliczenia: ",
                                Tools_1.default.formatNumber((invoice.vatAmount * vatDeductionPercentage) / 100),
                                " z\u0142")))),
                react_1.default.createElement(react_bootstrap_1.Row, null,
                    react_1.default.createElement(react_bootstrap_1.Col, { md: 12 },
                        react_1.default.createElement(react_bootstrap_1.Form.Group, { className: "mb-3" },
                            react_1.default.createElement(react_bootstrap_1.Form.Label, null, "Notatki"),
                            react_1.default.createElement(react_bootstrap_1.Form.Control, { as: "textarea", rows: 2, value: notes, onChange: (e) => setNotes(e.target.value), disabled: isBooked, placeholder: "Dodatkowe informacje..." })))),
                isBooked && invoice.bookedAt && (react_1.default.createElement(react_bootstrap_1.Alert, { variant: "info", className: "mb-0" },
                    react_1.default.createElement("strong", null, "Zaksi\u0119gowano:"),
                    " ",
                    ToolsDate_1.default.dateToDDmmmYYYYHHMM(invoice.bookedAt),
                    invoice._bookedByPerson && (react_1.default.createElement(react_1.default.Fragment, null,
                        " przez ",
                        invoice._bookedByPerson.name,
                        " ",
                        invoice._bookedByPerson.surname)))))),
        react_1.default.createElement(react_bootstrap_1.Card, { className: "mb-3" },
            react_1.default.createElement(react_bootstrap_1.Card.Header, null,
                react_1.default.createElement("h5", { className: "mb-0" }, "Pozycje faktury")),
            react_1.default.createElement(react_bootstrap_1.Card.Body, { className: "p-0" },
                renderItemsTable(costItems, "Pozycje kosztowe"),
                renderItemsTable(nonCostItems, "Pozycje poza kosztami"))),
        !isBooked && (react_1.default.createElement("div", { className: "d-flex gap-2" },
            react_1.default.createElement(react_bootstrap_1.Button, { variant: "primary", onClick: handleSave, disabled: saving }, saving ? (react_1.default.createElement(react_1.default.Fragment, null,
                react_1.default.createElement(react_bootstrap_1.Spinner, { animation: "border", size: "sm", className: "me-1" }),
                "Zapisywanie...")) : ("💾 Zapisz zmiany")),
            react_1.default.createElement(react_bootstrap_1.Button, { variant: "success", onClick: handleBook, disabled: saving }, saving ? (react_1.default.createElement(react_1.default.Fragment, null,
                react_1.default.createElement(react_bootstrap_1.Spinner, { animation: "border", size: "sm", className: "me-1" }),
                "Ksi\u0119gowanie...")) : ("✅ Zaksięguj fakturę"))))));
}
