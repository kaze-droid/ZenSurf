import axios from 'axios';
import readline from 'readline/promises';

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

async function testPaymentAPI(senderWallet, receiverWallet) {
    try {
        console.log("Initiating payment...");
        const initiateResponse = await axios.post('http://localhost:3000/initiate-payment', {
            senderWallet, 
            receiverWallet,
            amount: 100,
        });

        console.log("Redirect to this URL to approve the payment:", initiateResponse.data.redirectUrl);

        const answer = await rl.question("Are you done? (yes/no): ");
        if (answer.toLowerCase() !== 'yes') {
            console.log("Please complete the approval first.");
            process.exit();
        }

        console.log("Finalizing payment...");
        const finalizeResponse = await axios.post('http://localhost:3000/finalize-payment', {
            grantContinueUri: initiateResponse.data.grantContinueUri,
            grantAccessToken: initiateResponse.data.grantAccessToken,
            senderWallet,
            quoteId: initiateResponse.data.quoteId,
        });

        console.log("Payment Finalized:", finalizeResponse.data);
    } catch (error) {
        console.error("Error:", error.response ? error.response.data : error.message);
    } finally {
        rl.close();
    }
}


async function testPaymentAPITwice(senderWallet, receiverWallet) {
    try {
        console.log("Initiating payment...");
        const initiateResponse = await axios.post('http://localhost:3000/initiate-payment', {
            senderWallet, 
            receiverWallet,
            amount: 100,
        });

        console.log("Redirect to this URL to approve the payment:", initiateResponse.data.redirectUrl);

        const answer = await rl.question("Are you done? (yes/no): ");
        if (answer.toLowerCase() !== 'yes') {
            console.log("Please complete the approval first.");
            process.exit();
        }

        console.log("Finalizing payment...");
        const finalizeResponse = await axios.post('http://localhost:3000/double-payment', {
            grantContinueUri: initiateResponse.data.grantContinueUri,
            grantAccessToken: initiateResponse.data.grantAccessToken,
            senderWallet,
            receiverWallet,
            max_amount: 100
        });

        console.log("Payment Finalized:", finalizeResponse.data);
    } catch (error) {
        console.error("Error:", error.response ? error.response.data : error.message);
    } finally {
        rl.close();
    }
}

async function testPaymentAPISplits(senderWallet, receiverWallet) {
    try {
        console.log("Initiating payment...");
        const initiateResponse = await axios.post('http://localhost:3000/initiate-payment', {
            senderWallet,
            receiverWallet,
            amount: 1000
        });

        console.log("Redirect to this URL to approve the payment:", initiateResponse.data.redirectUrl);

        const answer = await rl.question("Are you done? (yes/no): ");
        if (answer.toLowerCase() !== 'yes') {
            console.log("Please complete the approval first.");
            process.exit();
        }   

        const finalizeResponse = await axios.post('http://localhost:3000/split-payment', {
            grantContinueUri: initiateResponse.data.grantContinueUri,
            grantAccessToken: initiateResponse.data.grantAccessToken,
            senderWallet,
            receiverWallet:"https://ilp.interledger-test.dev/c163a9e7",
            max_amount: 1000,
            splits: 5
        });

        console.log("Payment Finalized:", finalizeResponse.data);
    } catch (error) {
        console.error("Error:", error.response ? error.response.data : error.message);
    } finally {
        rl.close();
    }
}

const senderWallet = "https://ilp.interledger-test.dev/c163a9e7";
const receiverWallet = "https://ilp.interledger-test.dev/1b62a0b8";

// testPaymentAPI(senderWallet, receiverWallet);
// testPaymentAPITwice(senderWallet, receiverWallet);
testPaymentAPISplits(senderWallet, receiverWallet);