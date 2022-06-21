import {
    HttpException,
    HttpStatus,
    Injectable,
    InternalServerErrorException,
    UnsupportedMediaTypeException
} from "@nestjs/common";
import { IFilesService } from "./files.service.interface";
import { resolve, join, parse } from "path";
import { existsSync, mkdirSync } from "fs";
import { unlink, writeFile } from "fs/promises";
import { randomUUID } from "crypto";

@Injectable()
export class FilesService implements IFilesService {
    async deleteFile(filename: string): Promise<void> {
        const filePath = resolve(__dirname, "..", "uploads", filename);
        try {
            await unlink(filePath);
        } catch (error) {
            throw new InternalServerErrorException("Error while deleting file with name " + filename);
        }
    }

    async createFiles(files): Promise<string[]> {
        for (const file of files) {
            this.validateFile(file);
        }

        let fileNamesPromises = [];
        for (const file of files) {
            try {
                fileNamesPromises.push(this.saveFile(file));
            } catch {
                throw new InternalServerErrorException("Error while saving file with name " + file.originalname);
            }
        }

        return Promise.all(fileNamesPromises);
    }

    async createFile(file): Promise<string> {
        try {
            this.validateFile(file);
            return await this.saveFile(file);
        } catch {
            throw new InternalServerErrorException("Error while saving file");
        }
    }


    private async saveFile(file): Promise<string> {
        const fileName = randomUUID() + "-" + (new Date()).getTime() + parse(file.originalname).ext;
        const filePath = resolve(__dirname, "..", "uploads");
        if (!existsSync(filePath)) {
            mkdirSync(filePath, { recursive: true });
        }
        await writeFile(join(filePath, fileName), file.buffer);
        return fileName;
    }

    private validateFile(file) {
        if (!file.originalname.match(/\.(jpg|jpeg|png|gif|mp4|mov)$/)) {
            throw new UnsupportedMediaTypeException("Filetype is invalid. Allowed filetypes: jpg, jpeg, png, gif, mp4, mov");
        }
    }
}