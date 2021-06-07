import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { AuthenticateUserUseCase } from "../authenticateUser/AuthenticateUserUseCase";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { ShowUserProfileError } from "./ShowUserProfileError";
import { ShowUserProfileUseCase } from "./ShowUserProfileUseCase";


let inMemoryUsersRepository: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;
let showUserProfileUseCase: ShowUserProfileUseCase
let authenticateUserUseCase: AuthenticateUserUseCase

describe("Show User Profile", () => {

  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
    showUserProfileUseCase = new ShowUserProfileUseCase(inMemoryUsersRepository)
    authenticateUserUseCase = new AuthenticateUserUseCase(inMemoryUsersRepository)
  })

  it("Should be able to show user information after receiving an valid ID", async () =>{

    const user = await createUserUseCase.execute({
      email: "test@test.com",
      name: "User test",
      password: "1234"
    });
    const id = user.id;

    const showUser = await showUserProfileUseCase.execute(String(id));

    expect(showUser).toHaveProperty("name");
  });

  it("Should NOT be able to show information of a user that DOESN'T exists!", async () => {
    expect(async () =>{
      const user = await createUserUseCase.execute({
        email: "test@test.com",
        name: "User test",
        password: "1234"
      });

    const id = "WRONG ID";

    await showUserProfileUseCase.execute(id);

    }).rejects.toBeInstanceOf(ShowUserProfileError);
  });
})
