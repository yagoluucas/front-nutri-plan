export interface IInput {
    placeholder: string;
    type: string;
    id: string;
    name: string;
    isRequired?: boolean;
    minLength?: number;
    maxLength?: number;
}