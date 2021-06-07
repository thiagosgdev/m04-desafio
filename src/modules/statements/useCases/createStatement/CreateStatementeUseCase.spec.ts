import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementError } from "./CreateStatementError";
import { CreateStatementUseCase } from "./CreateStatementUseCase";

let inMemoryStatementRepository: InMemoryStatementsRepository;
let inMemoryUsersRepository: InMemoryUsersRepository;
let createStatementUseCase: CreateStatementUseCase;
let createUserUseCase: CreateUserUseCase;

describe("Create Statement", () => {

  enum OperationType {
    DEPOSIT = 'deposit',
    WITHDRAW = 'withdraw',
  }

  beforeEach(() =>{
    inMemoryStatementRepository = new InMemoryStatementsRepository();
    inMemoryUsersRepository = new InMemoryUsersRepository()
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository)
    createStatementUseCase = new CreateStatementUseCase(inMemoryUsersRepository, inMemoryStatementRepository);
  });
  it("Should be able to create a new deposit!", async () => {

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

    expect(statement).toHaveProperty("id");
  });

  it("Should NOT be able to create a new statement to a not existing user!", async () => {

    expect(async () => {
      const user = await createUserUseCase.execute({
        email: "test@test.com",
        name: "User test",
        password: "1234"
      });


      const deposit = {
        user_id: "WRONG ID",
        type: 'deposit' as OperationType,
        amount: 5000,
        description: "Deposit"
      }

      await createStatementUseCase.execute(deposit);
    }).rejects.toBeInstanceOf(CreateStatementError.UserNotFound);
  });

  it("Should be able to create a new WITHDRAW!", async () => {

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

    const withdraw = {
      user_id: id,
      type: 'withdraw' as OperationType,
      amount: 100,
      description: "Withdraw"
    }

    const statement = await createStatementUseCase.execute(withdraw);

    expect(statement).toHaveProperty("id");
  });

  it("Should NOT be able to create a new WITHDRAW if the user HAS INSUFFICIENT FUNDS!", async () => {
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
        amount: 200,
        description: "Deposit"
      }

      await createStatementUseCase.execute(deposit);

      const withdraw = {
        user_id: id,
        type: 'withdraw' as OperationType,
        amount: 5000,
        description: "Withdraw"
      }

      await createStatementUseCase.execute(withdraw);


    }).rejects.toBeInstanceOf(CreateStatementError.InsufficientFunds);
  });

})
