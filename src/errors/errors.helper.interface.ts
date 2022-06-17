export interface IErrorsHelper {
    returnNullWhenCaughtCastError(error): null;

    returnFalseWhenCaughtCastError(error): boolean;

    throwInvalidIdExceptionWhenCaughtCastError(error);
}

export const IErrorsHelper = Symbol("IErrorsHelper");