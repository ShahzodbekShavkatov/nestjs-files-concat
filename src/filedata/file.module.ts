import { Module } from "@nestjs/common";
import { PrismaModule } from "src/prisma/prisma.module";
import { FileController } from "./file.controller";
import { FileParser } from "./file.parser";
import { FileService } from "./file.service";

@Module({
    imports: [PrismaModule],
    controllers: [FileController],
    providers: [FileService, FileParser]
})

export class FileModule {}