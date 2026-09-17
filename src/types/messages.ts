export interface ValidateMessage {
  method: 'validate';
  hosts: string[];
}

export type ExtensionMessage = ValidateMessage;
export type ValidateResponse = string | null;