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

const groupBy = keys => array =>
  array.reduce((objectsByKeyValue, obj) => {
    const value = keys.map(key => obj[key]).join('-');
    objectsByKeyValue[value] = (objectsByKeyValue[value] || []).concat(obj);
    return objectsByKeyValue;
  }, {});
const groupByKSP = groupBy(['key', 'syn', 'pos']);


function makeRequest(dataSlice) {
    // do your request here
    dataSlice.map(function(elem, i) {
      var tk = token.get(elem)
      const tl = (lengo === 'en') ? 'ar' : 'en';
      // console.log('tl', lengo, tl);
      var url = `https://translate.google.com/translate_a/single?client=webapp&sl=${lengo}&tl=${tl}&hl=en&dt=at&dt=bd&dt=ex&dt=ld&dt=md&dt=qca&dt=rw&dt=rm&dt=ss&dt=t&otf=1&ssel=5&tsel=5&kc=5&tk=` + tk.value + '&q=' + encodeURIComponent(elem);
      var headers = {
        'User-Agent': fakeUa()
      };
      request.get({ url: url, headers: headers }, (e, r, body) => {
        const syn = JSON.parse(body);
        var key = decodeURIComponent(r.req.path.split('&q=')[1]);

        (syn[1]) ? console.log('ok') : console.log('NOT ok: ', key)
        let access = (syn[1]) ? true : false;
        if (access) {
          const shape = Object.keys(syn[1]).reduce((acc, arr) => {
            let pos = syn[1][arr][2];
            return acc.concat(Object.keys(pos).reduce((acc, word) => {
                return acc.concat(pos[word][1].reduce((acc, e) => (
                  acc.concat({key:key, syn:e, prob:(pos[word][3])?pos[word][3]:0.0000010101011, pos:syn[1][arr]["0"]})
                  ),[]))
                }
                , [])
                )}
                , [])
          let groups =  groupByKSP(shape);
          let uniqeSum = Object.values(groups).reduce((acc, r, idx)=> {
            return acc.concat(Object.values(r.reduce((acr, e, i) => {
              if (i == 0) { 
                acr = e  
              } else {
                acr.prob += e.prob ;  
              }
              return acr
            }
            , {})) + ' \n')
          }, '')
          // console.log('uniqeSum: ', uniqeSum);
  
          fs.appendFile(`${name}.txt`, `${uniqeSum}`, function (err) {
            if (err) throw err;
            console.log(c, 'Saved!');
            if(c >= l) {
            console.log('finish', counter);
            var filePath = path.join(__dirname, `${name}.txt`);
            var stat = fs.statSync(filePath);
            res.writeHead(200, {
                'Content-Type': 'application/octet-stream',
                "Content-Disposition": `attachment; filename="${name}-synNet.txt"`,
                'Content-Length': stat.size
            });
  
            var readStream = fs.createReadStream(filePath);
            // We replaced all the event handlers with a simple call to readStream.pipe()
            readStream.pipe(res);
            try {
              fs.unlinkSync(filePath)
              //file removed
            } catch(err) {
              console.error(err)
            }
          } else {
            ++c;
          }
          });
        } else {
          ++c;
          if(c > l) {
            console.log('finish', counter);
            var filePath = path.join(__dirname, `${name}.txt`);
            if (fs.existsSync(filePath)){
              var stat = fs.statSync(filePath);
              res.writeHead(200, {
                  'Content-Type': 'application/octet-stream',
                  "Content-Disposition": `attachment; filename="${name}-synNet.txt"`,
                  'Content-Length': stat.size
              });
              var readStream = fs.createReadStream(filePath);
              // We replaced all the event handlers with a simple call to readStream.pipe()
              readStream.pipe(res);
              try {
                fs.unlinkSync(filePath)
                //file removed
              } catch(err) {
                console.error(err)
              }  
            } else {
              res.writeHead(400);
              res.statusMessage = 'Not Accepted watch your language!';
              res.end();
            }
          }
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
    // console.log(lngDetector.getLanguages())
    console.log('Lang:', fileData.reduce((a, e)=>a.concat(e + ' '),''), lngDetector.detect(fileData.reduce((a, e)=>a.concat(e + ' '),'')))
    res = response;
    name = nameWExt.split('.')[0];
    // console.log('resp', fileData);
    l = fileData.length;
    c = 1;
    counter = 0;
    lengo = language[0];
    myFunction();
}

module.exports.getSyn = getSyn;
