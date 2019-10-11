//Global variables used in different functions in the code
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

//calling the createRadviz function after DOM content is loaded
document.addEventListener('DOMContentLoaded',(event) => {
    document.getElementsByTagName("p")[0].style.visibility = "hidden";
    createRadviz();
});

//Radviz plotting function
function createRadviz(){

    //creating the canvas
    canvas=d3.select("#Graph").append("svg")
                                .attr("width","100%")
                                .attr("height",600);


    //loading the Dataset after clicking submit button in browser
    document.getElementById("submit").onclick = loadFileAsText;

    //loading the csv file as input
    function loadFileAsText(){
        var fileToLoad = document.getElementById("csvfile").files[0];
        if(fileToLoad!=null)
        {
        var fileReader = new FileReader();
        fileReader.onload = function(fileLoadedEvent){
            textFromFileLoaded = fileLoadedEvent.target.result;
            data = d3.csvParse(textFromFileLoaded+"");

            //removing the existing check boxes and messages
            d3.selectAll("#divCheckBox").remove();
            d3.select("#Graph .message").remove();
            anchors=[];

            //calling processingData function
            processingData(data);
        };
        fileReader.readAsText(fileToLoad, "UTF-8");
        
        //removing the existing slider in browser
        d3.select("#slider").remove();
     
        //creating a new slider for color opacity after receiving the dataset
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

//function for processing the input data 
function processingData(data){

    //removing the exisiting canvas
    d3.select("svg").remove();

    //creating a new canvas
    canvas=d3.select("#Graph").append("svg")
                            .attr("width","100%")
                            .attr("height",600);
    //plotting the Main circle for Radviz
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

    //calling the showOptCheBox method to create the checkboxes for anchors
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

    //storing the copy of data before normalization
    dataBeforeNorm=JSON.parse(JSON.stringify(data));

    //calling dataNormalization method to normalize the data
    dataNormalization(Columns,data);

    //getting the column name in which class values are present
    classColumnName = Columns[Columns.length-1];

    //finding the unique values in class column
    classValues=d3.map(data, function(d){return d[classColumnName];}).keys();

    //getting the colors for categorical column
    var colors = d3.scaleOrdinal(d3.schemeCategory10).range();

    //assigning colors for different classes and storing in object
    colorMapping={};
    for (i=0;i<classValues.length;i++)
    {
        colorMapping[classValues[i]]=colors[i];
    }

    //calling plotClassIndicators method to plot the class names with colors in svg
    plotClassIndicators(colorMapping);

    //calling method to plot the anchors
    plottingAnchors(Columns);

    //calling method to plot the data points inside Radviz circle
    plottingDataPoints(data,dataBeforeNorm);
}

//method providing checkboxes for selecting the anchors
function showOptCheBox(Columns){
    //removing the existing checkboxes
    d3.selectAll(".checkboxes").remove();
    d3.select("#Graph").append("div")
                        .attr("id", "divCheckBox");
    for (i=0;i<Columns.length-1;i++){
        columnName=Columns[i];

        //creating a checkbox and calling updatePlot method when changes are made to checkbox
        d3.select('#divCheckBox ').append("input")
                        .attr("type","checkbox")
                        .attr("name",columnName)
                        .attr("checked","true")
                        .attr("class","checkboxes")
                        .attr("id",columnName)
                        .attr("onchange","updatePlot()");
        //creating a label for checkbox
        d3.select("#divCheckBox").append("text")
                            .text(columnName+"  ")
                            .attr("class","checkboxes");
    }

}

//method to update the Radviz when changes are made to checkboxes
function updatePlot(){

    d3.selectAll("#Graph .message").remove();
    className=Columns[Columns.length-1];
    anchors=[];
    //storing all the selected anchors in an array
    d3.selectAll(".checkboxes").each(function(d){
        checkbox = d3.select(this);
        if(checkbox.property("checked")){
            anchors.push(checkbox.property("id"));
        }
      });

    //if number of anchors selected are <=2, throwing an error in UI
    if(anchors.length<=2){
        
        d3.select("#Graph").append("text").attr("class","message").text("Please select minimum 3").style("color","red");
    }
    else{
        anchors.push(className);
        //removing all the existing anchors
        d3.selectAll(".anchorCircles").remove();
        d3.selectAll(".anchorLabels").remove();

        //calling method to create new anchors
        plottingAnchors(anchors);

        //removing existing data points
        d3.selectAll(".dataPoints").remove();

        //calling method to create new data points based on new anchors
        plottingDataPoints(data,dataBeforeNorm);
    }
   
}

//normalizing the data between 0 and 1 for all columns except the class column
function dataNormalization(Columns,data){
    scalingFunctions=[];
    for (i=0;i<Columns.length;i++)
    {
        columnName=Columns[i];
        //getting the minimum value of current column
        min=d3.min(data,function(d){
            return d[columnName];
        });
        //getting the maximum value of current column
        max=d3.max(data,function(d){
            return d[columnName];
        });

        //storing the scaling function for every column in array
        var scaling = d3.scaleLinear()
                    .domain([min, max])
                    .range([0, 1]);
        scalingFunctions.push(scaling);
    }
    
    //replacing every value with normalized value
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

//function for updating the color opacity
function sliderforCircles(){
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
        //calculating the x and y coordinates for every anchor
        anchor_x = Radius*Math.cos((i*360/(num_of_col-1))*(parseFloat(Math.PI/180)))+Radviz_cx;
        anchor_y = Radius*Math.sin((i*360/(num_of_col-1))*(parseFloat(Math.PI/180)))+Radviz_cy;
        anchors_xaxis.push(anchor_x);
        anchors_yaxis.push(anchor_y);
        
        //storing the anchor coordinates along with anchor name in object
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

//method to update the anchor position when the anchor is dragged
function anchorsMovement(d){
    d3.select(this).raise().classed('active', true);

    //calculating the new position of anchor
    tempX=d3.event.x-Radviz_cx;
    tempY=d3.event.y-Radviz_cy;
    anglePosit=Math.atan2(tempY,tempX);
    newAnchorX=Radviz_cx+(Radius*Math.cos(anglePosit));
    newAnchorY=Radviz_cy+(Radius*Math.sin(anglePosit));

    //updating the anchor coordinates on Radviz
    d3.select(this).attr('cx', d.x=newAnchorX).attr('cy', d.y=newAnchorY);
    id = d3.select(this).attr("id");
    label=d3.select("text#" +id).text();
    d3.select("#" + id).attr("x", newAnchorX+6)
                .attr("y", newAnchorY+6)
                .attr("fill","black")
                .attr("id", id)
                .text(label);
    
    //removing existing data points on radviz
    d3.selectAll(".dataPoints").remove();

    index=Columns.indexOf(label);
    anchors_xaxis[index]=newAnchorX;
    anchors_yaxis[index]=newAnchorY;

    //updating the anchor coordinates in object
    anchors_coordinates[label]=[newAnchorX,newAnchorY];

    //removing existing class indicators in the UI and creating new one's.
    d3.selectAll(".classIndicatorNames").remove();
    d3.selectAll(".classIndicators").remove();
    plotClassIndicators(colorMapping);

    //calling the method to plot the data points as per new anchor positions
    plottingDataPoints(data, dataBeforeNorm);
}

//plotting the data points in Radviz
function plottingDataPoints(data,dataBeforeNorm)
{
    counter=0;
    //looping for each record in the data
    data.forEach(function(record){

        //fetching the corresponding record from before normalized data
        beforeNormRecord=dataBeforeNorm[counter];

        anchor_count=0;
        numerator_x=0;
        denominator_x=0;
        numerator_y=0;
        denominator_y=0;
        var toolTipMessage="";
        for(key in record){
            //if the anchor is present in Radviz then using the corresponding column
            if (anchors_coordinates[key]!=undefined){
                //calculating the coordinates of data point
                anch=anchors_coordinates[key];
                numerator_x=numerator_x+(anch[0]*record[key]);
                denominator_x=denominator_x+record[key];
                numerator_y=numerator_y+(anch[1]*record[key]);
                denominator_y=denominator_y+record[key];
                anchor_count++;
                //creating a tooltip message with information from all columns
                toolTipMessage=toolTipMessage+key+": "+beforeNormRecord[key]+"\n";
          
            } 
        }
        counter++;
        dataPoint_x=numerator_x/denominator_x;
        dataPoint_y=numerator_y/denominator_y;

        toolTipMessage=toolTipMessage+classColumnName+": "+record[classColumnName];

        //plotting the data point on Radviz along with the color stored in object for its class
        dataPoint=canvas.append("circle")
        .attr("cx",dataPoint_x)
        .attr("cy",dataPoint_y)
        .attr("r",3)
        .attr("fill",colorMapping[record[classColumnName]])
        .attr("stroke",colorMapping[record[classColumnName]])
        .style("opacity", 1.0)
        .attr("class","dataPoints");

        //creating the tool tip for data point
        dataPoint.append("svg:title").text(toolTipMessage);
    });

    //calling method to restore the color opacity for all data points as per the slider input
    sliderforCircles();
}

//References:
//https://jsfiddle.net/opencpu/5Rqcm/
//https://www.d3-graph-gallery.com/graph/basic_datamanipulation.html
//https://github.com/d3/d3-scale
////https://bl.ocks.org/EfratVil/2bcc4bf35e28ae789de238926ee1ef05
//https://www.d3-graph-gallery.com/graph/interactivity_button.html
//https://github.com/WYanChao/RadViz/blob/master/src/RadViz.js