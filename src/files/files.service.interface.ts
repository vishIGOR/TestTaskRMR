export interface IFilesService{
    deleteFile(filename: string): Promise<void>
    createFiles(files): Promise<string[]>
    createFile(file): Promise<string>
}
export const IFilesService = Symbol("IFilesService")