FROM node:boron

# Install global pm2
RUN npm install pm2 -g --registry=https://registry.npm.taobao.org


# Create app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Install app dependencies
COPY package.json /usr/src/app/
RUN npm install --registry=https://registry.npm.taobao.org


# Bundle app source
COPY . /usr/src/app

ENV NODE_ENV dev

RUN ["chmod", "+x", "/usr/src/app/docker_start.sh"]
CMD /bin/bash /usr/src/app/docker_start.sh $NODE_ENV

EXPOSE 8777

# Build image
# docker build -t bd_web:v1 .

# Run docker

# docker run --name mongo_prod  -d -p 27017:27017 mongo
# docker run -e NODE_ENV=staging -e MONGO_NAME=mongo_prod --name bd-web --link mongo_prod:mongo_prod -p 8777:8777  -d  bd_web:v1