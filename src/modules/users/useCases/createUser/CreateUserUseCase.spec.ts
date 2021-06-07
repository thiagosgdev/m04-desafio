
import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository"
import { CreateUserError } from "./CreateUserError";
import { CreateUserUseCase } from "./CreateUserUseCase";


let inMemoryUsersRepository: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;

describe("Create User", () => {

  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository)
  });

  it("Should be able to create a new user!", async () => {

    const user = await createUserUseCase.execute({
      email: "test@test.com",
      name: "User test",
      password: "1234"
    });

    expect(user).toHaveProperty("id");
  });

  it("Should NOT be able to create a new user with an existing email!", async () => {
    expect(async () =>{
      await createUserUseCase.execute({
        email: "test@test.com",
        name: "User test",
        password: "1234"
      });

      await createUserUseCase.execute({
        email: "test@test.com",
        name: "User test 2",
        password: "1234"
      });
    }).rejects.toBeInstanceOf(CreateUserError);
  });
});
