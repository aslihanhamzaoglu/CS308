FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm install

COPY . .

# Vite needs to listen on all interfaces in a container
EXPOSE 8080
CMD ["npm", "run", "dev", "--", "--host"]
