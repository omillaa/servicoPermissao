const swaggerJSDoc = require('swagger-jsdoc');

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'API de Controle de Acesso',
    version: '1.0.0',
    description: 'API para gerenciar sistemas, permissões, papéis e usuários',
  },
  servers: [
    {
      url: 'http://localhost:3000',
      description: 'Servidor local',
    },
  ],
};

const options = {
  swaggerDefinition,
  apis: ['./routes/*.js'], 
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;
const swaggerAutogen = require('swagger-autogen')();

const doc = {
  info: {
    title: 'API de Controle de Acesso',
    description: 'Documentação da API gerada automaticamente',
  },
  host: 'localhost:3000',
  schemes: ['http'],
};

const outputFile = './docs/swagger-output.json'; 
const endpointsFiles = ['./app.js']; 

swaggerAutogen(outputFile, endpointsFiles).then(() => {
  console.log('Documentação gerada com sucesso!');
});
