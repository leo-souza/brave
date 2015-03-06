//Wander//
var express = require('express'),
		routes = require('./routes'),
		http = require('http'),
		path = require('path'),
		io = require('socket.io'),
		exphbs  = require('express3-handlebars'),
		app = express(),
		server = http.createServer(app),
		util = require('./util.js'),
		game = require('./game.js');
		
//Environment vars
app.set('port', process.env.PORT || 3001);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'handlebars');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.engine('handlebars', exphbs({defaultLayout: 'main'}));

//Routes
app.get('/', routes.index);

//Start the server
server.listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

//Start socket.io
var sio = io.listen(server);

sio.sockets.on('connection', function (client) {
    //Generate a new UUID, looks something like 
    //5b2ca132-64bd-4513-99da-90e838ca47d1
    //and store this on their socket/connection
		client.userid = util.uuid();

		client.on('connect', function(data){
			var item = {}
			data.player.uid = client.userid;
			item[client.userid] = data.player;
			client.emit('enter', { player: data.player, uid: client.userid, players: game.players } );
			game.players.push(item);	
    	sio.sockets.emit('join', {uid: client.userid, player: data.player, players: game.players});
		});

    client.on('disconnect', function () {
			for (var i = 0; i < game.players.length; i++) {
				if(Object.keys(game.players[i])[0] == client.userid){	
					var playr = game.players[i][client.userid];
					game.players.splice(i, 1);			
					sio.sockets.emit('exit', {message: client.userid+' has left the arena', uid: client.userid, player: playr, players: game.players});
					break;		
				}
			}
    }); 

		client.on('message', function(data){
			for (var i = 0; i < game.players.length; i++) {
				if(Object.keys(game.players[i])[0] == data.uid){
					game.players[i][data.uid].message = data.message;
				}
			}	
			sio.sockets.emit('update', data);
		});

		client.on('moving', function(data){
			for (var i = 0; i < game.players.length; i++) {
				if(Object.keys(game.players[i])[0] == data.player.uid){
					game.players[i][data.player.uid] = data.player;
				}
			}	
			sio.sockets.emit('update', data);
		});
});

