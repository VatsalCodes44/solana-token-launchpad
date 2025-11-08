import {
    appendTransactionMessageInstruction,
    BaseTransactionMessage,
    createSolanaRpc,
    createSolanaRpcSubscriptions,
    Rpc,
    RpcSubscriptions,
    sendAndConfirmTransactionFactory,
    SolanaRpcApi,
    SolanaRpcSubscriptionsApi,
    TransactionMessageWithFeePayer,
} from '@solana/kit';
import {
    estimateComputeUnitLimitFactory,
    getSetComputeUnitLimitInstruction,
} from '@solana-program/compute-budget';
export type Client = {
    rpc: Rpc<SolanaRpcApi>;
    rpcSubscriptions: RpcSubscriptions<SolanaRpcSubscriptionsApi>;
    estimateAndSetComputeUnitLimit: ReturnType<typeof estimateAndSetComputeUnitLimitFactory>;
    sendAndConfirmTransaction: ReturnType<typeof sendAndConfirmTransactionFactory>; 
};

function estimateAndSetComputeUnitLimitFactory(
    ...params: Parameters<typeof estimateComputeUnitLimitFactory>
) {
    const estimateComputeUnitLimit = estimateComputeUnitLimitFactory(...params);
    return async <T extends BaseTransactionMessage & TransactionMessageWithFeePayer>(
        transactionMessage: T,
    ) => {
        const computeUnitsEstimate = await estimateComputeUnitLimit(transactionMessage);
        return appendTransactionMessageInstruction(
            getSetComputeUnitLimitInstruction({ units: computeUnitsEstimate }),
            transactionMessage,
        );
    };
}

let client: Client | undefined;
export async function createClient(): Promise<Client> {
    if (!client) {
        // Create RPC objects and airdrop function.
        const rpc = createSolanaRpc('https://api.devnet.solana.com');
        const rpcSubscriptions = createSolanaRpcSubscriptions('wss://api.devnet.solana.com/');
        // Create a function to estimate and set the compute unit limit.
        const estimateAndSetComputeUnitLimit = estimateAndSetComputeUnitLimitFactory({ rpc });
        const sendAndConfirmTransaction = sendAndConfirmTransactionFactory({
            rpc,
            rpcSubscriptions,
        });
        client = { rpc, rpcSubscriptions, estimateAndSetComputeUnitLimit, sendAndConfirmTransaction};
    }
    return client;
}