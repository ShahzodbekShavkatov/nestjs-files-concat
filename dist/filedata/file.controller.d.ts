/// <reference types="multer" />
import { FileService } from "./file.service";
import { Response } from "express";
export declare class FileController {
    private fileService;
    constructor(fileService: FileService);
    filePost(res: Response, file: Express.Multer.File): Promise<any>;
    filesPost(res: Response, files: Array<Express.Multer.File>): Promise<any>;
    fileGet(res: Response, fileId: string): Promise<any>;
}
