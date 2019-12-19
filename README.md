# Radviz-Visualization-using-D3js

Features implemented:

1.	Providing an option to the user to select any csv file to visualize Radviz.
2.	Static visualization with all data attributes as anchors of circle. Different class data points were plotted with different colors.
3.	Draggable anchors where we can drag the anchor positions to any point on the Radviz.
4.	Slider for changing color opacity of all instances.
5.	smooth transition when dragging the anchors. All the data points positions will be changed automatically when the anchors are dragged.
6.	Correlation matrix will be displayed when hovering any data point in Radviz. The correlation matrix will be displayed for the data belonging to the same cluster or class.
7.	Checkboxes for selecting optional anchors to be displayed in Radviz. When input is provided using check boxes, the positions of remaining anchors will be updated automatically along with the data points in Radviz.
8.	Checkbox for selecting an option to visualize the data using the clustering or based on classes.
9.	Option for selecting the Assignment1 processed csv file and visualizing it using both clustering and classes. A dropdown for the user to select the categorical column as color for the Assignment1 processed csv file.

Steps to run the application:

1. There are total 4 files provided of this project. 
	Radviz.html – to create the user interface for interactive visualization
	Style.css – for creating the styles in the user interface
	app.py – backend python file for providing the required information to user interface
  file.js – frontend java script file for creating the visualization using the information provided by app.py file.  
2. make sure that all the input csv files used for visualization are in the same folder as app.py and execute the application 


References:

[1] "File Upload Example using read.csv - JSFiddle", Jsfiddle.net, 2019. [Online]. Available: https://jsfiddle.net/opencpu/5Rqcm/. [Accessed: 10- Oct- 2019].
[2] Y. Holtz, "Data manipulation in d3.js", D3-graph-gallery.com, 2019. [Online]. Available: https://www.d3-graph-gallery.com/graph/basic_datamanipulation.html. [Accessed: 10- Oct- 2019].
[3] "d3/d3-scale", GitHub, 2019. [Online]. Available: https://github.com/d3/d3-scale. [Accessed: 10- Oct- 2019].
[4] "Change objects opacity", Bl.ocks.org, 2019. [Online]. Available: https://bl.ocks.org/EfratVil/2bcc4bf35e28ae789de238926ee1ef05. [Accessed: 10- Oct- 2019].
[5] Y. Holtz, "Adding and using buttons in d3.js", D3-graph-gallery.com, 2019. [Online]. Available: https://www.d3-graph-gallery.com/graph/interactivity_button.html. [Accessed: 10- Oct- 2019].
[6] "WYanChao/RadViz", GitHub, 2019. [Online]. Available: https://github.com/WYanChao/RadViz/blob/master/src/RadViz.js. [Accessed: 10- Oct- 2019].
[7]"Heatmaps", Plot.ly, 2019. [Online]. Available: https://plot.ly/javascript/heatmaps/. [Accessed: 21- Nov- 2019].
[8]"Python Flask jQuery AJAX POST Tutorial", Code Handbook, 2019. [Online]. Available: https://codehandbook.org/python-flask-jquery-ajax-post/. [Accessed: 21- Nov- 2019].
[9]"Flask by Example using Pycharm", Medium, 2019. [Online]. Available: https://medium.com/@agustian42/flask-by-example-using-pycharm-f1610aa2e7e9. [Accessed: 21- Nov- 2019].
[10] used the same code for Radviz from Assignment 2
