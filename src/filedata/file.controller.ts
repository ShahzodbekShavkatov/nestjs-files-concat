import { Controller, Get, Param, Post, Res, UploadedFile, UploadedFiles, UseInterceptors } from "@nestjs/common";
import { FileInterceptor, FilesInterceptor, AnyFilesInterceptor } from "@nestjs/platform-express";
import { FileService } from "./file.service";
import { Express, Response } from "express";
import { ApiBody, ApiConsumes, ApiCreatedResponse } from "@nestjs/swagger";

@Controller('file')
export class FileController {
    constructor(
        private fileService: FileService
    ) {}


    @Post('post')
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                file: {
                    type: 'string',
                    format: 'binary'
                }
            }
        }
    })
    @UseInterceptors(FileInterceptor('file'))
    filePost(
        @Res() res: Response,
        @UploadedFile() file: Express.Multer.File
    )  {
        return this.fileService.fileUpload(res, file)
    }


                        // ONLY TWO FILES UPLOAD AND CONCATENATION
    // @Post('posts')
    // @UseInterceptors(FilesInterceptor('files'))
    // filesPost(
    //     @Res() res: Response,
    //     @UploadedFiles() files: Array<Express.Multer.File>
    // )  {
    //     return this.fileService.filesUpload(res, files)
    // }


                    // MULTIPLE FILES UPLOAD AND CONCATENATION
    @Post('multiple')
    @ApiCreatedResponse({ description: 'Multiple files post' })
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                files: {
                    type: 'string',
                    format: 'binary'
                }
            }
        }
    })
    @UseInterceptors(FilesInterceptor('files'))
    filesPost(
        @Res() res: Response,
        @UploadedFiles() files: Array<Express.Multer.File>
    )  {
        return this.fileService.multipleUpload(res, files)
    }


    @Get('get/:fileId')
    fileGet(
        @Res() res: Response,
        @Param('fileId') fileId: string,
    ) {
        return this.fileService.fileGet(res, fileId)
    }

}