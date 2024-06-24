import { execaCommand } from 'execa';

export default async () => {
  try {
    await execaCommand(
      'eslint --fix --ext .js,.json,.vue --ignore-path .gitignore .',
      { all: true },
    );
  } catch (error) {
    throw new Error(error.all);
  }
};
