var http = require('http'),
    xlsx =require('node-xlsx'),
    gogle =require('./gogle'),
    fs = require('fs'),
    multiparty = require("multiparty"),
    utils = require('./utils.js'),
    fileTypes = ['csv', 'xls', 'xlsx'];


http.createServer(function(req, res) {
  console.log('req.url:', req.url, req.method);
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
            gogle.getSyn(dataArray.slice(0, 50), res, originalFilename, fields.lang);
          })
        } else {
          const workSheetsFromFile = xlsx.parse(path);
          var flattened = workSheetsFromFile[0].data.reduce((e, a) => e.concat(a),[]);
          gogle.getSyn(flattened.slice(0, 50), res, originalFilename, fields.lang);
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
  } else if (req.url == '/contact' && req.method.toLowerCase() == 'post') {
    utils.parseBody(req,function(err,user_data){
      console.log('contact msg', user_data)
      res.writeHead(301,
        {Location: '/#Contact'}
      );
      res.end();
    })
    
    // var form = new multiparty.Form();
    // let msg;
    // form.parse(req, function(err, fields, files) {
    //   msg = fields;
    //   console.log('fields',fields)
    // })
    // const param = req.url.split('?')[1];
    // const msg = param.split('&').reduce((a, e) => (a.concat({[e.split('=')[0]] : decodeURIComponent(e.split('=')[1])})), []);
  } else if (req.url.split('?')[0] == '/newsletter' && req.method.toLowerCase() == 'get') {
    console.log('newsletter email', req.url.split('?')[1])
    res.end();
  } else if (req.url == '/robots.txt'){
    res.writeHead(200, {'accept':'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8', 'content-type': 'text/plain'});
    var readSream = fs.createReadStream('./robots.txt','utf8')
    readSream.pipe(res);
  } else if (req.url == '/sitemap.xml'){
    res.writeHead(200);
    var readSream = fs.createReadStream('./sitemap.xml','utf8')
    readSream.pipe(res);
  } else {
  // show a file upload form
  // var html = fs.readFileSync('./src/front/index.html', 'utf8')
  res.writeHead(200, {'content-type': 'text/html'});
  var readSream = fs.createReadStream('./src/front/index.html','utf8')
  readSream.pipe(res);
  }

}).listen(process.env.PORT || 8080);
