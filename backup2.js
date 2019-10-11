//https://jsfiddle.net/opencpu/5Rqcm/
//https://www.d3-graph-gallery.com/graph/basic_datamanipulation.html
//https://github.com/d3/d3-scale
////https://bl.ocks.org/EfratVil/2bcc4bf35e28ae789de238926ee1ef05
//https://www.d3-graph-gallery.com/graph/interactivity_button.html
//https://github.com/WYanChao/RadViz/blob/master/src/RadViz.js
//optional variables
//animation
//dragging

var file=Object;
var Radius=250;
var Radviz_cx=450;
var Radviz_cy=300;
var Columns = [];
var data;
var dataBeforeNorm;
var anchors_xaxis=[];
var anchors_yaxis=[];
var colorMapping={};
var num_of_col;
var anchors=[];
var anchors_coordinates={};
var classColumnName;

document.addEventListener('DOMContentLoaded',(event) => {
    document.getElementsByTagName("p")[0].style.visibility = "hidden";
    createRadviz();
});

//Radviz plotting
function createRadviz(){

    //creating the canvas
    canvas=d3.select("#Graph").append("svg")
                                .attr("width","100%")
                                .attr("height",600);


    //loading the Dataset after clicking submit button
    document.getElementById("submit").onclick = loadFileAsText;

    function loadFileAsText(){
        var fileToLoad = document.getElementById("csvfile").files[0];
        if(fileToLoad!=null)
        {
        var fileReader = new FileReader();
        fileReader.onload = function(fileLoadedEvent){
            textFromFileLoaded = fileLoadedEvent.target.result;
            data = d3.csvParse(textFromFileLoaded+"");
            d3.selectAll("#divCheckBox").remove();
            d3.select("#Graph .message").remove();
            anchors=[];
            processingData(data);
        };
        fileReader.readAsText(fileToLoad, "UTF-8");
        d3.select("#slider").remove();
     
        d3.select("p").append("input")
                            .attr("type","range")
                            .attr("min",10)
                            .attr("max",100)
                            .attr("value",100)
                            .attr("id","slider")
                            .attr("oninput","sliderforCircles()");
        document.getElementsByTagName("p")[0].style.visibility = "visible";
        }
    }
}

//processing the data 
function processingData(data){
    //removing the exisiting canvas
    d3.select("svg").remove();

    //creating a new canvas
    canvas=d3.select("#Graph").append("svg")
                            .attr("width","100%")
                            .attr("height",600);
    //plotting the Main circle
    canvas.append("circle")
    .attr("cx",Radviz_cx)
    .attr("cy",Radviz_cy)
    .attr("r",Radius)
    .attr("fill","white")
    .attr("stroke","black")
    .attr("class","Maincircle");

    //finding all the coluns in dataset
    Columns=data.columns;
    num_of_col=data.columns.length;

    showOptCheBox(Columns);

    //preprocessing the data(converting all the data columns from strings to numbers)
    data.forEach(function(record){
        counter=1;
        for(k in record){
            if(counter<num_of_col)
            {
                record[k]=+record[k];
                counter++;
            }
        }
    });
    dataBeforeNorm=JSON.parse(JSON.stringify(data));
    dataNormalization(Columns,data);
    //getting the column name in which category names are present
    classColumnName = Columns[Columns.length-1];
    //finding the unique values in class column
    classValues=d3.map(data, function(d){return d[classColumnName];}).keys();
    //getting the colors for categorical column
    var colors = d3.scaleOrdinal(d3.schemeCategory10).range();

    colorMapping={};
    for (i=0;i<classValues.length;i++)
    {
        colorMapping[classValues[i]]=colors[i];
    }

    plotClassIndicators(colorMapping);
    plottingAnchors(Columns);
    plottingDataPoints(data,dataBeforeNorm);
    //sliderforCircles();  
}

//providing checkboxes for selecting the anchors
function showOptCheBox(Columns){
    d3.selectAll(".checkboxes").remove();
    d3.select("#Graph").append("div")
                        .attr("id", "divCheckBox");
    for (i=0;i<Columns.length-1;i++){
        columnName=Columns[i];
        d3.select('#divCheckBox ').append("input")
                        .attr("type","checkbox")
                        .attr("name",columnName)
                        .attr("checked","true")
                        .attr("class","checkboxes")
                        .attr("id",columnName)
                        .attr("onchange","updatePlot()");
        d3.select("#divCheckBox").append("text")
                            .text(columnName+"  ")
                            .attr("class","checkboxes");
    }

}

function updatePlot(){
    d3.selectAll("#Graph .message").remove();
    className=Columns[Columns.length-1];
  anchors=[];
    d3.selectAll(".checkboxes").each(function(d){
        checkbox = d3.select(this);
        if(checkbox.property("checked")){
            anchors.push(checkbox.property("id"));
        }
      });
    if(anchors.length<=2){
        
        d3.select("#Graph").append("text").attr("class","message").text("Please select minimum 3").style("color","red");
    }
    else{
        anchors.push(className);
        d3.selectAll(".anchorCircles").remove();
        d3.selectAll(".anchorLabels").remove();
        plottingAnchors(anchors);
        
        d3.selectAll(".dataPoints").remove();
        plottingDataPoints(data,dataBeforeNorm);
        // d3.select("#slider").remove();
         
        // d3.select("p").append("input")
        //                         .attr("type","range")
        //                         .attr("min",10)
        //                         .attr("max",100)
        //                         .attr("value",100)
        //                         .attr("id","slider");
    
        // d3.selectAll(".classIndicatorNames").remove();
        // d3.selectAll(".classIndicators").remove();
        // plotClassIndicators(colorMapping);
       // sliderforCircles();
    }
   
}

//normalizing the data between 0 and 1 for all columns except the class column
function dataNormalization(Columns,data){
    scalingFunctions=[];
    for (i=0;i<Columns.length;i++)
    {
        columnName=Columns[i];
        min=d3.min(data,function(d){
            return d[columnName];
        });
        max=d3.max(data,function(d){
            return d[columnName];
        });

        var scaling = d3.scaleLinear()
                    .domain([min, max])
                    .range([0, 1]);
        scalingFunctions.push(scaling);
    }
    
    data.forEach(function(record){
        index=0;
        for (key in record){
            if(index<Columns.length-1){
                record[key]=scalingFunctions[index](record[key]);
                index++;
            }
        }
    });
}

//creating the slider for color opacity
function sliderforCircles(){
   // d3.select("#slider").on("input", function () {

        canvas.selectAll('.dataPoints')
                        .transition()
                        .duration(2000)
                        .ease(d3.easeLinear)
                        .style("opacity", d3.select("#slider").property("value")/100);
        canvas.selectAll('.classIndicators')
                        .transition()
                        .duration(2000)
                        .ease(d3.easeLinear)
                        .style("opacity", d3.select("#slider").property("value")/100);
      //  });
}

//creating the class indicators with colors and name of the class
function plotClassIndicators(colorMapping){
    label_x=750;
    label_y=50;
    for (key in colorMapping)
    {
        canvas.append("circle")
        .attr("cx",label_x)
        .attr("cy",label_y)
        .attr("r",5)
        .attr("fill",colorMapping[key])
        .attr("stroke",colorMapping[key])
        .attr("class","classIndicators");

        //labelling the classes with names
        canvas.append("text")
        .attr("x",label_x+8)
        .attr("y",label_y+4)
        .attr("fill","black")
        .attr("class","classIndicatorNames")
        .text(key);

        label_y=label_y+15;
    }

}

//plotting the attributes or anchors
function plottingAnchors(Columns)
{
    num_of_col=Columns.length;
    anchors_xaxis=[];
    anchors_yaxis=[];
    anchors_coordinates={};
    for(i=0;i<num_of_col-1;i++)
    {
        anchor_x = Radius*Math.cos((i*360/(num_of_col-1))*(parseFloat(Math.PI/180)))+Radviz_cx;
        anchor_y = Radius*Math.sin((i*360/(num_of_col-1))*(parseFloat(Math.PI/180)))+Radviz_cy;
        anchors_xaxis.push(anchor_x);
        anchors_yaxis.push(anchor_y);
        anchors_coordinates[Columns[i]]=[anchor_x,anchor_y];
        //plotting the circle/anchor for each attribute
        canvas.append("circle")
        .attr("cx",anchor_x)
        .attr("cy",anchor_y)
        .attr("r",5)
        .data([{"x":anchor_x,"y":anchor_y}])
        .attr("fill","black")
        .attr("stroke","ash")
        .attr("id",Columns[i].replace(/[^A-Z0-9]/ig, ""))
        .attr("class","anchorCircles")
        .call(d3.drag()
				.on('drag', anchorsMovement));

        //labelling each anchor
        canvas.append("text")
        .attr("x",anchor_x+6)
        .attr("y",anchor_y+6)
        .attr("fill","black")
        .attr("id",Columns[i].replace(/[^A-Z0-9]/ig, ""))
        .attr("class","anchorLabels")
        .text(Columns[i]);
    }
}

function anchorsMovement(d){
    d3.select(this).raise().classed('active', true);

    tempX=d3.event.x-Radviz_cx;
    tempY=d3.event.y-Radviz_cy;
    anglePosit=Math.atan2(tempY,tempX);

    newAnchorX=Radviz_cx+(Radius*Math.cos(anglePosit));
    newAnchorY=Radviz_cy+(Radius*Math.sin(anglePosit));

    d3.select(this).attr('cx', d.x=newAnchorX).attr('cy', d.y=newAnchorY);
    id = d3.select(this).attr("id");
    label=d3.select("text#" +id).text();
    d3.select("#" + id).attr("x", newAnchorX+6)
                .attr("y", newAnchorY+6)
                .attr("fill","black")
                .attr("id", id)
                .text(label);
    d3.selectAll(".dataPoints").remove();

    index=Columns.indexOf(label);
    anchors_xaxis[index]=newAnchorX;
    anchors_yaxis[index]=newAnchorY;

    anchors_coordinates[label]=[newAnchorX,newAnchorY];
    // d3.select("#slider").remove();
     
    // d3.select("p").append("input")
    //                         .attr("type","range")
    //                         .attr("min",10)
    //                         .attr("max",100)
    //                         .attr("value",100)
    //                         .attr("id","slider");

    d3.selectAll(".classIndicatorNames").remove();
    d3.selectAll(".classIndicators").remove();
    plotClassIndicators(colorMapping);
    plottingDataPoints(data, dataBeforeNorm);
    //sliderforCircles();
}

//plotting the data points in Radviz
function plottingDataPoints(data,dataBeforeNorm)
{
    // if(anchors.length!=0)
    // {
    //     Columns=anchors;
    // }
    counter=0;
    data.forEach(function(record){
        beforeNormRecord=dataBeforeNorm[counter];
        anchor_count=0;
        numerator_x=0;
        denominator_x=0;
        numerator_y=0;
        denominator_y=0;
        var toolTipMessage="";
        for(key in record){
            if (anchors_coordinates[key]!=undefined){
                anch=anchors_coordinates[key];
                numerator_x=numerator_x+(anch[0]*record[key]);
                denominator_x=denominator_x+record[key];
                numerator_y=numerator_y+(anch[1]*record[key]);
                denominator_y=denominator_y+record[key];
                anchor_count++;
                toolTipMessage=toolTipMessage+key+": "+beforeNormRecord[key]+"\n";
          
        } 
        }
        counter++;
        dataPoint_x=numerator_x/denominator_x;
        dataPoint_y=numerator_y/denominator_y;

        toolTipMessage=toolTipMessage+classColumnName+": "+record[classColumnName];
        dataPoint=canvas.append("circle")
        .attr("cx",dataPoint_x)
        .attr("cy",dataPoint_y)
        .attr("r",3)
        .attr("fill",colorMapping[record[classColumnName]])
        .attr("stroke",colorMapping[record[classColumnName]])
        .style("opacity", 1.0)
        .attr("class","dataPoints");

        dataPoint.append("svg:title").text(toolTipMessage);
    });

    sliderforCircles();
}