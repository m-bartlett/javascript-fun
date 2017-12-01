function translateShape(x, y, z, shape){
    shape.x += x;
    shape.y += y;
    shape.z += z;
}


function matrix_rotate(vert, roll, pitch, yaw) {
	
	var {cos, sin} = Math;
	
	var cosa = cos(roll);
	var sina = sin(roll);
	var cosb = cos(yaw);
	var sinb = sin(yaw);
	var cosc = cos(-pitch);
	var sinc = sin(-pitch);

	var xx = cosa*cosb;
	var xy = cosa*sinb*sinc - sina*cosc;
	var xz = cosa*sinb*cosc + sina*sinc;
	var yx = sina*cosb;
	var yy = sina*sinb*sinc + cosa*cosc;
	var yz = sina*sinb*cosc - cosa*sinc;
	var zx = -sinb;
	var zy = cosb*sinc;
	var zz = cosb*cosc;

	var px = xx*vert.x + xy*vert.y + xz*vert.z;
	var py = yx*vert.x + yy*vert.y + yz*vert.z;
	var pz = zx*vert.x + zy*vert.y + zz*vert.z;
	
	return {x:px, y:py, z:pz};
}
			
			
function project3D(x, y, z, cam){

  var p,d
  var {cos, sin, sqrt, atan2} = Math;
  x -= cam.x;
  y -= cam.y;
  z -= cam.z;
  p = atan2(x,z);
  d = sqrt(x*x+z*z);
  x = sin(p-cam.yaw)*d;
  z = cos(p-cam.yaw)*d;
  p = atan2(y,z);
  d = sqrt(y*y+z*z);
  y = sin(p-cam.pitch)*d;
  z = cos(p-cam.pitch)*d;
  var x1 = -100,y1 = 1,x2 = 100,y2 = 1,x3 = 0,y3 = 0,x4 = x,y4 = z;
  var uc = (y4-y3)*(x2-x1)-(x4-x3)*(y2-y1);
  if(!uc) return {x:0,y:0,d:-1};
  var ua=((x4-x3)*(y1-y3)-(y4-y3)*(x1-x3))/uc;
  var ub=((x2-x1)*(y1-y3)-(y2-y1)*(x1-x3))/uc;
  if(ua>0&&ua<1&&ub>0&&ub<1){
    return {
      x:cam.cx+(x1+ua*(x2-x1))*cam.scale,
      y:cam.cy+y/z*cam.scale,
      d:sqrt(x*x+y*y+z*z)
    };
  }else{
    return {d:-1};
  }
}


function frame(vars){

    if(vars === undefined){
        var vars={};
        vars.canvas = document.querySelector("#canvas");
        vars.ctx = vars.canvas.getContext("2d");
        vars.canvas.width = 758;
        vars.canvas.height = 500;
        vars.frame=0;
        vars.x = 1;
        vars.y = 0;
        vars.z = -6;
        vars.pitch = 0;
        vars.yaw = 0;
        vars.roll = 0;
        vars.cx=vars.canvas.width/2;
        vars.cy=vars.canvas.height/2;
        vars.scale=500;
        vars.shape=loadCube(-1,0,1);
    }

    vars.frame++;
    requestAnimationFrame(function() {
      frame(vars);
    });

    vars.ctx.clearRect(0, 0, canvas.width, canvas.height);

    var x,y,z,point1,point2;
    vars.ctx.strokeStyle="#ff0";

    x=Math.sin(vars.frame/40)/20;
    y=0;
    z=Math.cos(vars.frame/40)/20;
    translateShape(x,y,z,vars.shape);

    for(var i=0;i<vars.shape.segs.length;++i){
        vars.shape.segs[i].a=matrix_rotate(vars.shape.segs[i].a,0,-0.025,0.02);
        vars.shape.segs[i].b=matrix_rotate(vars.shape.segs[i].b,0,-0.025,0.02);
        x=vars.shape.x+vars.shape.segs[i].a.x;
        y=vars.shape.y+vars.shape.segs[i].a.y;
        z=vars.shape.z+vars.shape.segs[i].a.z;
        point1=project3D(x,y,z,vars);
        if(point1.d != -1){
            x=vars.shape.x+vars.shape.segs[i].b.x;
            y=vars.shape.y+vars.shape.segs[i].b.y;
            z=vars.shape.z+vars.shape.segs[i].b.z;
            point2=project3D(x,y,z,vars);
            if(point2.d != -1){
                vars.ctx.lineWidth=50/(1+point1.d);
                vars.ctx.beginPath();
                vars.ctx.moveTo(point1.x,point1.y);
                vars.ctx.lineTo(point2.x,point2.y);
                vars.ctx.stroke();
            }
        }
    }
}


function Vert(x,y,z){
    this.x = x;
    this.y = y;
    this.z = z;
}


function Seg(x1,y1,z1,x2,y2,z2){
    this.a = new Vert(x1,y1,z1);
    this.b = new Vert(x2,y2,z2);
}


function loadCube(x,y,z){

    var shape={};
    shape.x=x;
    shape.y=y;
    shape.z=z;
    shape.segs=[];
    shape.segs.push(new Seg(-1,-1,-1,1,-1,-1));
    shape.segs.push(new Seg(1,-1,-1,1,1,-1));
    shape.segs.push(new Seg(1,1,-1,-1,1,-1));
    shape.segs.push(new Seg(-1,1,-1,-1,-1,-1));
    shape.segs.push(new Seg(-1,-1,1,1,-1,1));
    shape.segs.push(new Seg(1,-1,1,1,1,1));
    shape.segs.push(new Seg(1,1,1,-1,1,1));
    shape.segs.push(new Seg(-1,1,1,-1,-1,1));
    shape.segs.push(new Seg(-1,-1,-1,-1,-1,1));
    shape.segs.push(new Seg(1,-1,-1,1,-1,1));
    shape.segs.push(new Seg(1,1,-1,1,1,1));
    shape.segs.push(new Seg(-1,1,-1,-1,1,1));
    return shape;
}

frame();