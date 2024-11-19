const sql = require('mssql');

const config = {
    user: 'sa',
    password: '123',
    server: 'localhost', 
    database: 'SistemaPermissoes',
    options: {
        encrypt: true, 
        trustServerCertificate: true, 
    },
};

const poolPromise = new sql.ConnectionPool(config)
    .connect()
    .then((pool) => {
        console.log('Conectado ao SQL Server!');
        return pool;
    })
    .catch((err) => {
        console.error('Falha na conexão com o SQL Server:', err);
    });

module.exports = { sql, poolPromise };
