# audiofunctions2.0

## Build Setup

```bash
# install dependencies
$ yarn install

# serve with hot reload at localhost:3000
$ yarn dev

# build for production and launch server
$ yarn build
$ yarn start

# generate static project
$ yarn generate
```

## Usage

//TODO

## URL di test

I query params dei link di seguito sono stati calcolati con `this.$sessionDataSerializer.encode()`

http://localhost:3000/chart?sd=JTVCJTdCJTIyaWRlbnRpZmllciUyMiUzQSUyMnhEb21haW4lMjIlMkMlMjJkYXRhJTIyJTNBJTdCJTIyeE1pbiUyMiUzQTElMkMlMjJ4TWF4JTIyJTNBMyUyQyUyMnN0ZXAlMjIlM0ExJTdEJTJDJTIyaXNGYXZvcml0ZSUyMiUzQWZhbHNlJTdEJTJDJTdCJTIyaWRlbnRpZmllciUyMiUzQSUyMnlEb21haW4lMjIlMkMlMjJkYXRhJTIyJTNBJTdCJTIyeU1pbiUyMiUzQTElMkMlMjJ5TWF4JTIyJTNBMyUyQyUyMnN0ZXAlMjIlM0ExJTdEJTJDJTIyaXNGYXZvcml0ZSUyMiUzQWZhbHNlJTdEJTJDJTdCJTIyaWRlbnRpZmllciUyMiUzQSUyMmZ1bmN0aW9uJTIyJTJDJTIyZGF0YSUyMiUzQSU3QiUyMmZuJTIyJTNBJTIyM3glMkIyJTIyJTdEJTJDJTIyaXNGYXZvcml0ZSUyMiUzQWZhbHNlJTdEJTVE

```json
[
        {
          identifier: "xDomain",
          data: {
            xMin: 1,
            xMax: 3,
            step: 1,
          },
          isFavorite: false,
        },
        {
          identifier: "yDomain",
          data: {
            yMin: 1,
            yMax: 3,
            step: 1,
          },
          isFavorite: false,
        },
        {
          identifier: "function",
          data: {
            fn: "3x+2",
          },
          isFavorite: false,
        },
      ]
```

Lo stesso json, ma con il preferito della funzione a `true`

http://localhost:3000/chart?sd=JTVCJTdCJTIyaWRlbnRpZmllciUyMiUzQSUyMnhEb21haW4lMjIlMkMlMjJkYXRhJTIyJTNBJTdCJTIyeE1pbiUyMiUzQTElMkMlMjJ4TWF4JTIyJTNBMyUyQyUyMnN0ZXAlMjIlM0ExJTdEJTJDJTIyaXNGYXZvcml0ZSUyMiUzQWZhbHNlJTdEJTJDJTdCJTIyaWRlbnRpZmllciUyMiUzQSUyMnlEb21haW4lMjIlMkMlMjJkYXRhJTIyJTNBJTdCJTIyeU1pbiUyMiUzQTElMkMlMjJ5TWF4JTIyJTNBMyUyQyUyMnN0ZXAlMjIlM0ExJTdEJTJDJTIyaXNGYXZvcml0ZSUyMiUzQWZhbHNlJTdEJTJDJTdCJTIyaWRlbnRpZmllciUyMiUzQSUyMmZ1bmN0aW9uJTIyJTJDJTIyZGF0YSUyMiUzQSU3QiUyMmZuJTIyJTNBJTIyM3glMkIyJTIyJTdEJTJDJTIyaXNGYXZvcml0ZSUyMiUzQXRydWUlN0QlNUQ%3D

```json
[
        {
          identifier: "xDomain",
          data: {
            xMin: 1,
            xMax: 3,
            step: 1,
          },
          isFavorite: false,
        },
        {
          identifier: "yDomain",
          data: {
            yMin: 1,
            yMax: 3,
            step: 1,
          },
          isFavorite: false,
        },
        {
          identifier: "function",
          data: {
            fn: "3x+2",
          },
          isFavorite: true,
        },
      ]
```