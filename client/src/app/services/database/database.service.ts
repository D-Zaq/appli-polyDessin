import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Drawing } from '@common/communication/drawing';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
    providedIn: 'root',
})
export class DatabaseService {
    private readonly SEND_URL: string = 'http://localhost:3000/log2990/polyDessin/drawing/addDrawing';
    private readonly GET_URL: string = 'http://localhost:3000/log2990/polyDessin/drawing/';
    private readonly GET_ALL_URL: string = 'http://localhost:3000/log2990/polyDessin/Drawings';
    private readonly DELETE_URL: string = 'http://localhost:3000/log2990/polyDessin/drawing/delete/';

    constructor(private http: HttpClient) {}

    sendDrawing(drawing: Drawing): Observable<number> {
        return this.http.post<number>(this.SEND_URL, drawing).pipe(
            catchError((error: HttpErrorResponse) => {
                return of(error.status);
            }),
        );
    }

    getDrawing(name: string): Observable<number | Drawing> {
        return this.http.get<Drawing | number>(this.GET_URL + name).pipe(
            catchError((error: HttpErrorResponse) => {
                return of(error.status);
            }),
        );
    }

    getDrawings(): Observable<number | Drawing[]> {
        return this.http.get<Drawing[]>(this.GET_ALL_URL).pipe(
            catchError((error: HttpErrorResponse) => {
                return of(error.status);
            }),
        );
    }

    deleteDrawing(name: string): Observable<number | Drawing> {
        return this.http.delete<Drawing>(this.DELETE_URL + name).pipe(
            catchError((error: HttpErrorResponse) => {
                return of(error.status);
            }),
        );
    }
}
