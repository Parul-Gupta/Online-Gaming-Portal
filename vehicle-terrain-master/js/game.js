/*
* The code has been built upon the example given on loonride.com
*/

var Game = {};

var width = window.innerWidth;
var height = window.innerHeight;

var truck;
var wheelMaterial;
var worldMaterial;
var allowTruckBounce = true;

var score = 0;
var scoreText;

Game.init = function(){
    game.stage.disableVisibilityChange = true;
};

Game.preload = function() {
	game.load.image('truck', 'asset/truck.png');
	game.load.image('sky', 'asset/sky.png');
	game.load.image('wheel', 'asset/wheel.png');
	game.load.image('dot', 'asset/dot.png');
	game.load.physics("physics", "asset/physics.json");
	game.load.physics("physics2", "asset/New Project.json");
	game.load.image('terrain', 'asset/mountain2.png');
	game.load.image('mount', 'asset/mount2.png');
};

Game.create = function() {
	Game.playerMap = {};
	Game.selfID = 0;
	var testKey = game.input.keyboard.addKey(Phaser.Keyboard.ENTER);
    testKey.onDown.add(Client.sendTest, this);
	//set world boundaries with a large world width
	bg = game.add.tileSprite(0, -height, width*10, height*2, 'sky');
	game.world.setBounds(0,-height,width*10,height*2);

	game.physics.startSystem(Phaser.Physics.P2JS);
	game.physics.p2.setImpactEvents(true);
	game.physics.p2.gravity.y = 500;

	wheelMaterial = game.physics.p2.createMaterial("wheelMaterial");
	worldMaterial = game.physics.p2.createMaterial("worldMaterial");
	game.physics.p2.setWorldMaterial(worldMaterial, true, true, true, true);

	//create contact material to increase friction between
	//the wheels and the ground
	var contactMaterial = game.physics.p2.createContactMaterial(
		wheelMaterial, worldMaterial
	);
	contactMaterial.friction = 1e2;
	contactMaterial.restitution = .3;

	//call onSpaceKeyDown when space key is first pressed
	var spaceKey = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
	spaceKey.onDown.add(Game.onSpaceKeyDown, this);

	for(var i = 0;  i*400 < width*10 ; i++){
		var backMount = game.add.sprite(i*400, height - 330, 'mount');
		backMount.scale.setTo(2, 2);
	}

	for(var i = 0;  i*1800 < width*10 ; i++){
		var ground = game.add.sprite(i*1800 + 800, height, 'terrain');
		game.physics.p2.enable(ground, false);
		ground.body.clearShapes();
		ground.body.loadPolygon("physics2","mountain");
		ground.body.immovable = true;
		ground.body.kinematic = true;
		ground.body.setMaterial(worldMaterial);
	}

	Game.initTruck();

	sprite = game.add.sprite(0,0);
	sprite.fixedToCamera = true;

	scoreText = game.add.text(150, height*0.1, 'score: 0', { fontSize: '32px', fill: '#000' });
	sprite.addChild(scoreText);
	sprite.cameraOffset.x = width/3;
	sprite.cameraOffset.y = 20;

	Client.askNewPlayer();
};

Game.update = function () {
	truck.update();
	var vehicleX = truck.frame.position.x;
    var vehicleY = truck.frame.position.y;
	score = Math.floor(vehicleX/10);
    scoreText.text = 'Score: ' + score;
    Game.getCoordinates();
};

Game.initTruck = function() {
	//initialize the truck and add the proper physics body
	
	var truckFrame = game.add.sprite(width*0.1, 0, "truck");
	truck = new Vehicle(truckFrame);
	truck.frame.body.clearShapes();
	truck.frame.body.loadPolygon("physics", "truck");

	game.camera.follow(truck.frame);

	var distBelowTruck = 24;
	Game.initWheel([55, distBelowTruck]);
	Game.initWheel([-52, distBelowTruck]);
};

Game.initWheel = function (offsetFromTruck) {
	var wheel = truck.addWheel("wheel", offsetFromTruck);
	wheel.body.setMaterial(wheelMaterial);
	wheel.body.onBeginContact.add(Game.onWheelContact, this);
	return wheel;
};

Game.onSpaceKeyDown = function() {
	if (allowTruckBounce) {
		//make the truck bounce
		truck.frame.body.moveUp(850);
		allowTruckBounce = false;
	}
};

Game.onWheelContact = function(phaserBody, p2Body) {
	//allow another bounce if the wheels touched the ground
	if ((phaserBody === null && p2Body.id == 4)
		|| (phaserBody && phaserBody.name == "terrain")) {
		allowTruckBounce = true;
	}
};

Game.addNewPlayer = function(id, x, y) {
	if(id == Game.selfID) Game.playerMap[id] = game.paint.sprite(x,y,'dot');
	else Game.playerMap[id] = game.add.sprite(x,y,'dot');
};

Game.getCoordinates = function(){
    Client.sendClick(truck.frame.position.x,truck.frame.position.y);
};

Game.movePlayer = function(id,x,y){
    var player = Game.playerMap[id];
    var distance = Phaser.Math.distance(player.x,player.y,x,y);
    var tween = game.add.tween(player);
    var duration = distance*2;
    tween.to({x:x,y:y}, duration);
    tween.start();
};

Game.removePlayer = function(id){
    Game.playerMap[id].destroy();
    delete Game.playerMap[id];
};

Game.setself = function(id){
    Game.selfID = id;
};