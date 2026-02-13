export class BaseError extends Error {
    constructor(
        public message: string,
        public statusCode: number
    ) {
        super(message);
    }
}