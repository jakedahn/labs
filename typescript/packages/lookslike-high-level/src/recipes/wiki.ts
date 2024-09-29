import { html } from "@commontools/common-html";
import {
  recipe,
  lift,
  generateData,
  handler,
  NAME,
  UI,
  str,
  ifElse,
} from "@commontools/common-builder";
import { launch } from "../data.js";

type ExploreResult = {
  text: string;
  related: { title: string }[];
}

// this is a bit of a hack to extend the canon with the current page title and text
// and expose it in a way that works inside the `map` of each related title
const contextify = lift(({ related, canon, text, title, maxLength }) => {
  const newCanon = `<title>${title}</title>\n<text>${text}</text>\n\n${canon}`.slice(0, maxLength)
  return (related || []).map(({ title }) => ({ title, canon: newCanon }))
})

const launcher = handler<PointerEvent, { title: string, canon: string }>(
  (_, { title, canon }) => { launch(wiki, { title, canon }) }
);

export const wiki = recipe<{ title: string; canon: string }>(
  "wiki",
  ({ title, canon }) => {
    title.setDefault("Mystical Creatures");
    canon.setDefault("A mythical creature is a creature that is not real.  But let's pretend they are real.");

    const {
      result: { text, related }, pending,
    } = generateData<ExploreResult>({
      prompt: str`Here is the pages the user has explored so far:\n\n<canon>${canon}</canon>.  Generate a 2 sentence article in a fictional wiki current page titled, and a list of 5 related pages and 1 page that only partially belongs': <title>${title}</title>`,
      schema: {
        type: "object",
        properties: {
          text: {
            type: "string",
            description: "text of the wiki page",
          },
          related: {
            type: "array",
            items: {
              type: "object",
              properties: {
                title: {
                  type: "string",
                  description: "title",
                },
              },
              required: ["title"],
            },
          },
        },
      },
    });

    text.setDefault("");
    related.setDefault([]);

    const relatedWithClosure = contextify({ related, canon, text, title, maxLength: 4000 });

    return {
      [NAME]: str`${title} ~ Wiki Page`,
      [UI]: html`<div>
        <h3>${title}</h3>
        ${ifElse(pending,
        html`<p>generating...</p>`,
        html`<p>${text}</p>`,
      )}
        <ul>
          ${relatedWithClosure.map(({ title, canon }) => html`<li onclick=${launcher({ title, canon })}>${title}</li>`)}
        </ul>
        <h4>Debug (Canon)</h4>
        <pre>${canon}</pre>
      </div>`,
      title,
      text: str`${text}`, // FIXME(ja): if don't use str`, the [NAME] doesn't get set correctly/show up in the sidebar?
      canon,
    };
  },
);

// export const wikiToPrompt = recipe<{ wiki: { title: string; text: string } }>(
//   "create prompt from wiki",
//   ({ wiki }) => {
//     const promptTitle = lift(({ title }) => title)(wiki);

//     // FIXME(ja): this is what I wanted to do:
//     // const newPrompt = run(prompt, { title: wiki.title });
//     // addGems([newPrompt]);
//     // openSaga(newPrompt.get()[ID]);
//     // return { [UI]: html`<div></div>` };

//     return { [UI]: html`<b>Sorry, you have to click <common-button
//         onclick=${handler({ promptTitle }, (_, { promptTitle }) => {
//           const newPage = run(prompt, {
//             title: promptTitle,
//           });
//           addGems([newPage]);
//           openSaga(newPage.get()[ID]);
//         })}
//         >button</common-button>`
//       }
//     });

// addSuggestion({
//   description: description`Generate a prompt for ${"wiki"}`,
//   recipe: wikiToPrompt,
//   bindings: { sagas: "sagas" },
//   dataGems: { wiki: "wiki" },
// });