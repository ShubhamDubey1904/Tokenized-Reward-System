const hre = require("hardhat");

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function main() {
  const Factory = await hre.ethers.getContractFactory("RewardToken");
  const c = await Factory.deploy();
  await c.waitForDeployment();

  const addr = await c.getAddress();
  const tx = c.deploymentTransaction();

  console.log("RewardToken:", addr);
  console.log("Deploy tx:", tx.hash);

  await tx.wait(3);
  await sleep(15000);

  await hre.run("verify:verify", {
    address: addr,
    constructorArguments: [],
    contract: "contracts/RewardToken.sol:RewardToken",
  });

  console.log("Verified");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
