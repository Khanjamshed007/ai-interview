declare module "pdf-parse-fork" {
  import { Buffer } from "buffer";

  interface PDFInfo {
    PDFFormatVersion: string;
    IsAcroFormPresent?: boolean;
    IsXFAPresent?: boolean;
    [key: string]: any;
  }

  interface PDFMetadata {
    metadata: string;
    [key: string]: any;
  }

  interface PDFPage {
    pageInfo: any;
    getTextContent(): Promise<any>;
  }

  interface PDFData {
    numpages: number;
    numrender: number;
    info: PDFInfo;
    metadata?: PDFMetadata;
    text: string;
    version: string;
  }

  function pdf(dataBuffer: Buffer | Uint8Array, options?: { max?: number }): Promise<PDFData>;

  export = pdf;
}
