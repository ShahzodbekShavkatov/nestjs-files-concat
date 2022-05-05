import { Injectable } from "@nestjs/common";
import { readFileSync, open, write, close, writeFileSync } from "fs";
import { join } from "path";
import * as pdf from "pdf-parse";
import { PDFDocument } from "pdf-lib";
import { jsonToXlsx } from "json-and-xlsx";
import * as XLSX from "xlsx";
import xlsx from "node-xlsx";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class FileParser {
    constructor(
        private prisma: PrismaService
    ) {}
    
    async pdfParserOne(res, filename) {
        try {
            const pdfFile = readFileSync(join(process.cwd(), 'files', filename))
        
            const fileObj = await pdf(pdfFile).then(function(data) {
                return {
                    numpages: data.numpages,
                    info: data.info,
                }
            });
            
            return fileObj
        } catch(error) {
            res.json({
                message: error.message
            })
        }

    }

    async pdfParser(res, filename) {
        try {
            const pdfFile = readFileSync(join(process.cwd(), 'concatFiles', filename))
        
            const fileObj = await pdf(pdfFile).then(function(data) {
                return {
                    numpages: data.numpages,
                    info: data.info,
                }
            });
            
            return fileObj
        } catch(error) {
            res.json({
                message: error.message
            })
        }

    }
    
    async excelParser(res, filename) {
        try {
            const xlsFile = XLSX.readFile(filename);
        
            let parseData = Object.keys(xlsFile.Sheets).map( name => ({
                data: XLSX.utils.sheet_to_json(xlsFile.Sheets[name])
            }))
    
            return {
                rows: parseData[0].data.length
            }
        } catch(error) {
            res.json({
                message: error.message
            })
        }

    }


    async cancatPDFMultiple(res, filess) {
        try {

            let size = 0
            filess.forEach(async file => {
                const filename =  (new Date().getTime()) + file.originalname.replace(/\s/g, '')
                const filePath = join(process.cwd(), 'files', filename)

                writeFileSync(filePath, file.buffer)
                size += file.size
                const newFile1 = await this.prisma.files.create({
                    data: {
                        fileName: filename,
                        link: '/' + filename
                    }
                })
            })

            let outputFileName = (new Date().getTime()) + '.pdf'
            let outputFilePath = join(process.cwd(), 'concatFiles', outputFileName)
            let pdfsToMerge = filess.map(file => {
                return file.buffer

            })

            const mergedPdf = await PDFDocument.create()
            for (const pdfBytes of pdfsToMerge) { 
                const pdf = await PDFDocument.load(pdfBytes); 
                const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
                copiedPages.forEach((page) => {
                    mergedPdf.addPage(page); 
                }); 
            } 
            
            const buf = await mergedPdf.save();        // Uint8Array

            open(outputFilePath, 'w', function (err, fd) {
                write(fd, buf, 0, buf.length, null, function (err) {
                    close(fd, function () {
                        console.log('wrote the file successfully');
                    }); 
                }); 
            });
    
            const newFile = await this.prisma.files.create({
            data: {
                    fileName: outputFileName,
                    link: '/' + outputFileName
                }
            })

            let pdfPages  = await this.pdfParser(res, outputFileName)
    
            return {
                fileId: newFile.id,
                link: '/' + outputFileName,
                numpages: pdfPages.numpages,
                info: pdfPages.info,
                fileSize: `${(size / (2 ** 20)).toFixed(3)}mb`
            }
        } catch(error) {
            res.json({
                message: error
            })
        }
    }


                    // ONLY TWO PDF FILES CONCATENATION
    async cancatPDF(res, filename1, filename2) {
        try {
            const path1 = join(process.cwd(), 'files', filename1)
            const path2 = join(process.cwd(), 'files', filename2)
            const output = (new Date().getTime()) + '.pdf'
            const outputpath = join(process.cwd(), 'files', output)
            
            let pdfBuffer1 = readFileSync(path1)
            let pdfBuffer2 = readFileSync(path2)
            
            let pdfsToMerge = [pdfBuffer1, pdfBuffer2]
            
            const mergedPdf = await PDFDocument.create(); 
            for (const pdfBytes of pdfsToMerge) { 
                const pdf = await PDFDocument.load(pdfBytes); 
                const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
                copiedPages.forEach((page) => {
                    mergedPdf.addPage(page); 
                }); 
            } 
            
            const buf = await mergedPdf.save();        // Uint8Array
            
            let path = outputpath; 
            open(path, 'w', function (err, fd) {
                write(fd, buf, 0, buf.length, null, function (err) {
                    close(fd, function () {
                        // console.log('wrote the file successfully');
                    }); 
                }); 
            });
    
            const newFile = await this.prisma.files.create({
                data: {
                    fileName: output,
                    link: '/' + output
                }
            })
    
            let pdfPages  = await this.pdfParser(res, output)
        
            return {
                fileId: newFile.id,
                link: '/' + output,
                numpages: pdfPages.numpages,
                info: pdfPages.info
            }
        } catch(error) {
            res.json({
                message: error.message
            })
        }
        
    }

    async cancatExcelMultiple(res, filess) {
        try {

            let filenameArray = filess.map(async file => {
                const filename =  (new Date().getTime()) + file.originalname.replace(/\s/g, '')
                const filePath = join(process.cwd(), 'files', filename)

                writeFileSync(filePath, file.buffer)

                const newFile1 = await this.prisma.files.create({
                    data: {
                        fileName: filename,
                        link: '/' + filename
                    }
                })
                return filename

            })

            const outputFileName = (new Date().getTime()) + '.xls'
            const outputpath = join(process.cwd(), 'concatFiles', outputFileName)
            let array = filess.map(file => {

                const workSheetsFromBuffer = xlsx.parse(file.buffer)
                return [...workSheetsFromBuffer[0].data]

            })
            let readyxls = jsonToXlsx.readAndGetBuffer(array)
            writeFileSync(outputpath, readyxls)
            const newFile = await this.prisma.files.create({
                data: {
                    fileName: outputFileName,
                    link: '/' + outputFileName
                }
            })
    
            let excelRow = await this.excelParser(res, outputpath)
    
            return {
                fileId: newFile.id,
                rows: excelRow.rows,
                link: '/' + outputFileName,
                fileSize: ( Buffer.byteLength(readyxls) / (2 ** 20) ).toFixed(3) + 'mb'
            }

        } catch(error) {
            res.json({
                message: error.message
            })
        }
    }


                    // ONLY TWO EXCEL FILES CONCATENATION
    async cancatExcel(res, filename1, filename2) {
        try {
            const path1 = join(process.cwd(), 'files', filename1)
            const path2 = join(process.cwd(), 'files', filename2)
            const outputFileName = (new Date().getTime()) + '.xls'
            const outputpath = join(process.cwd(), 'files', outputFileName)
    
            const workSheetsFromBuffer1 = xlsx.parse(readFileSync(path1))
            const workSheetsFromBuffer2 = xlsx.parse(readFileSync(path2))
    
            let array = [...workSheetsFromBuffer1[0].data, ...workSheetsFromBuffer2[0].data]
            let readyxls = jsonToXlsx.readAndGetBuffer(array)
    
            writeFileSync(outputpath, readyxls)
    
            const newFile = await this.prisma.files.create({
                data: {
                    fileName: outputFileName,
                    link: '/' + outputFileName
                }
            })
    
            let excelRow = await this.excelParser(res, outputpath)
    
            return {
                fileId: newFile.id,
                rows: excelRow.rows,
                link: '/' + outputFileName
            }
        } catch(error) {
            res.json({
                message: error.message
            })
        }
    }

}