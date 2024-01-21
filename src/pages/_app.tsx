import "../styles/globals.css";

import type { AppProps } from "next/app";
import { WagmiConfig, createConfig } from "wagmi";
import { sepolia } from "wagmi/chains";
import { ConnectKitProvider, getDefaultConfig } from "connectkit";
import theme from "../styles/theme.json";
const chains = [sepolia];

const config = createConfig(
  getDefaultConfig({
    appName: "ConnectKit Next.js demo",
    //infuraId: process.env.NEXT_PUBLIC_INFURA_ID,
    //alchemyId:  process.env.NEXT_PUBLIC_ALCHEMY_ID,
    chains,
    walletConnectProjectId: process.env.WALLET_CONNECT_ID!,
  })
);

export default function App({ Component, pageProps }: AppProps) {
  const AnyComponent = Component as any;
  return (
    <WagmiConfig config={config}>
      <ConnectKitProvider customTheme={theme}>
        <AnyComponent {...pageProps} />
      </ConnectKitProvider>
    </WagmiConfig>
  );
}
