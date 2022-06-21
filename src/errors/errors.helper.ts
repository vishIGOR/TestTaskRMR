import { BadRequestException, Injectable, InternalServerErrorException } from "@nestjs/common";
import { Error } from "mongoose";
import { IErrorsHelper } from "./errors.helper.interface";

@Injectable()
export class ErrorsHelper implements IErrorsHelper {
    returnNullWhenCaughtCastError(error): null {
        if (error instanceof Error.CastError) {
            return null;
        }
        throw new UnexpectedDatabaseError();
    }

    returnFalseWhenCaughtCastError(error): boolean {
        if (error instanceof Error.CastError) {
            return false;
        }
        throw new UnexpectedDatabaseError();
    }

    throwInvalidIdExceptionWhenCaughtCastError(error) {
        if (error instanceof Error.CastError) {
            throw new BadRequestException("Invalid id");
        }
        throw new UnexpectedDatabaseError();
    }

}

export class UnexpectedDatabaseError extends InternalServerErrorException {
    constructor() {
        super("Unexpected database error");
    }
}