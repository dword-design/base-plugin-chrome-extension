import execa from 'execa'

export default async () => {
  try {
    await execa.command(
      'eslint --fix --ext .js,.json --ignore-path .gitignore .',
      { all: true }
    )
  } catch ({ all }) {
    throw new Error(all)
  }
}
