import { useEffect, useMemo, useRef, useState } from "react";
import {
  BrowserProvider,
  Contract,
  formatUnits,
  parseUnits,
  isAddress,
} from "ethers";
import { NEXT_PUBLIC_TOKEN_ADDRESS, NEXT_PUBLIC_CHAIN_ID, ABI, AMOY_PARAMS } from "../lib/contract";

const EXPLORER_TX = (h) => `https://amoy.polygonscan.com/tx/${h}`;

export default function Home() {
  const [account, setAccount] = useState("");
  const [balance, setBalance] = useState("0");
  const [isOwner, setIsOwner] = useState(false);

  // transfer
  const [to, setTo] = useState("");
  const [amount, setAmount] = useState("1");

  // reward (owner-only)
  const [rewardTo, setRewardTo] = useState("");
  const [rewardAmount, setRewardAmount] = useState("1");

  // tx status
  const [txStatus, setTxStatus] = useState(null);

  const canRun = useMemo(() => typeof window !== "undefined" && window.ethereum, []);

  const providerRef = useRef(null);
  const contractRef = useRef(null);
  const transferHandlerRef = useRef(null);

  async function ensureAmoyNetwork() {
    const provider = new BrowserProvider(window.ethereum);
    const net = await provider.getNetwork();
    if (Number(net.chainId) === NEXT_PUBLIC_CHAIN_ID) return true;

    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: AMOY_PARAMS.chainId }],
      });
      return true;
    } catch {
      try {
        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [AMOY_PARAMS],
        });
        return true;
      } catch {
        alert("Please switch to Polygon Amoy in MetaMask");
        return false;
      }
    }
  }

  async function freshBalance(c, addr) {
    const b = await c.balanceOf(addr, { blockTag: "latest" });
    return formatUnits(b, 18);
  }

  async function setupProviderAndContract(requestAccounts = false) {
    const provider = new BrowserProvider(window.ethereum);
    let addr;
    if (requestAccounts) {
      [addr] = await provider.send("eth_requestAccounts", []);
    } else {
      const accounts = await provider.send("eth_accounts", []);
      addr = accounts?.[0];
    }
    if (!addr) return {};

    const signer = await provider.getSigner();
    const c = new Contract(NEXT_PUBLIC_TOKEN_ADDRESS, ABI, signer);

    providerRef.current = provider;
    contractRef.current = c;
    setAccount(addr);

    setBalance(await freshBalance(c, addr));
    try {
      const owner = await c.owner();
      setIsOwner(owner.toLowerCase() === addr.toLowerCase());
    } catch {
      setIsOwner(false);
    }

    return { provider, c, addr };
  }

  async function connect() {
    if (!canRun) return alert("Install MetaMask");
    const ok = await ensureAmoyNetwork();
    if (!ok) return;

    await teardownTransferListener();
    await setupProviderAndContract(true);
    await setupTransferListener();
  }

  async function doTransfer() {
    if (!account) return alert("Connect wallet first");
    if (!isAddress(to)) return alert("Enter a valid recipient address");
    if (!amount || Number(amount) <= 0) return alert("Enter a valid amount");

    const provider = providerRef.current ?? new BrowserProvider(window.ethereum);
    const c = contractRef.current ?? new Contract(NEXT_PUBLIC_TOKEN_ADDRESS, ABI, await provider.getSigner());

    try {
      const tx = await c.transfer(to, parseUnits(amount, 18));
      setTxStatus({ hash: tx.hash, confirmed: false });

      const receipt = await provider.waitForTransaction(tx.hash);
      setTxStatus({ hash: tx.hash, confirmed: true });

      setBalance(await freshBalance(c, account));
    } catch (e) {
      setTxStatus({ error: e?.shortMessage || e?.message || "Transaction failed" });
    }
  }

  async function rewardUserCall() {
    if (!isOwner) return alert("Only the owner can call rewardUser()");
    if (!isAddress(rewardTo)) return alert("Enter a valid reward recipient address");
    if (!rewardAmount || Number(rewardAmount) <= 0) return alert("Enter a valid reward amount");

    const provider = providerRef.current ?? new BrowserProvider(window.ethereum);
    const c = contractRef.current ?? new Contract(NEXT_PUBLIC_TOKEN_ADDRESS, ABI, await provider.getSigner());

    try {
      const tx = await c.rewardUser(rewardTo, parseUnits(rewardAmount, 18));
      setTxStatus({ hash: tx.hash, confirmed: false });

      const receipt = await provider.waitForTransaction(tx.hash);
      setTxStatus({ hash: tx.hash, confirmed: true });

      setBalance(await freshBalance(c, account));
    } catch (e) {
      setTxStatus({ error: e?.shortMessage || e?.message || "Transaction failed" });
    }
  }

  async function setupTransferListener() {
    if (!canRun) return;
    const { c } = contractRef.current
      ? { c: contractRef.current }
      : await setupProviderAndContract(false);
    if (!c) return;

    const handler = async (from, to) => {
      if (!account) return;
      const me = account.toLowerCase();
      if (from?.toLowerCase?.() === me || to?.toLowerCase?.() === me) {
        const fresh = await c.balanceOf(account, { blockTag: "latest" });
        setBalance(formatUnits(fresh, 18));
      }
    };

    transferHandlerRef.current = handler;
    c.on("Transfer", handler);
  }

  async function teardownTransferListener() {
    const c = contractRef.current;
    const h = transferHandlerRef.current;
    if (c && h) {
      try { c.off("Transfer", h); } catch {}
    }
    transferHandlerRef.current = null;
  }

  useEffect(() => {
    if (!canRun) return;

    (async () => {
      await ensureAmoyNetwork();
      await setupProviderAndContract(false);
      await setupTransferListener();

      window.ethereum?.on?.("accountsChanged", async () => {
        await teardownTransferListener();
        await setupProviderAndContract(false);
        await setupTransferListener();
      });
      window.ethereum?.on?.("chainChanged", async () => {
        await teardownTransferListener();
        await setupProviderAndContract(false);
        await setupTransferListener();
      });
    })();

    return () => {
      teardownTransferListener();
    };
  }, [canRun]);

  return (
    <div className="container">
      <h1 className="title">Phillip Reward Token (PRT)</h1>

      <div className="card">
        <button onClick={connect}>Connect MetaMask (Amoy)</button>
        <p><b>Connected:</b> {account || "-"}</p>
        <p><b>Your PRT Balance:</b> {balance}</p>
      </div>

      <div className="card">
        <h3>Transfer</h3>
        <input
          placeholder="Recipient 0x..."
          value={to}
          onChange={(e) => setTo(e.target.value)}
        />
        <div className="row">
          <input
            placeholder="Amount (e.g., 5)"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          <button onClick={doTransfer}>Send</button>
        </div>
      </div>

      <div className="card">
        <h3>Reward (Owner Only)</h3>
        <input
          placeholder="Reward To (0x...)"
          value={rewardTo}
          onChange={(e) => setRewardTo(e.target.value)}
        />
        <div className="row">
          <input
            placeholder="Amount (e.g., 1)"
            value={rewardAmount}
            onChange={(e) => setRewardAmount(e.target.value)}
          />
          <button onClick={rewardUserCall} disabled={!isOwner}>
            Reward
          </button>
        </div>
        {!isOwner && <p className="warn">You are not the owner — the Reward button is disabled.</p>}
      </div>

      {txStatus && (
        <p className="note">
          {txStatus.error ? (
            <>Status: {txStatus.error}</>
          ) : txStatus.hash && !txStatus.confirmed ? (
            <>
              Status:{" "}
              <a href={EXPLORER_TX(txStatus.hash)} target="_blank" rel="noreferrer">
                open in explorer
              </a>
            </>
          ) : (
            <>
              Status: Transaction confirmed —{" "}
              <a href={EXPLORER_TX(txStatus.hash)} target="_blank" rel="noreferrer">
                open in explorer
              </a>
            </>
          )}
        </p>
      )}
    </div>
  );
}
