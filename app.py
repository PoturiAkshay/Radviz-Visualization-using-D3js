#importing all the required libraries
from collections import OrderedDict
from flask import Flask, render_template, request, jsonify
import pandas as pd
import json
from sklearn.cluster import KMeans

app = Flask(__name__)

@app.route('/')
def hello_world():
    return render_template('Radviz.html')


#function called on submission of the form in HTML
@app.route('/file', methods=['GET', 'POST'])
def get_file():
    #getting the filename and clustering option from HTML
    filename = request.form.get('file')
    is_checked = request.form.get('cluster_option')
    df = pd.read_csv(filename)
    new_df = df
    class_selected = ""

    #If the file selected is Assignment1_processed.csv, retrieving the class selected
    if filename == "Assignment1_processed.csv":
        new_df = df.select_dtypes(include=['int', 'float64'])
        class_selected = request.form.get('class_selector')
        new_df["Class"] = df[class_selected]
    #If the clustering option is selected by the user, clustering is being performed on the data
    if request.form.get('cluster_option') == "on":
        #setting the default value for 4 clusters
        num_clusters = 4
        user_input_k = request.form.get('clusters')
        #fetching the user provided number of clusters
        if user_input_k != "":
            num_clusters = int(user_input_k)
        if filename == "Assignment1_processed.csv":
            ndf = df.select_dtypes(include=['int', 'float64'])
        else:
            ndf = df.iloc[:, :-1]
        #Kmeans clustering is being performed
        km = KMeans(n_clusters=num_clusters)
        km.fit(ndf)
        clusters = km.labels_.tolist()
        new_df = ndf.copy()
        new_df['cluster_id'] = clusters
        new_df['cluster_id'] = 'Cluster ' + new_df['cluster_id'].astype(str)
    correlation_matrix_dict = {}
    col_name = new_df.columns[-1];
    #fetching all the unique values in the class or cluster column in current dataset
    unique_labels = new_df[col_name].unique()

    #creating the correlation matrices for every label data and storing them in dictionary
    for label in unique_labels:
        temp_df = new_df[new_df[col_name] == label]
        correlation = (temp_df.corr()).to_numpy()
        arr = pd.DataFrame(correlation).to_json(orient='split')
        correlation_matrix_dict[str(label)] = json.loads(arr)["data"]
    columns = list(new_df.columns)
    new_df = new_df.to_json(orient='records')
    new_df = json.dumps(json.loads(new_df, object_pairs_hook=OrderedDict))
    #Passing filename, data, column names, and correlation matrices of current data to HTML
    return render_template('Radviz.html', obj=new_df, col=json.dumps(columns), file_selected=filename,
                           is_checked=is_checked,
                           class_selected=class_selected, correlation_matrix_dict=json.dumps(correlation_matrix_dict))


#function to be called using the ajax call from javascript for clustering option checkbox
@app.route('/GetClusteredData/<clusters>/<ischecked>/<filename>', methods=['GET', 'POST'])
def get_clustered_data(clusters, ischecked, filename):
    output = []
    df = pd.read_csv(filename)
    new_df = df
    #clustering is being performed if the cluster option is checked
    if ischecked == "true":
        num_clusters = int(clusters)
        if filename == "Assignment1_processed.csv":
            ndf = df.select_dtypes(include=['int', 'float64'])
        else:
            ndf = df.iloc[:, :-1]
        km = KMeans(n_clusters=num_clusters)
        km.fit(ndf)
        clusters = km.labels_.tolist()
        new_df = ndf.copy()
        new_df['cluster_id'] = clusters
        new_df['cluster_id'] = 'Cluster ' + new_df['cluster_id'].astype(str)
    columns = list(new_df.columns)
    correlation_matrix_dict = {}
    col_name = new_df.columns[-1];
    unique_labels = new_df[col_name].unique()
    #storing all the correlation matrices of all labels in a dictionary
    for label in unique_labels:
        temp_df = new_df[new_df[col_name] == label]
        correlation = (temp_df.corr()).to_numpy()
        correlation_matrix_dict[str(label)] = pd.DataFrame(correlation).to_json(orient='split')
    new_df = new_df.to_json(orient='records')
    new_df = json.dumps(json.loads(new_df, object_pairs_hook=OrderedDict))
    #storing the dataframe, column names, filename and correlation matrices in array and sending as response to javascript
    output.append(new_df)
    output.append(json.dumps(columns))
    output.append(filename)
    output.append(correlation_matrix_dict)
    return jsonify(output)
