FROM node:boron

# Create app directory

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
# Bundle app source
COPY . /usr/src/app
RUN npm install --production

EXPOSE 3000
CMD [ "npm", "start" ]