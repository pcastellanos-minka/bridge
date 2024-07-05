import ledgerSdk from '@minka/ledger-sdk'

const { LedgerSdk } = ledgerSdk

// Populate this object with bank keys you have created previously
const bankKeyPair = {
  format: 'ed25519-raw',
  public: 'n6vLXMGe1MSLyTKYloHhp/jiEWP5ODKj5Qew+R6gAhA=',
  secret: 'spImfKjWqIGRMb2eQ6eN89Am1pafuFRB+abzlVLKs+E=',
}

// Populate with Ledger public key data.
export const ledgerSigner = {
  format: 'ed25519-raw',
  public: 'Zq6UZyy9/9+HKUVfXH51n3Q6FoVvcjBbAH/p9f8o0M8='
}

// Configure the Ledger SDK.
const ledger = new LedgerSdk({
  // This is the ledger instance we are going to connect to.
  ledger: 'SupportLedger',
  server: 'https://ldg-stg.one/api/v2',
  secure: {
    aud: 'SupportLedger',
    iss: 'mint',
    keyPair: bankKeyPair,
    sub: bankKeyPair.public,
    exp: 3600
  },
})

// This function is used to notify Ledger of Entry processing final statuses.
export async function notifyLedger(entry, action, notifyStates) {
  const notifyAction = entry.actions[action]

  if (!notifyStates.includes(notifyAction.state)) {
    return
  }

  const custom = {
    handle: entry.handle,
    status: notifyAction.state,
    coreId: notifyAction.coreId,
    reason: notifyAction.error.reason,
    detail: notifyAction.error.detail,
    failId: notifyAction.error.failId,
  }
  const ledgerResponse = await ledger.intent
    .from(entry.data.intent)
    .hash()
    .sign([
      {
        keyPair: bankKeyPair,
        custom,
      },
    ])
    .send()
  console.log(`SENT signature to Ledger\n${JSON.stringify(custom, null, 2)}`)
}