const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger');

const app = express();
app.use(cors());
app.use(bodyParser.json());


const userRoutes = require('./routes/users');
const systemRoutes = require('./routes/systems');
const roleRoutes = require('./routes/roles');
const permissionRoutes = require('./routes/permissions');

app.use('/users', userRoutes);
app.use('/systems', systemRoutes);
app.use('/roles', roleRoutes);
app.use('/permissions', permissionRoutes);


app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
