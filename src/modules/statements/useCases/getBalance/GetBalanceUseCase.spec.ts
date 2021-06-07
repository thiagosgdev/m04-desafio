import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementUseCase } from "../createStatement/CreateStatementUseCase";
import { GetBalanceError } from "./GetBalanceError";
import { GetBalanceUseCase } from "./GetBalanceUseCase";

let inMemoryStatementRepository: InMemoryStatementsRepository;
let inMemoryUsersRepository: InMemoryUsersRepository;
let createStatementUseCase: CreateStatementUseCase;
let createUserUseCase: CreateUserUseCase;
let getBalanceUseCase: GetBalanceUseCase;

interface IRequest {
  user_id: string;
}

describe("Get balance", () => {
  enum OperationType {
    DEPOSIT = 'deposit',
    WITHDRAW = 'withdraw',
  }

  beforeEach(() => {
    inMemoryStatementRepository = new InMemoryStatementsRepository();
    inMemoryUsersRepository = new InMemoryUsersRepository()
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository)
    createStatementUseCase = new CreateStatementUseCase(inMemoryUsersRepository, inMemoryStatementRepository);
    getBalanceUseCase = new GetBalanceUseCase(inMemoryStatementRepository, inMemoryUsersRepository)
  });
  it("Should be able to get the balance of an existing user", async () => {
    let data : IRequest;

    const user = await createUserUseCase.execute({
      email: "test@test.com",
      name: "User test",
      password: "1234"
    });

    data = {
      user_id: String(user.id)
    }

    const id = String(user.id);

    const deposit = {
      user_id: id,
      type: 'deposit' as OperationType,
      amount: 5000,
      description: "Deposit"
    }

    await createStatementUseCase.execute(deposit);

    const balance = await getBalanceUseCase.execute(data);

    expect(balance).toHaveProperty("balance");

  });

  it("Should NOT be able to show the balance of a user that DOESN'T exists!", async () => {
    expect(async () =>{
      const user = await createUserUseCase.execute({
        email: "test@test.com",
        name: "User test",
        password: "1234"
      });

      let data : IRequest;

      data = {
        user_id: "WRONG ID"
      }

      await getBalanceUseCase.execute(data);

    }).rejects.toBeInstanceOf(GetBalanceError);
  });
})
