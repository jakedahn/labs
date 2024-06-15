import {
  dict,
  datatable,
  vstack
} from './hyperscript/tags.js';
import render from './hyperscript/render.js';

const datatableNode = datatable({
  cols: ['title', 'day', 'time', 'location', 'address', 'description', 'level', 'price', 'email', 'reservation'],
  rows: [
    {
      title: 'Power Yoga',
      day: 'Monday',
      time: '8:00am',
      location: 'Studio 1 & 2 (combined)',
      description: 'Stretch and relax with yoga practice at the studio. All levels welcome. Bring your own mat. Namaste. 🧘‍♂️',
      level: 'Beginner to Advanced',
      price: '$10',
      address: '1234 Elm St, Springfield, IL 62701',
      email: 'yogazon124@example.com',
      reservation: 'https://example.com/reserve/power-yoga'
    },
    {
      title: 'Pilates',
      day: 'Wednesday',
      time: '8:00am',
      location: 'Studio',
      description: 'Strengthen and tone',
      level: 'Intermediate',
      price: '$15',
      address: '1234 Elm St, Springfield, IL 62701',
      email: 'pilates14asdf@example.com',
      reservation: 'https://example.com/reserve/pilates'
    },
    {
      title: 'Zumba',
      day: 'Friday',
      time: '8:00am',
      location: 'Studio',
      description: 'Dance and have fun',
      level: 'Advanced',
      price: '$20',
      address: '1234 Elm St, Springfield, IL 62701',
      email: 'zumba@example.com',
      reservation: 'https://example.com/reserve/zumba'
    }
  ]
});

const dictNode = dict({
  records: {
    'one': '1',
    'two': '2',
    'three': '3'
  }
});

const tree = vstack(
  {},
  datatableNode,
  dictNode
)

const element = render(tree, {});

document.body.appendChild(element);