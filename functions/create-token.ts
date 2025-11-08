import {
    appendTransactionMessageInstructions,
    createTransactionMessage,
    generateKeyPairSigner,
    pipe,
    setTransactionMessageFeePayerSigner,
    setTransactionMessageLifetimeUsingBlockhash,
    address,
    TransactionSigner,
    signAndSendTransactionMessageWithSigners,
    getBase58Decoder,
    Signature,
    Address,
    createSignableMessage,
    Transaction,
    TransactionWithLifetime,
    TransactionSendingSignerConfig,
    SignatureBytes,
} from '@solana/kit';
import { getCreateAccountInstruction } from '@solana-program/system';
import {
    AuthorityType,
    findAssociatedTokenPda,
    getInitializeAccount2Instruction,
    getInitializeMintInstruction,
    getMintSize,
    getMintToInstruction,
    getSetAuthorityInstruction,
    getTokenSize,
    TOKEN_PROGRAM_ADDRESS,
} from '@solana-program/token';
import type { Client } from './client';
import {
	createV1,
	findMetadataPda,
	mplTokenMetadata,
    TokenStandard,
} from "@metaplex-foundation/mpl-token-metadata";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { mplToolbox } from '@metaplex-foundation/mpl-toolbox';
import { generateSigner, keypairIdentity, percentAmount, publicKey, signerIdentity, sol } from "@metaplex-foundation/umi";
import { walletAdapterIdentity } from "@metaplex-foundation/umi-signer-wallet-adapters";
import { Connection, clusterApiUrl, PublicKey } from "@solana/web3.js";
import { base58 } from '@metaplex-foundation/umi/serializers';



export async function createTokenAndAccount(client: Client, signer:TransactionSigner<string>, mintRevoke:boolean, freezeRevoke:boolean, options: { decimals: number, supply: number }) {
    
    // creating mint
    const mintSize = getMintSize();
    const [mint, mintRent, { value: latestBlockhash}] = await Promise.all([
        generateKeyPairSigner(),
        client.rpc.getMinimumBalanceForRentExemption(BigInt(mintSize)).send(),
        client.rpc.getLatestBlockhash().send(),
    ]);
 
    // Build instructions.
    const createAccountIx = getCreateAccountInstruction({
        payer: signer,
        newAccount: mint,
        space: mintSize,
        lamports: mintRent,
        programAddress: TOKEN_PROGRAM_ADDRESS,
    });
    const initializeMintIx = getInitializeMintInstruction({
        mint: mint.address,
        decimals: options.decimals ?? 0,
        mintAuthority: address(signer.address),
        freezeAuthority: address(signer.address),
    });
    address

    // Build the transaction message.
    const transactionMessage = await pipe(
        createTransactionMessage({ version: 0 }),
        (tx) => setTransactionMessageFeePayerSigner(signer, tx),
        (tx) => setTransactionMessageLifetimeUsingBlockhash(latestBlockhash, tx),
        (tx) => appendTransactionMessageInstructions([createAccountIx, initializeMintIx], tx),
        (tx) => client.estimateAndSetComputeUnitLimit(tx),
    );

    const signature = await signAndSendTransactionMessageWithSigners(transactionMessage);
    const signatureStr = getBase58Decoder().decode(signature) as Signature;



    // CREATING ASSOCIATED TOKEN ACCOUNT 
    const { value: associatedAccountBlockhash } = await client.rpc.getLatestBlockhash().send();
    const tokenAccount = await generateKeyPairSigner();
    
    // Get token account size (in bytes)
    const tokenAccountSpace = BigInt(getTokenSize());

    // Get minimum balance for rent exemption
    const tokenAccountRent = await client.rpc
    .getMinimumBalanceForRentExemption(tokenAccountSpace)
    .send();

    // Instruction to create new account for token account (token program)
    // Invokes the system program
    const createTokenAccountInstruction = getCreateAccountInstruction({
    payer: signer,
    newAccount: tokenAccount,
    lamports: tokenAccountRent,
    space: tokenAccountSpace,
    programAddress: TOKEN_PROGRAM_ADDRESS
    });

    // Instruction to initialize token account data
    // Invokes the token program
    const initializeTokenAccountInstruction = getInitializeAccount2Instruction({
    account: tokenAccount.address,
    mint: mint.address,
    owner: signer.address
    });

    const instructions2 = [
    createTokenAccountInstruction,
    initializeTokenAccountInstruction
    ];

    // Create transaction message for token account creation
    const tokenAccountMessage = pipe(
    createTransactionMessage({ version: 0 }), // Create transaction message
    (tx) => setTransactionMessageFeePayerSigner(signer, tx), // Set fee payer
    (tx) => setTransactionMessageLifetimeUsingBlockhash(associatedAccountBlockhash, tx), // Set transaction blockhash
    (tx) => appendTransactionMessageInstructions(instructions2, tx) // Append instructions
    );

    const associatedAccountSignature = await signAndSendTransactionMessageWithSigners(tokenAccountMessage);



    // MINT TOKENS

    // Use findAssociatedTokenPda to derive the ATA address
    const { value: mintTokenBlockhash } = await client.rpc.getLatestBlockhash().send();

    // Create instruction to mint tokens
    const mintToInstruction = getMintToInstruction({
        mint: mint.address,
        token: tokenAccount.address,
        mintAuthority: signer.address,
        amount: BigInt(options.supply) * BigInt(10 ** options.decimals)
    });

    // Create transaction message for minting tokens
    const mintTxMessage = pipe(
        createTransactionMessage({ version: 0 }),
        (tx) => setTransactionMessageFeePayerSigner(signer, tx),
        (tx) => setTransactionMessageLifetimeUsingBlockhash(mintTokenBlockhash, tx),
        (tx) => appendTransactionMessageInstructions([mintToInstruction], tx)
    );
    const mintSignature = await signAndSendTransactionMessageWithSigners(mintTxMessage);
    


    // 1. Change Mint Authority (MintTokens)
    if (mintRevoke) {
        const { value: revokeBlockhash } = await client.rpc.getLatestBlockhash().send();

        const revokeMintAuthorityIx = getSetAuthorityInstruction({
        owned: mint.address,
        owner: signer,
        authorityType: AuthorityType.MintTokens,
        newAuthority: null
        });

        const revokeTxMessage = pipe(
            createTransactionMessage({ version: 0 }),
            (tx) => setTransactionMessageFeePayerSigner(signer, tx),
            (tx) => setTransactionMessageLifetimeUsingBlockhash(revokeBlockhash, tx),
            (tx) => appendTransactionMessageInstructions([revokeMintAuthorityIx], tx)
        );
        
        const revokeMintSignature = await signAndSendTransactionMessageWithSigners(revokeTxMessage);
    }
    
    // 2. Change Freeze Authority (FreezeAccount)
    if (freezeRevoke) {
        const { value: revokeBlockhash } = await client.rpc.getLatestBlockhash().send();
        
        const revokeFreezeAuthorityIx = getSetAuthorityInstruction({
            owned: mint.address,
            owner: signer,
            authorityType: AuthorityType.FreezeAccount,
            newAuthority: null
        });
        
        const revokeTxMessage = pipe(
            createTransactionMessage({ version: 0 }),
            (tx) => setTransactionMessageFeePayerSigner(signer, tx),
            (tx) => setTransactionMessageLifetimeUsingBlockhash(revokeBlockhash, tx),
            (tx) => appendTransactionMessageInstructions([revokeFreezeAuthorityIx], tx)
        );

        const revokeUpdateSignature = await signAndSendTransactionMessageWithSigners(revokeTxMessage);
    }



    return {mintAddress: mint.address, signature: signatureStr};
}


export async function uploadMetaData(mintAddress:string, name: string, symbol: string, uri: string, updateAuthority: boolean,
) {
    // METADATA
    const umi = createUmi("https://api.devnet.solana.com")
    .use(mplTokenMetadata())
    .use(mplToolbox())
    const signer = generateSigner(umi);
    umi.use(signerIdentity(signer));
    const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

    const sig = await connection.requestAirdrop(new PublicKey(umi.identity.publicKey), 2e9);
    await connection.confirmTransaction(sig, "confirmed");   


    const mint = publicKey(mintAddress);
	const metadataAccountAddress = findMetadataPda(umi, {
		mint: mint,
	});
    // add metadata to our already initialized token using `createV1` helper 
	const tx = await createV1(umi, {
		mint,
		authority: umi.identity,
		payer: umi.identity,
		updateAuthority: updateAuthority ? umi.identity : undefined,
		name,
		symbol,
		uri,
		sellerFeeBasisPoints: percentAmount(5.5), // 5.5%
		tokenStandard: TokenStandard.Fungible,
	}).sendAndConfirm(umi);

	let txSig = base58.deserialize(tx.signature);
	console.log(`https://explorer.solana.com/tx/${txSig}?cluster=devnet`);

}