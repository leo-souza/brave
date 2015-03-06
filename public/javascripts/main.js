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
}

window.addEventListener("load", function () {
  

	var canvas = document.getElementById("canvas"),
		  width = 500,
		  height = 400,
		  player = null,//new Player('red', width/2, height-15),
		  keys = [],
		  friction = 0.8,
			svgns = canvas.getAttribute('xmlns');

	var boxes = [],
			others = [];

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

	canvas.setAttributeNS(null, 'width', width);
	canvas.setAttributeNS(null, 'height', height);

	function renderArena(){
		//Boxes
		for (var i = 0; i < boxes.length; i++) {
				var box = document.createElementNS(svgns, 'rect');
				box.setAttributeNS(null, 'x', boxes[i].x);
				box.setAttributeNS(null, 'y', boxes[i].y);
				box.setAttributeNS(null, 'width', boxes[i].width);
				box.setAttributeNS(null, 'height', boxes[i].height);
				box.setAttributeNS(null, 'fill', 'black');
				canvas.appendChild(box);
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

	function updatePlayer(playr){

		var p = document.getElementById(playr.uid);

		if(p.getAttribute('cx') != playr.x || p.getAttribute('cy') != playr.y)
			socket.emit('moving', {player: player});

		p.setAttributeNS(null, 'cx', playr.x);
		p.setAttributeNS(null, 'cy', playr.y);

		var t = document.getElementById('msg-'+playr.uid);
		t.setAttributeNS(null, 'x', playr.x - playr.width);
		t.setAttributeNS(null, 'y', playr.y - 20);
		t.textContent = playr.message || "";

		if(playr.uid == player.uid && (playr.x < -1 || playr.y < -1 || playr.x > width+1 || playr.y > height+1)){
			alert('U LOST!');
			playr.x = 200;
			playr.y = 380;
			playr.velX = 0;
			playr.velY = 0;
			keys = [];
		}
	}

	function renderPlayer(playr){
		//var g = document.createElementNS(svgns, 'g');

		var avatar = document.createElementNS(svgns, 'circle');
		avatar.setAttributeNS(null, 'id', playr.uid);
		avatar.setAttributeNS(null, 'cx', playr.x);
		avatar.setAttributeNS(null, 'cy', playr.y);
		avatar.setAttributeNS(null, 'r', playr.width);
		avatar.setAttributeNS(null, 'fill', playr.color);
		canvas.appendChild(avatar);

		var talk = document.createElementNS(svgns, 'text');
		talk.setAttributeNS(null, 'id', 'msg-'+playr.uid);
		talk.setAttributeNS(null, 'fill', playr.color);
		talk.setAttributeNS(null, 'font', "16px Helvetica");
		talk.setAttributeNS(null, 'textAlign', "left");
		talk.setAttributeNS(null, 'textBaseline', "top");
		talk.setAttributeNS(null, 'x', playr.x - playr.width);
		talk.setAttributeNS(null, 'y', playr.y - 20);
		canvas.appendChild(talk);
	}

	function removePlayer(playr){
		var p = document.getElementById(playr.uid);
		p.parentNode.removeChild(p);
		var t = document.getElementById('msg-'+playr.uid);
		t.parentNode.removeChild(t);
	}

	function update() {
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
				updatePlayer(others[i]);

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

		//if(player.moving) player.message = null;

		player.x += player.velX;
		player.y += player.velY;

		updatePlayer(player);
	
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

	document.body.addEventListener("keydown", function (e) {
		  keys[e.keyCode] = true;
	});

	document.body.addEventListener("keyup", function (e) {
		  keys[e.keyCode] = false;
			if(e.keyCode == 32){ //spacebar
				document.getElementById('textbox').focus();
			}
	});

	document.getElementById('textbox').addEventListener("keyup", function (e) {
		if(e.keyCode == 13){
			player.message = this.value;
			socket.emit('message', {uid: player.uid, message: this.value });
			this.value = null;
		}
	});

	if(!player){
		document.getElementById('colors').style.display = 'block';
	}

	$('.color').click(function(){
		document.getElementById('colors').style.display = '';
		var playr = new Player($(this).data('color'), 200, 380);
		socket.emit('connect', {player: playr });
		renderArena();
	});

	function buildlist(list){
		html = ""; 		
		for (var i = 0; i < list.length; i++) {
			var uid = Object.keys(list[i])[0];
			html = html + "<div><span class=\""+list[i][uid].color+"\">&nbsp;&nbsp;&nbsp;</span>&nbsp;"+uid+"</div>";
		}
		document.getElementById('userlist').innerHTML = html;
	}

	var socket = io.connect();
	socket.on('enter', function( data ) {
		player = data.player;
		for (var i = 0; i < data.players.length; i++) {
			var other_id = Object.keys(data.players[i])[0]
			others.push(data.players[i][other_id]);
			renderPlayer(data.players[i][other_id]);
		}
		renderPlayer(player);
		update();
	});
	socket.on('join', function( data ) {
		if(player && data.uid != player.uid){
			others.push(data.player);
			renderPlayer(data.player);
		}
		buildlist(data.players);
	});
	socket.on('exit', function( data ) {
		buildlist(data.players);
		for (var i = 0; i < others.length; i++) {
			if(data.uid == others[i].uid){
				others.splice(i, 1);
				removePlayer(data.player);
				break;			
			}
		}
	});

	socket.on('update', function(data){
		if(data.player){
			for (var i = 0; i < others.length; i++) {
				if(data.player.uid == others[i].uid){
					others[i] = data.player;			
				}
			}
		}else if(data.uid){
			for (var i = 0; i < others.length; i++) {
				if(data.uid == others[i].uid){
					others[i].message = data.message;			
				}
			}
		}
	});

});



