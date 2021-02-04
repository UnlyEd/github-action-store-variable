<a href="https://unly.org"><img src="https://storage.googleapis.com/unly/images/ICON_UNLY.png" align="right" height="20" alt="Unly logo" title="Unly logo" /></a>
[![Maintainability](https://api.codeclimate.com/v1/badges/9e073b5db2eec4c4e5c8/maintainability)](https://codeclimate.com/github/UnlyEd/github-action-store-variable/maintainability)
[![Test Coverage](https://api.codeclimate.com/v1/badges/9e073b5db2eec4c4e5c8/test_coverage)](https://codeclimate.com/github/UnlyEd/github-action-store-variable/test_coverage)

![GitHub Action integration test](https://github.com/UnlyEd/github-action-store-variable/workflows/GitHub%20Action%20integration%20test/badge.svg)
![GitHub Action build test](https://github.com/UnlyEd/github-action-store-variable/workflows/GitHub%20Action%20build%20test/badge.svg)
![Update Code Climate test coverage](https://github.com/UnlyEd/github-action-store-variable/workflows/Update%20Code%20Climate%20test%20coverage/badge.svg)

# GitHub Action - Store variables between your jobs

## Code snippet example (minimal example)

```yaml
name: 'GitHub Action code snippet'
on:
  push:
    branches:
      - '*'
jobs:
  # On some job, do some stuff an persist variables meant to be re-used in other jobs
  compute-data:
    name: Compute data
    runs-on: ubuntu-18.04
    steps:
      # Do your own internal business logic...
      - name: Compute ressource
        run: |
          MAGIC_NUMBER=42
          echo "Found universal answer: $MAGIC_NUMBER"
          echo "Exporting it as ENV variable..."
          echo "MAGIC_NUMBER=$MAGIC_NUMBER" >> $GITHUB_ENV

      # XXX We recommend to export all your variables at once, at the end of your job
      - name: Export variable for next jobs
        uses: UnlyEd/github-action-store-variable@v2.1.0 # See https://github.com/UnlyEd/github-action-store-variable
        with:
          # Persist (store) our MAGIC_NUMBER ENV variable into our store, for the next jobs
          variables: |
            MAGIC_NUMBER=${{ env.MAGIC_NUMBER }}

  # In another job, read the previously stored variable and use it
  retrieve-data:
    name: Find & re-use data
    runs-on: ubuntu-18.04
    needs: compute-data
    steps:
      - name: Import variable MAGIC_NUMBER
        uses: UnlyEd/github-action-store-variable@v2.1.0 # See https://github.com/UnlyEd/github-action-store-variable
        with:
          # List all variables you want to retrieve from the store
          # XXX They'll be automatically added to your ENV
          variables: | 
            MAGIC_NUMBER
      - name: Debug output
        run: echo "We have access to $MAGIC_NUMBER"
```

> If you want to see a real output, check out the output of our code snippet example [here](https://github.com/UnlyEd/github-action-store-variable/actions/runs/537556204).

See the [Examples section](#examples) for more advanced examples.

## What does this GitHub Action do?

You can use this action to **store variables** in a sort of "global store" for your GitHub Actions.

Then, you can **read the variables** that have been stored previously.

The variables stored can be read by any job within the same workflow.

> **N.B**: When you read a variable, **it is automatically added as an ENV variable** and will erase any variable with the same name.
> 
> This behavior helps keeping the code cleaner by only manipulating (reading/writing) ENV variables.
> In v1, we had to read the variables from a JSON object, and [it was ugly](https://github.com/UnlyEd/github-action-store-variable/blob/c4143c0d7f/.github/workflows/run-integration-test.yml#L29).

> N.B: You can both **read and write** in the same action.

## Why/when should you use it?

GitHub Actions doesn't allow to natively re-use variables between jobs.

If you need to **re-use variables defined in a job in other** (subsequent) jobs, then you can use this action.

### Action's API

#### Inputs

Name | Required | Default | Description
---  | --- |--- |---
`variables`|✅| | Write variable: `VAR=VALUE` - Read variable: `VAR`
`delimiter`|✖️|`\r?\n`| Regex delimiter between each variable, defaults to normal line break
`failIfNotFound`|✖️|`false`| If true, will throw an error (and crash CI) when attempting to read a variable that doesn't exist in the store

#### Outputs

There are no outputs for this action, reading variables **automatically** adds these variables in `${{ env }}`.

For example, if you read a variable named `VAR`, you can then access it by using `${{ env.VAR }}`.

## Examples

### 1. Save one variable

```yaml
- name: Export one variable
  uses: UnlyEd/github-action-store-variable@v2.1.0
  with:
    variables: FOO=BAR
```

### 2. Save many variables

```yaml
- name: Export many variables
  uses: UnlyEd/github-action-store-variable@v2.1.0
  with:
    variables: |
      FOO=BAR
      STAGE=production
```

> Pro-tip: We recommend always using the `variables: |` syntax (multi lines), because it's just simpler to add more variables later on.

### 3. Save one variable and read another

```yaml
- name: Export one variable
  uses: UnlyEd/github-action-store-variable@v2.1.0
  with:
    # Writes "FOO" and reads "STAGE"
    variables: |
      FOO=BAR
      STAGE
```

### 4. Save many variables using a custom delimiter

```yaml
- name: Export many variables
  uses: UnlyEd/github-action-store-variable@v2.1.0
  with:
    delimiter: ':'
    variables: FOO=BAR:STAGE=production
```

### 5. Retrieve one variable

```yaml
- name: Import variable MAGIC_NUMBER
  uses: UnlyEd/github-action-store-variable@v2.1.0
  with:
    variables: FOO
```

### 6. Retrieve many variables

```yaml
- name: Import variable MAGIC_NUMBER
  uses: UnlyEd/github-action-store-variable@v2.1.0
  with:
    variables: |
      FOO
      STAGE
```

### 7. Retrieve many variables using a custom delimiter

```yaml
- name: Import variable MAGIC_NUMBER
  uses: UnlyEd/github-action-store-variable@v2.1.0
  with:
    delimiter: ';'
    variables: FOO;STAGE
```

### 8. Crash CI if variable doesn't exist

```yaml
- name: Import variable MAGIC_NUMBER
  uses: UnlyEd/github-action-store-variable@v2.1.0
  with:
    failIfNotFound: true
    variables: WRONG_VARIABLE
```

> N.B: If you want to crash only for some variables, then you can call 2 times the `UnlyEd/github-action-store-variable` and have `failIfNotFound: true` in one of them.

## :hugs: Community examples :heart:

Here are a few community-powered examples, those are usually advanced use-cases!

- [Next Right Now](https://github.com/UnlyEd/next-right-now/blob/60455642a5c5248c3e0e9604de080e24ef9eed0a/.github/workflows/deploy-vercel-staging.yml#L250-L260) _(Disclosure: We're the author!)_

---

# Advanced debugging

> Learn how to enable logging, from within the `github-action-store-variable` action.

## How to enable debug logs

Our GitHub Action is written using the GitHub Actions
native [`core.debug` API](https://github.com/actions/toolkit/blob/main/docs/action-debugging.md#step-debug-logs).

Therefore, it allows you to enable logging whenever you need to debug **what's happening within our action**.

**To enable debug mode**, you have to set a [**GitHub Secret**](https://help.github.com/en/actions/automating-your-workflow-with-github-actions/creating-and-using-encrypted-secrets#creating-encrypted-secrets), such as:

- `ACTIONS_STEP_DEBUG` of value `true`

Please see [the official documentation](https://github.com/actions/toolkit/blob/main/docs/action-debugging.md#how-to-access-step-debug-logs) for more information.

> Enabling debugging using `ACTIONS_STEP_DEBUG` will also enable debugging for all other GitHub Actions you use that are using the `core.debug` API.

---

# Contributing

We gladly accept PRs, but please open an issue first, so we can discuss it beforehand.

---

# Changelog

[Changelog](./CHANGELOG.md)

---

# Releases versioning

We follow Semantic Versioning. (`major.minor.patch`)

Our versioning process is completely automated, any changes landing on the `main` branch will trigger a new [release](../../releases).

- `MAJOR`: Behavioral change of the existing API that would result in a breaking change.
  - E.g: Removing an input, or changing the output would result in a breaking change and thus would be released as a new MAJOR version.
- `Minor`: Behavioral change of the existing API that would **not** result in a breaking change.
  - E.g: Adding an optional input would result in a non-breaking change and thus would be released as a new Minor version.
- `Patch`: Any other change.
  - E.g: Documentation, tests, refactoring, bug fix, etc.

## Releases versions:

- We do not provide major versions that are automatically updated (e.g: `v1`).
- We only provide tags/releases that are not meant to be changed once released (e.g: `v1.1.0`).

> As utility, we provide a special [`latest`](../../releases/tag/latest) tag which is automatically updated to the latest release.
> _This tag/release is **not meant to be used in production systems**, as it is not reliable (might jump to the newest MAJOR version at any time)._

---

# License

[MIT](./LICENSE)

---

# Vulnerability disclosure

[See our policy](https://github.com/UnlyEd/Unly).

---

# Contributors and maintainers

This project is being authored by:

- [Unly] Ambroise Dhenain ([Vadorequest](https://github.com/vadorequest)) **(active)**
- Hugo Martin ([Demmonius](https://github.com/demmonius)) **(active)**

---

# **[ABOUT UNLY]** <a href="https://unly.org"><img src="https://storage.googleapis.com/unly/images/ICON_UNLY.png" height="40" align="right" alt="Unly logo" title="Unly logo" /></a>

> [Unly](https://unly.org) is a socially responsible company, fighting inequality and facilitating access to higher education.
> Unly is committed to making education more inclusive, through responsible funding for students.

We provide technological solutions to help students find the necessary funding for their studies.

We proudly participate in many TechForGood initiatives. To support and learn more about our actions to make education accessible, visit :

- https://twitter.com/UnlyEd
- https://www.facebook.com/UnlyEd/
- https://www.linkedin.com/company/unly
- [Interested to work with us?](https://jobs.zenploy.io/unly/about)

Tech tips and tricks from our CTO on our [Medium page](https://medium.com/unly-org/tech/home)!

# TECHFORGOOD #EDUCATIONFORALL
