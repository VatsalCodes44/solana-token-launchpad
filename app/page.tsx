"use client"
import { useSolana } from "@/components/solana-provider";
import { TextareaWithText } from "@/components/TextareaWithText";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { WalletConnectButton } from "@/components/wallet-connect-button";
import { createClient } from "@/functions/client";
import { createTokenAndAccount, uploadMetaData } from "@/functions/create-token";
import { uploadImage, uploadJson } from "@/server-actions/presignedUrl";
import { useWalletAccountTransactionSendingSigner } from "@solana/react";
import { UiWallet, UiWalletAccount } from "@wallet-standard/react";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import axios from "axios"
import { Transaction } from "@solana/kit";

export default function Home() {
  const { wallets, selectedWallet, selectedAccount, isConnected, chain} = useSolana();
  const [socialLinks, setSocialLinks] = useState(false)
  const [mintRevoke, setMintRevoke] = useState(false);
  const [freezeRevoke, setFreezeRevoke] = useState(false);
  const [updateRevoke, setUpdateRevoke] = useState(false);
  const [name,setName] = useState("")
  const [symbol,setSymbol] = useState("")
  const [decimals,setDecimals] = useState(6)
  const [supply,setSupply] = useState(1e10)
  const [description,setDescription] = useState("")
  const [website,setWebsite] = useState("")
  const [telegram,setTelegram] = useState("")
  const [discord,setDiscord] = useState("")
  const [x,setX] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [mint, setMint] = useState("")
  console.log(file?.type)

  return (
    <div className="w-full h-full flex justify-center bg-input/30">
      <div className="w-fit my-8">
        <div className="text-center text-4xl font-bold bg-gradient-to-r from-blue-500 to-red-500 bg-clip-text text-transparent">
          Solana Token Creator
        </div>
        <div className="text-center my-4">
          Easily Create your own Solana SPL Token without Coding.
        </div>

        <div className="bg-black p-4 rounded-xl max-w-xl sm:max-w-none sm:w-2xl my-8">
          <div className="my-4 ">
            <label className="text-xs" htmlFor="name">
              <span className="text-red-500 pr-1">*</span>
              <span className="text-white">Name</span>
            </label>
            <Input value={name} onChange={(e) => {
              if (e.target.value.length > 32) {
                setName(e.target.value.substring(0,31))
              } else {
                setName(e.target.value)
              }
            }} className="mt-2" id="name" placeholder="Ex: Solana" />
            <text className="text-xs text-neutral-400">Max 32 characters in your name</text>
          </div>

          <div className="my-4">
            <label className="text-xs" htmlFor="symbol">
              <span className="text-red-500 pr-1">*</span>
              <span className="text-white">Symbol</span>
            </label>
            <Input value={symbol} onChange={(e) => {
              if (e.target.value.length > 8) {
                setSymbol(e.target.value.substring(0,7))
              } else {
                setSymbol(e.target.value)
              }
            }} className="mt-2" id="symbol" placeholder="Ex: SOL" />
            <text className="text-xs text-neutral-400">Max 8 characters in your symbol</text>
          </div>

          <div className="my-4">
            <label className="text-xs" htmlFor="decimals">
              <span className="text-red-500 pr-1">*</span>
              <span className="text-white">Decimals</span>
            </label>
            <Input onChange={(e) => {
              if (e.target.value.length > 6) {
                const value = parseInt(e.target.value.substring(0,5))
                setDecimals(isNaN(value) ? 0 : value)
              } else {
                setDecimals(parseInt(e.target.value))
              }
            }} className="mt-2" id="decimals" type="number" placeholder="6" />
            <text className="text-xs text-neutral-400">Most token use 6 decimals</text>
          </div>

          <div className="my-4">
            <label className="text-xs" htmlFor="supply">
              <span className="text-red-500 pr-1">*</span>
              <span className="text-white">Supply</span>
            </label>
            <Input onChange={(e) => {
              const value = parseInt(e.target.value.substring(0,5))
                setSupply(isNaN(value) ? 0 : value)
            }} className="mt-2" id="supply" type="number" placeholder="1" />
            <text className="text-xs text-neutral-400">Most token use 10B</text>
          </div>

          <TextareaWithText description={description} setDescription={setDescription} />

          <div className="my-4">
            <label className="text-xs" htmlFor="supply">
              <span className="text-red-500 pr-1">*</span>
              <span className="text-white">Image</span>
            </label>
            <Input onChange={(e) => {
              setFile(e.target.files ? e.target.files[0] : null)
            }} className="mt-2" id="supply" type="file" accept=".jpg,.png,.jpeg" multiple={false}/>
            <text className="text-xs text-neutral-400">.png .jpg 1000x1000 px</text>
          </div>
          
          <Separator className="my-8"/>

          <div>
            <div className="flex justify-between items-center mb-8">
                <div className="">
                  <div className="text-md font-semibold">Add Social Links</div>
                  <div className="text-xs text-neutral-400">Add links to your token metadata.</div>
                </div>
                <div>
                  <Switch checked={socialLinks} onCheckedChange={() => {setSocialLinks(p=>!p)}} />
                </div>
            </div>
            <div className={`${socialLinks ? "" : "hidden"}`}>

              <div className="flex justify-between items-center my-4">
                <label className="" htmlFor="website">
                  <span className="text-white">Website:</span>
                </label>
                <Input onChange={(e) => {
                  setWebsite(e.target.value)
                }} className="max-w-sm sm:w-sm" id="website" type="text" placeholder="https://" />
              </div>

              <div className="flex justify-between items-center my-4">
                <label className="" htmlFor="Telegram">
                  <span className="text-white">Telegram:</span>
                </label>
                <Input onChange={(e) => {
                  setTelegram(e.target.value)
                }} className="max-w-sm sm:w-sm" id="Telegram" type="text" placeholder="https://t.me/" />
              </div>

              <div className="flex justify-between items-center my-4 ">
                <label className="" htmlFor="Discord">
                  <span className="text-white">Discord:</span>
                </label>
                <Input onChange={(e) => {
                  setDiscord(e.target.value)
                }} className="max-w-sm sm:w-sm" id="Discord" type="text" placeholder="https://discord.com/" />
              </div>

              <div className="flex justify-between items-center my-4">
                <label className="" htmlFor="X">
                  <span className="text-white">X:</span>
                </label>
                <Input onChange={(e) => {
                  setX(e.target.value)
                }} className="max-w-sm sm:w-sm" id="X" type="text" placeholder="https://x.com/" />
              </div>
            </div>
          </div>

          <Separator className="my-8"/>

          <div>
            <div className="text-md font-semibold">Revoke Authorities</div>
            <div className="text-xs text-neutral-400">Solana Token has 3 authorities: Freeze Authority, Mint Authority, and Update Authority. Revoke them to attract more investors.</div>
          </div>

          <div onClick={() => {
            setFreezeRevoke(p=>!p)
          }} className="flex justify-between items-center border-2 border-white rounded-md p-4 my-4 cursor-pointer">
            <div>
              <div className="text-md font-semibold">Revoke Freeze</div>
              <div className="text-xs text-neutral-400">No one will be able to freeze holders' token accounts anymore</div>
            </div>
            <div>
              <Checkbox checked={freezeRevoke}/>
            </div>
          </div>

          <div onClick={() => {
            setMintRevoke(p=>!p)
          }} className="flex justify-between items-center border-2 border-white rounded-md p-4 my-4 cursor-pointer">
            <div>
              <div className="text-md font-semibold">Revoke Mint</div>
              <div className="text-xs text-neutral-400">No one will be able to create more tokens anymore</div>
            </div>
            <div>
              <Checkbox checked={mintRevoke}/>
            </div>
          </div>

          <div onClick={() => {
            setUpdateRevoke(p=>!p)
          }} className="flex justify-between items-center border-2 border-white rounded-md p-4 my-4 cursor-pointer">
            <div>
              <div className="text-md font-semibold">Revoke Update</div>
              <div className="text-xs text-neutral-400">No one will be able to modify token metadata anymore</div>
            </div>
            <div>
              <Checkbox checked={updateRevoke}/>
            </div>
          </div>

          <div className="flex justify-center mt-16 mb-8 w-full">
            <div className={`${isConnected ? "hidden" : ""} w-full`}><WalletConnectButton/></div>

            {selectedAccount && isConnected && file && selectedWallet &&
              <CreateButton selectedAccount={selectedAccount} selectedWallet={selectedWallet} socialLinks={socialLinks}
              mintRevoke={mintRevoke} freezeRevoke={freezeRevoke} updateRevoke={updateRevoke} 
              name={name} symbol={symbol} decimals={decimals} supply={supply} description={description} 
              website={website} telegram={telegram} discord={discord} x={x} setMint={setMint} 
              file={file} 
              />
            }
          </div>
        </div>

      </div>
    </div>
  );
}

const CreateButton = ({ 
  selectedAccount,
  selectedWallet,
  socialLinks,
  mintRevoke,
  freezeRevoke,
  updateRevoke,
  name,
  symbol,
  decimals,
  supply, 
  description,
  website,
  telegram,
  discord,
  x,
  setMint, 
  file
  }: {
  selectedAccount: UiWalletAccount,
  selectedWallet: UiWallet,
  socialLinks: boolean,
  mintRevoke: boolean,
  freezeRevoke: boolean,
  updateRevoke: boolean,
  name: string,
  symbol: string,
  decimals: number,
  supply: number,
  description: string,
  website: string,
  telegram: string,
  discord: string,
  x: string,
  setMint: Dispatch<SetStateAction<string>>,
  file: File
  }) => {
  const signer = useWalletAccountTransactionSendingSigner(selectedAccount, "solana:devnet")

  const createToken = async () => {
    const client = await createClient();
    const {mintAddress} = await createTokenAndAccount(client, signer, mintRevoke, freezeRevoke, {decimals, supply})
    setMint(mintAddress)
    const response1 = await uploadImage(mintAddress);
    await axios.put(response1.url, file, {
      headers: {
        "Content-Type": file.type
      }
    })
    const jsonObject = {
      name,
      symbol,
      description,
      image: `https://solana-token-launchpad-nextjs.s3.us-east-1.amazonaws.com/images/${mintAddress}`,
      website,
      telegram,
      discord,
      x
    }
    
    const response2 = await uploadJson(mintAddress);
    await axios.put(response2.url, jsonObject, {
      headers: {
        "Content-Type": "application/json"
      }
    })

    await uploadMetaData(mintAddress, name, symbol, `https://solana-token-launchpad-nextjs.s3.us-east-1.amazonaws.com/json/${mintAddress}`, updateRevoke)


  }
  return (
    <div className={`w-full`}><Button onClick={createToken} variant="wallet" className="w-full">Create Token</Button></div>
  )
}

