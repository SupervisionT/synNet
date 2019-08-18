var formidable = require('formidable'),
    http = require('http'),
    util = require('util'),
    xlsx =require('node-xlsx'),
    gogle =require('./gogle'),
    fs = require('fs'),
    fileTypes = ['csv', 'vnd.ms-excel', 'vnd.openxmlformats-officedocument.spreadsheetml.sheet'];

http.createServer(function(req, res) {
  console.log('req.url:', req.url);
  if (req.url == '/upload' && req.method.toLowerCase() == 'post') {
    // parse a file upload
    var form = new formidable.IncomingForm();
    // console.log('form', form)
    form.uploadDir = __dirname + "/tmp";
    form.encoding = 'utf-8';
    form.parse(req, function(err, fields, files) {
      let { path, type, name } = files.upload
      console.log('path, type', fields, files);
      if (fileTypes.includes(type.split('/')[1]) && fields.lang !== '0'){
        if (type.split('/')[1] === fileTypes[0]){
          fs.readFile(path, 'utf8', function (err, data) {
            var dataArray = data.split(/\r?\n/);  //Be careful if you are in a \r\n world...
            // Your array contains ['ID', 'D11', ... ]
            gogle.getSyn(dataArray, res, name, fields.lang);
          })
        } else {
          const workSheetsFromFile = xlsx.parse(path);
          var flattened = workSheetsFromFile[0].data.reduce((e, a) => e.concat(a),[]);
          gogle.getSyn(flattened, res, name, fields.lang);
          // console.log(`size = [${workSheetsFromFile[0].data.length}, ${workSheetsFromFile[0].data[0].length}]`);
          // console.log('form.uploadDir', path, files.upload);
        }
      } else {
        res.writeHead(400, {'content-type': 'text/plain'});
        (fields.lang == '0') ?
        res.write('You must select language') :
        res.write('You must select file or uploaded file is not compatible');
        res.end();
      }
    });

    return;
  }

  // show a file upload form
  res.writeHead(200, {'content-type': 'text/html'});
  res.end(
    '<form action="/upload" enctype="multipart/form-data" method="post">'+
    '<select class="example" name="lang">'+
      '<option name="" value="0" selected>Select Language</option>'+
      '<option name="en" value="en">English</option>'+
      '<option name="ar" value="ar">Arabic</option>'+
      '<option name="fr" value="fr">France</option>'+
    '</select><br>'+
    '<input type="file" name="upload"><br>'+
    '<input type="submit" value="Upload">'+
    '</form>'
  );
}).listen(process.env.PORT || 8080);
