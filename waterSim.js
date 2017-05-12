
function waterSim() {

    camera.position.y = 1;
    camera.position.z = 5;

    var bodyDefine = new b2BodyDef();
    var ground = world.CreateBody(bodyDefine);

    bodyDefine.type = b2_dynamicBody;
    bodyDefine.allowSleep = false;
    bodyDefine.position.Set(0, 0);
    var body = world.CreateBody(bodyDefine);

    var b1 = new b2PolygonShape();
    b1.SetAsBoxXYCenterAngle(0.05, 0.5, new b2Vec2(2, 0.5), 0);
    body.CreateFixtureFromShape(b1, 5);

    var b2 = new b2PolygonShape();
    b2.SetAsBoxXYCenterAngle(0.05, 0.5, new b2Vec2(-2, 0.5), 0);
    body.CreateFixtureFromShape(b2, 5);

    var b3 = new b2PolygonShape();
    b3.SetAsBoxXYCenterAngle(2, 0.05, new b2Vec2(0, 0), 0);
    body.CreateFixtureFromShape(b3, 5);

    var jd = new b2RevoluteJointDef();
    this.joint = jd.InitializeAndCreate(ground, body, new b2Vec2(0, 1));

    this.bottomShape = new b2PolygonShape();
    this.bottomShape.SetAsBoxXYCenterAngle( 10, 1, new b2Vec2(0, -5),0);

    // setup particles
    var psd = new b2ParticleSystemDef();
    psd.radius = 0.025;
    psd.dampingStrength = 0.2;
    this.particleSystem = world.CreateParticleSystem(psd);

    this.produceInterval = 1000;
    this.lastTimeStamp = 0;
    this.mouseTracing = false;
    this.waterColor = new b2ParticleColor(0x29, 0xA6, 0xEE, 0xff);
}

waterSim.prototype.Step = function(){

    let now = new Date().getTime();
    if((now - this.lastTimeStamp > this.produceInterval)){
        this.createDrop();
        this.lastTimeStamp = now;
    }

    let xf = new b2Transform;
    xf.SetIdentity();
    this.particleSystem.DestroyParticlesInShape(this.bottomShape, xf);

    // splash water
    if(mouseTracing && mouseJoint === null){
        let delay = 0.1;
        let acceleration = new b2Vec2();
        let temp = new b2Vec2();
        // acceleration = 2 / delay * (1 / delay * (m_mouseWorld - m_mouseTracerPosition) - m_mouseTracerVelocity);
        b2Vec2.Sub(acceleration, mouseWorldPos, mouseTracerPos);
        b2Vec2.MulScalar(acceleration,acceleration,1/delay);
        b2Vec2.Sub(acceleration, acceleration, mouseTracerVel);
        b2Vec2.MulScalar(acceleration,acceleration,2/delay);

        // velocity
        b2Vec2.MulScalar(acceleration,acceleration,timeStep);
        b2Vec2.Add(mouseTracerVel,mouseTracerVel,acceleration);
        // position
        b2Vec2.MulScalar(temp,mouseTracerVel,timeStep);
        b2Vec2.Add(mouseTracerPos,mouseTracerPos,temp);
        
        // compute aabb
        let shape = new b2CircleShape;
        shape.position = mouseTracerPos;
        shape.radius = 0.1;
        let aabb = new b2AABB();
        let xf = new b2Transform();
        xf.SetIdentity();
        shape.ComputeAABB(aabb,xf);

        // query aabb
        let waterCallback = new waterQueryCallback(this.particleSystem, shape, mouseTracerVel);
        world.QueryAABB(waterCallback, aabb);
    }
    testBedStep();
}

waterSim.prototype.createDrop = function(){
    let circle = new b2CircleShape;
    circle.position = new b2Vec2(1.5,5);
    circle.radius = 0.2;
    let pd = new b2ParticleGroupDef;
    pd.shape = circle;
    pd.flags = 0;
    pd.groupFlags = 0;
    pd.color = this.waterColor;

    this.particleSystem.CreateParticleGroup(pd);
}

function waterQueryCallback(particleSystem, shape, velocity){
    this.particleSystem = particleSystem;
    this.circleShape = shape;
    this.velocity = velocity;
}
waterQueryCallback.prototype.ReportFixture = function(fixture){
    return false;
}
waterQueryCallback.prototype.ReportParticle = function(system, index){
    if(this.particleSystem !== system)
        return false;

    let array = this.particleSystem.GetPositionBuffer();
    let point = new b2Vec2(array[2*index], array[2*index+1]);
    let xf = new b2Transform();
    xf.SetIdentity();
    if(this.circleShape.TestPoint(xf, point)){
        this.particleSystem.SetVelocityBuffer(index, this.velocity.x, this.velocity.y);
    }
    return true;
}