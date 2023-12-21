const CSV = require('../models/csv');
const csv = require('csv-parser');
const xlsx = require('xlsx');
const fs = require('fs');
const path = require('path');

module.exports.home = function (req, res) {
    CSV.find({}).sort('-createdAt').then(function (data) {
        if(req.xhr){
            return res.status(200).json({
                data:{
                    title: 'Home',
                    files: data
                }
            });
        }
        return res.render('home', {
            title: 'Home',
            files: data
        });
    }).catch(function (err) {
        console.log(`Error while fetching files ${err}`);
    })
}

module.exports.uploadFile = function (req, res) {
    CSV.uploadedCSV(req, res, function (err) {
        if (err) {
            console.log(err);
        }

        if (req.file) {
            let csvPath = path.join(CSV.uploadedCSVPath, req.file.filename);
            let absolutePath = path.join(__dirname, '..', csvPath);
            let size = req.file.size;
            let originalname = req.file.originalname;

            if (fs.existsSync(absolutePath) && originalname.endsWith('.csv')) {
                let rows = [];
                fs.createReadStream(absolutePath)
                    .pipe(csv())
                    .on('data', (row) => {
                        if (!rows.length) {
                            rows.push(Object.keys(row));
                        }
                        let rowArray = Object.values(row);
                        rows.push(rowArray);
                    })
                    .on('end', () => {
                        CSV.create({ csvPath: csvPath, size: size, originalname: originalname, file: rows })
                            .then(function (data) {
                                if(req.xhr){
                                    return res.status(200).json({
                                        data:{
                                            file: data
                                        },
                                        message: 'File uploaded'
                                    });
                                }
                            })
                            .catch(function (err) {
                                console.log(`Error while processing and uploading file: ${err}`);
                            });
                    });
            } else if (fs.existsSync(absolutePath) && originalname.endsWith('.xlsx')) {
                let workbook = xlsx.readFile(absolutePath);
                let sheet_name_list = workbook.SheetNames;
                let rows = xlsx.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]], { header: 1 });

                rows = rows.filter(row => row.join('').trim() !== '');

                CSV.create({ csvPath: csvPath, size: size, originalname: originalname, file: rows })
                    .then(function (data) {
                        if(req.xhr){
                            return res.status(200).json({
                                data:{
                                    file: data
                                },
                                message: 'File uploaded'
                            });
                        }
                    })
                    .catch(function (err) {
                        console.log(`Error while processing and uploading a file: ${err}`);
                    });
            }
        }
    });
}

module.exports.viewFile = function(req,res){
    CSV.findById(req.query.id).then(function(data){
        if(req.xhr){
            return res.status(200).json({
                data: {
                    file: data
                },
                message: 'File loaded'
            });
        }
    }).catch(function(err){
        console.log(`Error while finding a file: ${err}`);
    })
}

module.exports.deleteFile = function(req,res){
    CSV.findByIdAndDelete(req.query.id).then(function(data){
        if (data && data.csvPath){
            fs.unlinkSync(path.join(__dirname, '..', data.csvPath));
        }
        if(req.xhr){
            return res.status(200).json({
                data: {
                    deleted: true,
                    fileId: req.query.id
                },
                message: 'File Deleted'
            });
        }
    }).catch(function(err){
        console.log(`Error while deleting a file: ${err}`);
    });
}

