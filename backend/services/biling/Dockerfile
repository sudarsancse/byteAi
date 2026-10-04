FROM node

WORKDIR /app

# shared folder .json copy 
COPY package*.json ./
RUN npm install

#  .json copy from biling folder
COPY ./services/biling/package*.json ./services/biling/
RUN cd ./services/biling && npm install

COPY ./shared ./shared
# all file copy from biling 
COPY ./services/biling ./services/biling

WORKDIR /app/services/biling

EXPOSE 8004

CMD [ "npm", "start" ]