export class HttpException extends Error {
    constructor(public status: number = 500, message: string) {
        super(message);
        this.name = 'HttpException';
    }
}
