const solc = require('solc')

export default async function compileContract({
  standardJsonInput,
  contractName
}: {
  standardJsonInput: string
  contractName: string
}) {
  const fileName = contractName.replace(/[\/\\:*?"<>|.\s]+$/g, '_') + '.sol'

  const output = JSON.parse(solc.compile(standardJsonInput))
  if (output.errors) {
    // Filter out warnings
    const errors = output.errors.filter(
      (error: { severity: string }) => error.severity === 'error'
    )
    if (errors.length > 0) {
      const error = new Error(errors[0].formattedMessage)
      throw error
    }
  }
  const contract = output.contracts[fileName]


  // Get the contract ABI and bytecode
  const abi = contract[contractName].abi
  let bytecode = contract[contractName].evm.bytecode.object
  if (!bytecode.startsWith('0x')) {
    bytecode = '0x' + bytecode
  }

  return {
    abi,
    bytecode
  }
}
