import { TransferPayload } from '../schemas/validation';

export const transferFunds = async ({
  recipientAccount,
  recipientName,
}: TransferPayload): Promise<{ success: boolean }> => {
  //mocking up errors for the api request
  await new Promise(resolve => setTimeout(resolve, 3000));
  if (recipientName.toLowerCase() === 'wrong recipient') {
    const error = new Error('Wrong Recipient Name');
    (error as any).status = 400;
    (error as any).code = 'INVALID_RECIPIENT_NAME';
    throw error;
  }
  if (recipientAccount === '+306900000000') {
    const error = new Error('Wrong Recipient Account');
    (error as any).status = 404;
    (error as any).code = 'RECIPIENT_ACOUNT_NOT_FOUND';
    throw error;
  }
  if (recipientName.toLowerCase() === 'server error') {
    const error = new Error('Service Is Unavailable');
    (error as any).status = 500;
    (error as any).code = 'INTERNAL_SERVER_ERROR';
    throw error;
  }
  return { success: true };
};
