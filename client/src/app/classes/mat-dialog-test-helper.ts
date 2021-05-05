import { MatDialogRef } from '@angular/material/dialog';

export class MatDialogTestHelper {
    // tslint:disable-next-line: no-any because no known type
    openDialog: MatDialogRef<any>[] = [];
    open(): {} {
        return {};
    }
}
