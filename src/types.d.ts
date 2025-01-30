declare module 'pdf-parse' {
    function pdf(data: Buffer | Uint8Array | ArrayBuffer | string): Promise<{ text: string }>;
    export default pdf;
}


declare module 'formidable' {
    import { IncomingMessage } from 'http';
  
    export interface File {
        originalFilename?: string;
        filepath: string;
        mimetype?: string;
        size: number;
    }
  
    export interface Files {
        file?: File | File[];
    }
  
    export interface Fields {
        [key: string]: string | string[];
    }
  
    export interface IncomingFormOptions {
        multiples?: boolean;
        uploadDir?: string;
        keepExtensions?: boolean;
    }
  
    export class IncomingForm {
        constructor(options?: IncomingFormOptions);
        parse(
            req: IncomingMessage,
            callback?: (err: Error | null, fields: Fields, files: Files) => void
        ): void;
    }
  }
  