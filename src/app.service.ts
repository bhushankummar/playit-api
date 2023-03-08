import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
    getHello() {
        return {
            message: 'PlayIt API is Up!'
        };
    }
}
