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
// Function to validate Solana public key format
function isValidPublicKey(publicKey) {
  try {
      // Check if the provided public key is a valid PublicKey object
      new PublicKey(publicKey);
      return true;
  } catch (error) {
      // If an error occurs during parsing, the public key is invalid
      return false;
  }
}

async function buyTokens(chatId, sellerPublicKey, buyerPrivateKeyBase64, amount) {
  try {
    // Establish connection to the Solana network
    const connection = new Connection("https://api.devnet.solana.com");
    // Assuming you're using Node.js
    // Assuming you're using Node.js
const privateKeyBuffer = Buffer.from("sVXqOyRxrDhPXLYXs5iTTyL43r2tHtZs45Jf90DaWSg1bjLN3zmG2KE9FoRHJc8xTVIYZLwdrwjTszWFAZvDPg==", 'base64');

// Slice the buffer to 32 bytes
const trimmedPrivateKeyBuffer = privateKeyBuffer.slice(0, 32);

// Convert trimmed buffer to hexadecimal
const hexEncodedPrivateKey = trimmedPrivateKeyBuffer.toString('hex');

console.log("Private Key Hex:", hexEncodedPrivateKey);
console.log("Private Key Length:", hexEncodedPrivateKey.length);


    const buyerKeyPair = Keypair.fromSecretKey(privateKeyBuffer);
    console.log('buyer key pair : ____________________________________',buyerKeyPair)
    // Ensure that the seller public key is in the correct format
    if (isValidPublicKey(sellerPublicKey==false)) {
      bot.sendMessage(chatId, 'Invalid token address format. Please provide a valid Solana public key.');
      return;
    }

    // Get PublicKey for the seller
    const sellerPublicKeyObj = new PublicKey(sellerPublicKey);
    
    // Fetch recent blockhash
    const blockhash = await connection.getRecentBlockhash();

    // Create a transaction to transfer tokens from seller to buyer
    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: sellerPublicKeyObj,
        toPubkey: buyerKeyPair.secretKey,
        lamports: amount, // Amount of tokens to transfer
      })
    );

    // Sign transaction with buyer's private key
    transaction.recentBlockhash = blockhash.blockhash;
    transaction.sign(buyerKeyPair);

    // Send transaction
    const signature = await connection.sendTransaction(transaction, [buyerKeyPair]);

    console.log("Transaction sent:", signature);
    bot.sendMessage(chatId, 'Successfully bought Token');
  } catch (error) {
    console.error("Error buying tokens:", error);
    bot.sendMessage(chatId, 'The token entered is wrong or does not have the expected token');
  }
}



  async function sellTokens(chatId, recipientAddress, privateKeyBase64, amount) {
    try {
      // Connect to Solana cluster
      const connection = new Connection("https://api.devnet.solana.com");
      if (isValidPublicKey(recipientAddress) == false) {
        bot.sendMessage(chatId, 'Invalid token address format. Please provide a valid Solana public key.');
        return;
    } 
      // Decode the base64 private key to a buffer
      const privateKeyBuffer = Buffer.from(privateKeyBase64, "base-64");
  
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
        fs.writeFileSync('./data.json', JSON.stringify(data, null, 4));
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
          let found = false;
          
          // Check if the username matches with any username in the data
          // Check if the username matches with any username in the data
Object.keys(data).forEach(key => {
  console.log("Comparing usernames:", key, username); // Log the key (which is the username) being compared
  if (key === username) { // Compare the key (username) directly with the provided username
      found = true;
      const mytoken = data[key].token;
      // Send message with token address
      bot.sendMessage(chatId, `
ℹ️ D.BuyBot is one of the most innovative buy-bots, supporting @TrendingsCrypto.

⤵️ Current token address:
${mytoken}

Backed by @DelugeCash
      `);
  }
});

          if (!found) {
              bot.sendMessage(chatId, `First run the command /add`);
          }
      } else {
          bot.sendMessage(chatId, `Failed to read data from file.`);
      }
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
    // Check if the state is 'add'
if (state === 'add') {
  // Read data from file
  let data = readDataFromFile();
  if (data) {
      // Check if the username exists in the data, if not, initialize it
      if (!data[msg.from.username]) {
          data[msg.from.username] = {};
      }
      // Update data object with token
      data[msg.from.username].token = msg.text;
      // Write data back to file
      writeDataToFile(data);
      bot.sendMessage(chatId , 'Token added successfully')
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
                if (key === username) {
                    mytoken = data[key].token;
                }
                
            });
            if(mytoken){
              console.log('this is myToken :' , mytoken)
              console.log('the token to buy',msg.text)
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


