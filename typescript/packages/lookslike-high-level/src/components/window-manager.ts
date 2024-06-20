import { LitElement, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";
import { view, tags, render } from "@commontools/common-ui";
import { isGem, Gem, ID } from "../recipe.js";
const { binding } = view;
const { include } = tags;

@customElement("common-window-manager")
export class CommonWindowManager extends LitElement {
  static override styles = css`
    :host {
      display: flex;
      overflow-x: auto;
      width: 100%;
      padding: 20px 0; /* Add vertical padding */
    }
    .window {
      flex: 0 0 auto;
      width: 300px;
      margin-left: 20px;
      padding: 10px;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      background-color: rgba(255, 255, 255, 0.8);
      backdrop-filter: blur(10px);
      box-shadow:
        0 10px 20px rgba(0, 0, 0, 0.1),
        0 6px 6px rgba(0, 0, 0, 0.1),
        0 0 0 1px rgba(0, 0, 0, 0.05);
      transition: all 0.3s ease;
    }
    .close-button {
      position: absolute;
      top: 8px;
      right: 8px;
      width: 16px;
      height: 16px;
      border-radius: 50%;
      background-color: rgba(0, 0, 0, 0.1);
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      color: rgba(0, 0, 0, 0.4);
      font-weight: bold;
      transition: all 0.2s ease;
    }
    .close-button:hover {
      background-color: rgba(0, 0, 0, 0.15);
      color: rgba(0, 0, 0, 0.6);
    }
  `;

  @property({ type: Array })
  sagas: Gem[] = [];

  private renderedSagas: { [key: string]: HTMLElement } = {};

  override render() {
    return html`
      ${this.sagas.map((saga) => {
        if (!this.renderedSagas[saga[ID]])
          this.renderedSagas[saga[ID]] = render.render(
            include({ content: binding("UI") }),
            {
              UI: saga.UI,
            }
          ) as HTMLElement;

        return html`
          <div class="window" id="${saga[ID]}">
            <button class="close-button" @click="${this.onClose}">×</button>
            <common-screen-element>
              ${this.renderedSagas[saga[ID]]}
            </common-screen-element>
          </div>
        `;
      })}
    `;
  }

  openSaga(saga: Gem) {
    this.sagas = [...this.sagas, saga];
    this.updateComplete.then(() => {
      const newWindow = this.renderRoot.querySelector(".window:last-child");
      if (newWindow) {
        newWindow.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
          inline: "start",
        });
      }
    });
  }

  onClose(e: Event) {
    const id = (e.currentTarget as HTMLElement).parentElement?.id;
    if (id) {
      this.sagas = this.sagas.filter((saga) => saga[ID] + "" !== id);
    }
  }

  override connectedCallback() {
    super.connectedCallback();
    this.addEventListener("open-saga", this.handleAddWindow);
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener("open-saga", this.handleAddWindow);
  }

  private handleAddWindow(e: Event) {
    const saga = (e as CustomEvent).detail.saga;
    if (isGem(saga)) {
      this.openSaga(saga);
    }
  }
}