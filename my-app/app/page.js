import styles from "./page.module.css";
import TokenContract from "../contract/CryptoDevToken.json";
import Exchange from "../contract/Exchange.json";
import { ethers } from "ethers";
import { addLiquidity } from "@/utils/addLiquidity";

export default function Home() {
  return (
    <main className={styles.main}>
      <h1>DEX</h1>
    </main>
  );
}
