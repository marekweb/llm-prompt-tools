## LLM-Extract: Structured Data Extractor

LLM-Extract is an experimental project to leverage LLMs for extraction of structured data from large pieces of unstructured text.

For example, it can take a long product description, and use it to extract the product's name, price, and specific properties that you're looking for.

It uses an LLM such as GPT-4 or GPT-3.5-Turbo to extract structured data from unstructured text. It leverages the Function Call feature of these models to instruct the model to create structured output, in the form of named parameters.

<img width="1059" alt="screenshot" src="https://github.com/marekweb/llm-prompt-tools/assets/602886/e5922f81-e01a-43dc-b7f2-1a783e928163">

### Implementation

The project is built in TypeScript and runs as a web application:

- Frontend in TypeScript, React , TailwindCSS, Vite.
- Backend in TypeScript, Express, PostgreSQL.

It uses OpenAI chat completions API with the Function Calls feature.
