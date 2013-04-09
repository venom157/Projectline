/*
 * Author : Sander Walstock
 */
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

//globals
var canvasm, canvaso, canvasd;
var b,i=0;
var ctx, ctx2, ctx3;
var SCALE = 30;
var stage, world, pixel_dist = 5;
var drawobj_array = new Array();
var lineobj, drawobj, deleteobj;
var tool = false;
var tool_default = 'pencil';
// This object holds the implementation of each drawing tool.
var tools = {};
var riderobj, started;
var xl = 0, yl = 0;

function e_stage(e) {
    e._x = e.stageX; //event coordinates on stage
    e._y = e.stageY; //without stage offset

  // Call the event handler of the tool.
  var func = tool[e.type];
  if(func) {
    func(e);
  }
}

//event handler for toolselect
function e_tool_change(e){
    if(tools[this.value]){
        tool = new tools[this.value]();
    }
}

//pencil tool
tools.pencil = function(){
    var tool = this;
    this.started = false;
    this.stagemousedown = function(e){ //movedown eventhandler
        tool.x0 = e._x; //initial pen coordinates get stored in tool object
        tool.y0 = e._y;
        tool.started = true; //started drawing
    };

    this.stagemousemove = function(e){
        tool.xf = e._x;
        tool.yf = e._y;
        tool.xw = tool.xf - tool.x0; //length of the line in x
        tool.yw = tool.yf - tool.y0; //length of the line in y
        if (tool.started) {
            if (Math.sqrt(tool.xw * tool.xw + tool.yw * tool.yw) > 10) { //simple pythagoras for checking that line length is longer then .. pixels
                var lineBodyDef = new box2d.b2BodyDef; //for more info check
                lineBodyDef.type = box2d.b2Body.b2_staticBody; //Box2dweb lib
                lineBodyDef.position.x = (tool.x0 - stage.x) / SCALE;//body position
                lineBodyDef.position.y = (tool.y0 - stage.y) / SCALE;

                var lineFixtureDef = new box2d.b2FixtureDef; //fixdef
                //lineFixtureDef.filter.groupIndex = -1;
                lineFixtureDef.shape = new box2d.b2PolygonShape;
                lineFixtureDef.shape.SetAsEdge(new box2d.b2Vec2(0, 0), new box2d.b2Vec2(tool.xw / SCALE, tool.yw / SCALE)); //setting it as an edge for thin lines, with x,y values
                lineFixtureDef.friction = 0.1; //friction a value between 0-1
                world.CreateBody(lineBodyDef).CreateFixture(lineFixtureDef); //should try something else here:
				//drawobj.body = world.CreateBody(lineBodyDef); //not tested
                //drawobj.body.CreateFixture(lineFixtureDef);
                drawobj = new createjs.Shape();
                drawobj.graphics
                         .setStrokeStyle(2, "square")
                         .beginStroke("#000") //color
                         .moveTo((tool.x0 - stage.x), (tool.y0 - stage.y)) //pen movement including stage offset
                         .lineTo((tool.xf - stage.x), (tool.yf - stage.y));//draw line with pen to given x,y
                tool.x0 = tool.xf; //final point of the .. pixels saved
                tool.y0 = tool.yf;
                stage.addChild(drawobj);//adding line objects
                //i++;
            }
                
        }
    };

    this.stagemouseup = function(){ //obvious
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
                    .lineTo((tool.xf - stage.x),(tool.yf - stage.y));//straight line is drawn on the overlay stage first and is cleared everytime you move.
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
            lineFixtureDef.friction = 0.5;
            world.CreateBody(lineBodyDef).CreateFixture(lineFixtureDef);//should also try something else here!

            drawobj.graphics
                    .setStrokeStyle(2, "square")
                    .beginStroke("#000")
                    .moveTo((tool.x0 - stage.x), (tool.y0 - stage.y))
                    .lineTo((tool.xf - stage.x), (tool.yf - stage.y));//line is now drawn on the mainstage
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
        }
    };

    this.stagemouseup = function () {
        if (tool.started) {
            tool.started = false;
        }
    };
};

tools.erase = function () {
    var tool = this;
    this.started = false;

    this.stagemousedown = function (e) {
        tool.x0 = e._x;
        tool.y0 = e._y;
        tool.started = true;
        deleteobj = stage.getObjectUnderPoint(tool.x0, tool.y0);
        stage.removeChild(drawobj_array[0]);
    };
    //this moves all the stages so that you can drag. Just simple math
    this.stagemousemove = function (e) {
        tool.xf = e._x;
        tool.yf = e._y;
        if (tool.started) {
            deleteobj = stage.getObjectUnderPoint(tool.xf, tool.yf);
            stage.removeChild(deleteobj);
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
    //canvasd = document.getElementById("debugcanvas");//debugcanvas is not used right now
    button_start = document.getElementById("startbutton");
    button_stop = document.getElementById("stopbutton");
    ctx = canvasm.getContext('2d');
    ctx2 = canvaso.getContext('2d');
    //ctx3 = canvasd.getContext('2d');

    stage = new createjs.Stage(canvasm); //creating easeljs stages
    overlaystage = new createjs.Stage(canvaso);
    world = new box2d.b2World(new box2d.b2Vec2(0, 9.81), true); //setting up box2d world for physics
    
    //tool selection
    var tool_select = document.getElementById('dtool');
    if(!tool_select){
        alert("Error: No tool selected");
        return;
    }
    tool_select.addEventListener('change', e_tool_change, false);//event listeners for tool and button
    button_start.addEventListener('click', newball, false);
    button_stop.addEventListener('click', deleteball, false);
    
    if (tools[tool_default]) {
        tool = new tools[tool_default]();
        tool_select.value = tool_default;
    }
    lineobj = new createjs.Shape();//adding line shape
    
    /*canvasd.onmousedown = e_stage;
    canvasd.onmousemove = e_stage;
    canvasd.onmouseup = e_stage;*/

    overlaystage.onMouseDown = e_stage;//event handlers on stage
    overlaystage.onMouseMove = e_stage;
    overlaystage.onMouseUp = e_stage;

    overlaystage.addChild(lineobj);

    createjs.Ticker.addListener(this);//use default tick
    createjs.Ticker.setFPS(100); //100fps other settings feel slow
    createjs.Ticker.useRAF = true;//forgot what it meant
}


function newball(e) { //eventhandler for adding a new ball
    //if (riderobj == null) {
        b = new Ball();
        riderobj = b.view;
        stage.addChild(riderobj)
        started = true;
    //}
}

function deleteball(e) { //eventhandler for deleting ball
    if (riderobj != null) {
        stage.removeChild(riderobj);
        world.DestroyBody(riderobj.body);
        riderobj = null;
        started = false;
        stage.x = stage.y = 0;
    }
}

function ridercamera()
{
    var centerx = ((canvasm.width / 2) - stage.x);
    var centery = ((canvasm.height) / 2 - stage.y);
    var rposx = riderobj.body.GetPosition().x * SCALE;
    var rposy = riderobj.body.GetPosition().y * SCALE;
    var dx = centerx - rposx;
    var dy = centery - rposy;
    var xd=0,yd=0;
    var dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < 100) {
        xl = dx;
        yl = dy;
    }
    else {
        xd = dx - xl;
        yd = dy - yl;
        stage.x += xd;
        stage.y += yd;
        overlaystage.x += xd;
        overlaystage.y += yd;
    }

}

function tick(e) { //tick event updating the world
    stage.update();
    overlaystage.update();
	world.Step(1/50, 5, 5); //best setting in my opinion otherwise world feels slow. Perhaps more calculations per step needed
	world.ClearForces();
    if(started)
	    ridercamera();

}