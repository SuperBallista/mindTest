declare module 'bcryptjs' {
    export function hashSync(s: string, salt: number | string): string;
    export function hash(s: string, salt: number | string): Promise<string>;
    export function compareSync(s: string, hash: string): boolean;
    export function compare(s: string, hash: string): Promise<boolean>;
    export function genSaltSync(rounds?: number): string;
    export function genSalt(rounds?: number): Promise<string>;
  }
  