import { PrismaService } from "src/prisma/prisma.service";
export declare class FileParser {
    private prisma;
    constructor(prisma: PrismaService);
    pdfParserOne(res: any, filename: any): Promise<any>;
    pdfParser(res: any, filename: any): Promise<any>;
    excelParser(res: any, filename: any): Promise<{
        rows: number;
    }>;
    cancatPDFMultiple(res: any, filess: any): Promise<{
        fileId: number;
        link: string;
        numpages: any;
        info: any;
        fileSize: string;
    }>;
    cancatPDF(res: any, filename1: any, filename2: any): Promise<{
        fileId: number;
        link: string;
        numpages: any;
        info: any;
    }>;
    cancatExcelMultiple(res: any, filess: any): Promise<{
        fileId: number;
        rows: number;
        link: string;
        fileSize: string;
    }>;
    cancatExcel(res: any, filename1: any, filename2: any): Promise<{
        fileId: number;
        rows: number;
        link: string;
    }>;
}
