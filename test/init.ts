/**
 * DO NOT MODIFY THIS FILE
 */
console.log('CONNECTION_STRING ', process.env.CONNECTION_STRING);
if (!process.env.CONNECTION_STRING) {
    console.log('Kindly include all ENV');
    process.exit(1);
}
if (process.env.BUCKET_NAME !== 'test-en') {
    console.log('You can run TEST CASES on test-en bucket only');
    process.exit(1);
}