FROM node

WORKDIR /app

# shared folder .json copy  
COPY package*.json ./
RUN npm install

#  .json copy from agent folder
COPY ./services/agent/package*.json ./services/agent/
RUN cd services/agent && npm install

# all file copy from agent 
COPY ./services/agent ./services/agent
# all file copy from shared folder
COPY /shared ./shared

WORKDIR /app/services/agent


EXPOSE 8003

CMD [ "npm", "start" ]

