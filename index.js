const express = require("express");
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");
const PORT = 3000;
const http = require("http");
const Wallet = require("ethereumjs-wallet");
const Web3 = require("web3");
const server = http.createServer(app);
const {ethers,JsonRpcProvider , formatEther} = require("ethers");
const { EthHdWallet, generateMnemonic } = require("eth-hd-wallet");
const HttpProvider =
  "https://eth-mainnet.g.alchemy.com/v2/3iz35aSwwC5nbTT9SyTmJ0WM916nuv70";
app.use(bodyParser.json({ limit: "100mb", type: "application/json" }));
app.use(
  bodyParser.urlencoded({
    limit: "100mb",
    extended: true,
  })
);

// app.post('/import-wallet',async (req, res) => {
//     const privateKey = "06cfe268e737bda2e3fc4ef07603b6ff6b74ce7f9671b81dd43bccc5fb9f8a93";
//     var wallet = Wallet.fromPrivateKey(new Buffer(privateKey, "hex"));
//     console.log(wallet)
//     const web3 = new Web3(HttpProvider);
//     const address = `0x${wallet.getAddress().toString('hex')}`;

//     web3.eth.getBalance(address).then((balance) => {
//       res.json({ address, balance });
//     });
//   });

// app.post("/create-wallet", (req, res) => {
//   const wallet = EthHdWallet.fromMnemonic(generateMnemonic());
//   console.log(wallet instanceof EthHdWallet);
//   console.log(wallet.generateAddresses(1));
//   res.send({ wallet });
// });

app.post("/import-wallet",async (req, res) => {
  var privateKey = req.body.privateKey;
  privateKey = "0x".concat(privateKey);

    //"0x41f6b253b7965836e092e66fc89ffa623083f0b034c20985d92c4d29950d895d";
   if(privateKey){
    try{
    const wallet = new ethers.Wallet(privateKey);
    console.log("Address:", wallet.address);
    const rpcURL = new JsonRpcProvider("https://eth.llamarpc.com");
    //const provider = new ethers.Wallet(wallet.address, rpcURL);
    var balance = await rpcURL.getBalance(wallet.address);
    const result = {
      walletAddress : wallet.address,
      balance : formatEther(balance)
    }
    console.log(result)
    res.send(result);
  }
  catch(err){
    console.log(err)
    res.status(400).send("Private Key Not Correct")
  }
   }
   else{
    console.log(err)
    res.status(400).send("Please provide private key")
   }
});

app.post("/generate-wallet", (req, res) => {
  const wallet = ethers.Wallet.createRandom();
  console.log("Wallet Address:", wallet);
  console.log("Private key:", wallet.privateKey);
  console.log("Address:", wallet.address);
  console.log("Wallet Mnemmonic "+JSON.stringify(wallet.mnemonic.phrase));
  const result = {
    walletAddress : wallet.address,
    privateKey : wallet.privateKey,
    mnemonic : wallet.mnemonic.phrase,
  }
  res.status(200).send(result)
});

app.post("/network-wallet", async (req, res) => {
  const privateKey = "0x06cfe268e737bda2e3fc4ef07603b6ff6b74ce7f9671b81dd43bccc5fb9f8a93"
  const provider = new JsonRpcProvider("https://rpc.ankr.com/eth_goerli");
  const wallet = new ethers.Wallet(privateKey, provider);
  const balance = await provider.getBalance(wallet.address);
  console.log("balance "+balance)
  console.log("balance convert "+formatEther(balance))
  //console.log("Balance:", ethers.utils.format(balance));
  // console.log("Private key:", wallet.privateKey);
  // console.log("Address:", wallet.address);
  res.end()
});

app.post("/token-wallet", async (req, res) => {
  const privateKey = "0x06cfe268e737bda2e3fc4ef07603b6ff6b74ce7f9671b81dd43bccc5fb9f8a93"
  const provider = new JsonRpcProvider("https://eth.llamarpc.com");
  const wallet = new ethers.Wallet(privateKey, provider);
   // Define the contract ABI
   const abi = require("./contract.json")

  // Create a contract instance
  try {
    

  var contractAddress = "0xdAC17F958D2ee523a2206206994597C13D831ec7"
  const contract = new ethers.Contract(contractAddress, abi, provider);
  const name = await contract.name();
  const symbol = await contract.symbol();
  const decimals = await contract.decimals();
  const token =  {
    name: name,
    symbol: symbol,
    decimals: decimals
  };
  console.log("name "+name)
  console.log("symbol "+symbol)
  console.log("decimals "+decimals)
  //wallet.addtoken(token);
 
  console.log("Token imported:", token);
  const balance = await contract.balanceOf(wallet.address);
  console.log("Token balance:", balance.toString());
} catch (error) {
    console.log(error)
}
  //console.log("Balance:", ethers.utils.format(balance));
  // console.log("Private key:", wallet.privateKey);
  // console.log("Address:", wallet.address);
  res.end()
});

server.listen();
