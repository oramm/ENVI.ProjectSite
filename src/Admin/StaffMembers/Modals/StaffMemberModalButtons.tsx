import React from "react";
import { StaffMemberData } from "../../../../Typings/bussinesTypes";
import { GeneralEditModalButton } from "../../../View/Modals/GeneralModalButtons";
import { SpecificEditModalButtonProps } from "../../../View/Modals/ModalsTypes";
import { saveProjectAssignments } from "../../SystemUsers/Modals/SystemUserModalButtons";
import { staffMembersRepository } from "../StaffMembersController";
import { StaffMemberModalBody } from "./StaffMemberModalBody";
import { makeStaffMemberValidationSchema } from "./StaffMemberValidationSchema";

/**
 * Tylko edycja. Nie ma przycisku dodawania, bo panel nie zakłada ludzi -
 * uprawnienia przypina się do osób już istniejących w systemie.
 *
 * Po zapisie flag domykamy przypisania projektów tą samą funkcją, której używa
 * ekran użytkowników. Bez tego zmiana roli na zakresową zostawiłaby osobę
 * bez dostępu do czegokolwiek.
 */
export function StaffMemberEditModalButton({
    modalProps: { onEdit, initialData },
}: SpecificEditModalButtonProps<StaffMemberData>) {
    async function handleEdit(editedObject: StaffMemberData) {
        // saveProjectAssignments oczekuje osoby: `id` to PersonId, bo tak właśnie
        // backend identyfikuje rekord uprawnień.
        await saveProjectAssignments({
            id: editedObject.personId ?? editedObject.id,
            systemRoleId: (editedObject as any).systemRoleId,
            _projectAssignments: (editedObject as any)._projectAssignments,
        } as any);
        onEdit(editedObject);
    }

    return (
        <GeneralEditModalButton<StaffMemberData>
            modalProps={{
                onEdit: handleEdit,
                ModalBodyComponent: StaffMemberModalBody,
                modalTitle: "Uprawnienia osoby",
                repository: staffMembersRepository,
                initialData: initialData,
                makeValidationSchema: makeStaffMemberValidationSchema,
            }}
            buttonProps={{
                buttonVariant: "outline-success",
            }}
        />
    );
}
