/*
* The code has been built upon the example given on loonride.com
*/

var width = 1300;
var height = 550;
var game = new Phaser.Game(width, height, Phaser.AUTO, null,
	{preload: preload, create: create, update: update});

var truck;
var wheelMaterial;
var worldMaterial;
var allowTruckBounce = true;

var score = 0;
var scoreText;

function preload() {
	game.load.image('truck', 'asset/truck.png');
	game.load.image('sky', 'asset/sky.png');
	game.load.image('wheel', 'asset/wheel.png');
	game.load.physics("physics", "asset/physics.json");
}
function create() {
	//set world boundaries with a large world width
	bg = game.add.tileSprite(0, -height, width*10, height*2, 'sky');
	game.world.setBounds(0,-height,width*10,height*2);
	game.physics.startSystem(Phaser.Physics.P2JS);
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
	contactMaterial.restitution = .5;

	//call onSpaceKeyDown when space key is first pressed
	var spaceKey = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
	spaceKey.onDown.add(onSpaceKeyDown, game);

	initTruck();
	initTerrain();

	sprite = game.add.sprite(0,0);
	sprite.fixedToCamera = true;

	scoreText = game.add.text(150, height*0.1, 'score: 0', { fontSize: '32px', fill: '#000' });
	sprite.addChild(scoreText);
	sprite.cameraOffset.x = width/3;
	sprite.cameraOffset.y = 20;
}
function update() {
	truck.update();
	var vehicleX = truck.frame.position.x;
    var vehicleY = truck.frame.position.y;
	score = Math.floor(vehicleX/10);
    scoreText.text = 'Score: ' + score;
}
function initTruck() {
	//initialize the truck and add the proper physics body
	
	var truckFrame = game.add.sprite(width*0.25, height*0.4, "truck");
	truck = new Vehicle(truckFrame);
	truck.frame.body.clearShapes();
	truck.frame.body.loadPolygon("physics", "truck");
	game.camera.follow(truck.frame);

	var distBelowTruck = 24;
	initWheel([55, distBelowTruck]);
	initWheel([-52, distBelowTruck]);
}
function initTerrain() {
	//initialize the terrain with bounds
	var terrain = new TerrainController(game, 50, game.world.width - 50,
		100, height - 50);
	//draw the terrain
	terrain.drawOutline();
	//add the physics body
	var groundBody = terrain.addToWorld();
	groundBody.setMaterial(worldMaterial);
	groundBody.name = "terrain";
}
function initWheel(offsetFromTruck) {
	var wheel = truck.addWheel("wheel", offsetFromTruck);
	wheel.body.setMaterial(wheelMaterial);
	wheel.body.onBeginContact.add(onWheelContact, game);
	return wheel;
}
function onSpaceKeyDown() {
	if (allowTruckBounce) {
		//make the truck bounce
		truck.frame.body.moveUp(850);
		allowTruckBounce = false;
	}
}
function onWheelContact(phaserBody, p2Body) {
	//allow another bounce if the wheels touched the ground
	if ((phaserBody === null && p2Body.id == 4)
		|| (phaserBody && phaserBody.name == "terrain")) {
		allowTruckBounce = true;
	}
}
