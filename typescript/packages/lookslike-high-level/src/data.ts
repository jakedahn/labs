// This file is setting up example data
import { signal } from "@commontools/common-frp";
import { Gem, NAME } from "./recipe.js";
const { state } = signal;

import { todoList, todoTask } from "./recipes/todo-list.js";
import "./recipes/todo-list-as-task.js"; // Necessary, so that suggestions are indexed.

export const keywords: { [key: string]: string[] } = {
  groceries: ["grocery list"],
};

export const dataGems = state<{ [key: string]: Gem }>({});

export function addGems(gems: { [key: string]: Gem }) {
  Object.entries(gems).forEach(([name, gem]) => (gem[NAME] = name));
  dataGems.send({ ...dataGems.get(), ...gems });
}

addGems({
  "todo list": todoList({
    items: ["Buy groceries", "Walk the dog", "Wash the car"].map((item) =>
      todoTask({
        title: item,
        done: false,
      })
    ),
  }),
  "grocery list": todoList({
    items: ["milk", "eggs", "bread"].map((item) =>
      todoTask({
        title: item,
        done: false,
      })
    ),
  }),
});