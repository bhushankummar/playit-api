import { ObjectId } from 'mongodb';
import * as mongoose from 'mongoose';
import * as BaseModel from './BaseModel';

// Schema
const Schema = mongoose.Schema;
const schema: mongoose.Schema = new Schema({
    _id: {
        type: Schema.Types.ObjectId,
    },
    user: {
        _id: {
            type: ObjectId
        },
        email: {
            type: String
        }
    },
    url: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    urlId: {
        type: String,
        required: true
    },
    playlistUrlId: {
        type: String,
        required: true
    },
    driveFolderId: {
        type: String,
        required: true
    },
    fileId: {
        type: String,
        required: true
    },
    localFilePath: {
        type: String,
        required: true
    },
    downloadAttemptCount: {
        type: Number,
        default: 0,
        required: true
    },
    isUploaded: {
        type: Boolean,
        default: false,
        required: true
    },
    isDownloaded: {
        type: Boolean,
        default: false,
        required: true
    },
    lastDownloadTimeStamp: {
        type: Date
    },
    errors: {
        type: Array
    }
}, {
    timestamps: true
});
schema.set('toObject', {
    getters: true,
    transform: BaseModel.transform
});
export const mediaModel = mongoose.model<any>('mediaItems', schema, 'mediaItems');