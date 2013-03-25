var box2d = {
	b2Vec2 : Box2D.Common.Math.b2Vec2,
	b2BodyDef : Box2D.Dynamics.b2BodyDef,
	b2Body : Box2D.Dynamics.b2Body,
	b2FixtureDef : Box2D.Dynamics.b2FixtureDef,
	b2Fixture : Box2D.Dynamics.b2Fixture,
	b2World : Box2D.Dynamics.b2World,
	b2MassData : Box2D.Collision.Shapes.b2MassData,
	b2PolygonShape : Box2D.Collision.Shapes.b2PolygonShape,
	b2CircleShape : Box2D.Collision.Shapes.b2CircleShape,
	b2DebugDraw : Box2D.Dynamics.b2DebugDraw
};


var canvasm, canvaso, canvasd;
var b;
var ctx, ctx2, ctx3;
var SCALE = 30;
var stage, world, pixel_dist = 5;
var points_array = new Array();
var lineobj, drawobj;
var tool = false;
var tool_default = 'pencil';
// This object holds the implementation of each drawing tool.
var tools = {};

//radiaal naar graden conversie
var rad_to_deg = 180/Math.PI;

function e_stage(e) {
    e._x = e.stageX;
    e._y = e.stageY;

  // Call the event handler of the tool.
  var func = tool[e.type];
  if(func) {
    func(e);
  }
}

function e_tool_change(e){
    if(tools[this.value]){
        tool = new tools[this.value]();
    }
}

tools.pencil = function(){
    var tool = this;
    this.started = false;
    
    this.stagemousedown = function(e){
        tool.x0 = e._x;
        tool.y0 = e._y;
        tool.started = true;
        drawobj.graphics
                     .setStrokeStyle(2, "square")
                     .beginStroke("#000")
                     .moveTo((tool.x0 - stage.x), (tool.y0 - stage.y));
    };

    this.stagemousemove = function(e){
        tool.xf = e._x;
        tool.yf = e._y;
        tool.xw = tool.xf - tool.x0;
        tool.yw = tool.yf - tool.y0;
        if (tool.started) {
            if (Math.sqrt(tool.xw * tool.xw + tool.yw * tool.yw) > 10) {
                var lineBodyDef = new box2d.b2BodyDef;
                lineBodyDef.type = box2d.b2Body.b2_staticBody;
                lineBodyDef.position.x = (tool.x0 - stage.x) / SCALE;
                lineBodyDef.position.y = (tool.y0 - stage.y) / SCALE;

                var lineFixtureDef = new box2d.b2FixtureDef;
                //lineFixtureDef.filter.groupIndex = -1;
                lineFixtureDef.shape = new box2d.b2PolygonShape;
                lineFixtureDef.shape.SetAsEdge(new box2d.b2Vec2(0, 0), new box2d.b2Vec2(tool.xw / SCALE, tool.yw / SCALE));
                lineFixtureDef.friction = 0.1;
                world.CreateBody(lineBodyDef).CreateFixture(lineFixtureDef);

                drawobj.graphics.lineTo((tool.xf - stage.x), (tool.yf - stage.y));
                tool.x0 = tool.xf;
                tool.y0 = tool.yf;
            }
                
        }
    };

    this.stagemouseup = function(){
        if(tool.started){
            tool.started = false;
        }
    };
};

tools.line = function(){
    var tool = this;
    this.started = false;
    
        this.stagemousedown = function(e){
        tool.x0 = e._x;
        tool.y0 = e._y;
        tool.started = true;
    };

    this.stagemousemove = function(e){
        if(!tool.started) return;
        tool.xf = e._x;
        tool.yf = e._y;
        if(tool.started){
            lineobj.graphics
                    .clear()
                    .setStrokeStyle(2, "square")
                    .beginStroke("#cbc53d")
                    .moveTo((tool.x0 - stage.x),(tool.y0 - stage.y))
                    .lineTo((tool.xf - stage.x),(tool.yf - stage.y));
        }
    };

    this.stagemouseup = function(){
        if (tool.started) {
            tool.xw = tool.xf - tool.x0;
            tool.yw = tool.yf - tool.y0;
            var lineBodyDef = new box2d.b2BodyDef;
            lineBodyDef.type = box2d.b2Body.b2_staticBody;
            lineBodyDef.position.x = (tool.x0 - stage.x) / SCALE;
            lineBodyDef.position.y = (tool.y0 - stage.y) / SCALE;

            var lineFixtureDef = new box2d.b2FixtureDef;
            //lineFixtureDef.filter.groupIndex = -1;
            lineFixtureDef.shape = new box2d.b2PolygonShape;
            lineFixtureDef.shape.SetAsEdge(new box2d.b2Vec2(0, 0), new box2d.b2Vec2(tool.xw / SCALE, tool.yw / SCALE));
            lineFixtureDef.friction = 0.1;
            world.CreateBody(lineBodyDef).CreateFixture(lineFixtureDef);

            drawobj.graphics
                    .setStrokeStyle(2, "square")
                    .beginStroke("#000")
                    .moveTo((tool.x0 - stage.x), (tool.y0 - stage.y))
                    .lineTo((tool.xf - stage.x), (tool.yf - stage.y));
            lineobj.graphics.clear();
            tool.started = false;
        }
    };  
};

tools.drag = function () {
    var tool = this;
    this.started = false;

    this.stagemousedown = function (e) {
        tool.x0 = e._x;
        tool.y0 = e._y;
        tool.started = true;
    };

    this.stagemousemove = function (e) {
        tool.xf = e._x;
        tool.yf = e._y;
        if (tool.started) {
            offsetX = (tool.xf - tool.x0);
            offsetY = (tool.yf - tool.y0);
            stage.x += offsetX;
            stage.y += offsetY;
            overlaystage.x += offsetX;
            overlaystage.y += offsetY;
            tool.x0 = tool.xf;
            tool.y0 = tool.yf;
        }
    };

    this.stagemouseup = function () {
        if (tool.started) {
            tool.started = false;
        }
    };
};



function init() {
    canvasm = document.getElementById("canvas");
    canvaso = document.getElementById("overlaycanvas");
    canvasd = document.getElementById("debugcanvas");
    button_start = document.getElementById("startbutton");
    ctx = canvasm.getContext('2d');
    ctx2 = canvaso.getContext('2d');
    ctx3 = canvasd.getContext('2d');

    stage = new createjs.Stage(canvasm);
    overlaystage = new createjs.Stage(canvaso);
    world = new box2d.b2World(new box2d.b2Vec2(0, 9.81), true);
    
    //tool selection
    var tool_select = document.getElementById('dtool');
    if(!tool_select){
        alert("Error: No tool selected");
        return;
    }
    tool_select.addEventListener('change', e_tool_change, false);
    button_start.addEventListener('click', newball, false);
    
    if (tools[tool_default]) {
        tool = new tools[tool_default]();
        tool_select.value = tool_default;
    }

    drawobj = new createjs.Shape();
    lineobj = new createjs.Shape();
    
    /*canvasd.onmousedown = e_stage;
    canvasd.onmousemove = e_stage;
    canvasd.onmouseup = e_stage;*/

    overlaystage.onMouseDown = e_stage;
    overlaystage.onMouseMove = e_stage;
    overlaystage.onMouseUp = e_stage;

    stage.addChild(drawobj);
    overlaystage.addChild(lineobj);

    createjs.Ticker.addListener(this);
    createjs.Ticker.setFPS(100);
    createjs.Ticker.useRAF = true;
}


function newball(e) {
    b = new Ball();
    stage.addChild(b.view);
}

function tick(e) {
    stage.update();
    overlaystage.update();
	world.Step(1/50, 5, 5);
	world.ClearForces();;
}