const {
    Observable,
    Subject,
    ReplaySubject,
    from,
    of ,
    range,
    fromEvent,
    merge,
    interval
} = require('rxjs');
const {
    flatMap,
    map,
    filter,
    switchMap,
    tap,
    mapTo,
    takeUntil
} = require('rxjs/operators');
const WebSocketServer = require("websocket").server
const http = require("http")

const server = http.createServer()
server.listen(1337)

wsServer = new WebSocketServer({
    httpServer: server
})
console.log("listening on 1337")

var cons = []

/*function originIsAllowed(origin) {
  // put logic here to detect whether the specified origin is allowed.
  return true;
}
 
wsServer.on('request', function(request) {
    if (!originIsAllowed(request.origin)) {
      // Make sure we only accept requests from an allowed origin
      request.reject();
      console.log((new Date()) + ' Connection from origin ' + request.origin + ' rejected.');
      return;
    }
    
    var connection = request.accept(null, request.origin);
    console.log((new Date()) + ' Connection accepted.');

    connection.on('message', function(message) {
        if (message.type === 'utf8') {
            console.log('Received Message: ' + message.utf8Data);
            connection.sendUTF(message.utf8Data);
        }
        else if (message.type === 'binary') {
            console.log('Received Binary Message of ' + message.binaryData.length + ' bytes');
            connection.sendBytes(message.binaryData);
        }
    });
    connection.on('close', function(reasonCode, description) {
        console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.');
    });
});*/


const conn$ = fromEvent(wsServer, 'request')
    .pipe(map(request => request.accept(null, request.origin)))

const msg$ = flatMap(connection => (fromEvent(connection, 'message') || fromEvent(connection, 'close'))
    .pipe(map(x => [x, connection])))

const connection$ = conn$.pipe(
    msg$
)

connection$.subscribe(([evt, connection]) => {
    //console.log("cons: ",cons.map(x=>x.remoteAddresses))
    switch (JSON.parse(evt.utf8Data).event) {
        case "events":
            let d = JSON.parse(evt.utf8Data).data
            wsServer.connections.forEach(x => {
                x.send(JSON.stringify(`${d} sent`))
            })
            break;
        case "greet":
            let e = JSON.parse(evt.utf8Data).data
            wsServer.connections.forEach(x => {
                x.send(JSON.stringify(`${e}`))
            })
            break;
        default:
            connection.send(JSON.stringify(`server received giberish`))
    }
})