import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { join, extname } from "path";
import { writeFileSync, readFileSync } from "fs";
import { FileParser } from "./file.parser";

@Injectable()
export class FileService {
    constructor(
        private prisma: PrismaService,
        private fileParser: FileParser,
        ) {}
        
        async fileUpload(res, file: Express.Multer.File) {
            try {
                const filePath = join(process.cwd(), 'files', file.originalname)
                
                writeFileSync(filePath, file.buffer)
                const newFile = await this.prisma.files.create({
                    data: {
                        fileName: file.originalname,
                        link: '/' + file.originalname
                    }
                })
                
                return res.status(201).json({
                    fileId: newFile.id
                })
                
            } catch(error) {
                res.json({
                    message: error.message
                })
            }
        }

                        // MULTIPLE FILES UPLOAD AND CONCATENATION
        async multipleUpload(res, files) {
            try {

                let count1 = 0
                let count2 = 0
                files.forEach(file => {
                    if( extname(file.originalname).toLowerCase() == '.pdf') {
                        count1++
                    }
                })
                files.forEach(file => {
                    if( extname(file.originalname).toLowerCase() == '.xls' || extname(file.originalname).toLowerCase() == '.xlsx' ) {
                        count2++
                    }
                })
                
                if(files.length == count1) return this.pdf(res, files)
                if(files.length == count2) return this.excel(res, files)
                else {
                    throw new Error('Every files must be in the same format!')
                }

            } catch(err) {
                res.json({
                    message: err.message
                })
            }
        }

        async pdf(res, filess) {

            let answer = await this.fileParser.cancatPDFMultiple(res, filess)
            // console.log(answer)

            return res.status(201).json(answer)
        }

        async excel(res, filess) {

            let answer = await this.fileParser.cancatExcelMultiple(res, filess)

            return res.status(201).json(answer)
        }
        
        // ONLY TWO FILES UPLOAD AND CONCATENATION
        // async filesUpload(res, files) {
        //     try {
        
        //                         // for PDF files concatination
        //         if( extname(files[0].originalname).toLowerCase() == '.pdf' && extname(files[1].originalname).toLowerCase() == '.pdf' ) {
        //             const filePath1 = join(process.cwd(), 'files', files[0].originalname)
        //             const filePath2 = join(process.cwd(), 'files', files[1].originalname)
        
        //             writeFileSync(filePath1, files[0].buffer)
        //             writeFileSync(filePath2, files[1].buffer)
        
        //             const newFile1 = await this.prisma.files.create({
        //                 data: {
        //                     fileName: files[0].originalname,
        //                     link: '/' + files[0].originalname
        //                 }
        //             })
        
        //             const newFile2 = await this.prisma.files.create({
        //                 data: {
        //                     fileName: files[1].originalname,
        //                     link: '/' + files[1].originalname
        //                 }
        //             })
        
        //             let answer = await this.fileParser.cancatPDF(res, files[0].originalname, files[1].originalname)
        
        //             return res.status(201).json(answer)
        //         } 
        //                             // for EXCEL files concatination
        //         else if( (extname(files[0].originalname) == '.xls' || extname(files[0].originalname) == '.xlsx') && (extname(files[1].originalname) == '.xls' || extname(files[1].originalname) == '.xlsx') ) {
        //             const filePath1 = join(process.cwd(), 'files', files[0].originalname)
        //             const filePath2 = join(process.cwd(), 'files', files[1].originalname)
        
        //             writeFileSync(filePath1, files[0].buffer)
        //             writeFileSync(filePath2, files[1].buffer)
        
        //             const newFile1 = await this.prisma.files.create({
        //                 data: {
        //                     fileName: files[0].originalname,
        //                     link: '/' + files[0].originalname
        //                 }
        //             })
        
        //             const newFile2 = await this.prisma.files.create({
        //                 data: {
        //                     fileName: files[1].originalname,
        //                     link: '/' + files[1].originalname
        //                 }
        //             })
        
        //             let answer = await this.fileParser.cancatExcel(res, files[0].originalname, files[1].originalname)
        
        //             return res.status(201).json(answer)
        //         }  
        //         else {
        //             res.json({
        //                 message: "Both files must be in the same format!"
        //             })
        //         }
        
        //     } catch(err) {
        //         res.json({
        //             message: err.message
        //         })
        //     }
        // }
        
        async fileGet(res, fileId: string) {
            try {
                const findFile = await this.prisma.files.findUnique({
                    where: {
                        id: Number(fileId)
                    }
                })
                
                let fileData;
                if(extname(findFile.fileName) == '.pdf') fileData = await this.fileParser.pdfParserOne(res, findFile.fileName)
                if(extname(findFile.fileName) == '.xls' || extname(findFile.fileName) == '.xlsx') fileData = await this.fileParser.excelParser(res, join(process.cwd(), 'files', findFile.fileName))
                
                return res.json({
                    findFile,
                    fileData
                })
                
            } catch(error) {
                res.json({
                    message: error.message
                })
            }
        }
    }