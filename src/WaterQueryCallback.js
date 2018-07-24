class WaterQueryCallback{
    constructor(particleSystem, shape, velocity){
        this.particleSystem = particleSystem;
        this.circleShape = shape;
        this.velocity = velocity;
    }
    ReportFixture(){
        return false;
    }
    ReportParticle(system, index){
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
}
export default WaterQueryCallback;
