"use client";

import { useState } from "react";
import { useSolana } from "@/components/solana-provider";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChevronDown, Wallet, LogOut } from "lucide-react";
import {
  useConnect,
  useDisconnect,
  type UiWallet
} from "@wallet-standard/react";

function truncateAddress(address: string): string {
  return `${address.slice(0, 4)}...${address.slice(-4)}`;
}

function WalletIcon({
  wallet,
  className
}: {
  wallet: UiWallet;
  className?: string;
}) {
  return (
    <Avatar className={className}>
      {wallet.icon && (
        <AvatarImage src={wallet.icon} alt={`${wallet.name} icon`} />
      )}
      <AvatarFallback>{wallet.name.slice(0, 2).toUpperCase()}</AvatarFallback>
    </Avatar>
  );
}

function WalletMenuItem({
  wallet,
  onConnect
}: {
  wallet: UiWallet;
  onConnect: () => void;
}) {
  const { setWalletAndAccount } = useSolana();
  const [isConnecting, connect] = useConnect(wallet);

  const handleConnect = async () => {
    if (isConnecting) return;

    try {
      const accounts = await connect();

      if (accounts && accounts.length > 0) {
        const account = accounts[0];
        setWalletAndAccount(wallet, account);
        onConnect();
      }
    } catch (err) {
      console.error(`Failed to connect ${wallet.name}:`, err);
    }
  };

  return (
    <button
      className="flex w-full items-center justify-between px-2 py-1.5 text-sm outline-none hover:bg-accent focus:bg-accent disabled:pointer-events-none disabled:opacity-50"
      onClick={handleConnect}
      disabled={isConnecting}
    >
      <div className="flex items-center gap-2">
        <WalletIcon wallet={wallet} className="h-6 w-6" />
        <span className="font-medium">{wallet.name}</span>
      </div>
    </button>
  );
}

function DisconnectButton({
  wallet,
  onDisconnect
}: {
  wallet: UiWallet;
  onDisconnect: () => void;
}) {
  const { setWalletAndAccount } = useSolana();
  const [isDisconnecting, disconnect] = useDisconnect(wallet);

  const handleDisconnect = async () => {
    try {
      await disconnect();
      setWalletAndAccount(null, null);
      onDisconnect();
    } catch (err) {
      console.error("Failed to disconnect wallet:", err);
    }
  };

  return (
    <DropdownMenuItem
      className="text-destructive focus:text-destructive cursor-pointer"
      onClick={handleDisconnect}
      disabled={isDisconnecting}
    >
      <LogOut className="mr-2 h-4 w-4" />
      Disconnect
    </DropdownMenuItem>
  );
}

export function WalletConnectButton() {
  const { wallets, selectedWallet, selectedAccount, isConnected } = useSolana();

  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="wallet" className="w-full justify-between">
          {isConnected && selectedWallet && selectedAccount ? (
            <span className="font-mono text-sm w-full">
                {truncateAddress(selectedAccount.address)}
            </span>
          ) : (
              <div className="text-center w-full">Connect Wallet</div>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-[280px]">
        {wallets.length === 0 ? (
          <p className="text-sm text-muted-foreground p-3 text-center">
            No wallets detected
          </p>
        ) : (
          <>
            {!isConnected ? (
              <>
                <DropdownMenuLabel>Available Wallets</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {wallets.map((wallet, index) => (
                  <WalletMenuItem
                    key={`${wallet.name}-${index}`}
                    wallet={wallet}
                    onConnect={() => setDropdownOpen(false)}
                  />
                ))}
              </>
            ) : (
              selectedWallet &&
              selectedAccount && (
                <>
                  <DropdownMenuLabel>Connected Wallet</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <div className="px-2 py-1.5">
                    <div className="flex items-center gap-2">
                      <WalletIcon wallet={selectedWallet} className="h-6 w-6" />
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">
                          {selectedWallet.name}
                        </span>
                        <span className="text-xs text-muted-foreground font-mono">
                          {truncateAddress(selectedAccount.address)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DisconnectButton
                    wallet={selectedWallet}
                    onDisconnect={() => setDropdownOpen(false)}
                  />
                </>
              )
            )}
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}