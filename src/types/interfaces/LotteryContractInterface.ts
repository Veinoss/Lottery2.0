// Interface pour le contrat Web3
interface LotteryContractInterface {
  methods: {
    getNumberOfParticipants(): {
      call(): Promise<string>;
    };
    owner(): {
      call(): Promise<string>;
    };
    getJackPot(): {
      call(): Promise<string>;
    };
    enroleInLottery(name: string): {
      estimateGas(arg0: { from: string; value: string; }): unknown;
      send(options: {
        from: string;
        value: string;
        gas: number;
        gasPrice: string;
      }): Promise<any>;
    };
  };
}

export default LotteryContractInterface;