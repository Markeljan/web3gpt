interface SmartContract {
  name: string;
  code: string;
}

type SmartContractsType = SmartContract[];

let smartContracts: SmartContractsType = [];

export const getSmartContracts = (): SmartContractsType => {
  return smartContracts;
};

export const createSmartContract = (smartContract: SmartContract) => {
  smartContracts = [...smartContracts, smartContract];
};

export const deleteSmartContract = (smartContract: SmartContract): void => {
  const index = smartContracts.findIndex((item) => item.name === smartContract.name);
  if (index !== -1) {
    smartContracts.splice(index, 1);
  }
};
