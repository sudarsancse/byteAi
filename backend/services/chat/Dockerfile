FROM node

WORKDIR /app

# shared folder .json copy  
COPY package*.json ./
RUN npm install


#  .json copy from chat folder
COPY ./services/chat/package*.json ./services/chat/
RUN cd ./services/chat && npm install

# all file copy from shared folder
COPY ./shared ./shared
# all file copy from chat
COPY ./services/chat ./services/chat

WORKDIR /app/services/chat

EXPOSE 8002

CMD [ "npm", "start" ]