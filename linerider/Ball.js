(function (window) {

    function Ball() {
        this.view = new createjs.Bitmap("soccerklein.png");
        this.view.regX = this.view.regY = 15;

        var fixDef = new box2d.b2FixtureDef;
        fixDef.density = 0.5;
        fixDef.friction = 0.5;
        fixDef.restitution = 0;

        var bodyDef = new box2d.b2BodyDef;
        bodyDef.type = box2d.b2Body.b2_dynamicBody;
        bodyDef.position.x = 100 / SCALE;
        bodyDef.position.y = 100 / SCALE;
        fixDef.shape = new box2d.b2CircleShape(15 / SCALE);
        this.view.body = world.CreateBody(bodyDef);
        this.view.body.CreateFixture(fixDef);
        this.view.onTick = balltick;
    }

    function balltick(e) {
        this.x = this.body.GetPosition().x * SCALE;
        this.y = this.body.GetPosition().y * SCALE;
        this.rotation = this.body.GetAngle() * (180 / Math.PI);

    }

    window.Ball = Ball;

}(window));