var valueFormat = d3.format("+,.2f"); 
var perFormat = d3.format("+,.2p")
var dFinal = (new Date(2013,5,1));
var menufields = ['U','V','S','Temp','Lat'];
var dataset = [62582,101800,60360,107600,71020,43613,62582,92968,83409,71020]; //drifter ids     
var trimdata = dataset;  //default list to use
var key = "U";  //default time series to use
var fname = "drift_samp.csv"
var stepsize = 6*3600e3; //6 hours
var nData = 960; //180 days
var selToUse = "#chart";  //id where the cubism displays will appear
var context = cubism.context().serverDelay(Date.now()-dFinal).step(stepsize).size(nData).stop(); 

setup(selToUse,context);   //set up the axis, rule and display of the value

metricsRS = dataset.map(function(el) {return readData(el,key,context)})  //build the metric with the default key

insertMetrics(selToUse,context,metricsRS,valueFormat,key) //put the metrics into horizons for visualization

setupMenu(menufields,dataset) //set up the menu to select the channel to display

d3.select("#allInstruments").on("change",function() {
   var str = d3.select("#searchbox").node().value, 
  key = d3.selectAll("#drop-menu1 > .key").html().trim(),     
   trimdata = (str==""|d3.select("#allInstruments").property("checked"))?dataset:str.split(/[ ,;]+/);
   redo(selToUse,context,trimdata,key);
   d3.select("#all").style("font-weight",d3.select("#allInstruments").property("checked")?"bold":"normal");
})

function redo(sel,ctx,data,key) { 
  metricsRS = data.map(function(el) {return readData(el,key,context)}) 
  d3.selectAll(sel +" > .horizon").call(context.horizon().remove).remove()
  insertMetrics(sel,context,metricsRS,valueFormat,key)  
  setup(sel,context)       		
}                                                                                                      http://www.hulu.com/watch/474716

function setup(sel,ctx) {
d3.selectAll(sel).selectAll(".axis")
    .data(["bottom"])
  .enter().append("div")
    .attr("class", function(d) { return d + " axis"; })
    .each(function(d) {d3.select(this).call(ctx.axis().ticks(12).orient(d)); });

d3.select(sel).append("div")
    .attr("class", "rule")
    .call(ctx.rule());

ctx.on("focus", function(i) {
  d3.selectAll(".value").style("right", i == null ? null : context.size() - i + "px"); 
	})

};

function readData(name,key,ctx) {
  return ctx.metric(function(start, stop, step, callback) {
    d3.csv("drift_samp.csv", function(measurements) { 
	values = measurements.filter(function(d) {return +d.ID==name}).map(function(d) {return key=='varTemp'?Math.log(+d[key]):+d[key]}).map(function(d) {return d>999?NaN:d})	
      callback(null,values.slice(-context.size()));
    });
  },name+" "+key);
}

function insertMetrics(sel,ctx,metrics,fmt,key) {
d3.selectAll(sel).selectAll(".horizon")
    .data(metrics)
  .enter().append("div")
    .attr("class", "horizon")
  .call(ctx.horizon().extent(fixhorizon(key)).colors(["#a50026","#d73027","#f46d43","#fdae61","#fee090","#ffffbf","#e0f3f8","#abd9e9","#74add1","#4575b4"].reverse())
    .format(fmt));
}
function fixhorizon(key) {
	switch (key) {
		case "Lat":
			return [-60,25];
			break;
		case "Lon":
			return [0,360];
			break;
		case "Temp":
			return [10,30];
			break;
		case "U":
			return [-100,100];
			break;
	    case "V":
			return [-100,100];
			break;
	    case "S":
			return [0,100];
			break;	  
		case "varTemp":
			return [-7,-3.5];
			break;
	}
}
        
function setupMenu(pfields,nfields)   {
d3.select("#drop-menu1").selectAll("span")
    .data(menufields)
  .enter().append("span")
    .html(function(d){return d+" ";}).attr("id",function(d) {return d}).style({"text-transform":"lower"})
     .on("click",selectkey)
d3.select("#drop-menu1").select("span#"+key).style({"text-transform":"uppercase","font-weight":"bold"}).attr("class","key")
}

function selectkey() {
  var key = this.innerText.trimRight().toLowerCase();
	  key = key.charAt(0).toUpperCase() + key.slice(1);
  var str = d3.select("#searchbox").node().value,
      trimdata = (str==""|d3.select("#allInstruments").property("checked"))?dataset:str.split(/[ ,;]+/)
redo(selToUse,context,trimdata,key);
d3.selectAll("#drop-menu1 > span:not(#"+key+")").style({"text-transform":"none","font-weight":"normal"}).attr("class","");
d3.selectAll("#drop-menu1 >span#"+key).style({"text-transform":"uppercase","font-weight":"bold"}).attr("class","key"); 
} 
    
function searchbox() {
  var e = event || window.event,
  matchthis = e.srcElement.value, 
  key = d3.selectAll("#drop-menu1 > .key").html().trim(),
  trimdata = d3.select("#allInstruments").property("checked")?dataset:array_intersect(matchthis.split(/[ ,;]+/),dataset);
  redo(selToUse,context,trimdata,key)     
} 

function toggleDesc() {
	d3.select("#desc").style("display",d3.select("#toggleDesc").property("checked")?"block":"none")
}
//array intersect from https://gist.github.com/lovasoa/3361645
//I'm using this to ensure the input is part of the dataset. However, this doesn't preserve the user's order 
function array_intersect(){var a,b,c,d,e,f,g=[],h={},i;i=arguments.length-1;d=arguments[0].length;c=0;for(a=0;a<=i;a++){e=arguments[a].length;if(e<d){c=a;d=e}}for(a=0;a<=i;a++){e=a===c?0:a||c;f=arguments[e].length;for(var j=0;j<f;j++){var k=arguments[e][j];if(h[k]===a-1){if(a===i){g.push(k);h[k]=0}else{h[k]=a}}else if(a===0){h[k]=0}}}return g}