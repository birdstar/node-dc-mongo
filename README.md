# node-dc-mongo
<h2>Source code for the project demonstrating data visualization using d3.js, dc.js, node.js and mongodb<h2><br/>

For the full post please visit: <br/>
<h2>https://anmolkoul.wordpress.com/2015/06/05/interactive-data-visualization-using-d3-js-dc-js-nodejs-and-mongodb</h2>

Required Components:<br/>
D3.js<br/>
Dc.js<br/>
Node.js<br/>
Crossfilter.js<br/>
Jquery<br/>
MongoDB<br/>

Steps for successful execution:<br/>
1. Install MongoDB <br/>
2.Insert the data into mongoDB as given in the blog<br/>
3.Install Nodejs and NPM<br/>
4. Navigate to the node-dc-mongo directory using command prompt and run npm install, this will install the dependencies<br/>
5. Navigate to the node-dc-mongo directory using command prompt and run npm start<br/>
6. In your browser go to localhost:8080/index.html<br/>


Run with docker:
1. Build: docker build -t bd_web:v1 .
2. docker run --name mongo_prod  -d -p 27017:27017 mongo
3. docker run -e NODE_ENV=staging -e MONGO_NAME=mongo_prod --name bd-web --link mongo_prod:mongo_prod -p 8777:8777  -d  bd_web:v1
