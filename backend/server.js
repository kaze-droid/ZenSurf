import Fastify from 'fastify';
import { createAuthenticatedClient, isFinalizedGrant } from '@interledger/open-payments';
import { createClient } from '@supabase/supabase-js'

const fastify = Fastify({ logger: true });

const CLIENT_WALLET = "https://ilp.interledger-test.dev/1b62a0b8"
const WALLET_PRIVATE_KEY = "private.key";
const WALLET_KEY_ID = "cec09679-1abd-4075-8bfb-198e98ca78bd";

const SUPABASE_URL = "https://zanrmopcruojbmouflkp.supabase.co"
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InphbnJtb3BjcnVvamJtb3VmbGtwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk1OTY2MzEsImV4cCI6MjA1NTE3MjYzMX0.6adZdSyZ18K1h6IHA_eytwEs3a4FQO4gNkMgWM1lWQg"
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

async function sendMoney(client, senderWalletAddress, receiverWalletAddress, amount, outgoingPaymentToken) {
    console.log(`Starting sendMoney with amount: ${amount}`);

    const incomingPaymentGrant = await client.grant.request({ url: receiverWalletAddress.authServer }, {
        access_token: {
            access: [{ type: "incoming-payment", actions: ["read", "complete", "create"] }]
        }
    });
    console.log("Received incoming payment grant");

    const incomingPayment = await client.incomingPayment.create({
        url: receiverWalletAddress.resourceServer,
        accessToken: incomingPaymentGrant.access_token.value,
    }, {
        walletAddress: receiverWalletAddress.id,
        incomingAmount: {
            assetCode: receiverWalletAddress.assetCode,
            assetScale: receiverWalletAddress.assetScale,
            value: String(amount)
        }
    });
    console.log("Created incoming payment:", { id: incomingPayment.id });

    const quoteGrant = await client.grant.request({ url: senderWalletAddress.authServer }, {
        access_token: {
            access: [{ type: "quote", actions: ["create", "read"] }]
        }
    });
    console.log("Received quote grant");

    const quote = await client.quote.create({
        url: senderWalletAddress.resourceServer,
        accessToken: quoteGrant.access_token.value,
    }, {
        walletAddress: senderWalletAddress.id,
        receiver: incomingPayment.id,
        method: "ilp",
    });
    console.log("Created quote:", { id: quote.id });

    if (!outgoingPaymentToken) {
        throw new Error("Missing outgoing payment token");
    }

    try {
        console.log({
            url: senderWalletAddress.resourceServer,
            accessToken: outgoingPaymentToken,
        }, {
            walletAddress: senderWalletAddress.id,
            quoteId: quote.id,
        })

        const outgoingPayment = await client.outgoingPayment.create({
            url: senderWalletAddress.resourceServer,
            accessToken: outgoingPaymentToken,
        }, {
            walletAddress: senderWalletAddress.id,
            quoteId: quote.id,
        });
        console.log("Created outgoing payment:", { id: outgoingPayment.id });
        return outgoingPayment;
    } catch (error) {
        console.error("Error creating outgoing payment:", error);
        throw error;
    }
}

// Used to display leaderboard based on their streak count
fastify.get("/leaderboard", async (request, reply) => {
    const { data, error } = await supabase
        .from("streak")
        .select()
        .order("streak_count", { ascending: false });

    if (error == null) { reply.send(data) } else { reply.status(500).send({ error: "Error in displaying leaderboard", details: error.message }); }
});

fastify.get("/get-streak/", async (request, reply) => {
    const wallet_id = request.query.wallet_id;
    const walletId = `https://ilp.interledger-test.dev/${wallet_id}`;

    if (!walletId) {
        return reply.status(400).send({
            error: "Missing wallet_id",
            details: "Please provide a wallet_id query parameter"
        });
    }

    try {
        // First verify the user exists
        const { data: userData, error: userError } = await supabase
            .from("users")
            .select("user_id", "wallet_id")
            .eq("wallet_id", walletId)
            .single();

        if (userError || !userData) {
            return reply.status(404).send({
                error: "User not found",
                details: "No user exists with the provided wallet ID"
            });
        }

        // Get the user's streak data
        const { data: streakData, error: streakError } = await supabase
            .from("streak")
            .select("streak_count")
            .eq("user_id", userData.user_id)
            .single();

        if (streakError) {
            return reply.status(500).send({
                error: "Error fetching streak data",
                details: streakError.message
            });
        }

        // If no streak record exists, return default values
        if (!streakData) {
            return reply.send({
                current_streak: 0,
                max_streak: 0,
                last_interaction_date: null
            });
        }

        return reply.send(streakData);
    } catch (err) {
        return reply.status(500).send({
            error: "Internal server error",
            details: err.message
        });
    }
});

// Used to create a new user in users table
fastify.post("/new-user", async (request, reply) => {
    const { wallet_id } = request.body;
    const { error } = await supabase
        .from('users')
        .insert({ wallet_id: wallet_id })
    if (error == null) { console.log("User creation successful") } else { reply.status(500).send({ error: "Error in creating new user", details: error.message }); }
})

// Used to create a new record in log table
fastify.post("/new-record", async (request, reply) => {
  // get user id from users table
  const { wallet_id, duration_commit, duration, commit_price, accessToken } = request.body;
  console.log("Request body:", request.body);
  // round duration_commit to int
  const roundedDurationCommit = Math.round(duration_commit);
  // round duration to int
  const roundedDuration = Math.round(duration);
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('user_id')
    .eq('wallet_id', wallet_id)
    .single();
  if (userError) {
    return reply.status(500).send({ error: "Error in getting user id", details: userError.message });
  }

  console.info("User data:", userData);

  // Get today's date in UTC and set time to start of day
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  // Check if record exists for today
  const { data: existingRecord, error: checkError } = await supabase
    .from('logs')
    .select('*')
    .eq('user_id', userData.user_id)
    .gte('date', today.toISOString())
    .lt('date', new Date(today.getTime() + 86400000).toISOString())
    .single();
  
  console.info("Existing record:", existingRecord);

  if (checkError && checkError.code !== 'PGRST116') { // PGRST116 means no rows returned
    return reply.status(500).send({ error: "Error checking existing record", details: checkError.message });
  }

  let result;
  if (existingRecord) {
    // Update existing record using userId and date
    result = await supabase
      .from('logs')
      .update({ 
        duration_commited: roundedDurationCommit, 
        duration: roundedDuration, 
        commit_price: commit_price,
        access_token: accessToken
      })
      .eq('user_id', userData.user_id)
      .gte('date', today.toISOString())
      .lt('date', new Date(today.getTime() + 86400000).toISOString());
  } else {
    // Insert new record
    result = await supabase
      .from('logs')
      .insert({ 
        user_id: userData.user_id, 
        duration_commited: roundedDurationCommit, 
        duration: roundedDuration, 
        commit_price: commit_price,
        access_token: accessToken
      });
  }

  console.info("Result:", result);

  if (result.error) {
    return reply.status(500).send({ 
      error: `Error ${existingRecord ? 'updating' : 'creating'} record`, 
      details: result.error.message 
    });
  }

  reply.send({ 
    message: `Record ${existingRecord ? 'updated' : 'created'} successfully`,
    isNewRecord: !existingRecord
  });
});

// Used to create a new streak in users table
fastify.put("/new-user-streak", async (request, reply) => {
    const { wallet_id, streak_count } = request.body;
    const int_streak_count = parseInt(streak_count);

    if (!wallet_id) {
        return reply.status(400).send({
            error: "Missing wallet_id",
            details: "Please provide a wallet_id in request body"
        });
    }

    try {
        // First verify the user exists and get their id
        const { data: userData, error: userError } = await supabase
            .from("users")
            .select("user_id, wallet_id")
            .eq("wallet_id", wallet_id)
            .single();

        if (userError || !userData) {
            return reply.status(404).send({
                error: "User not found",
                details: "No user exists with the provided wallet ID"
            });
        }

        // Upsert the streak count (update if exists, insert if doesn't exist)
        const { data: upsertData, error: upsertError } = await supabase
            .from('streak')
            .upsert(
                {
                    user_id: userData.user_id,
                    streak_count: int_streak_count
                },
                {
                    onConflict: 'user_id',  // specify the unique constraint
                    returning: 'minimal'     // or 'representation' if you want the full row back
                }
            )
            .select();

        if (upsertError) {
            return reply.status(500).send({
                error: "Error upserting streak",
                details: upsertError.message
            });
        }

        return reply.send({
            message: "Successfully upserted streak",
            updatedData: upsertData
        });
    } catch (err) {
        return reply.status(500).send({
            error: "Error in upserting user streak",
            details: err.message
        });
    }
});

// Used to update meet_commit value
fastify.put("/update-commit-value", async (request, reply) => {
    const { id } = request.body
    const { error } = await supabase
        .from('logs')
        .update({ fulfill_commit: false })
        .eq('user_id', id)
    if (error == null) { console.log("Update successful") } else { reply.status(500).send({ error: "Error in updating commit value", details: error.message }); }
})

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


fastify.post("/get-continue-uri", async (request, reply) => {
    const { grantAccessToken, grantContinueUri } = request.body;
    
    const client = await createAuthenticatedClient({
        walletAddressUrl: CLIENT_WALLET,
        privateKey: WALLET_PRIVATE_KEY,
        keyId: WALLET_KEY_ID,
    });

    const continueUri = await client.grant.continue({ url: grantContinueUri, accessToken: grantAccessToken });
    reply.send({ access_token: continueUri.access_token.value });
})

fastify.post('/split-payment', async (request, reply) => {
    const { grantContinueUri, grantAccessToken, senderWallet, receiverWallet, max_amount, splits } = request.body;
    const splitCount = parseInt(splits) || 2; // Default to 2 if not specified
    const amountPerSplit = Math.floor(max_amount / splitCount) - 10; // Use Math.floor to avoid floating point issues

    console.log(`Starting ${splitCount}-way split payment process with parameters:`,
        { senderWallet, receiverWallet, max_amount, amountPerSplit });

    try {
        const client = await createAuthenticatedClient({
            walletAddressUrl: CLIENT_WALLET,
            privateKey: WALLET_PRIVATE_KEY,
            keyId: WALLET_KEY_ID,
        });
        console.log("Successfully created authenticated client");

        // Continue grant only once at the beginning
        console.log("Continuing grant...");
        const outgoingPaymentGrant = await client.grant.continue({
            url: grantContinueUri,
            accessToken: grantAccessToken
        });

        if (!outgoingPaymentGrant?.access_token?.value) {
            throw new Error("Failed to get valid outgoing payment grant");
        }
        console.log("Received outgoing payment grant");

        const sendingWalletAddress = await client.walletAddress.get({ url: senderWallet });
        const receivingWalletAddress = await client.walletAddress.get({ url: receiverWallet });
        console.log("Retrieved wallet addresses:", {
            sender: sendingWalletAddress.id,
            receiver: receivingWalletAddress.id
        });

        const outgoingPayments = [];
        // Create all payments in sequence
        for (let i = 0; i < splitCount; i++) {
            console.log(`Processing payment ${i + 1} of ${splitCount}`);

            await new Promise(resolve => setTimeout(resolve, 1000));
            const outgoingPayment = await sendMoney(
                client,
                sendingWalletAddress,
                receivingWalletAddress,
                amountPerSplit,
                outgoingPaymentGrant.access_token.value
            );
            outgoingPayments.push({
                paymentNumber: i + 1,
                amount: amountPerSplit,
                paymentId: outgoingPayment.id
            });
        }

        console.log(`${splitCount}-way split payment process completed successfully`);
        reply.send({
            message: "Payments successful",
            totalAmount: max_amount,
            numberOfSplits: splitCount,
            amountPerSplit,
            payments: outgoingPayments
        });

    } catch (error) {
        console.error("Error in split-payment process:", error);
        console.error("Error occurred at:", error.stack);
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


function distributeRewards(rewards, merit) {
  // Sort the rewards array in descending order
  rewards.sort((a, b) => b - a);
  
  // Sort the merit array in descending order, while keeping track of original indices
  const meritWithIndices = merit.map((value, index) => ({ merit: value, index }));
  meritWithIndices.sort((a, b) => b.merit - a.merit);

  // Initialize the result object to store distributed rewards
  const result = {};

  // Distribute the rewards
  for (let i = 0; i < meritWithIndices.length; i++) {
      result[meritWithIndices[i].merit] = result[meritWithIndices[i].merit] || [];
      result[meritWithIndices[i].merit].push(rewards[i]);
  }

  return result;
}

fastify.get('/distribute-rewards', async (request, reply) => {
    // Get today's date in UTC and set time to start of day
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    // Start from users table and get all user_id and wallet_id
    const { data: users, error: usersError } = await supabase
        .from('users')
        .select('user_id, wallet_id');

    if (usersError) {
        return reply.status(500).send({ error: "Error in getting users", details: usersError.message });
    }

    // get streaks for each user
    const { data: streaks, error: streaksError } = await supabase
        .from('streak')
        .select('user_id, streak_count')
        .in('user_id', users.map(user => user.user_id));

    if (streaksError) {
        return reply.status(500).send({ error: "Error in getting streaks", details: streaksError.message });
    }

    // get logs for each user and check if they have a log for today
    const { data: logs, error: logsError } = await supabase
        .from('logs')
        .select('user_id, date, access_token')
        .in('user_id', users.map(user => user.user_id))
        .gte('date', today.toISOString())
        .lt('date', new Date(today.getTime() + 86400000).toISOString());  

    if (logsError) {
        return reply.status(500).send({ error: "Error in getting logs", details: logsError.message });
    }

    // create a list of users who have a log for today
    const activeUserIds = new Set(logs.map(log => log.user_id));
    
    // Combine all data for active users
    const activeUsersData = users
        .filter(user => activeUserIds.has(user.user_id))
        .map(user => {
            const streak = streaks.find(s => s.user_id === user.user_id);
            const log = logs.find(l => l.user_id === user.user_id);
            return {
                ...user,
                streak_count: streak?.streak_count || 0,
                access_token: log?.access_token
            };
        });

    console.log("Active users with data:", activeUsersData);
    
    return reply.send(activeUsersData);
});