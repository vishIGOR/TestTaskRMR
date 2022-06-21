import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { ValidationPipe } from "@nestjs/common";
import { ServerErrorsInterceptor } from "./app.interceptors";

async function start() {
    const PORT = process.env.PORT || 3000;
    const app = await NestFactory.create(AppModule);

    app.useGlobalPipes(new ValidationPipe({
        transform: true
    }));
    app.useGlobalInterceptors(new ServerErrorsInterceptor());

    const config = new DocumentBuilder()
        .setTitle("Test task for rmr")
        .setDescription("Документация API для тестового задания по node.js от red_mad_robot")
        .setVersion("1.0.0")
        .addBearerAuth()
        .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup("/docs", app, document);

    await app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
}

start();
