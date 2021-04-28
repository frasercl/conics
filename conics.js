/*
Note: this code is very old (ca. 2014), and written before I knew anything about
writing code that human beings might actually read!
It is not reflective of my current style, and is frankly pretty tough to look at.
Scroll down at your own risk.
*/



function round(n) {
	return Math.round(n*1000)/1000;
}

//GRAPH DRAWER///////////////////////////////////

Graph={};

var canvas;
var conicTitle;

Graph.ctx;

//Miscellaneous graph drawing tools

Graph.xMin=-20;
Graph.xMax=20;
Graph.yMin=-10;
Graph.yMax=10;

Graph.xScale;
Graph.yScale;
Graph.pointX;
Graph.pointY;
Graph.pixelX;
Graph.pixelY;

Graph.clear=function() {
	Graph.ctx.clearRect(0,0,canvas.width,canvas.height);
}

Graph.setScale=function() { //Set scale variables based on min and max heights
	Graph.xScale=(Math.abs(Graph.xMin)+Math.abs(Graph.xMax))/canvas.width;
	Graph.yScale=(Math.abs(Graph.yMin)+Math.abs(Graph.yMax))/canvas.height;
}

Graph.getPoint=function(x,y) { //Converts point coordinates to pixel coordinates
	Graph.pointX=(-Graph.xMin+x)/Graph.xScale;
	Graph.pointY=(Graph.yMax-y)/Graph.yScale;
}

Graph.getPixel=function(x,y) { //Converts pixel coordinates to point coordinates
	Graph.pixelX=x*Graph.xScale+Graph.xMin;
	Graph.pixelY=-(y*Graph.yScale-Graph.yMax);
}

Graph.setGraphStyle=function() {
	Graph.ctx.strokeStyle='#000000';
	Graph.ctx.lineWidth=2;
}

Graph.drawAxis=function() {
	Graph.ctx.strokeStyle='#b0b0b0';
	Graph.ctx.lineWidth=1;
	Graph.ctx.beginPath();
	if(Graph.xMin<=0 && Graph.xMax>=0) { //If x=0 is visible...
		Graph.getPoint(Graph.xMin,0); //Draw it...
		Graph.ctx.moveTo(Graph.pointX,Graph.pointY);
		Graph.getPoint(Graph.xMax,0);
		Graph.ctx.lineTo(Graph.pointX,Graph.pointY);
		var markLength=Math.abs(Graph.xMin)>Graph.xMax ? 20 : -20;
		for(var x=Graph.xMin;x<Graph.xMax;x++) { //Iterate through all visible nonzero integer y-values...
			if(x!==0) {
				Graph.getPoint(x,0); //...placing a tickmark at each one along the x-axis.
				Graph.ctx.moveTo(Graph.pointX,Graph.pointY);
				Graph.ctx.lineTo(Graph.pointX,Graph.pointY+markLength);
			}
		}
	}
	if(Graph.yMin<=0 && Graph.yMax>=0) { //If y=0 is visible...
		Graph.getPoint(0,Graph.yMin); //Draw it...
		Graph.ctx.moveTo(Graph.pointX,Graph.pointY);
		Graph.getPoint(0,Graph.yMax);
		Graph.ctx.lineTo(Graph.pointX,Graph.pointY);
		var markLength=Math.abs(Graph.yMin)>Graph.yMax ? -20 : 20;
		for(var y=Graph.yMin;y<Graph.yMax;y++) { //Iterate through all visible nonzero integer x-values...
			if(y!==0) {
				Graph.getPoint(0,y); //...placing a tickmark at each one along the y-axis.
				Graph.ctx.moveTo(Graph.pointX,Graph.pointY);
				Graph.ctx.lineTo(Graph.pointX+markLength,Graph.pointY);
			}
		}
	}
	Graph.ctx.stroke();
}

Graph.plotPoint=function(x,y) {
	Graph.getPoint(x,y);
	Graph.ctx.beginPath();
	Graph.ctx.arc(Graph.pointX,Graph.pointY,3,0,2*Math.PI);
	Graph.ctx.fillStyle='#2ecc71';
	Graph.ctx.fill();
}

Graph.drawLine=function(l,v) {
	Graph.ctx.strokeStyle='#2ecc71';
	Graph.ctx.lineWidth=1;
	Graph.ctx.beginPath();
	if(v) { //If line is vertical
		Graph.getPoint(l,Graph.yMax);
		Graph.ctx.moveTo(Graph.pointX,Graph.pointY);
		Graph.getPoint(l,Graph.yMin);
		Graph.ctx.lineTo(Graph.pointX,Graph.pointY);
	} else { //If line is horizontal
		Graph.getPoint(Graph.xMin,l);
		Graph.ctx.moveTo(Graph.pointX,Graph.pointY);
		Graph.getPoint(Graph.xMax,l);
		Graph.ctx.lineTo(Graph.pointX,Graph.pointY);
	}
	Graph.ctx.stroke();
}

//Parametric grapher

Graph.deltaT=0.1;
Graph.tMax=10;

Graph.drawParametric=function(xFunc,yFunc) {
	Graph.setGraphStyle();
	Graph.ctx.beginPath();
	Graph.getPoint(xFunc(0),yFunc(0));
	var startX=Graph.pointX;
	var startY=Graph.pointY;
	Graph.ctx.moveTo(startX,startY);
	Graph.pointX+=10;
	Graph.pointY+=10;
	for(var t=Graph.deltaT;t<Graph.tMax;t+=Graph.deltaT) {
		Graph.getPoint(xFunc(t),yFunc(t));
		Graph.ctx.lineTo(Graph.pointX,Graph.pointY);
	}
	Graph.ctx.stroke();
}

//Function grapher

Graph.funcRes=5;
Graph.funcBacktrackRes=0.1;

Graph.drawFunction=function(func) {
	Graph.setGraphStyle();
	var isDrawing=false;
	for(var x=Graph.xMin;x<=Graph.xMax;x+=Graph.xScale*Graph.funcRes) { //Iterate through values of x in Graph.funcRes pixel increments.
		Graph.getPoint(x,func(x)); //Find y.
		if(isDrawing) {
			if(isNaN(Graph.pointY)) { //If y was real but isn't anymore...
				var bX; //Recursively backtrack in Graph.funcBacktrackRes pixel increments until it is...
				for(bX=x;isNaN(func(bX)) && bX>Graph.xMin;bX-=Graph.xScale*Graph.funcBacktrackRes) {
				}
				if(bX>Graph.xMin) {
					//bX+=Graph.funcBacktrackRes*Graph.xScale;
				}
				Graph.getPoint(bX,func(bX)); //Make a line to that point and stop drawing until y becomes real again.
				Graph.ctx.lineTo(Graph.pointX,Graph.pointY);
				Graph.ctx.stroke();
				isDrawing=false;
			} else { //If y is real...
				Graph.ctx.lineTo(Graph.pointX,Graph.pointY); //Draw a line to it.
			}
		} else {
			if(!isNaN(Graph.pointY)) { //If y wasn't real but now is...
				var bX; //Recursively backtrack by Graph.funcBacktrackRes pixel increments until it is...
				for(bX=x;!isNaN(func(bX)) && bX>Graph.xMin;bX-=Graph.xScale*Graph.funcBacktrackRes) {
				}
				if(bX>Graph.xMin) {
					bX+=Graph.funcBacktrackRes*Graph.xScale;
				}
				Graph.getPoint(bX,func(bX)); //Make a line to it and resume drawing.
				Graph.ctx.beginPath();
				Graph.ctx.moveTo(Graph.pointX,Graph.pointY);
				isDrawing=true;
			}
		}
	}
	if(isDrawing) { //If y was real when x reached the max. width of the graph...
		Graph.ctx.stroke(); //Finish drawing.
	}
}

//CONICS/////////////////////////////////////////

//Base conic sections object

Conics={};

Conics.activeObjects=[];
Conics.conicClasses=[];

Conics.conicNames=['ellipse','parabola','hyperbola'];

Conics.startNewConic=function(x,y,type) { //this and the next two functions are just shortcuts to create and manipulate the newest section
	Conics.activeObjects.push(new Conics.conicClasses[type](x,y));
}

Conics.updateInput=function(x,y) {
	return Conics.activeObjects[Conics.activeObjects.length-1].updateInput(x,y);
}

Conics.confirmInput=function(x,y) {
	return Conics.activeObjects[Conics.activeObjects.length-1].confirmInput(x,y);
}

//Ellipse

Conics.getEllipseFunction=function(a,b,h,k,n) { //functions are got outside of object (closures created by object method don't work outside of object)
	var nMult=n ? -1 : 1;
	return function(x) {
		return b*nMult*Math.sqrt(-Math.pow((x-h)/a,2)+1)+k;
	}
}

Conics.conicClasses['ellipse']=function(x,y) { //there are four methods common to each conic class...
	this.defineProgress=0; //how many of the necessary steps have been done to define the conic
	this.focusX=x; //(rest of the properties should be somewhat self-explanatory)
	this.focusY=y;
	this.vertical=false;
	this.funcPlus;
	this.funcMinus;
	this.centerX;
	this.centerY;
	this.focusDist;
	this.majorAxis;
	this.minorAxis;
	this.isHovered=false;
	this.hoverX;
	this.hoverY;
	this.draw=function() { //draw: run by Renderer.loop every frame
		switch(this.defineProgress) {
			case 2:
			case 1: //Draw function if it's defined
			Graph.drawFunction(this.funcPlus);
			Graph.drawFunction(this.funcMinus);
			if(this.isHovered) {
				Graph.plotPoint(this.hoverX,this.hoverY);
				Graph.ctx.lineWidth=1;
				Graph.ctx.strokeStyle='#2ecc71';
				Graph.ctx.beginPath();
				Graph.getPoint(this.focusX,this.focusY);
				Graph.ctx.moveTo(Graph.pointX,Graph.pointY);
				Graph.getPoint(this.hoverX,this.hoverY);
				Graph.ctx.lineTo(Graph.pointX,Graph.pointY);
				if(this.vertical) {
					Graph.getPoint(this.focusX,this.focusY+this.focusDist);
				} else {
					Graph.getPoint(this.focusX+this.focusDist,this.focusY);
				}
				Graph.ctx.lineTo(Graph.pointX,Graph.pointY);
				Graph.ctx.stroke();
			}
			case 0:
			if(this.vertical) { //Plot foci
				Graph.plotPoint(this.focusX,this.focusY+this.focusDist);
			} else {
				Graph.plotPoint(this.focusX+this.focusDist,this.focusY);
			}
			Graph.plotPoint(this.focusX,this.focusY);
		}
	}
	this.updateInput=function(x,y) { //updateInput: run by [Input.handleMouseMove] to redefine the section based on mouse position
		var valid=true;
		switch(this.defineProgress) {
			case 0: //If second focus is not defined
			if(Math.abs(x-this.focusX)>Math.abs(y-this.focusY)) { //If cursor is farther away from focus on x-axis than y-axis...
				this.vertical=false; //...set properties accordingly.
				this.focusDist=x-this.focusX;
				this.centerX=this.focusX+this.focusDist/2;
				this.centerY=this.focusY;
			} else { //If cursor is farther away from focus on y-axis than x-axis (or if both distances are equal)...
				this.vertical=true; //...set properties accordingly.
				this.focusDist=y-this.focusY;
				this.centerX=this.focusX;
				this.centerY=this.focusY+this.focusDist/2;
			}
			break;
			case 1: //If second focus is defined, but function is not...
			var fX; //Get coords of second focus from those of first focus, vertical and focusDist
			var fY;
			if(this.vertical) {
				fX=this.focusX;
				fY=this.focusY+this.focusDist;
			} else {
				fX=this.focusX+this.focusDist;
				fY=this.focusY;
			} //Calculate major and minor axes
			this.majorAxis=(Math.sqrt(Math.pow(this.focusX-x,2)+Math.pow(this.focusY-y,2))+Math.sqrt(Math.pow(fX-x,2)+Math.pow(fY-y,2)))/2;
			this.minorAxis=Math.sqrt(Math.pow(this.majorAxis,2)-Math.pow(Math.abs(this.focusDist/2),2));
			var xX; //Find which axis is major and which is minor
			var xY;
			if(this.vertical) {
				xX=this.minorAxis;
				xY=this.majorAxis;
			} else {
				xX=this.majorAxis;
				xY=this.minorAxis;
			}
			this.funcPlus=Conics.getEllipseFunction(xX,xY,this.centerX,this.centerY,false); //Define functions.
			this.funcMinus=Conics.getEllipseFunction(xX,xY,this.centerX,this.centerY,true);
			break;
			default: //If everything is already defined, or something is wrong...
			valid=false; //...communicate error by returning false.
		}
		return valid;
	}
	this.confirmInput=function(x,y) { //confirmInput: run by [Input.handleMouseDown] to progress definition
		var unfinished=true;
		if(this.defineProgress>1) { //If everything is already defined...
			unfinished=false; //...communicate by returning false.
		} else {
			this.defineProgress++; //Increment defineProgress
			if(this.defineProgress>1) { //If everything is defined now...
				unfinished=false; //...communicate by returning false.
			} else if(this.defineProgress===1) { //If second focus was just defined...
				this.updateInput(x,y); //Run updateInput to set function, so the rendering loop doesn't error.
			}
		}
		return unfinished;
	}
	this.setHover=function(x,y) { //and setHover, run by [Input.handleMouseMove] so that conics will respond when hovered
		if(Math.abs(this.funcPlus(x)-y)<=0.1) {
			this.hoverX=x;
			this.hoverY=this.funcPlus(x);
			this.isHovered=true;
		} else if(Math.abs(this.funcMinus(x)-y)<=0.1) {
			this.hoverX=x;
			this.hoverY=this.funcMinus(x);
			this.isHovered=true;
		} else if(this.isHovered && !(Math.abs(this.funcPlus(x)-y)<=0.1 || Math.abs(this.funcMinus(x)-y)<=0.01)) {
			this.isHovered=false;
			Renderer.tooltip='';
		}
		if(this.isHovered) {
			var h='';
			var k='';
			var a;
			var b;
			if(this.centerX>0) {
				h='-'+round(this.centerX);
			} else if(this.centerX<0) {
				h='+'+round(Math.abs(this.centerX));
			}
			if(this.centerY>0) {
				k='-'+round(this.centerY);
			} else if(this.centerY<0) {
				k='+'+round(Math.abs(this.centerY));
			}
			if(this.vertical) {
				a=round(this.minorAxis);
				b=round(this.majorAxis);
			} else {
				a=round(this.majorAxis);
				b=round(this.minorAxis);
			}
			Renderer.tooltip=(a===0 ? '' : '(') + '(x'+h+')' + (a===0 ? '' : '/'+a+')') + '^2+' + (b===0 ? '' : '(') + '(y'+k+')' + (b===0 ? '' : '/'+b+')') + '^2=1';
		}
	}
}

//Parabola

Conics.getParabolaFunction=function(a,h,k,v,n) {
	var func;
	var nMult=n ? -1 : 1;
	if(v) {
		func=function(x) {
			return a*Math.pow(x-h,2)+k;
		}
	} else {
		func=function(x) {
			return nMult*Math.sqrt((x-h)/a)+k;
		}
	}
	return func;
}

Conics.conicClasses['parabola']=function(x,y) {
	this.defined=false; //Only one step in defining, so all we need to keep track of definition progress is a boolean
	this.focusX=x;
	this.focusY=y;
	this.directrix;
	this.vertical=false;
	this.vertexX;
	this.vertexY;
	this.funcPlus;
	this.funcMinus;
	this.a;
	this.isHovered=false;
	this.hoverX;
	this.hoverY;
	this.draw=function() {
		Graph.drawFunction(this.funcPlus);
		if(!this.vertical) {
			Graph.drawFunction(this.funcMinus);
		}
		Graph.plotPoint(this.focusX,this.focusY);
		Graph.drawLine(this.directrix,!this.vertical);
		if(this.isHovered) {
			Graph.plotPoint(this.hoverX,this.hoverY);
			Graph.ctx.lineWidth=1;
			Graph.ctx.strokeStyle='#2ecc71';
			Graph.ctx.beginPath();
			Graph.getPoint(this.focusX,this.focusY);
			Graph.ctx.moveTo(Graph.pointX,Graph.pointY);
			Graph.getPoint(this.hoverX,this.hoverY);
			Graph.ctx.lineTo(Graph.pointX,Graph.pointY);
			if(this.vertical) {
				Graph.getPoint(this.hoverX,this.directrix);
			} else {
				Graph.getPoint(this.directrix,this.hoverY);
			}
			Graph.ctx.lineTo(Graph.pointX,Graph.pointY);
			Graph.ctx.stroke();
			if(this.vertical) {
				Graph.plotPoint(this.hoverX,this.directrix);
			} else {
				Graph.plotPoint(this.directrix,this.hoverY);
			}
			var h='';
			var k='';
			if(this.vertexX>0) {
				h='-'+round(this.vertexX);
			} else if(this.vertexX<0) {
				h='+'+round(Math.abs(this.vertexX));
			}
			if(this.vertexY>0) {
				k='-'+round(this.vertexY);
			} else if(this.vertexY<0) {
				k='+'+round(Math.abs(this.vertexY));
			}
			if(this.vertical) {
				Renderer.tooltip='y=' + round(this.a) + '*(x' + h + ')^2' + k;
			} else {
				Renderer.tooltip='y=√(' + (this.a===0 && !h==='' ? '' : '(') + 'x' + h + (this.a===0 ? '' : (h==='' ? '' : ')')+'/'+round(this.a)) + ')' + k;
			}
		}
	}
	this.updateInput=function(x,y) {
		if(!this.defined) {
			if(Math.abs(x-this.focusX)>Math.abs(y-this.focusY)) {
				this.vertical=false;
				this.directrix=x;
				this.vertexX=(this.focusX+this.directrix)/2;
				this.vertexY=this.focusY;
				this.a=1/(4*(this.focusX-this.vertexX)); //TOM: is this the correct formula for horizontal dilation of a parabola?
			} else {
				this.vertical=true;
				this.directrix=y;
				this.vertexX=this.focusX;
				this.vertexY=(this.focusY+this.directrix)/2;
				this.a=1/(4*(this.focusY-this.vertexY));
			}
			this.funcPlus=Conics.getParabolaFunction(this.a,this.vertexX,this.vertexY,this.vertical,false);
			this.funcMinus=Conics.getParabolaFunction(this.a,this.vertexX,this.vertexY,this.vertical,true);
		}
		return !this.defined;
	}
	this.confirmInput=function(x,y) {
		this.defined=true;
		return false;
	}
	this.setHover=function(x,y) {
		if(Math.abs(this.funcPlus(x)-y)<=0.1) {
			this.hoverX=x;
			this.hoverY=this.funcPlus(x);
			this.isHovered=true;
		} else if(Math.abs(this.funcMinus(x)-y)<=0.1) {
			this.hoverX=x;
			this.hoverY=this.funcMinus(x);
			this.isHovered=true;
		} else if(this.isHovered && !(Math.abs(this.funcPlus(x)-y)<=0.1 || Math.abs(this.funcMinus(x)-y)<=0.01)) {
			this.isHovered=false;
			Renderer.tooltip='';
		}
	}
	this.updateInput(x,y);
}

//Hyperbola

Conics.getHyperbolaFunction=function(a,b,h,k,n,v) {
	var nMult=n ? -1 : 1;
	var vMult=v ? 1 : -1;
	return function(x) {
		return b*nMult*Math.sqrt(Math.pow((x-h)/a,2)+vMult)+k;
	}
}

Conics.conicClasses['hyperbola']=function(x,y) { //Pretty much the same as ellipse, but with slightly different math
	this.defineProgress=0;
	this.focusX=x;
	this.focusY=y;
	this.vertical=false;
	this.funcPlus;
	this.funcMinus;
	this.centerX;
	this.centerY;
	this.focusDist;
	this.majorAxis;
	this.minorAxis;
	this.isHovered=false;
	this.hoverX;
	this.hoverY;
	this.draw=function() {
		switch(this.defineProgress) {
			case 2:
			case 1:
			Graph.drawFunction(this.funcPlus);
			Graph.drawFunction(this.funcMinus);
			if(this.isHovered) {
				Graph.plotPoint(this.hoverX,this.hoverY);
				Graph.ctx.lineWidth=1;
				Graph.ctx.strokeStyle='#2ecc71';
				Graph.ctx.beginPath();
				Graph.getPoint(this.focusX,this.focusY);
				Graph.ctx.moveTo(Graph.pointX,Graph.pointY);
				Graph.getPoint(this.hoverX,this.hoverY);
				Graph.ctx.lineTo(Graph.pointX,Graph.pointY);
				if(this.vertical) {
					Graph.getPoint(this.focusX,this.focusY+this.focusDist);
				} else {
					Graph.getPoint(this.focusX+this.focusDist,this.focusY);
				}
				Graph.ctx.lineTo(Graph.pointX,Graph.pointY);
				Graph.ctx.stroke();
			var h='';
			var k='';
				var a;
				var b;
				if(this.centerX>0) {
					h='-'+round(this.centerX);
				} else if(this.centerX<0) {
					h='+'+round(Math.abs(this.centerX));
				}
				if(this.centerY>0) {
					k='-'+round(this.centerY);
				} else if(this.centerY<0) {
					k='+'+round(Math.abs(this.centerY));
				}
				if(this.vertical) {
					a=round(this.minorAxis);
					b=round(this.majorAxis);
					Renderer.tooltip=(b===0 ? '' : '(') + '(y'+k+')' + (b===0 ? '' : '/'+b+')') + '^2-' + (a===0 ? '' : '(') + '(x'+h+')' + (a===0 ? '' : '/'+a+')') + '^2=1';
				} else {
					a=round(this.majorAxis);
					b=round(this.minorAxis);
					Renderer.tooltip=(a===0 ? '' : '(') + '(x'+h+')' + (a===0 ? '' : '/'+a+')') + '^2-' + (b===0 ? '' : '(') + '(y'+k+')' + (b===0 ? '' : '/'+b+')') + '^2=1';
				}
			}
			case 0:
			if(this.vertical) {
				Graph.plotPoint(this.focusX,this.focusY+this.focusDist);
			} else {
				Graph.plotPoint(this.focusX+this.focusDist,this.focusY);
			}
			Graph.plotPoint(this.focusX,this.focusY);
		}
	}
	this.updateInput=function(x,y) {
		var valid=true;
		switch(this.defineProgress) {
			case 0:
			if(Math.abs(x-this.focusX)>Math.abs(y-this.focusY)) {
				this.vertical=false;
				this.focusDist=x-this.focusX;
				this.centerX=this.focusX+this.focusDist/2;
				this.centerY=this.focusY;
			} else {
				this.vertical=true;
				this.focusDist=y-this.focusY;
				this.centerX=this.focusX;
				this.centerY=this.focusY+this.focusDist/2;
			}
			break;
			case 1:
			var fX;
			var fY;
			if(this.vertical) {
				fX=this.focusX;
				fY=this.focusY+this.focusDist;
			} else {
				fX=this.focusX+this.focusDist;
				fY=this.focusY;
			}
			this.majorAxis=Math.abs(Math.sqrt(Math.pow(this.focusX-x,2)+Math.pow(this.focusY-y,2))-Math.sqrt(Math.pow(fX-x,2)+Math.pow(fY-y,2)))/2;
			this.minorAxis=Math.abs(Math.sqrt(Math.pow(this.focusDist/2,2)-Math.pow(this.majorAxis,2)));
			var xX;
			var xY;
			if(this.vertical) {
				xX=this.minorAxis;
				xY=this.majorAxis;
			} else {
				xX=this.majorAxis;
				xY=this.minorAxis;
			}
			this.funcPlus=Conics.getHyperbolaFunction(xX,xY,this.centerX,this.centerY,false,this.vertical);
			this.funcMinus=Conics.getHyperbolaFunction(xX,xY,this.centerX,this.centerY,true,this.vertical);
			break;
			default:
			valid=false;
		}
		return valid;
	}
	this.confirmInput=function(x,y) {
		var unfinished=true;
		if(this.defineProgress>1) {
			unfinished=false;
		} else {
			this.defineProgress++;
			if(this.defineProgress>1) {
				unfinished=false;
			} else if(this.defineProgress===1) {
				this.updateInput(x,y);
			}
		}
		return unfinished;
	}
	this.setHover=function(x,y) {
		if(Math.abs(this.funcPlus(x)-y)<=0.1) {
			this.hoverX=x;
			this.hoverY=this.funcPlus(x);
			this.isHovered=true;
		} else if(Math.abs(this.funcMinus(x)-y)<=0.1) {
			this.hoverX=x;
			this.hoverY=this.funcMinus(x);
			this.isHovered=true;
		} else if(this.isHovered && !(Math.abs(this.funcPlus(x)-y)<=0.1 || Math.abs(this.funcMinus(x)-y)<=0.01)) {
			this.isHovered=false;
			Renderer.tooltip='';
		}
	}
}

//INPUT//////////////////////////////////////////

Input={};

Input.conicPlusKey=38;
Input.conicMinusKey=40;

Input.conicInProgress=false;
Input.currentConicType='ellipse';
Input.currentConicId=0;

Input.mouseWheelPosition=0;

Input.handleMouseMove=function(e) { //With this, and all other methods of [Input], it's all in the name.
	Graph.getPixel(e.clientX,e.clientY);
	if(Input.conicInProgress) { //If we're currently working on defining a conic, tell that conic where the mouse has moved to.
		Conics.updateInput(Graph.pixelX,Graph.pixelY);
	} else {
		for(var c=0;c<Conics.activeObjects.length;c++) { //Otherwise, tell all sections about it, so they can figure out if they're hovered.
			Conics.activeObjects[c].setHover(Graph.pixelX,Graph.pixelY);
		}
	}
	Renderer.tooltipX=e.clientX; //Move the tooltip to mouse position
	Renderer.tooltipY=e.clientY;
}

Input.handleMouseDown=function(e) {
	Graph.getPixel(e.clientX,e.clientY);
	if(Input.conicInProgress) { //If we're defining a conic
		Input.conicInProgress=Conics.confirmInput(Graph.pixelX,Graph.pixelY);
	} else {
		Conics.startNewConic(Graph.pixelX,Graph.pixelY,Input.currentConicType);
		Input.conicInProgress=true;
		Renderer.tooltip='';
		for(var c=0;c<Conics.activeObjects.length;c++) {
			Conics.activeObjects[c].isHovered=false;
		}
	}
}

Input.changeConic=function(down) {
	if(down) {
		if(Input.currentConicId<=0) {
			id=Conics.conicNames.length-1;
		} else {
			id=Input.currentConicId-1;
		}
	} else {
		if(Input.currentConicId>=Conics.conicNames.length-1) {
			id=0;
		} else {
			id=Input.currentConicId+1;
		}
	}
	Input.currentConicId=id;
	Input.currentConicType=Conics.conicNames[id];
	Renderer.setMessage(Input.currentConicType);
}

Input.handleKeyDown=function(e) {
	var id=-1;
	switch(e.keyCode) {
		case Input.conicPlusKey:
		Input.changeConic(false);
		break;
		case Input.conicMinusKey:
		Input.changeConic(true);
	}
}

Input.handleMouseWheel=function(e) {
	Input.mouseWheelPosition+=e.wheelDelta;
	for(;Input.mouseWheelPosition>=120;Input.mouseWheelPosition-=120) {
		Input.changeConic(true);
	}
	for(;Input.mouseWheelPosition<=-120;Input.mouseWheelPosition+=120) {
		Input.changeConic(false);
	}
}

window.addEventListener('mousemove',Input.handleMouseMove); //Add listeners for above functions
window.addEventListener('mousedown',Input.handleMouseDown);
window.addEventListener('keydown',Input.handleKeyDown);
window.addEventListener('mousewheel',Input.handleMouseWheel);

//RENDERER///////////////////////////////////////

Renderer={};

Renderer.fps=30;
Renderer.messageTime=3000;
Renderer.messageFadeTime=1000;
Renderer.messageMaxOpacity=0.8;

Renderer.lastFrame;

Renderer.message;
Renderer.messageOpacity=0;
Renderer.messageCountdown;
Renderer.drawingMessage=false;

Renderer.tooltip='';
Renderer.tooltipX=0;
Renderer.tooltipY=0;

Renderer.setMessage=function(msg) { //Sets message (big text in center to notify conic change)
	Renderer.message=msg;
	Renderer.messageOpacity=1;
	Renderer.messageCountdown=Renderer.messageTime;
	Renderer.messageOpacity=Renderer.messageMaxOpacity;
	Renderer.drawingMessage=true;
}

Renderer.loop=function() { //Main rendering loop: clears and redraws graph [Renderer.fps] times per second.
	var time=new Date().getTime(); //Find time between frames (to compensate for lag)
	var msElapsed=time-Renderer.lastFrame;
	Renderer.lastFrame=time;
	Graph.clear(); //Clear graph
	Graph.drawAxis(); //Draw axis
	for(var c=0;c<Conics.activeObjects.length;c++) { //Draw conics
		Conics.activeObjects[c].draw();
	}
	if(Renderer.drawingMessage) { //Draw message
		Graph.ctx.font=(canvas.height/3)+'px "Open Sans"';
		Graph.ctx.fillStyle='rgba(80,80,80,'+Renderer.messageOpacity+')';
		Graph.ctx.textAlign='center';
		Graph.ctx.textBaseline='alphabetic';
		Graph.ctx.fillText(Renderer.message,canvas.width/2,canvas.height/2);
		if(Renderer.messageCountdown<=0) {
			Renderer.messageOpacity-=msElapsed/Renderer.messageFadeTime*Renderer.messageMaxOpacity;
			Renderer.drawingMessage=Renderer.messageOpacity>0;
		} else {
			Renderer.messageCountdown-=msElapsed;
		}
	}
	Graph.ctx.textAlign='left'; //Draw tooltip
	Graph.ctx.textBaseline='bottom';
	Graph.ctx.fillStyle='rgba(80,80,80,0.8)';
	Graph.ctx.font=(canvas.height/35)+'px "Open Sans"';
	Graph.ctx.fillText(Renderer.tooltip,Renderer.tooltipX,Renderer.tooltipY);
	window.setTimeout(Renderer.loop,1000/Renderer.fps); //Schedule this to be run again [1000/Renderer.fps]ms from now
}

//STARTUP////////////////////////////////////////

window.onload=function() { //Runs on page load
	canvas=document.getElementById('graph'); //Grabs page elements and such for use later...
	conicTitle=document.getElementById('conictitle');
	Graph.ctx=canvas.getContext('2d');
	canvas.width=window.innerWidth; //Sizes canvas element to size of window...
	canvas.height=window.innerHeight;
	Graph.setScale(); //Sets scale...
	Renderer.loop(); //...and starts rendering loop.
}