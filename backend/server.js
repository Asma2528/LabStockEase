require("dotenv").config({ //using this syntax as we dont want to keep a name of it, to make it default

}) 

const {PUBLIC_DATA} = require("./constant");
const app = require("./src/app");
const { ConnectDB } = require("./src/config/db.config");

// Connect to DB
ConnectDB().then(() => {
    // ✅ Load the cron job after DB connection
    require("./cron/equipmentMaintenanceNotifier");

    // Start the server
    app.listen(PUBLIC_DATA.port, '0.0.0.0', () => {
        console.log(`🚀 Server listening at http://localhost:${PUBLIC_DATA.port}`);
    });
}).catch((err) => {
    console.error("❌ Failed to connect to DB:", err);
});