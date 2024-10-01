import dotenv from 'dotenv';
import { connect } from './config/db'; 
import { init } from './config/init';

dotenv.config()

const pool = connect()
const app = init()

const PORT = 3000

app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
  });

export { pool };