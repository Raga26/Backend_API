const mongoose = require('mongoose')

const connectDB = async () => {

    try {
        const conn = await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,  // Corrected typo in 'Topology'
        });

        console.log(`MongoDB connected: ${process.env.MONGO_URI}`, conn.connection.host);
    } catch (error) {
        console.error("Error connecting to MongoDB:", error.message);
    }
}

module.exports = connectDB