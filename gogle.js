let fs = require('fs');
let request = require("request");
const path = require('path');
const token = require('./google-translate-token.js');
const fakeUa = require('fake-useragent');
const LanguageDetect = require('languagedetect');

const lngDetector = new LanguageDetect();

// let logger = fs.createWriteStream('googleTkV555.json', {
//   flags: 'a' // 'a' means appending (old data will be preserved)
// })

function makeRequest(dataSlice) {
    // do your request here
    dataSlice.map(function(elem, i) {
      console.log('lang:', lngDetector.detect(elem, 1))
      var tk = token.get(elem)
      const tl = (lengo === 'en') ? 'ar' : 'en';
      // console.log('tk', tk, elem);
      var url = `https://translate.google.com/translate_a/single?client=webapp&sl=${lengo}&tl=${tl}&hl=en&dt=at&dt=bd&dt=ex&dt=ld&dt=md&dt=qca&dt=rw&dt=rm&dt=ss&dt=t&otf=1&ssel=5&tsel=5&kc=5&tk=` + tk.value + '&q=' + encodeURIComponent(elem);
      var headers = {
        'User-Agent': fakeUa()
      };
      request.get({ url: url, headers: headers }, (e, r, body) => {
        const syn = JSON.parse(body);
        var key = decodeURIComponent(r.req.path.split('&q=')[1]);

        (syn[1]) ? console.log('ok') : console.log('NOT ok: ', key)
        let access = (syn[1]) ? syn[1]["0"][2] : false;
        console.log('access', syn, key, access)
        // console.log('access length', Object.keys(access).length)
        if (access) {
          const kk = Object.keys(access).reduce((acc, arr) => (
            acc.concat((access[arr][3] + ":" + access[arr][1].join(", " + access[arr][3] + ":")).split(','))
          ), []).map(e => e.split(':'))
          // console.log('Object.keys: ', syn.length);
  
          // logger.write(JSON.stringify({'key': key, 'data': kk}))
          // logger.write(",")
          fs.appendFile('mynewfile1.txt', `${kk},`, function (err) {
            if (err) throw err;
            console.log(c, 'Saved!');
            if(c >= l) {
            console.log('finish', counter);
            var filePath = path.join(__dirname, 'mynewfile1.txt');
            var stat = fs.statSync(filePath);
            res.writeHead(200, {
                'Content-Type': 'application/octet-stream',
                "Content-Disposition": `attachment; filename="${name}-synNet.txt"`,
                'Content-Length': stat.size
            });
  
            var readStream = fs.createReadStream(filePath);
            // We replaced all the event handlers with a simple call to readStream.pipe()
            readStream.pipe(res);
          } else {
            ++c;
          }
          });
        } else {
          ++c;
        }
      });
    })
}

var myFunction = () => {
    // console.log(counter, new Date());
    let counterEnd = (counter+5 > fileData.length) ? fileData.length : counter+5
    dataSlice = fileData.slice(counter, counterEnd)
    // console.log('dataSlice length', typeof dataSlice, dataSlice);

    makeRequest(dataSlice);
    counter=counter+5;
    console.log('l, counter', l, counter);
    if (counter < l)
        setTimeout(myFunction, Math.floor(Math.random() * (6000 - 2000 + 1) + 2000));
    // } else {
    //   logger.on('end', () => {
    //     console.error('All writes are now complete.');
    //   });
    // }
}

var fileData,
l, res, name, c, counter, lengo;



function getSyn(data, response, nameWExt, language) {
    fileData = data;
    res = response;
    name = nameWExt.split('.')[0];
    console.log('resp', fileData);
    l = fileData.length;
    c = 1;
    counter = 0;
    lengo = language;
    myFunction();
}

module.exports.getSyn = getSyn;
