FROM node:8
RUN mkdir -p /distribute-frontend/contracts
WORKDIR /distribute-frontend/contracts

COPY yarn.lock /distribute-frontend/contracts/
COPY package.json /distribute-frontend/contracts/
RUN npm install scrypt
RUN yarn

COPY . /distribute-frontend/contracts
EXPOSE 3002
CMD [ "yarn", "docker" ]
