var fs = require('fs');
var http = require('http');
var https = require('https');
var url = require("url");
var yaml = require('js-yaml');
var openpgp = require('openpgp');
var Hashes = require('jshashes');

var seckeyArmored ;
var seckey ;
var eventqueue = new Object();
var eventmap = new Object();
var eventinfo ;
var meeting = new Object();
var FSM = new Object();
FSM.status = 0 ;

//eventinit();

function eventinit(){
    fs.rmdirSync("event");
    fs.mkdirSync("event");
    
    eventinfo = new Object();
    eventinfo.lastest = "non";
    fs.writeFileSync("event/event.info.yaml",yaml.safeDump(eventinfo));
}

function loadeventqueue(){
    eventmap = new Object();
    var files = fs.readdirSync("event/");
    var cnt = 0 ;
    files.forEach(function(item) {
        itemsplit = item.split(".");
        console.log(itemsplit);
        eventmap[itemsplit[2]] = yaml.safeLoad(fs.readFileSync("event/"+item,'utf8'));
        cnt += 1;
    });
    
    curhash = eventmap["info"].lastest;
    eventqueue = new Object();
    var cur = cnt ;
    console.log(Object.getOwnPropertyNames(eventmap).length)
    
    while(curhash !="non"){
        eventqueue[cur] = eventmap[curhash];
        curhash = eventmap[curhash].last;
        cur -= 1;
    }
}

function loadmeeting(){
    
}

//getmeeting()
function getClientAddress(req) {
    return (req.headers['x-forwarded-for'] || '').split(',')[0] || req.connection.remoteAddress;
};

var server = http.createServer(function (req, res) {
    var chunk = ""; 
    req.on('data', function(data){
      chunk += data ;
    });
    req.on('end', function(){
        console.log(req.connection.remoteAddress);
        if(req.method == 'POST') {
            console.log("POST");
            var pathname = url.parse(req.url).pathname;
            console.log(pathname);
            console.log('BODY: ' + chunk);
            console.log('BODY length: ' + chunk.length);
            switch(pathname){
                case "/user/keyArmored":
                    seckeyArmored = chunk;
                    seckey = openpgp.key.readArmored(seckeyArmored).keys[0];
                    //console.log(seckey);
                    //console.log(seckey.primaryKey);
                    //console.log(seckey.primaryKey.encrypted);
                    if(seckey == undefined || seckey.primaryKey.encrypted == undefined){
                        res.writeHead(406, {'Content-Type': 'text/plain'});
                        res.write( "it's not a secret key.");
                        res.end();

                    }else{
                        res.writeHead(200, {'Content-Type': 'text/plain'});
                        res.write( seckey.primaryKey.fingerprint + "received.");
                        res.end();
                    }
                    break;
                case "/user/passphrase":
                    //console.log(seckey);
                    if(seckey.primaryKey.encrypted != undefined && seckey.decrypt(chunk)){
                        console.log("decrypted！");
                        res.writeHead(200, {'Content-Type': 'text/plain'});
                        res.write( seckey.primaryKey.fingerprint + "decrypted.");
                        res.end();
                    }else{
                        res.writeHead(406, {'Content-Type': 'text/plain'});
                        res.write( seckey.primaryKey.fingerprint + ": wrong passphrase.");
                        res.end();
                    }
                    break;
                default:
            }
        }else if(req.method == 'GET') {
            console.log("GET");
            var pathname = url.parse(req.url).pathname;
            console.log(pathname);
            
            switch(pathname){
                case "/page/meetinglist":
                    //loadmeeting();
                    //test
                    for (var i = 0; i<10 ; i++){
                        meeting[i] = new Object(); ;

                        meeting[i]["id"] = i ;
                        meeting[i]["status"] = "calling";
                    }
                    
                    //console.log(yaml.safeDump(meeting));
                    
                    res.writeHead(200, {'Content-Type': 'text/plain'});
                    res.write( yaml.safeDump(meeting));
                    res.end();
                    
                    break;
                default:
                    var realPath = pathname.substring(1);
                    // get the suffix to detect the MIME type
                    var suffix =/\.[^\.]+/.exec(realPath);
                    if(realPath == ""){
                        realPath = "login.html";
                    }
                    console.log(realPath);
                    console.log(suffix);
                    fs.exists(realPath, function (exists) {
                        if (!exists) {
                            res.writeHead(404, {'Content-Type': 'text/plain'});
                            res.write("找不到文件","utf8");
                            res.end();
                        } else {
                            fs.readFile(realPath, "binary", function(err, file){    
                                if ( err ) {    
                                    res.writeHead(500, {'Content-Type': 'text/plain'});    
                                    res.write(err);    
                                    res.end();    
                                } else {
                                    // return the content in right MIME type
                                    if(suffix == ".css"){
                                        res.writeHead(200, {'Content-Type':'text/css'});
                                    }else{
                                        res.writeHead(200, {'Content-Type':'text/html'});    // or text/x-yaml  to make client save a file    
                                    }
                                    
                                    res.write(file, "binary");
                                    res.end();
                                    //console.log(file);
                                }
                            })
                        }
                    });
            }
        }
    });

});
// motion/new
// meeting/call

server.listen(80,"127.0.0.1");