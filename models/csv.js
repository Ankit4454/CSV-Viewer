const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const CSV_PATH = path.join('/tmp');

const csvSchema = new mongoose.Schema({
    originalname: {
        type: String
    },
    csvPath: {
        type: String
    },
    size: {
        type: Number
    },
    file: {
        type: Array
    }
}, {
    timestamps: true
});

let storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(CSV_PATH));
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix);
    }
});

// Add a file filter function
const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'text/csv' || file.mimetype === 'application/vnd.ms-excel' || file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
        cb(null, true);
    } else {
        cb(new Error('Only CSV files are allowed!'), false);
    }
};

//static methods
csvSchema.statics.uploadedCSV = multer({ storage: storage, limits: { fileSize: 1 * 1024 * 1024 }, fileFilter: fileFilter }).single('csvPath');
csvSchema.statics.uploadedCSVPath = CSV_PATH;

const CSV = mongoose.model('CSV', csvSchema);

module.exports = CSV;