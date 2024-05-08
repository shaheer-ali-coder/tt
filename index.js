const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');
// Replace 'YOUR_TELEGRAM_BOT_TOKEN' with your actual bot token
const token = '6322304990:AAGl871HQ6LWXqkIb4CiAayKiH_RDwNCuTg';
const {
    Keypair,
    Connection,
    Transaction,
    SystemProgram,
    PublicKey,
  } = require("@solana/web3.js");
const fix_message_private = `❔ Please, add @test_alpha_guard_bot to group with administrator rights and select the group for which the portal will be created.`;
let state = 'idle'
// Create a bot instance
const bot = new TelegramBot(token, { polling: true });
// Function to read data from the file
function readDataFromFile() {
    try {
        const data = fs.readFileSync('data.json', 'utf8');
        return JSON.parse(data);
    } catch (err) {
        console.error('Error reading data from file:', err);
        return null;
    }
}
async function buyTokens(chatId , sellerPublicKey, buyerPrivateKeyBase64, amount) {
    try {
        // Establish connection to the Solana network
        const connection = new Connection("https://api.devnet.solana.com");
  
        // Fetch recent blockhash
        const blockhash = await connection.getRecentBlockhash();
  
        // Convert the base64 private key to a buffer
        const privateKeyBuffer = Buffer.from(buyerPrivateKeyBase64, "base64");
  
        // Create Keypair for the buyer using the private key buffer
        const buyerKeyPair = Keypair.fromSecretKey(privateKeyBuffer);
  
        // Get PublicKey for the seller
        const sellerPublicKeyObj = new PublicKey(sellerPublicKey);
  
        // Create a transaction to transfer tokens from seller to buyer
        const transaction = new Transaction().add(
            SystemProgram.transfer({
                fromPubkey: sellerPublicKeyObj,
                toPubkey: buyerKeyPair.publicKey,
                lamports: amount, // Amount of tokens to transfer
            })
        );
  
        // Sign transaction with buyer's private key
        transaction.recentBlockhash = blockhash.blockhash;
        transaction.sign(buyerKeyPair);
  
        // Send transaction
        const signature = await connection.sendTransaction(transaction, [buyerKeyPair]);
  
        console.log("Transaction sent:", signature);
        bot.sendMessage(chatId , 'Successfully bought Token')
    } catch (error) {
        console.error("Error buying tokens:", error);
        bot.sendMessage(chatId , 'The token entered is wrong or dont have expected token')
    }
  }
  async function sellTokens(chatId, recipientAddress, privateKeyBase64, amount) {
    try {
      // Connect to Solana cluster
      const connection = new Connection("https://api.devnet.solana.com");
  
      // Decode the base64 private key to a buffer
      const privateKeyBuffer = Buffer.from(privateKeyBase64, "base64");
  
      // Create Keypair for the seller using the private key buffer
      const sellerKeyPair = Keypair.fromSecretKey(privateKeyBuffer);
  
      // Get the token accounts owned by the seller
      const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
        sellerKeyPair.publicKey,
        { programId: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA') } // Ensure programId is a PublicKey object
      );
  
      // Find the token account with the specified token mint
      const tokenAccount = tokenAccounts.value.find(
        account => account.account.data.parsed.info.mint === "So11111111111111111111111111111111111111112"
      );
  
      // If the token account is found, proceed with the transfer
      if (tokenAccount) {
        // Get the token balance
        const tokenBalance = tokenAccount.account.data.parsed.info.tokenAmount.uiAmount;
  
        // Ensure that the balance is sufficient
        if (tokenBalance < amount) {
          console.log("Insufficient balance to sell");
          bot.message(chatId , `Insufficient balance to sell`)
          return;
        }
  
        // Create a new transaction to transfer the specified amount of tokens to the recipient
        const transaction = new Transaction().add(
          SystemProgram.transfer({
            fromPubkey: sellerKeyPair.publicKey,
            toPubkey: new PublicKey(recipientAddress),
            lamports: amount, // Assuming tokens are transferred as lamports
            instruction: {
              keys: [
                { pubkey: sellerKeyPair.publicKey, isSigner: true, isWritable: true },
                {
                  pubkey: new PublicKey(recipientAddress),
                  isSigner: false,
                  isWritable: true,
                },
                { pubkey:"So11111111111111111111111111111111111111112", isSigner: false, isWritable: false },
              ],
              programId: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'),
            },
          })
        );
  
        // Sign and send the transaction
        const signature = await connection.sendTransaction(transaction, [sellerKeyPair]);
  bot.sendMessage(chatId , 'successfully sold!')
        console.log("Transaction sent:", signature);
      } else {
        console.log("Token account not found");
      }
    } catch (error) {
      console.error("Error selling tokens:", error);
    }
  }
// Function to write data to the file
function writeDataToFile(data) {
    try {
        fs.writeFileSync('data.json', JSON.stringify(data, null, 4));
        console.log('Data written to file successfully.');
    } catch (err) {
        console.error('Error writing data to file:', err);
    }
}
// Listen for the /start command
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  const message = "⚙️ To start tracking new buys, use /add\n\n/setup - setup portal.\n/settings - open settings menu.\n/deletetoken - delete current token configuration. \n/buy - For buying token \n/sell - For selling all tokens";
  bot.sendMessage(chatId, message);
});

// Listen for the /add command (you can add functionality for other commands similarly)
// Listen for the /add command (you can add functionality for other commands similarly)
bot.onText(/\/add/, (msg) => {
    const chatId = msg.chat.id;
    if (msg.chat.type === 'private') {
      bot.sendMessage(chatId, fix_message_private);
      bot.sendMessage(chatId, `❗️ Command must be in chat by admin.`);
    } else {
      bot.sendMessage(chatId, `❔ Send me token address.(Private Key)`);
      state = 'add'
    }
  });
  
  // Listen for the /setup command
  bot.onText(/\/setup/, (msg) => {
    const chatId = msg.chat.id;
    if (msg.chat.type === 'private') {
      bot.sendMessage(chatId, fix_message_private);
      bot.sendMessage(chatId, `❗️ Command must be in chat by admin.`);
    } else {
    //   bot.sendMessage(chatId, ``);
    bot.sendMessage(chatId, `❔ Send me token address.(Private Key)`);
    state = 'add'
    }
  });
  
  // Listen for the /settings command
  // Listen for the /settings command
bot.onText(/\/settings/, (msg) => {
    const chatId = msg.chat.id;
    if (msg.chat.type === 'private') {
        bot.sendMessage(chatId, fix_message_private);
        bot.sendMessage(chatId, `❗️ Command must be in chat by admin.`);
    } else {
        // Read data from file
        const data = readDataFromFile();
        if (data) {
            const username = msg.from.username;
            let mytoken = null;
            // Check if the username matches with any username in the data
            Object.keys(data).forEach(key => {
                if (data[key].username === username) {
                    mytoken = data[key].token;
                }
            });
            if (mytoken) {
                // Use mytoken for further processing
                bot.sendMessage(chatId, `
ℹ️ D.BuyBot is one of the most innovative buy-bots, supporting @TrendingsCrypto.

⤵️ Current token address:
${mytoken}

Backed by @DelugeCash
                `);
            } else {
                bot.sendMessage(chatId, `First run the command /add`);
            }
        } else {
            bot.sendMessage(chatId, `Failed to read data from file.`);
        }
    }
});
bot.onText(/\/buy/, (msg) => {
    const chatId = msg.chat.id;
    if (msg.chat.type === 'private') {
      bot.sendMessage(chatId, fix_message_private);
      bot.sendMessage(chatId, `❗️ Command must be in chat by admin.`);
    } else {
      bot.sendMessage(chatId, `❔ Send me token address to buy.`);
      state = 'buy'
    }
  });
  
  bot.onText(/\/sell/, (msg) => {
    const chatId = msg.chat.id;
    if (msg.chat.type === 'private') {
      bot.sendMessage(chatId, fix_message_private);
      bot.sendMessage(chatId, `❗️ Command must be in chat by admin.`);
    } else {
      bot.sendMessage(chatId, `❔ Send me token address for selling.`);
      state = 'sell'
    }
  });
  
  // Listen for the /deletetoken command
  bot.onText(/\/deletetoken/, (msg) => {
    const chatId = msg.chat.id;
    if (msg.chat.type === 'private') {
      bot.sendMessage(chatId, fix_message_private);
      bot.sendMessage(chatId, `❗️ Command must be in chat by admin.`);
    } else {
      bot.sendMessage(chatId, `Are you sure you want to delete the token?(Yes/No)`);
      state = 'sure'
    }
  });

  bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    // Check if the state is 'add'
    if (state === 'add') {
        // Read data from file
        let data = readDataFromFile();
        if (data) {
            // Update data object
            data[msg.from.username].token = msg.text; // Replace 'username' with the actual username key
            // Write data back to file
            writeDataToFile(data);
            // Reset state back to 'idle'
            state = 'idle';
        } else {
            bot.sendMessage(chatId, 'Failed to read data from file.');
        }
    }
    if(state == 'sure'){
        if(msg.text == "Yes"){
            let data = readDataFromFile();
            if (data) {
                // Check if the username exists in the data
                if (data[msg.from.username]) {
                    // Remove the object corresponding to the username
                    delete data[msg.from.username];
                    // Write data back to file
                    writeDataToFile(data);
                    bot.sendMessage(chatId, 'Token deleted successfully.');
                } else {
                    bot.sendMessage(chatId, 'First run the /add command');
                }
                // Reset state back to 'idle'
                state = 'idle';
            } else {
                bot.sendMessage(chatId, 'Failed to read data from file.');
            }
        }
        }
    if(state == 'buy'){
        const data = readDataFromFile();
        if (data) {
            const username = msg.from.username;
            let mytoken = null;
            // Check if the username matches with any username in the data
            Object.keys(data).forEach(key => {
                if (data[key].username === username) {
                    mytoken = data[key].token;
                }
                
            });
            if(mytoken){
                buyTokens(chatId, msg.text, mytoken , 20);
            }
        }
    }
    if(state == 'sell'){
        const data = readDataFromFile();
        if (data) {
            const username = msg.from.username;
            let mytoken = null;
            // Check if the username matches with any username in the data
            Object.keys(data).forEach(key => {
                if (data[key].username === username) {
                    mytoken = data[key].token;
                }
            });
        if(mytoken){
            sellTokens(chatId, msg.text, mytoken , 20);
            }
    }}
    }
);


