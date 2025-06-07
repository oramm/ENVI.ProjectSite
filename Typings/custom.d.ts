declare module "*.png" {
    const value: any;
    export = value;
}

declare module "*.jpg" {
    const value: any;
    export = value;
}

declare module "*.jpeg" {
    const value: any;
    export = value;
}

declare module "*.gif" {
    const value: any;
    export = value;
}

declare module "*.svg" {
    const value: any;
    export = value;
}

declare module "*.ico" {
    const value: any;
    export = value;
}

declare namespace google {
    namespace picker {
        class PickerBuilder {
            addView(view: DocsView): PickerBuilder;
            setOAuthToken(token: string): PickerBuilder;
            setDeveloperKey(key: string): PickerBuilder;
            setCallback(callback: (data: any) => void): PickerBuilder;
            build(): Picker;
            setVisible(visible: boolean): void;
        }

        class DocsView {
            setParent(parentId: string): DocsView;
        }

        class Picker {
            setVisible(visible: boolean): void;
        }

        enum Action {
            PICKED = "picked",
            CANCEL = "cancel",
        }
    }
}
declare module "express-session" {
    interface Session {
        credentials?: Credentials;
        userData?: {
            enviId: number;
            googleId: string;
            systemEmail: string;
            userName: string;
            picture: string;
            systemRoleName: string;
            systemRoleId: number;
        };
    }
}
