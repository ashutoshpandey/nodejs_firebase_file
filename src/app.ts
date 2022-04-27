import path from "path";
import express from 'express';
import * as bodyParser from 'body-parser';

// Import the functions you need from the SDKs you need
const firebase = require('firebase-admin');

class App {
    public fbapp: any;
    public app: express.Application;

    constructor() {
        this.app = express();

        this.setupFireBase();
        this.initializeMiddlewares();
        this.setupUploadDownloadFile();

        process.on('unhandledRejection', err => {
            console.log(err);
        }).on('uncaughtException', err => {
            console.log(err);
        });
    }

    public listen() {
        const { SERVER_PORT = 3000 } = process.env;
        const { SERVER_ROOT_URL = "http://localhost:${SERVER_PORT}" } = process.env;

        const server = this.app.listen(SERVER_PORT, () => {
            console.log(`Server is running at ${SERVER_ROOT_URL}...`);
        });
    }

    /**
     * @function initializeMiddlewares
     * @description Initializes all middlewares
     */
    public initializeMiddlewares() {

        this.app.use((request: express.Request, response: express.Response, next: any) => {
            response.setHeader('Access-Control-Allow-Origin', '*');
            response.setHeader('Access-Control-Allow-Methods', '*');
            response.setHeader('Access-Control-Allow-Headers', 'DNT,X-Mx-ReqToken,Keep-Alive,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,authToken,loggedusertype,loggeduserid,clinicid');
            next();
        });

        this.app.use(bodyParser.urlencoded({ extended: true }));
        this.app.use(bodyParser.json({ limit: '50mb' }));
        this.app.use(express.static(__dirname + '/public'));

        this.app.use((request: express.Request, response: express.Response, next: any) => {
            request.body.startTime = new Date();
            next();
        });

        // Configure Express to use EJS
        this.app.set("views", path.join(__dirname, "views"));
        this.app.set("view engine", "ejs");
    }

    public setupFireBase() {
        console.log(__dirname);

        let serviceAccount = require(__dirname + "/firebase/serviceAccountKey.json");

        // TODO: Add SDKs for Firebase products that you want to use
        // https://firebase.google.com/docs/web/setup#available-libraries

        // Your web app's Firebase configuration
        const firebaseConfig = {
            credential: firebase.credential.cert(serviceAccount),
            apiKey: "AIxxxxx-XAtxxxxx2_Mncxxxx-8gxxxxxlrw",
            authDomain: "filexxxxxx-xxxx.firebaseapp.com",
            projectId: "filexxxxx-xxxxx",
            storageBucket: "filexxxxxx-xxxx.appspot.com",
            messagingSenderId: "102476xxxxx083",
            appId: "1:102476xxxxx3:web:97ea25xxxxxx75ef6fe"
        };

        // Initialize Firebase
        this.fbapp = firebase.initializeApp(firebaseConfig);
    }

    public setupUploadDownloadFile() {
        this.app.use('/upload', () => {
            this.uploadFile();
        });

        this.app.use('/download', () => {
            this.downloadFile();
        });
    }

    public setupDownloadFile() {

    }

    //function to upload file
    async uploadFile() {
        let bucketName = 'gs://filedownloadtest-c1d4e.appspot.com';

        //get your bucket
        let bucket = this.fbapp.storage().bucket(bucketName);

        let filepath = 'C:\\Users\\Ashutosh Pandey\\Documents\\ashutoshpandey.png';
        let filename = 'ashutoshpandey.png' //can be anything, it will be the name with which it will be uploded to the firebase storage.

        await bucket.upload(filepath, {
            gzip: true,
            destination: filename,
            metadata: {
                cacheControl: 'public, max-age=31536000'
            }
        });

        console.log(`${filename} uploaded to bucket.`);
    }

    async downloadFile() {
        let srcFilename = 'ashutoshpandey.png';
        let destFilename = 'ramu.png';
        let bucketName = 'gs://filexxxxxx-xxxxxx.appspot.com';

        const options = {
            // The path to which the file should be downloaded, e.g. "./file.txt"
            destination: destFilename,
        };

        let bucket = this.fbapp.storage().bucket(bucketName);

        // Downloads the file
        await bucket.file(srcFilename).download(options);

        console.log(`gs://${bucketName}/${srcFilename} downloaded to ${destFilename}.`);
    }
}

export default App;