export interface IGoogleDriveFileStore {
    id: string;
    name: string;
    mimeType: string;
    parents: string[];
    modifiedTime: Date;
    urlId?: string // It is not added by Google Drive. We are using it internally.
}