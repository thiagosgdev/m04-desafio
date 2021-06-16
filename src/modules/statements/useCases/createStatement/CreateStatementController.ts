import { Request, Response } from 'express';
import { container } from 'tsyringe';

import { CreateStatementUseCase } from './CreateStatementUseCase';

enum OperationType {
  DEPOSIT = 'deposit',
  WITHDRAW = 'withdraw',
  TRANSFER = 'transfer'
}

export class CreateStatementController {
  async execute(request: Request, response: Response) {
    let splitter = 1;
    let sender_id = undefined;
    let user_id = "";

    const { amount, description } = request.body;

    if(request.params.user_id){
      sender_id = request.user.id;
      user_id = request.params.user_id;
    }else{
      user_id = request.user.id;
    }

    const splittedPath = request.originalUrl.split('/');

    if(splittedPath.length > 5){
      splitter = 2;
    }

    const type = splittedPath[splittedPath.length - splitter] as OperationType;

    const createStatement = container.resolve(CreateStatementUseCase);

    const statement = await createStatement.execute({
      user_id,
      type,
      amount,
      description,
      sender_id
    });

    return response.status(201).json(statement);
  }
}
