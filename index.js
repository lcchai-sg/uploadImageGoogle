const express = require("express");
const app = express();
const port = 8080;
const path = require("path");
const { Storage } = require("@google-cloud/storage");
const Multer = require("multer");
const src = path.join(__dirname, "views");
app.use(express.static(src));

const multer = Multer({
    storage: Multer.memoryStorage(),    // using memory stream, instead of space on express server
    limits: {
        fileSize: 10 * 1024 * 1024,     // No larger than 5mb, change as you need
    },
});

let projectId = "scraper-300708";       // get from Google Cloud
let keyFilename = "mykey.json";         // get from Google Cloud -> Credentials -> Service Accounts
const storage = new Storage({
    projectId,
    keyFilename,
});
const bucket = storage.bucket("lc_scraper_images"); // Get from Google Cloud -> Storage

// Gets all files in the defined bucket
app.get("/upload", async (req, res) => {
    try {
      const [files] = await bucket.getFiles();
      res.send([files]);
      console.log("Success");
    } catch (error) {
      res.send("Error:" + error);
    }
});
// Streams file upload to Google Storage
app.post("/upload", multer.single("imgfile"), (req, res) => {
    console.log("Made it /upload");
    try {
        if (req.file) {
            console.log("File found, trying to upload...");
            const blob = bucket.file(req.file.originalname);
            const blobStream = blob.createWriteStream();
      
            blobStream.on("finish", () => {
                res.status(200).send("Success");
                console.log("Success");
            });
            blobStream.end(req.file.buffer);
        } else throw "error with img";
    } catch (error) {
        res.status(500).send(error);
    }
});

app.get("/", (req, res, next) => {
    res.sendFile(src + "/index.html");
});
app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});
