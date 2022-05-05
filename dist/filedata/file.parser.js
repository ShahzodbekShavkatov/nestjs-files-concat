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
exports.FileParser = void 0;
const common_1 = require("@nestjs/common");
const fs_1 = require("fs");
const path_1 = require("path");
const pdf = require("pdf-parse");
const pdf_lib_1 = require("pdf-lib");
const json_and_xlsx_1 = require("json-and-xlsx");
const XLSX = require("xlsx");
const node_xlsx_1 = require("node-xlsx");
const prisma_service_1 = require("../prisma/prisma.service");
let FileParser = class FileParser {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async pdfParserOne(res, filename) {
        try {
            const pdfFile = (0, fs_1.readFileSync)((0, path_1.join)(process.cwd(), 'files', filename));
            const fileObj = await pdf(pdfFile).then(function (data) {
                return {
                    numpages: data.numpages,
                    info: data.info,
                };
            });
            return fileObj;
        }
        catch (error) {
            res.json({
                message: error.message
            });
        }
    }
    async pdfParser(res, filename) {
        try {
            const pdfFile = (0, fs_1.readFileSync)((0, path_1.join)(process.cwd(), 'concatFiles', filename));
            const fileObj = await pdf(pdfFile).then(function (data) {
                return {
                    numpages: data.numpages,
                    info: data.info,
                };
            });
            return fileObj;
        }
        catch (error) {
            res.json({
                message: error.message
            });
        }
    }
    async excelParser(res, filename) {
        try {
            const xlsFile = XLSX.readFile(filename);
            let parseData = Object.keys(xlsFile.Sheets).map(name => ({
                data: XLSX.utils.sheet_to_json(xlsFile.Sheets[name])
            }));
            return {
                rows: parseData[0].data.length
            };
        }
        catch (error) {
            res.json({
                message: error.message
            });
        }
    }
    async cancatPDFMultiple(res, filess) {
        try {
            let size = 0;
            filess.forEach(async (file) => {
                const filename = (new Date().getTime()) + file.originalname.replace(/\s/g, '');
                const filePath = (0, path_1.join)(process.cwd(), 'files', filename);
                (0, fs_1.writeFileSync)(filePath, file.buffer);
                size += file.size;
                const newFile1 = await this.prisma.files.create({
                    data: {
                        fileName: filename,
                        link: '/' + filename
                    }
                });
            });
            let outputFileName = (new Date().getTime()) + '.pdf';
            let outputFilePath = (0, path_1.join)(process.cwd(), 'concatFiles', outputFileName);
            let pdfsToMerge = filess.map(file => {
                return file.buffer;
            });
            const mergedPdf = await pdf_lib_1.PDFDocument.create();
            for (const pdfBytes of pdfsToMerge) {
                const pdf = await pdf_lib_1.PDFDocument.load(pdfBytes);
                const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
                copiedPages.forEach((page) => {
                    mergedPdf.addPage(page);
                });
            }
            const buf = await mergedPdf.save();
            (0, fs_1.open)(outputFilePath, 'w', function (err, fd) {
                (0, fs_1.write)(fd, buf, 0, buf.length, null, function (err) {
                    (0, fs_1.close)(fd, function () {
                        console.log('wrote the file successfully');
                    });
                });
            });
            const newFile = await this.prisma.files.create({
                data: {
                    fileName: outputFileName,
                    link: '/' + outputFileName
                }
            });
            let pdfPages = await this.pdfParser(res, outputFileName);
            return {
                fileId: newFile.id,
                link: '/' + outputFileName,
                numpages: pdfPages.numpages,
                info: pdfPages.info,
                fileSize: `${(size / (2 ** 20)).toFixed(3)}mb`
            };
        }
        catch (error) {
            res.json({
                message: error
            });
        }
    }
    async cancatPDF(res, filename1, filename2) {
        try {
            const path1 = (0, path_1.join)(process.cwd(), 'files', filename1);
            const path2 = (0, path_1.join)(process.cwd(), 'files', filename2);
            const output = (new Date().getTime()) + '.pdf';
            const outputpath = (0, path_1.join)(process.cwd(), 'files', output);
            let pdfBuffer1 = (0, fs_1.readFileSync)(path1);
            let pdfBuffer2 = (0, fs_1.readFileSync)(path2);
            let pdfsToMerge = [pdfBuffer1, pdfBuffer2];
            const mergedPdf = await pdf_lib_1.PDFDocument.create();
            for (const pdfBytes of pdfsToMerge) {
                const pdf = await pdf_lib_1.PDFDocument.load(pdfBytes);
                const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
                copiedPages.forEach((page) => {
                    mergedPdf.addPage(page);
                });
            }
            const buf = await mergedPdf.save();
            let path = outputpath;
            (0, fs_1.open)(path, 'w', function (err, fd) {
                (0, fs_1.write)(fd, buf, 0, buf.length, null, function (err) {
                    (0, fs_1.close)(fd, function () {
                    });
                });
            });
            const newFile = await this.prisma.files.create({
                data: {
                    fileName: output,
                    link: '/' + output
                }
            });
            let pdfPages = await this.pdfParser(res, output);
            return {
                fileId: newFile.id,
                link: '/' + output,
                numpages: pdfPages.numpages,
                info: pdfPages.info
            };
        }
        catch (error) {
            res.json({
                message: error.message
            });
        }
    }
    async cancatExcelMultiple(res, filess) {
        try {
            let filenameArray = filess.map(async (file) => {
                const filename = (new Date().getTime()) + file.originalname.replace(/\s/g, '');
                const filePath = (0, path_1.join)(process.cwd(), 'files', filename);
                (0, fs_1.writeFileSync)(filePath, file.buffer);
                const newFile1 = await this.prisma.files.create({
                    data: {
                        fileName: filename,
                        link: '/' + filename
                    }
                });
                return filename;
            });
            const outputFileName = (new Date().getTime()) + '.xls';
            const outputpath = (0, path_1.join)(process.cwd(), 'concatFiles', outputFileName);
            let array = filess.map(file => {
                const workSheetsFromBuffer = node_xlsx_1.default.parse(file.buffer);
                return [...workSheetsFromBuffer[0].data];
            });
            let readyxls = json_and_xlsx_1.jsonToXlsx.readAndGetBuffer(array);
            (0, fs_1.writeFileSync)(outputpath, readyxls);
            const newFile = await this.prisma.files.create({
                data: {
                    fileName: outputFileName,
                    link: '/' + outputFileName
                }
            });
            let excelRow = await this.excelParser(res, outputpath);
            return {
                fileId: newFile.id,
                rows: excelRow.rows,
                link: '/' + outputFileName,
                fileSize: (Buffer.byteLength(readyxls) / (2 ** 20)).toFixed(3) + 'mb'
            };
        }
        catch (error) {
            res.json({
                message: error.message
            });
        }
    }
    async cancatExcel(res, filename1, filename2) {
        try {
            const path1 = (0, path_1.join)(process.cwd(), 'files', filename1);
            const path2 = (0, path_1.join)(process.cwd(), 'files', filename2);
            const outputFileName = (new Date().getTime()) + '.xls';
            const outputpath = (0, path_1.join)(process.cwd(), 'files', outputFileName);
            const workSheetsFromBuffer1 = node_xlsx_1.default.parse((0, fs_1.readFileSync)(path1));
            const workSheetsFromBuffer2 = node_xlsx_1.default.parse((0, fs_1.readFileSync)(path2));
            let array = [...workSheetsFromBuffer1[0].data, ...workSheetsFromBuffer2[0].data];
            let readyxls = json_and_xlsx_1.jsonToXlsx.readAndGetBuffer(array);
            (0, fs_1.writeFileSync)(outputpath, readyxls);
            const newFile = await this.prisma.files.create({
                data: {
                    fileName: outputFileName,
                    link: '/' + outputFileName
                }
            });
            let excelRow = await this.excelParser(res, outputpath);
            return {
                fileId: newFile.id,
                rows: excelRow.rows,
                link: '/' + outputFileName
            };
        }
        catch (error) {
            res.json({
                message: error.message
            });
        }
    }
};
FileParser = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], FileParser);
exports.FileParser = FileParser;
//# sourceMappingURL=file.parser.js.map