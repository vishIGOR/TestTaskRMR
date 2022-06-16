export interface IErrorsHelper {
    returnNullWhenCaughtCastError(error): null;

    returnFalseWhenCaughtCastError(error): boolean;
}

export const IErrorsHelper = Symbol("IErrorsHelper");