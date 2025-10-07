FROM node:20-alpine

WORKDIR /app

# Copia apenas os arquivos de dependências primeiro
COPY package*.json ./
RUN npm install --only=production

# Copia o restante do código
COPY . .

EXPOSE 5000
CMD ["npm", "start"]


