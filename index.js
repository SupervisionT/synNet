var http = require('http'),
    xlsx =require('node-xlsx'),
    gogle =require('./gogle'),
    fs = require('fs'),
    multiparty = require("multiparty"),
    fileTypes = ['csv', 'xls', 'xlsx'];


http.createServer(function(req, res) {
  console.log('req.url:', req.url);
  if (req.url == '/upload' && req.method.toLowerCase() == 'post') {

    var form = new multiparty.Form();
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
  } else if (req.url.split('?')[0] == '/contact') {
    var form = new multiparty.Form();
    form.parse(req, function(err, fields, files) {
      console.log('fields',fields)
    })
    // const param = req.url.split('?')[1];
    // const msg = param.split('&').reduce((a, e) => (a.concat({[e.split('=')[0]] : decodeURIComponent(e.split('=')[1])})), []);
    console.log('contact msg', req.query)
    res.writeHead(301,
      {Location: '/#Contact'}
    );
    res.end();
  }

  // show a file upload form
  // var html = fs.readFileSync('./src/front/index.html', 'utf8')
  res.writeHead(200, {'content-type': 'text/html'});
  var readSream = fs.createReadStream('./src/front/index.html','utf8')
  readSream.pipe(res);

}).listen(process.env.PORT || 8080);
