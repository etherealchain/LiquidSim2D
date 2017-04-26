
function waterSim() {

    camera.position.y = 1;
    camera.position.z = 4;

    var bd = new b2BodyDef();
    var ground = world.CreateBody(bd);

    bd.type = b2_dynamicBody;
    bd.allowSleep = false;
    bd.position.Set(0, 1);
    var body = world.CreateBody(bd);

    var b1 = new b2PolygonShape();
    b1.SetAsBoxXYCenterAngle(0.05, 1, new b2Vec2(2, 0), 0);
    body.CreateFixtureFromShape(b1, 5);

    var b2 = new b2PolygonShape();
    b2.SetAsBoxXYCenterAngle(0.05, 1, new b2Vec2(-2, 0), 0);
    body.CreateFixtureFromShape(b2, 5);

    var b3 = new b2PolygonShape();
    b3.SetAsBoxXYCenterAngle(2, 0.05, new b2Vec2(0, -1), 0);
    body.CreateFixtureFromShape(b3, 5);

    var jd = new b2RevoluteJointDef();
    this.joint = jd.InitializeAndCreate(ground, body, new b2Vec2(0, 2));

    // this.bottomShape = new b2PolygonShape();
    // this.bottomShape.SetAsBoxXYCenterAngle( 10, 10, new b2Vec2(0, -3),0);
    // this.rightShape = new b2PolygonShape();
    // this.rightShape.SetAsBoxXYCenterAngle( 10, 10, new b2Vec2(3, 0),0);
    // this.leftShape = new b2PolygonShape();
    // this.leftShape.SetAsBoxXYCenterAngle( 10, 10, new b2Vec2(-3, 0),0);

    // setup particles
    var psd = new b2ParticleSystemDef();
    psd.radius = 0.025;
    psd.dampingStrength = 0.2;
    this.particleSystem = world.CreateParticleSystem(psd);

    this.produceInterval = 1000;
    this.lastTimeStamp = 0;
}

waterSim.prototype.Step = function(){

    let now = new Date().getTime();
    if((now - this.lastTimeStamp > this.produceInterval)){
        let circle = new b2CircleShape;
        circle.position = new b2Vec2(1.5,5);
        circle.radius = 0.2;
        let pd = new b2ParticleGroupDef;
        pd.shape = circle;
        this.particleSystem.CreateParticleGroup(pd);

        this.lastTimeStamp = now;
    }

    // let xf = new b2Transform;
    // xf.SetIdentity();
    // this.particleSystem.DestroyParticlesInShape(this.bottomShape, xf);
    // this.particleSystem.DestroyParticlesInShape(this.rightShape, xf);
    // this.particleSystem.DestroyParticlesInShape(this.leftShape, xf);
    world.Step(timeStep, velocityIterations, positionIterations);

    console.log(this.particleSystem.GetParticleCount());
}