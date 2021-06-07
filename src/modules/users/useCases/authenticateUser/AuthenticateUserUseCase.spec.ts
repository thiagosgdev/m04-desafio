import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { AuthenticateUserUseCase } from "./AuthenticateUserUseCase";
import { IncorrectEmailOrPasswordError } from "./IncorrectEmailOrPasswordError";

let inMemoryUsersRepository: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;
let authenticateUserUseCase: AuthenticateUserUseCase

describe("Authentica User", () => {

  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
    authenticateUserUseCase = new AuthenticateUserUseCase(inMemoryUsersRepository)
  });

  it("Should be able to return user data and token after authentication", async () => {
    const data ={
      email: "test@test.com",
      password: "1234"
    }

    const user = await createUserUseCase.execute({
      email: "test@test.com",
      name: "User test",
      password: "1234"
    });

    const authenticate = await authenticateUserUseCase.execute(data);

    expect(authenticate).toHaveProperty("token");

  });

  it("Should NOT be able to authenticate using unmatching EMAIL!", async () => {
    expect(async () =>{
      await createUserUseCase.execute({
        email: "test@test.com",
        name: "User test",
        password: "1234"
      });

      const data = {
        email: "wront@email.com",
        password: "1234"
      }

      await authenticateUserUseCase.execute(data);
    }).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError);
  });

  it("Should NOT be able to authenticate using unmatching PASSWORD!", async () => {
    expect(async () =>{
      await createUserUseCase.execute({
        email: "test@test.com",
        name: "User test",
        password: "1234"
      });

      const data = {
        email: "test@test.com",
        password: "9876"
      }

      await authenticateUserUseCase.execute(data);
    }).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError);
  });
})
