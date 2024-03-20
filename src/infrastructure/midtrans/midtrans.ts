const midtransClient = require('midtrans-client');
import DotenvFlow from "dotenv-flow";
import path from "path";

DotenvFlow.config({ path: path.resolve(__dirname, `../../../`) })

export const midtransConfig = {
    isProduction: process.env.NODE_ENV === 'production',
    serverKey: process.env.MIDTRANS_SERVER_KEY,
    clientKey: process.env.MIDTRANS_CLIENT_KEY,
    // Add other necessary configurations here
};

// Create Snap API instance
const midtrans = new midtransClient.Snap(midtransConfig);

export default midtrans