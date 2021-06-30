import flask
from flask import request, jsonify
import numpy as np
from sklearn.linear_model import LinearRegression
from sklearn.svm import SVR
from sklearn.model_selection import train_test_split
import pandas as pd
import datetime
import json
from flask_cors import CORS
import os

app = flask.Flask(__name__)
CORS(app)
# app.config["DEBUG"] = True

# getUrl = os.environ.get("PREDICTION_URL")
# if getUrl is not None:
# 	URL = getUrl
# else:
# 	URL = "0.0.0.0"

# URL = "34.67.47.144"
URL = "0.0.0.0"

def available_stocks(stock):
        available_stocks = ['VTI','AAPL','WMT','V','MSFT','DIS','NFLX','NVDA','TWTR','ORCL','BABA','FB', 'GOOG']
        if stock not in available_stocks:
                return "No stock found:"+stock+"\n"
        else:
                return stock+".csv"

def prediction(file_to_predict):
	# Get the stock data
	df = pd.read_csv(file_to_predict)
	# Take a look at the data
	#print(df.head())

	# Get the Adjusted Close Price 
	df = df[['Adj Close']] 
	# Take a look at the new data 
	#print(df.head())

	# A variable for predicting 'n' days out into the future
	forecast_out = 30 #'n=30' days
	#Create another column (the target ) shifted 'n' units up
	df['Prediction'] = df[['Adj Close']].shift(-forecast_out)
	#print the new data set
	#print(df.tail())

	### Create the independent data set (X)  #######
	# Convert the dataframe to a numpy array
	X = np.array(df.drop(['Prediction'],1))

	#Remove the last '30' rows
	X = X[:-forecast_out]
	#print(X)

	### Create the dependent data set (y)  #####
	# Convert the dataframe to a numpy array 
	y = np.array(df['Prediction'])
	# Get all of the y values except the last '30' rows
	y = y[:-forecast_out]
	#print(y)


	# Split the data into 80% training and 20% testing
	x_train, x_test, y_train, y_test = train_test_split(X, y, test_size=0.2)

	# Create and train the Support Vector Machine (Regressor) 
	svr_rbf = SVR(kernel='rbf', C=1e3, gamma=0.1) 
	svr_rbf.fit(x_train, y_train)


	# Testing Model: Score returns the coefficient of determination R^2 of the prediction. 
	# The best possible score is 1.0
	#svm_confidence = svr_rbf.score(x_test, y_test)
	#print("svm confidence: ", svm_confidence)


	# Create and train the Linear Regression  Model
	#lr = LinearRegression()
	# Train the model
	#lr.fit(x_train, y_train)

	# The best possible score is 1.0
	#lr_confidence = lr.score(x_test, y_test)
	#print("lr confidence: ", lr_confidence)

	# Set x_forecast equal to the last 30 rows of the original data set from Adj. Close column
	x_forecast = np.array(df.drop(['Prediction'],1))[-forecast_out:]
	#print(x_forecast)

	# Print linear regression model predictions for the next '30' days
	#lr_prediction = lr.predict(x_forecast)
	#print(lr_prediction)
	# Print support vector regressor model predictions for the next '30' days
	svm_prediction = svr_rbf.predict(x_forecast)
	return svm_prediction

def pjson(stock,prediction):
	res = {"_id":stock}
	i = 1
	for j in range(len(prediction)):
		NextDay_Date = datetime.datetime.today() + datetime.timedelta(days=i)
		NextDay_Date_Formatted = NextDay_Date.strftime ('%Y-%m-%d')
		if NextDay_Date.weekday() == 5:
			i +=2
		else: 
			res[NextDay_Date_Formatted] = str(prediction[j])
			i +=1
	return res


@app.route('/', methods=['GET'])
def home():
    return '''<h1>Prediction Service</h1>
<p>Please visit - /predict?id=<stock_symbol></p>'''

@app.route('/predict',methods=['GET'])
def predict_stocks():
	if 'id' in request.args:
		id = request.args['id']
		file_to_predict = available_stocks(id)
		if file_to_predict:
			predicted = prediction(file_to_predict)
			return jsonify(pjson(id,predicted))
		else:
			return file_to_predict
	else:
		return "Error: No id field provided. Please specify an id."
		
	

app.run(host=URL, port=5050) 
