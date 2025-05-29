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