// shouldnt be a global :(
var particleColors = [
  new b2ParticleColor(0xff, 0x00, 0x00, 0xff), // red
  new b2ParticleColor(0x00, 0xff, 0x00, 0xff), // green
  new b2ParticleColor(0x00, 0x00, 0xff, 0xff), // blue
  new b2ParticleColor(0xff, 0x8c, 0x00, 0xff), // orange
  new b2ParticleColor(0x00, 0xce, 0xd1, 0xff), // turquoise
  new b2ParticleColor(0xff, 0x00, 0xff, 0xff), // magenta
  new b2ParticleColor(0xff, 0xd7, 0x00, 0xff), // gold
  new b2ParticleColor(0x00, 0xff, 0xff, 0xff) // cyan
];
var container;
var world = null;
var threeRenderer;
var renderer;
var camera;
var scene;
var objects = [];
var timeStep = 1.0 / 60.0;
var velocityIterations = 8;
var positionIterations = 3;
var test = {};
var g_groundBody = null;

var windowWidth = window.innerWidth;
var windowHeight = window.innerHeight;
var stats;

var mouseJoint = null;
var mouseTracing = false;
var mouseTracerPos = new b2Vec2(0,0);
var mouseTracerVel = new b2Vec2(0,0);
var mouseWorldPos = new b2Vec2(0,0);

function printErrorMsg(msg) {
  var domElement = document.createElement('div');
  domElement.style.textAlign = 'center';
  domElement.innerHTML = msg;
  document.body.appendChild(domElement);
}

function initTestbed() {
    stats = new Stats();
	document.body.appendChild(stats.dom);

    camera = new THREE.PerspectiveCamera(70
        , windowWidth / windowHeight
        , 1, 1000);

    try {
        threeRenderer = new THREE.WebGLRenderer();
    } catch( error ) {
        printErrorMsg('<p>Sorry, your browser does not support WebGL.</p>'
                    + '<p>This testbed application uses WebGL to quickly draw'
                    + ' LiquidFun particles.</p>'
                    + '<p>LiquidFun can be used without WebGL, but unfortunately'
                    + ' this testbed cannot.</p>'
                    + '<p>Have a great day!</p>');
        return;
    }

    threeRenderer.setClearColor(0xEEEEEE);
    threeRenderer.setSize(windowWidth, windowHeight);

    camera.position.x = 0;
    camera.position.y = 0;
    camera.position.z = 100;
    scene = new THREE.Scene();
    camera.lookAt(scene.position);

    document.body.appendChild( this.threeRenderer.domElement);

    // hack
    renderer = new Renderer();
    var gravity = new b2Vec2(0, -10);
    world = new b2World(gravity);
    Testbed();
}

function testSwitch(testName) {
    ResetWorld();
    world.SetGravity(new b2Vec2(0, -10));
    var bd = new b2BodyDef;
    g_groundBody = world.CreateBody(bd);
    test = new window[testName];
}

function onPressDown(p){

    var aabb = new b2AABB;
    var d = new b2Vec2;

    mouseTracing = true;
    mouseTracerPos = p;
    mouseWorldPos = p;
    mouseTracerVel.x = 0;
    mouseTracerVel.y = 0; 

    d.Set(0.01, 0.01);
    b2Vec2.Sub(aabb.lowerBound, p, d);
    b2Vec2.Add(aabb.upperBound, p, d);

    var queryCallback = new QueryCallback(p);
    world.QueryAABB(queryCallback, aabb);

    if (queryCallback.fixture) {
        var body = queryCallback.fixture.body;
        var md = new b2MouseJointDef;
        md.bodyA = g_groundBody;
        md.bodyB = body;
        md.target = p;
        md.maxForce = 1000 * body.GetMass();
        mouseJoint = world.CreateJoint(md);
        body.SetAwake(true);
    }
    if (test.MouseDown !== undefined) {
        test.MouseDown(p);
    }
}

function onDownMove(p){

    mouseWorldPos = p;
    if (mouseJoint) {
        mouseJoint.SetTarget(p);
    }
    if (test.MouseMove !== undefined) {
        test.MouseMove(p);
    }
}
function onRiseUp(p){
    mouseTracing = false;
    if (mouseJoint) {
        world.DestroyJoint(mouseJoint);
        mouseJoint = null;
    }
    if (test.MouseUp !== undefined) {
        test.MouseUp(p);
    }
}
function Testbed(obj) {
  // Init world
  //GenerateOffsets();
  //Init
  var that = this;
  document.addEventListener('keypress', function(event) {
    if (test.Keyboard !== undefined) {
      test.Keyboard(String.fromCharCode(event.which) );
    }
  });
  document.addEventListener('keyup', function(event) {
    if (test.KeyboardUp !== undefined) {
      test.KeyboardUp(String.fromCharCode(event.which) );
    }
  });
  document.addEventListener('touchstart', touchStart);
  document.addEventListener('touchmove', touchMove);
  document.addEventListener('touchend', touchEnd);

  document.addEventListener('mousedown', mouseStart);
  document.addEventListener('mousemove', mouseMove);
  document.addEventListener('mouseup', mouseEnd);


  window.addEventListener( 'resize', onWindowResize, false );
  testSwitch("waterSim");
  render();
}

var render = function() {
  // bring objects into world
  if (test.Step !== undefined) {
    test.Step();
  } else {
    testBedStep();
  }
  stats.begin();
  renderer.draw();
  threeRenderer.render(scene, camera);
  stats.end();
  requestAnimationFrame(render);
};

var ResetWorld = function() {
  if (world !== null) {
    while (world.joints.length > 0) {
      world.DestroyJoint(world.joints[0]);
    }

    while (world.bodies.length > 0) {
      world.DestroyBody(world.bodies[0]);
    }

    while (world.particleSystems.length > 0) {
      world.DestroyParticleSystem(world.particleSystems[0]);
    }
  }
  camera.position.x = 0;
  camera.position.y = 0;
  camera.position.z = 100;
};

var testBedStep = function() {
    world.Step(timeStep, velocityIterations, positionIterations);
};

function QueryCallback(point) {
    this.point = point;
    this.fixture = null;
}
QueryCallback.prototype.ReportParticle = function(system, index){
    return false;
}
QueryCallback.prototype.ReportFixture = function(fixture) {
    var body = fixture.body;
    if (body.GetType() === b2_dynamicBody) {
        var inside = fixture.TestPoint(this.point);
        if (inside) {
            this.fixture = fixture;
            return true;
        }
    }
    return false;
};

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    threeRenderer.setSize( window.innerWidth, window.innerHeight );
}

function mouseStart(event){
    let point = getWorldCoords(event.clientX, event.clientY);
    onPressDown(point);
}
function mouseMove(event){
    let point = getWorldCoords(event.clientX, event.clientY);
    onDownMove(point);
}
function mouseEnd(event){
    let point = getWorldCoords(event.clientX, event.clientY);
    onRiseUp(point);
}

function touchStart(event){
    event.preventDefault();
    event.stopPropagation();
    let point = getWorldCoords(event.touches[0].pageX, event.touches[0].pageY);
    onPressDown(point);
}
function touchMove(event){
    event.preventDefault();
    event.stopPropagation();
    let point = getWorldCoords(event.touches[0].pageX, event.touches[0].pageY);
    onDownMove(point);
}
function touchEnd(event){
    event.preventDefault();
    event.stopPropagation();
    let point = getWorldCoords(event.touches[0].pageX, event.touches[0].pageY);
    onRiseUp(point);
}

function getWorldCoords(x,y) {
    var mouse = new THREE.Vector3();
    mouse.x = (x / windowWidth) * 2 - 1;
    mouse.y = -(y / windowHeight) * 2 + 1;
    mouse.z = 0.5;

    mouse.unproject(camera);
    var dir = mouse.sub(camera.position).normalize();
    var distance = -camera.position.z / dir.z;
    var pos = camera.position.clone().add(dir.multiplyScalar(distance));
    var p = new b2Vec2(pos.x, pos.y);
    return p;
}
