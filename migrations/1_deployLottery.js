const Lottery = artifacts.require("Lottery");

module.exports = function(deployer, network, accounts) {
    deployer.then(async () => {
      console.log("Deploying Lottery contract");
      await deployer.deploy(Lottery);
      console.log("Lottery deployed at:", Lottery.address);
    }).catch(error => {
      console.error("Error in deployment:", error);
    });
  }