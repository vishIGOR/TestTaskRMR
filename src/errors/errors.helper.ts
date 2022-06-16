import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { Error } from "mongoose";
import { IErrorsHelper } from "./errors.helper.interface";

@Injectable()
export class ErrorsHelper implements IErrorsHelper {
    returnNullWhenCaughtCastError(error): null {
        if (error instanceof Error.CastError) {
            return null;
        }
        throw new InternalServerErrorException("Unexpected database error");
    }

    returnFalseWhenCaughtCastError(error): boolean {
        if (error instanceof Error.CastError) {
            return false;
        }
        throw new InternalServerErrorException("Unexpected database error");
    }
}