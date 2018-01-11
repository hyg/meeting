var fs = require('fs');
var http = require('http');
var https = require('https');
var url = require("url");
var yaml = require('js-yaml');
var openpgp = require('openpgp');
var Hashes = require('jshashes');


var FSM = new Object();
FSM.status = 0 ;


var server = http.createServer(function (req, res) {
    var chunk = ""; 
    req.on('data', function(data){
      chunk += data ;
    });
    req.on('end', function(){
        if(req.method == 'GET') {
            console.log("GET");
            var pathname = url.parse(req.url).pathname;
            //console.log(pathname);
			var realPath = pathname.substring(1);
            // get the suffix to detect the MIME type
            var suffix =/\.[^\.]+/.exec(realPath);
            if(realPath == ""){
                realPath = "s0.html";
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
                        }
                    })
                }
        });
        }
    });

});
// motion/new

// meeting/call
server.listen(80);