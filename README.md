# nodejs-http-server

## POST method request to  http://localhost:4221/files/readme.txt

1. http server: 
node app/main.js --directory ./
2. client server: 
curl -vvv -d "hello world" localhost:4221/files/readme.txt

## GET method request to  http://localhost:4221/files/
1. http server: 
node app/main.js --directory ./readme.txt
2. client server: 
curl -X GET localhost:4221/files/

## http://localhost:4221/echo/123
to print 123

## http://localhost:4221/
to do nothing, print http header in the http server

## http://localhost:4221/asdf
handle error 404


