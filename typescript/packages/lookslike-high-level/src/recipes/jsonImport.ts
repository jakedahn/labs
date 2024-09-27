import { html } from "@commontools/common-html";
import {
  recipe,
  UI,
  NAME,
  lift,
  generateData,
  handler,
  str,
  cell,
  createJsonSchema,
  ifElse,
} from "@commontools/common-builder";

import { launch } from "../data.js";
import { iframe } from "./iframe.js";

type Suggestion = {
  behaviour: 'append' | 'fork',
  prompt: string,
}

const formatData = lift(({ obj }) => {
  console.log("stringify", obj);
  return JSON.stringify(obj || {}, null, 2);
});

const tap = lift((x) => {
  console.log(x, JSON.stringify(x, null, 2));
  return x;
});

const updateValue = handler<{ detail: { value: string } }, { value: string }>(
  ({ detail }, state) => detail?.value && (state.value = detail.value),
);

const viewSystemPrompt = lift(
  ({ }) => `generate/modify a document based on inpout, respond within a json block , e.g.
  \`\`\`json
  ...
  \`\`\`

  No field can be set to null or undefined.`,
);

const deriveJsonSchema = lift(({ data}) => {
  const schema = createJsonSchema({}, data)?.["properties"];
  if (!schema) return {};

  return schema;
});

const onInput = handler<{ input: Event }, { value: string }>((input, state) => {
  state.value = input.target.value;
});

const onContentLoaded = handler<void, { loading: boolean }>((_, state) => {
  state.loading = false;
});

const loadingStatus = lift(({ loading }) =>
  loading ? html`<div>Loading...</div>` : html`<div></div>`,
);

const copy = lift(({ value }: { value: any }) => value);

const promptFilterSchema = lift(
  ({ schema, prompt }) => `Given the following schema:

${JSON.stringify(schema, null, 2)}

Filter and return only the relevant parts of this schema for the following request:

${prompt}`,
);

const addToPrompt = handler<
  { prompt: string },
  { prompt: string; query: string }
>((e, state) => {
  state.prompt += "\n" + e.prompt;
  state.query = state.prompt;
});

const acceptSuggestion = handler <
  void,
  { suggestion: Suggestion; prompt: string; query: string, data: any; }
>((_, state) => {
  if (state.suggestion.behaviour === 'append') {
    console.log(state.prompt, state.query, state.suggestion.prompt)
    state.prompt += "\n" + state.suggestion.prompt;
    state.query = `${state.prompt}`;
  } else if (state.suggestion.behaviour === 'fork') {
    launch(iframe, { data: state.data, title: state.suggestion.prompt, prompt: state.suggestion.prompt });
  }
});

const buildUiPrompt = lift(({ prompt, data }) => {
  console.log("prompt", prompt, data);
  let fullPrompt = prompt;
  if (data) {
    fullPrompt += `\n\nHere's the previous JSON for reference:\n\`\`\`json\n${JSON.stringify(data, null, 2)}\n\`\`\``;
  }
  return fullPrompt;
});

const buildSuggestionsPrompt = lift(({ src, prompt, schema }) => {
  let fullPrompt = `Given the current prompt: "${prompt}"`;
  fullPrompt += `\n\nGiven the following schema:\n<view-model-schema>\n${JSON.stringify(schema, null, 2)}\n</view-model-schema>`;
  if (src) {
    fullPrompt += `\n\nAnd the previous HTML:\n\`\`\`html\n${src}\n\`\`\``;
  }
  fullPrompt += `\n\nSuggest 3 prompts to enhancem, refine or branch off into a new UI. Return the suggestions in a JSON block with the following structure:
  \`\`\`json
  {
    "suggestions": [
      {
        "behaviour": "append" | "fork",
        "prompt": "string"
      }
    ]
  }
  \`\`\``;
  return fullPrompt;
});

const isAppend = lift(({ suggestion }: { suggestion: Suggestion }) => suggestion?.behaviour === 'append');

const getSuggestions = lift(({ result }) => result?.suggestions ?? []);

const getFirstSuggestion = lift(({ suggestions }: { suggestions: Suggestion[] }) => {
  return suggestions[0] || { behaviour: '', prompt: '' };
});

const getSecondSuggestion = lift(({ suggestions }: { suggestions: Suggestion[] }) => {
  return suggestions[1] || { behaviour: '', prompt: '' };
});

const getThirdSuggestion = lift(({ suggestions }: { suggestions: Suggestion[] }) => {
  return suggestions[2] || { behaviour: '', prompt: '' };
});

const onAcceptData = handler<void, { json: string, data: string }>(
  (_, state) => {
    console.log("accept data", state.json, state.data);
    state.data = JSON.parse(JSON.stringify(state.json))
  }
);

const tryParseJson = lift(({ jsonText }) => {
  try {
    return JSON.parse(jsonText);
  } catch (error: any) {
    return {error: error?.message || 'Invalid JSON'};
  }
});

export const jsonImporter = recipe<{
  title: string;
  prompt: string;
  data: any;
  loading: boolean;
}>("json importer", ({ title, prompt, data, loading }) => {
  prompt.setDefault("");
  data.setDefault({ key: 'value'  });
  loading.setDefault(false);

  const schema = deriveJsonSchema({ data });
  console.log("prompt", prompt);
  const jsonText = cell<string>('{}');
  jsonText.setDefault('{}')

  const json = tryParseJson({ jsonText });
  json.setDefault({});

  return {
    [NAME]: str`${title}`,
    [UI]: html`<div>
      <common-input
        value=${title}
        placeholder="title"
        oncommon-input=${updateValue({ value: title })}
      ></common-input>

      ${loadingStatus({ loading })}

      <pre>${formatData({ obj: json })}</pre>
      <textarea
        value=${jsonText}
        onkeyup=${onInput({ value: jsonText })}
        style="width: 100%; min-height: 128px;"
      ></textarea>
      <common-button
            onclick=${onAcceptData({ json, data })}
        >
            Import
        </common-button>

      <h3>schema</h3>
      <pre>${formatData({ obj: schema })}</pre>



    </div>`,
    prompt,
    title,
    data,
  };
});


// <button
//   type="button"
//   onclick=${acceptSuggestion({ suggestion: getFirstSuggestion({ suggestions }), prompt, src, lastSrc, query, data })}
// >
//     ${ifElse(
//           isAppend({ suggestion: getFirstSuggestion({ suggestions }) }),
//           `Append:`,
//           `Fork:`
//         )}
//     ${getFirstSuggestion({ suggestions }).prompt}
// </button>
// <button
//   type="button"
//   onclick=${acceptSuggestion({ suggestion: getSecondSuggestion({ suggestions }), prompt, src, lastSrc, query, data})}
// >
//     ${ifElse(
//           isAppend({ suggestion: getSecondSuggestion({ suggestions }) }),
//           `Append:`,
//           `Fork:`
//         )}
//     ${getSecondSuggestion({ suggestions }).prompt}
// </button>
// <button
//   type="button"
//   onclick=${acceptSuggestion({ suggestion: getThirdSuggestion({ suggestions }), prompt, src, lastSrc, query, data })}
// >
//     ${ifElse(
//           isAppend({ suggestion: getThirdSuggestion({ suggestions }) }),
//           `Append:`,
//           `Fork:`
//         )}
//     ${getThirdSuggestion({ suggestions }).prompt}
// </button>