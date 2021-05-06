export interface IGoogleDriveFileStore {
    id: string;
    name: string;
    mimeType: string;
    parents: string[];
    modifiedTime: Date;
}