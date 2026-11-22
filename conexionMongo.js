
require("dotenv").config();

const mongoose = require("mongoose");

async function conectarMongo() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("MongoDB conectado a:", mongoose.connection.name);
}

module.exports = conectarMongo;

if (require.main === module) {
  conectarMongo()
    .then(() => mongoose.disconnect())
    .catch((error) => {
      console.error("Error de conexión:", error.message);
      process.exitCode = 1;
    });
}
