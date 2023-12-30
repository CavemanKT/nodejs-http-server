const net = require("net");
const fs = require("fs")
const process = require("process");
const http = require("http")
const { once } = require("events")
const nodePath = require('path');

const writeFileAsync = (path, data) => {
    console.log("🚀 ~ file: main.js:9 ~ writeFileAsync ~ data:", data)
    console.log("🚀 ~ file: main.js:9 ~ writeFileAsync ~ path:", path)
    return new Promise((resolve, reject) => {
        fs.writeFile(path, data, (err) => {
            if (err) reject(err);
            else resolve();
        });
    })
}
const notFoundResponse = (
    content,
    contentType = 'text/plain',
    status = 404
) => {
    const statusLine = 'HTTP/1.1 404 Not Found\r\n\r\n';
    const headers = `Content-Type: ${contentType}\r\nContent-Length: ${content.length}\r\n\r\n`;
    return statusLine + headers + content;
};

const buildResponse = (
    content,
    contentType = 'text/plain',
    status = 200
) => {
    const statusLine = `HTTP/1.1 ${status} OK\r\n`;
    const headers = `Content-Type: ${contentType}\r\nContent-Length: ${content.length}\r\n\r\n`;
    return statusLine + headers + content;
};
// Uncomment this to pass the first stage
const server = net.createServer((socket) => {


    socket.on("data", async (data) => {
        console.log(data.toString())
        let request_split = data.toString().split("\r\n");
        console.log("🚀 ~ file: main.js:12 ~ socket.on ~ request_split:", request_split)

        let file_flag = process.argv.find((flag) => flag === "--directory");
        console.log("🚀 ~ file: main.js:40 ~ socket.on ~ process.argv:", process.argv)
        let request_user_agent = ""

        for (let i = 0; i < request_split.length; i++) {
            if (request_split[i].includes("User-Agent")) {
                request_user_agent = request_split[i].slice(12)
                console.log("🚀 ~ file: main.js:20 ~ socket.on ~ request_user_agent:", request_user_agent)
            }
        }

        let request_path = request_split[0].split(" ")[1]
        console.log("🚀 ~ file: main.js:50 ~ socket.on ~ request_path:", request_path)
        if (request_path === "/") {
            socket.write("HTTP/1.1 200 OK\r\nContent-Length: 0\r\n\r\n");
        } else if (request_path.startsWith("/echo")) {
            let response_body = request_path.slice(6) // anything after /echo is body
            console.log(request_split);
            console.log(request_path);
            socket.write(`HTTP/1.1 200 OK\r\nContent-Length: ${response_body.length}\r\n\r\n${response_body}`)
        } else if (request_path.endsWith("/user-agent")) {
            socket.write(`HTTP/1.1 200 OK\r\nContent-Length: ${request_user_agent.length}\r\n\r\n${request_user_agent}`)
        } else if (request_path.startsWith("/files") && file_flag && request_split[0].split(" ")[0] == "GET") {
            let file_path = process.argv[process.argv.length - 1] + request_path.slice(7)
            console.log("🚀 ~ file: main.js:61 ~ socket.on ~ file_path:", file_path)
            fs.access(file_path, fs.constants.F_OK, (err) => {
                if (err) {
                    socket.write('HTTP/1.1 404 Not Found\r\n\r\n');
                }
                fs.readFile(file_path, "utf-8", (_, file_data) => {
                    socket.write(`HTTP/1.1 200 OK\r\nContent-Type: application/octet-stream\r\nContent-Length: ${file_data.length}\r\n\r\n${file_data}`)
                })
            })
        } else if (request_path.startsWith("/files") && file_flag && request_split[0].split(" ")[0] == "POST") {
            let file_path = process.argv[process.argv.length - 1] + request_path.slice(7)
            console.log("🚀 ~ file: main.js:48 ~ socket.on ~ file_path:", file_path)
            let body = request_split[request_split.length - 1]
            console.log("🚀 ~ file: main.js:73 ~ socket.on ~ body:", body)
            const fileName = request_path.replace(/^\/files\//, '');
            console.log("🚀 ~ file: main.js:76 ~ socket.on ~ fileName:", fileName)

            try {
                await writeFileAsync(
                    file_path,
                    body
                );
                socket.write(buildResponse('File uploaded', 'text/plain', 201));
            } catch (err) {
                socket.write(notFoundResponse('File not found', 'text/plain', 404));
            }

        } else {
            let status = "Not Found Path"
            socket.write(`HTTP/1.1 404 Not Found\r\nContent-Type: text/plain\r\nContent-Length: ${status.length}\r\n\r\n${status}`);
        }
    })

    socket.on("close", (data) => {
        console.log("🚀 ~ file: main.js:25 ~ socket.on ~ data:", data)
        socket.end(); // it will send FIN flag to the other end.
        // server.close();
    });
});

server.on("connection", (socket) => {
    console.log("connection listener");
})

server.listen(4221, "localhost", () => {
    console.log("Server listening on localhost:4221");
});
