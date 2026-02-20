"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPublicProfileSubmissionImportApi = createPublicProfileSubmissionImportApi;
/**
 * Adapts the PublicProfileSubmissionApi to the ProfileImportApiAdapter interface
 * used by ProfileImportModal.
 *
 * BE has no confirm-import endpoints — the flow is:
 *   1. analyzeFile → returns parsed data
 *   2. User selects items in modal
 *   3. confirm* → maps to PUT /draft (merge with existing draft), simulates ImportConfirmResponse
 *
 * NOTES:
 * - _tempId is a frontend-only field; it is stripped before sending to BE.
 * - PUT /draft replaces all PENDING items of a given type. To avoid data loss when
 *   the user imports in multiple rounds, the current draft is fetched first and
 *   the new items are merged with the existing PENDING ones.
 * - The caller (PublicProfileSubmissionPage) creates the API object once,
 *   calls setSessionToken() after email verification, and passes it here.
 */
function createPublicProfileSubmissionImportApi(api) {
    return {
        analyzeFile(file, hint) {
            return api.analyzeFile(file, hint);
        },
        async confirmExperiences(items) {
            const { _tempId: _1, ...strip } = items[0] ?? {}; // type-check that _tempId exists
            void strip;
            void _1;
            const currentDraft = await api.getDraft();
            const existingPending = currentDraft.experiences
                .filter(e => e.status === "PENDING")
                .map(({ id: _id, status: _s, ...rest }) => rest);
            const newItems = items.map(({ _tempId, ...rest }) => rest);
            await api.updateDraft({ experiences: [...existingPending, ...newItems] });
            return { added: newItems, skipped: [] };
        },
        async confirmEducations(items) {
            const currentDraft = await api.getDraft();
            const existingPending = currentDraft.educations
                .filter(e => e.status === "PENDING")
                .map(({ id: _id, status: _s, ...rest }) => rest);
            const newItems = items.map(({ _tempId, ...rest }) => rest);
            await api.updateDraft({ educations: [...existingPending, ...newItems] });
            return { added: newItems, skipped: [] };
        },
        async confirmSkills(items) {
            const currentDraft = await api.getDraft();
            const existingPending = currentDraft.skills
                .filter(s => s.status === "PENDING")
                .map(({ id: _id, status: _s, ...rest }) => rest);
            const newItems = items.map(({ _tempId, ...rest }) => rest);
            await api.updateDraft({ skills: [...existingPending, ...newItems] });
            return { added: newItems, skipped: [] };
        },
    };
}
