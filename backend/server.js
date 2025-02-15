import Fastify from 'fastify';
import { createAuthenticatedClient, isFinalizedGrant } from '@interledger/open-payments';

const fastify = Fastify({ logger: true });

const CLIENT_WALLET = "https://ilp.interledger-test.dev/1b62a0b8"
const WALLET_PRIVATE_KEY = "private.key";
const WALLET_KEY_ID = "cec09679-1abd-4075-8bfb-198e98ca78bd";

fastify.post('/initiate-payment', async (request, reply) => {
  const { senderWallet, receiverWallet, amount } = request.body;

  console.log("Initiating payment between sender and receiver wallet addresses", { senderWallet, receiverWallet, amount });
  
  try {
    const client = await createAuthenticatedClient({
      walletAddressUrl: CLIENT_WALLET,
      privateKey: WALLET_PRIVATE_KEY,
      keyId: WALLET_KEY_ID,
    });

    const sendingWalletAddress = await client.walletAddress.get({ url: senderWallet });
    const receivingWalletAddress = await client.walletAddress.get({ url: receiverWallet });

    console.log(
      "Got wallet addresses. We will set up a payment between the sending and the receiving wallet address",
      { receivingWalletAddress, sendingWalletAddress }
    );

    // Step 1: Grant incoming payment
    const incomingPaymentGrant = await client.grant.request({ url: receivingWalletAddress.authServer }, {
      access_token: {
        access: [{ type: "incoming-payment", actions: ["read", "complete", "create"] }]
      }
    });

    console.log(
      "\nStep 1: got incoming payment grant for receiving wallet address",
      incomingPaymentGrant
    );
  
    // Step 2: Create incoming payment
    const incomingPayment = await client.incomingPayment.create({
      url: receivingWalletAddress.resourceServer,
      accessToken: incomingPaymentGrant.access_token.value,
    }, {
      walletAddress: receivingWalletAddress.id,
      incomingAmount: { assetCode: receivingWalletAddress.assetCode, assetScale: receivingWalletAddress.assetScale, value: String(amount) }
    });

    console.log(
      "\nStep 2: created incoming payment on receiving wallet address",
      incomingPayment
    );

    // Step 3: Grant and create quote for sending wallet
    const quoteGrant = await client.grant.request({ url: sendingWalletAddress.authServer }, {
      access_token: {
        access: [{ type: "quote", actions: ["create", "read"] }]
      }
    });

    console.log(
      "\nStep 3: got quote grant on sending wallet address",
      quoteGrant
    );

    const quote = await client.quote.create({
      url: sendingWalletAddress.resourceServer,
      accessToken: quoteGrant.access_token.value,
    }, {
      walletAddress: sendingWalletAddress.id,
      receiver: incomingPayment.id,
      method: "ilp",
    });

    console.log("\nStep 4: got quote on sending wallet address", quote);

    // Step 4: Grant outgoing payment (user interaction required)
    const outgoingPaymentGrant = await client.grant.request({ url: sendingWalletAddress.authServer }, {
      access_token: {
        access: [{
          type: "outgoing-payment", actions: ["read", "create"],
          limits: { debitAmount: { assetCode: quote.debitAmount.assetCode, assetScale: quote.debitAmount.assetScale, value: quote.debitAmount.value } },
          identifier: sendingWalletAddress.id,
        }]
      },
      interact: { start: ["redirect"] }
    });

    /* 
    
    Required paramns to be sent to the client:
    - outgoingPaymentGrantContinueUri- The URL to continue the grant
    - outgoingPaymentGrantAccessToken- The access token to continue the grant
    
    */
    reply.send({ message: "Approve the payment using the following link", redirectUrl: outgoingPaymentGrant.interact.redirect, grantContinueUri: outgoingPaymentGrant.continue.uri, grantAccessToken: outgoingPaymentGrant.continue.access_token.value, quoteId: quote.id });
  } catch (error) {
    console.error("Error:", error);
    reply.status(500).send({ error: "Payment initiation failed", details: error.message });
  }
});

fastify.post('/finalize-payment', async (request, reply) => {
  const { grantContinueUri, grantAccessToken, senderWallet, quoteId } = request.body ;

  try {
    const client = await createAuthenticatedClient({
      walletAddressUrl: CLIENT_WALLET,
      privateKey: WALLET_PRIVATE_KEY,
      keyId: WALLET_KEY_ID,
    });

    const sendingWalletAddress = await client.walletAddress.get({ url: senderWallet });

    const finalizedGrant = await client.grant.continue({ url: grantContinueUri, accessToken: grantAccessToken });
    if (!isFinalizedGrant(finalizedGrant)) {
      return reply.status(400).send({ error: "Grant was not finalized" });
    }

    const outgoingPayment = await client.outgoingPayment.create({
      url: sendingWalletAddress.resourceServer,
      accessToken: finalizedGrant.access_token.value,
    }, {
      walletAddress: sendingWalletAddress.id,
      quoteId,
    });

    reply.send({ message: "Payment successful", paymentDetails: outgoingPayment });
  } catch (error) {
    console.error("Error:", error);
    reply.status(500).send({ error: "Payment finalization failed", details: error.message });
  }
});

fastify.listen({ port: 3000 }, (err, address) => {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
  console.log(`Server running at ${address}`);
});
