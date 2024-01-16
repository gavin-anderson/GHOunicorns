import "../styles/globals.css";

import type { AppProps } from "next/app";
import { WagmiConfig, createConfig } from "wagmi";

import {
  ConnectKitProvider,
  ConnectKitButton,
  getDefaultConfig,
} from "connectkit";
import { useAccount } from "wagmi";
import theme from "../styles/theme.json";

const config = createConfig(
  getDefaultConfig({
    // Required API Keys
    alchemyId: process.env.INFURA_ID, // or infuraId
    walletConnectProjectId: process.env.WALLET_CONNECT_ID,

    // Required
    appName: "GHOunicorns",

    // Optional
  })
);

export default function App({ Component, pageProps }: AppProps) {
  const AnyComponent = Component as any;
  return (
    <WagmiConfig config={config}>
      <ConnectKitProvider customTheme={theme} debugMode>
        <AnyComponent {...pageProps} />
      </ConnectKitProvider>
    </WagmiConfig>
  );
}
