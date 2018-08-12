FROM node:boron-wheezy
LABEL maintainer="gabriele.decapoa@gmail.com"

# Update libraries with security exposure
RUN apt-get clean && apt-get update -qqy \
  && apt-get upgrade -y openssl curl && apt-get clean \\
  && rm -rf /var/lib/apt/lists/*

# Create app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
# Bundle app source
COPY . /usr/src/app
RUN npm install --production

EXPOSE 3000
CMD [ "npm", "start" ]