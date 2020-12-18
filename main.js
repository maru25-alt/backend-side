import express, { json } from "express";
import multer from "multer";
import path from "path";
import { v4 as uuid } from "uuid";
import fs from "fs";
import cors from 'cors'

const uniqueId = uuid();
const port = process.env.PORT || 5000;
const dirPath = "./public/upload_directory/";
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(express.static("./public"));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, dirPath);
  },
  filename: function (req, file, cb) {
    let i = file.originalname.lastIndexOf(".");
    let newName = file.originalname.slice(0, i);
    cb(null, newName + "-" + uniqueId + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 2000000 },
});

app.get("/", (req, res) => {
  res.send("home page");
  //need to redirect this towards photolink
});

const getFilesizeInBytes = (filename) => {
  const stats = fs.statSync(filename);
  const fileSizeInBytes = stats.size;
  return fileSizeInBytes;
};

const readFile = (req, res, next) => {
  fs.readdir(dirPath, (err, photos) => {
    if (err) {
      return next(err);
    } else {
      res.locals.filenames = photos;
      next();
    }
  });
};

app.get("/photos", readFile, (req, res) => {
  let photos = res.locals.filenames;
  //console.log(photos)
  photos = photos.map((photo) => ({
    src: photo,
    filesize: getFilesizeInBytes(`${dirPath}${photo}`),
  }));
  console.log("line 60: ", photos);

  res.json(photos);
});

app.get("/photos/:photoId", (req, res) => {
  res.send("setting up photos/:id route - tbc");
});
//Respond with a single photo object that has an src (filename) and filesize (i.e. bytes, mb, kb)

app.post("/upload", upload.single("photo"), (req, res, next) => {
  try {
    console.log("logging req.file: ", req.file);
    res.status(200).sendFile(`${__dirname}/public/upload_directory/${req.file.filename}`);
  } catch (err) {
    res.status(418).send(err);
  }
});

app.listen(port, () => {
  console.log(`Port is now running of localhost ${port}`);
});
