const { sql, poolPromise } = require('./services/db');

async function testConnection() {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query('SELECT GETDATE() AS CurrentDateTime');
        console.log('Conexão bem-sucedida! Resultado:', result.recordset[0]);
    } catch (error) {
        console.error('Erro ao testar a conexão:', error.message);
    }
}

testConnection();
