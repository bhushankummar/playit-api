export const transform = (document: any, plainObject: any) => {
    delete plainObject.id;
    delete plainObject.__v;
    return plainObject;
};
