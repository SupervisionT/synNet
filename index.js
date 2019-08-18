var http = require('http'),
    xlsx =require('node-xlsx'),
    gogle =require('./gogle'),
    fs = require('fs'),
    multiparty = require("multiparty"),
    fileTypes = ['csv', 'xls', 'xlsx'];


http.createServer(function(req, res) {
  console.log('req.url:', req.url);
  if (req.url == '/upload' && req.method.toLowerCase() == 'post') {
    // parse a file upload
    // var form = new formidable.IncomingForm();
    // console.log('form', form)
    // form.uploadDir = __dirname + "/tmp";
    // form.encoding = 'utf-8';
    

    var form = new multiparty.Form();

    // form.on("part", function(part){
    //     if(part.filename)
    //     {
    //       console.log('part', part)
    //       // const { file: { path } } = req;
    //       // console.log('path', path);
    //       // const { data } = xlsx.parse(path)[0];
    //       // data.splice(0, 1);
    //           var FormData = require("form-data");
    //           // var request = require("request")
    //           var form = new FormData(part);
    
    //           // form.append("thumbnail", part, {filename: part.filename,contentType: part["content-type"]});
    //           console.log('form', form)
    //           // var r = request.post("http://localhost:7070/store", { "headers": {"transfer-encoding": "chunked"} }, function(err, res, body){ 
    //           //     httpResponse.send(res);
    //           // });
              
    //           // r._form = form
    //     }
    // })

    // form.on("error", function(error){
    //     console.log(error);
    // })

    // form.parse(req);
    // form.parse(req, function(err, fields, files) {
    //   console.log(files)
    //   let path = files.upload['0'].path;
    //   const { data } = xlsx.parse(path)[0];
    //   console.log(data);
    // })


    // const { file: { path } } = req;
    // const { data } = xlsx.parse(path)[0];
    // data.splice(0, 1);

    form.parse(req, function(err, fields, files) {
      let { path, originalFilename } = files.upload['0'];
      console.log('path, type', path, originalFilename, originalFilename.split('.')[1]);
      if (fileTypes.includes(originalFilename.split('.')[1]) && fields.lang !== '0'){
        if (originalFilename.split('.')[1] === fileTypes[0]){
          fs.readFile(path, 'utf8', function (err, data) {
            var dataArray = data.split(/\r?\n/);  //Be careful if you are in a \r\n world...
            // Your array contains ['ID', 'D11', ... ]
            gogle.getSyn(dataArray, res, originalFilename, fields.lang);
          })
        } else {
          const workSheetsFromFile = xlsx.parse(path);
          var flattened = workSheetsFromFile[0].data.reduce((e, a) => e.concat(a),[]);
          gogle.getSyn(flattened, res, originalFilename, fields.lang);
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

    return
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
