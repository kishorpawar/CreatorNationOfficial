Moralis.initialize("rDecx1uN0CRZ8QWRxqjDeWEdc9P9ozhtp5xJjH5v"); // APP ID
Moralis.serverURL = "https://onln8a9c8sry.bigmoralis.com:2053/server";
var web3;
//  Create WalletConnect Provider
const provider = new WalletConnectProvider.default({
  infuraId: "e992178cee28442e86aa8c6611d7d472",
  rpc: {
    80001: "https://matic-mumbai.chainstacklabs.com"
  },
  
});

document.getElementById("btn-connect").addEventListener("click", connectWallet);

async function connectWallet(){
  //  Enable session (triggers QR Code modal)
  try{
    await provider.enable();
    console.log(provider);
    console.log("Connect Address:",provider.accounts[0])
    uploadEthAddress(provider.accounts[0])
    //  Create Web3 instance
    web3 = new Web3(provider);
    document.getElementById("connected").style.display="block";
    document.getElementById("prepare").style.display="none";
  }catch(err){
    console.log("Modal Closed");
  }

}

// Subscribe to accounts change
provider.on("accountsChanged", (accounts) => {
  console.log(accounts);
});

// Subscribe to chainId change
provider.on("chainChanged", (chainId) => {
  console.log(chainId);
});

// Subscribe to session disconnection
provider.on("disconnect", (code, reason) => {
  console.log(code, reason);
  document.getElementById("connected").style.display="none";
  document.getElementById("prepare").style.display="block";
});

document.getElementById("btn-disconnect").addEventListener("click", async()=>{
  try{
    await provider.disconnect()
    web3 = new Web3();
    document.getElementById("connected").style.display="none";
    document.getElementById("prepare").style.display="block";
  }catch(err){
  }
})

async function sign(){
  if(provider.connected){
    console.log("signing")
      console.log(web3)
      let accounts = await web3.eth.getAccounts()
      const signedMessage = await web3.eth.sign("hello",accounts[0]);
      console.log(signedMessage);
      // const result = await provider.connector.signMessage([accounts[0], "hello"]);
      // console.log(provider.connector)
      // console.log(result)
  }
}



async function uploadEthAddress(address){
  if(Moralis.User.current()){
    let user2 = Moralis.User.current().get("username");
    console.log(user2);
    try{
      const User = Moralis.Object.extend("User");
      const query = new Moralis.Query(User);
      query.equalTo("username", user2);
      const results = await query.find();
      let userDataObj = results[0]; 
      var userAddress = userDataObj.get("ethAddress")
      if(!userAddress){
        userDataObj.set("ethAddress", address);
        let result = await userDataObj.save();
        localStorage.setItem('userEthAddress', address);
        console.log("SuccessFully Set User Address", result);
      }else{
        console.log("Already Found Address: ",userAddress);
        if(userAddress!=address){
          alert("Registered Address and Wallet Connect Address Does not Match");
          provider.disconnect();
        }
        else {
          localStorage.setItem('userEthAddress', address);
        }
      }
    }catch(err){
      console.log(err)
    }
    
  }
  else{
    console.log("Not LogedIn")
  }
}


async function showConnect(){
  
  if(Moralis.User.current()){
    if(Moralis.User.current().get("authData")){
      document.getElementById("prepare").style.display="none";
    }else{
      await connectWallet();
    }
  }else{
    document.getElementById("prepare").style.display="none";
  }
}
    

await showConnect();
await sign();
