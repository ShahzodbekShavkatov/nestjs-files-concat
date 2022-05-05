"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const path_1 = require("path");
const fs_1 = require("fs");
const file_parser_1 = require("./file.parser");
let FileService = class FileService {
    constructor(prisma, fileParser) {
        this.prisma = prisma;
        this.fileParser = fileParser;
    }
    async fileUpload(res, file) {
        try {
            const filePath = (0, path_1.join)(process.cwd(), 'files', file.originalname);
            (0, fs_1.writeFileSync)(filePath, file.buffer);
            const newFile = await this.prisma.files.create({
                data: {
                    fileName: file.originalname,
                    link: '/' + file.originalname
                }
            });
            return res.status(201).json({
                fileId: newFile.id
            });
        }
        catch (error) {
            res.json({
                message: error.message
            });
        }
    }
    async multipleUpload(res, files) {
        try {
            let count1 = 0;
            let count2 = 0;
            files.forEach(file => {
                if ((0, path_1.extname)(file.originalname).toLowerCase() == '.pdf') {
                    count1++;
                }
            });
            files.forEach(file => {
                if ((0, path_1.extname)(file.originalname).toLowerCase() == '.xls' || (0, path_1.extname)(file.originalname).toLowerCase() == '.xlsx') {
                    count2++;
                }
            });
            if (files.length == count1)
                return this.pdf(res, files);
            if (files.length == count2)
                return this.excel(res, files);
            else {
                throw new Error('Every files must be in the same format!');
            }
        }
        catch (err) {
            res.json({
                message: err.message
            });
        }
    }
    async pdf(res, filess) {
        let answer = await this.fileParser.cancatPDFMultiple(res, filess);
        return res.status(201).json(answer);
    }
    async excel(res, filess) {
        let answer = await this.fileParser.cancatExcelMultiple(res, filess);
        return res.status(201).json(answer);
    }
    async fileGet(res, fileId) {
        try {
            const findFile = await this.prisma.files.findUnique({
                where: {
                    id: Number(fileId)
                }
            });
            let fileData;
            if ((0, path_1.extname)(findFile.fileName) == '.pdf')
                fileData = await this.fileParser.pdfParserOne(res, findFile.fileName);
            if ((0, path_1.extname)(findFile.fileName) == '.xls' || (0, path_1.extname)(findFile.fileName) == '.xlsx')
                fileData = await this.fileParser.excelParser(res, (0, path_1.join)(process.cwd(), 'files', findFile.fileName));
            return res.json({
                findFile,
                fileData
            });
        }
        catch (error) {
            res.json({
                message: error.message
            });
        }
    }
};
FileService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        file_parser_1.FileParser])
], FileService);
exports.FileService = FileService;
//# sourceMappingURL=file.service.js.map