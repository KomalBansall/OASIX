const AWS = require('aws-sdk');
const fs = require('fs');



const s3 = new AWS.S3({
    accessKeyId: AWS_ACCESS_KEY_ID,
    secretAccessKey: AWS_ACCESS_KEY_SECRET,
    signatureVersion: 'v4',
    region: AWS_REGION_NAME,
});

const bucketName = 'oasix';
const uploadFile = (file) => {
    try {
        console.log('file.originalname',file.originalname);
        return new Promise((resolve, reject) => {
            const params = {
                Bucket: bucketName,
                Key: file.originalname, // The name you want to give the object in S3
                Body: file.buffer,
            };
            s3.upload(params, (err, data) => {
                if (err) {                    
                    console.error('Error uploading file:', err);
                    reject(err); // Reject the Promise with the error
                } else {
                    console.log('File uploaded successfully:', data.Location);
                    resolve(data.Location); // Resolve the Promise with the file location
                }
            });
        });
    } catch (error) {
        console.log('===============', error);
    }

};
module.exports = { uploadFile }

