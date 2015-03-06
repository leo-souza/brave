(function () {
  var requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
  window.requestAnimationFrame = requestAnimationFrame;
})();

var Player = function(color, startX, startY){
	var inst = this;
	this.x = startX;
	this.y = startY;
	this.width = 10;
	this.height = 10;
	this.speed = 5;
	this.velX = 0;
	this.velY = 0;
	this.color = color;
	this.moving = false;

	this.setMessage = function(msg){
		inst.message = {text: msg, x: inst.x, y: inst.y - 20, color: inst.color};
	};
}

var canvas = document.getElementById("canvas"),
    ctx = canvas.getContext("2d"),
    width = 500,
    height = 400,
    player = null,//new Player('red', width/2, height-15),
    keys = [],
    friction = 0.8;

var boxes = [],
		others = [];

var AI = [{40: true, 39: true}, {38: true, 39: true},
 {37: true, 38: true}, {37: true, 40:true},
 {40: true}, {39: true}, {38:true}, {37: true}]
function blah()
{
    var text = "";
    var possible = "abcdefghijklmnopqrstuvwxyz ?!,.";

    for( var i=0; i < 8; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}
//others.push(new Player('blue', 10, 10));
//others[0].ai = function(){
//	var playr = others[0];
//	if(!playr.moving){
//		playr.ai_keys = AI[Math.floor(Math.random() * 8) + 1]
//		playr.setMessage(blah());
//	}
//}

// dimensions
boxes.push({
  x: 0,
  y: 0,
  width: 2,
  height: height
});
boxes.push({
  x: 0,
  y: height - 2,
  width: width,
  height: 2
});
boxes.push({
  x: width - 2,
  y: 0,
  width: 2,
  height: height
});
boxes.push({
  x: 0,
  y: 0,
  width: width,
  height: 2
});

boxes.push({
    x: 40,
    y: 12,
    width: 80,
    height: 180
});
boxes.push({
  x: 170,
  y: 50,
  width: 80,
  height: 180
});
boxes.push({
  x: 320,
  y: 100,
  width: 80,
  height: 180
});
boxes.push({
  x: 40,
  y: 300,
  width: 380,
  height: 40
});

canvas.width = width;
canvas.height = height;

function renderArena(){

	ctx.clearRect(0, 0, width, height);
  
	//Boxes
	ctx.fillStyle = "black";
  for (var i = 0; i < boxes.length; i++) {
      ctx.fillRect(boxes[i].x, boxes[i].y, boxes[i].width, boxes[i].height);
  }
}

function movePlayer(playr, ks){
	if(!ks) return;

	if (ks[39]) { // || ks[68]
    // right arrow
    if (playr.velX < playr.speed) {
      playr.velX++;
    }
  }
  if (ks[37]) { // || ks[65]
    // left arrow
    if (playr.velX > -playr.speed) {
      playr.velX--;
    }
  }

	if (ks[40]) {// || ks[83]
    // up arrow
    if (playr.velY < playr.speed) {
      playr.velY++;
    }
  }
  if (ks[38]) { // || ks[87]
    // down arrow
    if (playr.velY > -playr.speed) {
      playr.velY--;
    }
  }

  playr.velX *= friction;
	playr.velY *= friction;
}

function renderPlayer(playr){
	ctx.fillStyle = playr.color;
	ctx.fillRect(playr.x, playr.y, playr.width, playr.height);
  
	if(playr.message){
		var msg = playr.message;
		ctx.fillStyle = msg.color;
		ctx.font = "16px Helvetica";
		ctx.textAlign = "left";
		ctx.textBaseline = "top";
		ctx.fillText(msg.text, msg.x, msg.y);
	}
}

function update() {
	renderArena();

  movePlayer(player, keys);
  
  //Boxes
	for (var i = 0; i < boxes.length; i++) {
      
      var dir = colCheck(player, boxes[i]);
      if (dir === "l" || dir === "r") {
        player.velX = 0;
      } else if (dir === "b" || dir === "t") {
        player.velY = 0;
      } 
  }
  //Others
	for (var i = 0; i < others.length; i++) {
			movePlayer(others[i], others[i].remote_keys);

			for (var j = 0; j < boxes.length; j++) {
				var dir = colCheck(others[i], boxes[j]);
	      if (dir === "l" || dir === "r") {
					others[i].velX = 0;
	      } else if (dir === "b" || dir === "t") {
					others[i].velY = 0;
	      } 
			}
			if(others[i].velY == 0 || others[i].velX == 0){
				others[i].moving = false;
			}else{
				others[i].moving = true;
			}
			others[i].x += others[i].velX;
  		others[i].y += others[i].velY;

  		renderPlayer(others[i]);

      var dir = colCheck(player, others[i]);
      if (dir === "l" || dir === "r") {
				player.velX = 0;
      } else if (dir === "b" || dir === "t") {
				player.velY = 0;
      } 
  }

	if(player.velY == 0 || player.velX == 0){
		player.moving = false;
	}else{
		player.moving = true;
	}

	if(player.moving) player.message = null;

  player.x += player.velX;
  player.y += player.velY;

  renderPlayer(player);

  requestAnimationFrame(update);
}

function colCheck(shapeA, shapeB) {
  // get the vectors to check against
  var vX = (shapeA.x + (shapeA.width / 2)) - (shapeB.x + (shapeB.width / 2)),
    vY = (shapeA.y + (shapeA.height / 2)) - (shapeB.y + (shapeB.height / 2)),
    // add the half widths and half heights of the objects
    hWidths = (shapeA.width / 2) + (shapeB.width / 2),
    hHeights = (shapeA.height / 2) + (shapeB.height / 2),
    colDir = null;

  // if the x and y vector are less than the half width or half height, they we must be inside the object, causing a collision
  if (Math.abs(vX) < hWidths && Math.abs(vY) < hHeights) {
    // figures out on which side we are colliding (top, bottom, left, or right)
    var oX = hWidths - Math.abs(vX),
        oY = hHeights - Math.abs(vY);
    if (oX >= oY) {
      if (vY > 0) {
        colDir = "t";
        shapeA.y += oY;
      } else {
        colDir = "b";
        shapeA.y -= oY;
      }
    } else {
      if (vX > 0) {
        colDir = "l";
        shapeA.x += oX;
      } else {
        colDir = "r";
        shapeA.x -= oX;
      }
    }
  }
  return colDir;
}


window.addEventListener("load", function () {
  //update();
	//setInterval(others[0].ai, 10);
		
	document.body.addEventListener("keydown", function (e) {
		  keys[e.keyCode] = true;
			socket.emit('moving', {player: player, keys: keys });
	});

	document.body.addEventListener("keyup", function (e) {
		  keys[e.keyCode] = false;
			socket.emit('moving', {player: player, keys: keys });
			if(e.keyCode == 32){ //spacebar
				document.getElementById('textbox').focus();
			}
	});

	document.getElementById('textbox').addEventListener("keyup", function (e) {
		if(e.keyCode == 13){
			player.setMessage(this.value);
			this.value = null;
		}
	});

	if(!player){
		document.getElementById('colors').style.display = 'block';
	}

	$('.color').click(function(){
		document.getElementById('colors').style.display = '';
		socket.emit('connect', {player: new Player($(this).data('color'), 200, 380) });
		renderArena();
	});

	function buildlist(list){
		html = ""; 		
		for (var i = 0; i < list.length; i++) {
			html = html + "<div>"+Object.keys(list[i])[0]+"</div>";
		}
		document.getElementById('userlist').innerHTML = html;
	}

	var socket = io.connect();
	socket.on('enter', function( data ) {
		player = data.player;
		for (var i = 0; i < data.players.length; i++) {
			others.push(data.players[i]);
		}
		update();
	});
	socket.on('join', function( data ) {
		if(!player || data.uid != player.uid)
			others.push(data.player);
		buildlist(data.players);
	});
	socket.on('exit', function( data ) {
		buildlist(data.players);
	});

	socket.on('update', function(data){
		for (var i = 0; i < others.length; i++) {
			if(data.player.uid == others[i].uid){
				others[i].remote_keys = data.keys;			
			}
		}
	});

});



