const express = require("express");
const app = express();
const http = require("http").Server(app);
const io = require("socket.io")(http)

const port = 4000;


app.use(express.static("public"));
app.set("view engine", "ejs");


app.get("/", (req, res) => {
    res.render('room');
});


function arrayRemove(arr, value) {

    return arr.filter(function (ele) {
        return ele != value;
    });
}


// signaling
let rc = [];
io.on('connection', function (socket) {
    console.log('a user connected');

    socket.on('create or join', function (room) {
        console.log('create or join to room ', room);

        let numClients = 0;
        if (rc.length === 0) {
            rc.push(room)
            numClients = 0;
        }
        else {
            console.log(rc)
            let m = rc.length;
            console.log(m)
            for (i = 0; i <= m; i++) {
                if (rc[i] === room) {
                    numClients = 1;
                    console.log(numClients)
                }
            }
            if (numClients === 0 && rc.length > 0) {
                rc.push(room)

            }

        }
        app.post('/leave', function (req, res) {
            res.redirect('/')
            rc = arrayRemove(rc, room);
            console.log(rc)
        })


        console.log(room, ' has ', numClients, ' clients');

        if (numClients == 0) {
            socket.join(room);
            socket.emit('created', room);
        } else if (numClients == 1) {
            socket.join(room);
            socket.emit('joined', room);
        } else {
            socket.emit('full', room);
        }
    });

    socket.on('ready', function (room) {
        socket.broadcast.to(room).emit('ready');
    });

    socket.on('candidate', function (event) {
        socket.broadcast.to(event.room).emit('candidate', event);
    });

    socket.on('offer', function (event) {
        socket.broadcast.to(event.room).emit('offer', event.sdp);
    });

    socket.on('answer', function (event) {
        socket.broadcast.to(event.room).emit('answer', event.sdp);
    });

});


http.listen(port, () => console.log('server had started'))
