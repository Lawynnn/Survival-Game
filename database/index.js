const mongoose = require("mongoose");

mongoose.connect(`mongodb+srv://lawyn:Papameu123!@cluster0.px8nd.mongodb.net/?retryWrites=true&w=majority`, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    dbName: "DiscordPrompt",
}).then(c => {
    console.log("Connected to the database", c.connection.name);
}).catch(e => console.error("Database error: ", e));

module.exports = mongoose;