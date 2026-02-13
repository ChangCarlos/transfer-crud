import { NextFunction, Request, Response } from "express";
import { BaseError } from "../errors/base.error";
import { ZodError } from "zod";


export function errorHandler(
    err: any,
    req: Request,
    res: Response,
    next: NextFunction
) {
    if (err instanceof ZodError) {
        return res.status(400).json({
            message: "Validation error",
            errors: err.issues.map((issue: any) => ({
                field: issue.path.join('.'),
                message: issue.message,
            })),
        });
    }

    if ( err instanceof BaseError ) {
        return res.status(err.statusCode).json({
            message: err.message,
        })
    }

    if (err.code) {
        switch (err.code) {
            case 'P2002':
                return res.status(409).json({
                    message: "Unique constraint violation",
                    field: err.meta?.target,
                });
            case 'P2025':
                return res.status(404).json({
                    message: "Record not found",
                });
            default:
                break;
        }
    }

    console.error('Unexpected error:', err);

    return res.status(500).json({
        message: "Internal Server Error",
    })
}