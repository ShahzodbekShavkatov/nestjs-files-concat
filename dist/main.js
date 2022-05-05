"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const path_1 = require("path");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.enableCors();
    app.useStaticAssets((0, path_1.join)(__dirname, '../files'), {
        index: false,
        redirect: false
    });
    app.useStaticAssets((0, path_1.join)(__dirname, '../concatFiles'), {
        index: false,
        redirect: false
    });
    app.useGlobalPipes(new common_1.ValidationPipe());
    const options = new swagger_1.DocumentBuilder()
        .setTitle('API')
        .setDescription('Files swagger')
        .setVersion('1.0')
        .setBasePath('api')
        .addBearerAuth()
        .addTag('Demo')
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, options);
    swagger_1.SwaggerModule.setup('doc', app, document);
    await app.listen(3000);
}
bootstrap();
//# sourceMappingURL=main.js.map