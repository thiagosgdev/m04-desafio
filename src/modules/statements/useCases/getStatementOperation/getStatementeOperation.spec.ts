import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementUseCase } from "../createStatement/CreateStatementUseCase";
import { GetBalanceUseCase } from "../getBalance/GetBalanceUseCase";
import { GetStatementOperationError } from "./GetStatementOperationError";
import { GetStatementOperationUseCase } from "./GetStatementOperationUseCase";

let inMemoryStatementRepository: InMemoryStatementsRepository;
let inMemoryUsersRepository: InMemoryUsersRepository;
let createStatementUseCase: CreateStatementUseCase;
let createUserUseCase: CreateUserUseCase;
let getStatementOperation: GetStatementOperationUseCase;

interface IRequest {
  user_id: string;
  statement_id: string;
}

enum OperationType {
  DEPOSIT = 'deposit',
  WITHDRAW = 'withdraw',
  TRANSFER = 'transfer'
}

describe("Get Statement Operation", () => {


  beforeEach(() => {
    inMemoryStatementRepository = new InMemoryStatementsRepository();
    inMemoryUsersRepository = new InMemoryUsersRepository()
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository)
    createStatementUseCase = new CreateStatementUseCase(inMemoryUsersRepository, inMemoryStatementRepository);
    getStatementOperation = new GetStatementOperationUseCase(inMemoryUsersRepository, inMemoryStatementRepository)
  });

  it("Should be able to get a Statement Operation from an existing user!", async () => {


    const user = await createUserUseCase.execute({
      email: "test@test.com",
      name: "User test",
      password: "1234"
    });

    const id = String(user.id);
    const deposit = {
      user_id: id,
      type: 'deposit' as OperationType,
      amount: 5000,
      description: "Deposit"
    }

    const statement = await createStatementUseCase.execute(deposit);
    let data : IRequest;

    data = {
      user_id: id,
      statement_id: String(statement.id)
    }

    const statementOperation = await getStatementOperation.execute(data)

    expect(statementOperation).toHaveProperty("type");
  });

  it("Should NOT be able to get a Statement Operation to a not existing user!", async () => {

    expect(async () => {
      const user = await createUserUseCase.execute({
        email: "test@test.com",
        name: "User test",
        password: "1234"
      });

      const id = String(user.id);

      const deposit = {
        user_id: id,
        type: 'deposit' as OperationType,
        amount: 5000,
        description: "Deposit"
      }

      await createStatementUseCase.execute(deposit);

      const statement = await createStatementUseCase.execute(deposit);

      let data : IRequest;

      data = {
        user_id: "WRONG ID",
        statement_id: String(statement.id)
      }

      await getStatementOperation.execute(data);

    }).rejects.toBeInstanceOf(GetStatementOperationError);
  });

  it("Should NOT be able to get a Statement Operation that the ID doesn't exists!", async () => {

    expect(async () => {
      const user = await createUserUseCase.execute({
        email: "test@test.com",
        name: "User test",
        password: "1234"
      });

      const id = String(user.id);

      const deposit = {
        user_id: id,
        type: 'deposit' as OperationType,
        amount: 5000,
        description: "Deposit"
      }

      await createStatementUseCase.execute(deposit);

      const statement = await createStatementUseCase.execute(deposit);

      let data : IRequest;

      data = {
        user_id: id,
        statement_id: "WRONG STATEMENT ID"
      }

      await getStatementOperation.execute(data);

    }).rejects.toBeInstanceOf(GetStatementOperationError);
  });
});
