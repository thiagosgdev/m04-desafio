import { getRepository, Repository } from "typeorm";

import { Statement } from "../entities/Statement";
import { ICreateStatementDTO } from "../useCases/createStatement/ICreateStatementDTO";
import { IGetBalanceDTO } from "../useCases/getBalance/IGetBalanceDTO";
import { IGetStatementOperationDTO } from "../useCases/getStatementOperation/IGetStatementOperationDTO";
import { IStatementsRepository } from "./IStatementsRepository";

export class StatementsRepository implements IStatementsRepository {
  private repository: Repository<Statement>;

  constructor() {
    this.repository = getRepository(Statement);
  }

  async create({
    user_id,
    amount,
    description,
    type,
    sender_id
  }: ICreateStatementDTO): Promise<Statement> {
    const statement = this.repository.create({
      user_id,
      amount,
      description,
      type,
      sender_id
    });

    return this.repository.save(statement);
  }

  async findStatementOperation({ statement_id, user_id }: IGetStatementOperationDTO): Promise<Statement | undefined> {
    return this.repository.findOne(statement_id, {
      where: { user_id }
    });
  }

  async getUserBalance({ user_id, with_statement = false }: IGetBalanceDTO):
    Promise<
      { balance: number } | { balance: number, statement: Statement[] }
    >
  {
    let balance = 0;
    const statement = await this.repository.find({
      where: [
        { user_id},
        { sender_id: user_id }
      ]
    });

    const transfers = statement.filter(({type})=> type === 'transfer').reduce((acc, transfer) => {
      if(transfer.user_id === user_id){
        return acc + transfer.amount;
      }else{
        return acc - transfer.amount;
      }
    }, 0);

    const movement = statement.filter(({type})=> type === 'deposit' || type === 'withdraw').reduce((acc, operation) => {
      if ((operation.type === 'deposit')) {
        return Number(operation.amount) + acc;
      } else {
        return acc - operation.amount;
      }
    }, 0);

    console.log(`MOVEMENT ${movement}`)
    console.log(`TRANSFERS ${transfers}`)

    if(movement > transfers){
      balance = movement + transfers;
    }else{
      balance = transfers + movement;
    }

    console.log(`BALANCE A ${balance}`)
    if (with_statement) {
      console.log(`BALANCE B ${balance}`)
      return {
        statement,
        balance
      }
    }



    return {balance};
  }
}
