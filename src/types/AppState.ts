import type Particule from "./Particule"

type AppState = {
  accounts: string[];
  balanceInEther: string[];
  owner: string;
  players: string | number;
  value: string;
  selectedAccount: string | number;
  jackpot: string | number;
  name: string;
  succesMsg: string;
  isLoading: boolean;
  particles: Particule[];
}

export default AppState;