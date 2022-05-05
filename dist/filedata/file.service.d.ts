/// <reference types="multer" />
import { PrismaService } from "src/prisma/prisma.service";
import { FileParser } from "./file.parser";
export declare class FileService {
    private prisma;
    private fileParser;
    constructor(prisma: PrismaService, fileParser: FileParser);
    fileUpload(res: any, file: Express.Multer.File): Promise<any>;
    multipleUpload(res: any, files: any): Promise<any>;
    pdf(res: any, filess: any): Promise<any>;
    excel(res: any, filess: any): Promise<any>;
    fileGet(res: any, fileId: string): Promise<any>;
}
