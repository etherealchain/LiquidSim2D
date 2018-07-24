
class MouseQueryCallback{
    constructor(point){
        this.point = point;
        this.fixture = null;
    }
    ReportFixture(fixture){
        var body = fixture.body;
        if (body.GetType() === b2_dynamicBody) {
            var inside = fixture.TestPoint(this.point);
            if (inside) {
                this.fixture = fixture;
                return true;
            }
        }
        return false;
    }
    ReportParticle(system, index){
        return false;
    }
}
export default MouseQueryCallback;