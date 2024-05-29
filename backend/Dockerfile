FROM node:20-bullseye
WORKDIR /backend

# Install mongocryptd on the host machine.
RUN apt-get update && apt-get install -y curl
RUN curl -fsSL https://pgp.mongodb.com/server-6.0.asc | \
   gpg -o /usr/share/keyrings/mongodb-server-6.0.gpg \
   --dearmor
RUN echo "deb [ signed-by=/usr/share/keyrings/mongodb-server-6.0.gpg ] https://repo.mongodb.com/apt/debian bullseye/mongodb-enterprise/6.0 main" | tee /etc/apt/sources.list.d/mongodb-enterprise.list
RUN apt-get update && apt-get install -y mongodb-enterprise-cryptd

COPY . ./
RUN npm ci
RUN npm run build

CMD ["npm", "start"]
